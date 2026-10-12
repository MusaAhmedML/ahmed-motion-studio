#!/usr/bin/env python3
"""Generate the self-contained Colab notebook that renders the whole studio on
Google's compute. The studio source is embedded as base64, so there is nothing to
upload and nothing to download first: open, Run all, collect the zip."""
import json, base64, pathlib

B64 = pathlib.Path('/tmp/studio.b64').read_text().strip()
# split into 90-char lines so the notebook stays readable and copy-safe
CHUNK = '\n'.join(B64[i:i+90] for i in range(0, len(B64), 90))

def md(src):  return {"cell_type": "markdown", "metadata": {}, "source": src.splitlines(keepends=True)}
def code(src):return {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [],
                      "source": src.splitlines(keepends=True)}

cells = []

cells.append(md("""# Ahmed Academy — Graphic Animation Studio
### Renders all 8 reels on Google Colab compute. Your device does nothing heavy.

**What this does:** installs Node + Playwright Chromium + ffmpeg, installs the Geist brand
font, unpacks the motion studio, renders every film, synthesises the SFX, normalises to
-14 LUFS, and zips the finished MP4s.

**Requirements:** a Google Colab runtime. For the Gemini-plan premium GPU mentioned in the
tweet, pick a GPU runtime — though these films are Canvas 2D and do not need a GPU to render,
they only need CPU, which Colab provides generously.
"""))

cells.append(code("""#@title 1 · System packages (ffmpeg, node, chromium deps)
import sys, subprocess, os, shutil, base64, textwrap, time

def sh(cmd, **kw):
    print(f"$ {cmd}", flush=True)
    return subprocess.run(cmd, shell=True, **kw)

sh("apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ffmpeg fonts-liberation >/dev/null 2>&1")
if not shutil.which("node"):
    sh("DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nodejs npm >/dev/null 2>&1")
if not shutil.which("node"):
    sh("curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1 && apt-get install -y -qq nodejs >/dev/null 2>&1")
print("node:", shutil.which("node")); print("ffmpeg:", shutil.which("ffmpeg"))
sh("node --version && ffmpeg -version | head -1")
"""))

cells.append(code("""#@title 2 · Geist brand font (the type the whole system is set in)
os.makedirs('/usr/share/fonts/truetype/geist', exist_ok=True)
sh("curl -fsSL -o /tmp/geist.zip https://github.com/GeistSans/Geist/releases/download/v1.5.1/Geist-1.5.1.zip")
sh("cd /tmp && unzip -oq geist.zip -d geist_raw")
sh("find /tmp/geist_raw -name '*.ttf' -o -name '*.otf' | xargs -I{} cp {} /usr/share/fonts/truetype/geist/ 2>/dev/null")
sh("fc-cache -f >/dev/null 2>&1")
print(sh("fc-list | grep -ci geist || true", capture_output=True, text=True).stdout.strip(), "Geist faces installed")
"""))

cells.append(code("""#@title 3 · Playwright + Chromium
os.makedirs('/home/user', exist_ok=True)
if not os.path.exists('/home/user/package.json'):
    open('/home/user/package.json','w').write('{"name":"studio","private":true,"type":"module"}')
sh("cd /home/user && npm install playwright@1.63.0 --silent --no-fund --no-audit")
sh("cd /home/user && npx playwright install --with-deps chromium", capture_output=True)
print("chromium installed")
"""))

cells.append(code("""#@title 4 · Unpack the motion studio
import tarfile, io
STUDIO_B64 = \"\"\"
__B64__
\"\"\"
raw = base64.b64decode("".join(STUDIO_B64.split()))
DEST = '/home/user/ahmed-motion-studio'
os.makedirs(DEST, exist_ok=True)
with tarfile.open(fileobj=io.BytesIO(raw), mode='r:gz') as tf:
    tf.extractall(DEST)
print("unpacked to", DEST)
for root, dirs, files in os.walk(DEST):
    for f in sorted(files):
        p = os.path.join(root, f)
        print("   ", os.path.relpath(p, DEST), os.path.getsize(p))
""".replace('__B64__', CHUNK)))

cells.append(md("""**Run cell 5 last.** Colab sessions have an idle timeout. If it disconnects mid-render,
just re-run cell 5 — the renderer is deterministic, and it skips any MP4 that already exists.
"""))

cells.append(code("""#@title 5 · RENDER EVERY FILM
os.chdir('/home/user/ahmed-motion-studio')
os.makedirs('out', exist_ok=True); os.makedirs('out/audio', exist_ok=True)

FILMS = [("01-kinetic",38),("02-uimorph",9),("03-parallax",30),("04-character",30),
         ("05-paper",34),("06-glide",30),("07-offer",26),("08-constellation",30)]
FORMATS = os.environ.get("FORMATS","9x16").split(",")   # e.g. "9x16" or "9x16,16x9,1x1"

server = subprocess.Popen(["node","serve.mjs","8171"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)

t_all = time.time()
for fmt in FORMATS:
    for name, dur in FILMS:
        wav = f"out/audio/{name}.wav"
        if not os.path.exists(wav):
            sh(f'node sfx.mjs films/{name}.js {wav} {dur}')
        out = f"out/{name}__{fmt}.mp4"
        if os.path.exists(out) and os.path.getsize(out) > 100000:
            print("skip (exists)", out, flush=True); continue
        t0 = time.time()
        r = subprocess.run(f"node render.mjs --film {name} --fmt {fmt} --dur {dur} "
                           f"--sub 1 --crf 16 --out {out} --audio {wav}",
                           shell=True, capture_output=True, text=True)
        tail = [l for l in (r.stdout+r.stderr).splitlines() if 'done' in l or 'died' in l or 'Error' in l]
        print(f"[{fmt}] {name}: {time.time()-t0:.0f}s  {tail[-1] if tail else ''}", flush=True)

server.terminate()
print(f"\\nALL DONE in {time.time()-t_all:.0f}s")
for f in sorted(os.listdir('out')):
    if f.endswith('.mp4'):
        print(f"  {f}  {os.path.getsize('out/'+f)//1024} KB")
"""))

cells.append(code("""#@title 6 · Collect + download
import glob
sh("cd /home/user/ahmed-motion-studio/out && zip -q -r /home/user/ahmed-academy-reels.zip *.mp4")
z = "/home/user/ahmed-academy-reels.zip"
print("zip:", z, os.path.getsize(z)//1024, "KB")
try:
    from google.colab import files
    files.download(z)
    print("download started")
except Exception as e:
    print("auto-download unavailable:", e)
"""))

nb = {
 "cells": cells,
 "metadata": {"colab": {"provenance": [], "toc_visible": True},
              "kernelspec": {"name": "python3", "display_name": "Python 3"},
              "language_info": {"name": "python"}},
 "nbformat": 4, "nbformat_minor": 0,
}

out = pathlib.Path('/home/musaahmedml/ahmed-motion-studio/AA_MOTION_COLAB.ipynb')
out.write_text(json.dumps(nb, indent=1))
print("wrote", out, out.stat().st_size, "bytes,", len(cells), "cells")
