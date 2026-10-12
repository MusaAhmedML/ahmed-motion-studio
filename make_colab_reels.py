#!/usr/bin/env python3
"""Colab notebook: render the four student-pain reels + the mark-scheme reel.

Self-contained. The studio (code + headshot + gold logo) is embedded as base64.
The music bed is rebuilt ON COLAB from the YouTube link, so the notebook stays
small and the bed is derived from the real track, never a re-upload.
"""
import json, pathlib

def code(src): return {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [],
                       "source": src.splitlines(keepends=True)}
def md(src):   return {"cell_type": "markdown", "metadata": {}, "source": src.splitlines(keepends=True)}

CELLS = [md("""# Ahmed Academy — Student Pain Reels (4) + Mark Scheme
### Renders on Colab. Your device does nothing heavy.

**Music:** the halal bed is re-fetched from its YouTube link and cut to the exact
19.0s window that was measured against the film's beat grid (140.62 BPM). Cuts land
on real onsets. **No SFX** — the music carries the reel on its own.

**Reels:** `10-markscheme`, then the four student-pain reels `11`–`14`.
""")]

CELLS.append(code(r'''#@title 1 · System packages
import sys, subprocess, os, shutil, base64, time, json
def sh(c, **k): print(f"$ {c}", flush=True); return subprocess.run(c, shell=True, **k)

sh("apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ffmpeg zip fonts-liberation >/dev/null 2>&1")
if not shutil.which("node"):
    sh("DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nodejs npm >/dev/null 2>&1")
print("node:", shutil.which("node"), "| ffmpeg:", shutil.which("ffmpeg"))

os.makedirs('/usr/share/fonts/truetype/geist', exist_ok=True)
sh("curl -fsSL -o /tmp/geist.zip https://github.com/GeistSans/Geist/releases/download/v1.5.1/Geist-1.5.1.zip")
sh("cd /tmp && unzip -oq geist.zip -d geist_raw")
sh("find /tmp/geist_raw -name '*.ttf' -o -name '*.otf' | xargs -I{} cp {} /usr/share/fonts/truetype/geist/ 2>/dev/null")
sh("fc-cache -f >/dev/null 2>&1")

if not os.path.exists('/home/user/package.json'):
    open('/home/user/package.json','w').write('{"name":"studio","private":true,"type":"module"}')
sh("cd /home/user && npm install playwright@1.63.0 --silent --no-fund --no-audit")
sh("cd /home/user && npx playwright install --with-deps chromium", capture_output=True)
print("ready")
'''))

CELLS.append(code(r'''#@title 2 · Unpack the studio (code + headshot + gold logo)
STUDIO_B64 = """
__B64__
"""
raw = base64.b64decode("".join(STUDIO_B64.split()))
DEST = '/home/user/ahmed-motion-studio'
os.makedirs(DEST, exist_ok=True)
import tarfile, io
with tarfile.open(fileobj=io.BytesIO(raw), mode='r:gz') as tf:
    tf.extractall(DEST)
for f in ['assets/face.jpg', 'assets/logo_gold.png']:
    p = os.path.join(DEST, f)
    print(f, os.path.getsize(p)//1024, 'KB')
'''))

CELLS.append(code(r'''#@title 3 · Rebuild the music bed from the track
# Same track, same 19.0s window that was measured against the film's beat grid.
# Beat grid: 140.62 BPM (beat = 0.4267s). Film cuts snapped to onsets at 6.82s
# and 13.28s inside this window.
sh("pip install -q yt-dlp")
os.makedirs('/home/user/ahmed-motion-studio/audio', exist_ok=True)
TRACK = "https://music.youtube.com/watch?v=58tM4RUHosM"
sh(f'yt-dlp -f bestaudio -x --audio-format mp3 -o "/home/user/ahmed-motion-studio/audio/halal.%(ext)s" "{TRACK}"')
bed = '/home/user/ahmed-motion-studio/audio/bed19.wav'
sh(f'ffmpeg -v error -y -ss 25.5 -t 19.0 -i /home/user/ahmed-motion-studio/audio/halal.mp3 '
   f'-af "afade=t=in:st=0:d=0.35,afade=t=out:st=18.2:d=0.8,loudnorm=I=-14:TP=-1.5:LRA=11" '
   f'-ar 48000 -ac 2 {bed}')
print("bed:", os.path.getsize(bed)//1024, "KB")
print(sh(f'ffprobe -v error -show_entries format=duration -of csv=p=0 {bed}', capture_output=True, text=True).stdout.strip(), "s")
'''))

CELLS.append(code(r'''#@title 4 · Render the reels
os.chdir('/home/user/ahmed-motion-studio')
os.makedirs('out', exist_ok=True)
BED = 'audio/bed19.wav'
REELS = [("10-markscheme",19),("11-effort",19),("12-why",19),("13-which",19),("14-taught",19)]

server = subprocess.Popen(["node","serve.mjs","8171"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)

for name, dur in REELS:
    out = f"out/{name}__9x16.mp4"
    if os.path.exists(out) and os.path.getsize(out) > 100000:
        print("skip", out, flush=True); continue
    t0 = time.time()
    r = subprocess.run(f"node render.mjs --film {name} --fmt 9x16 --dur {dur} "
                       f"--sub 1 --crf 16 --out {out} --audio {BED}",
                       shell=True, capture_output=True, text=True)
    log = r.stdout + r.stderr
    done = [l for l in log.splitlines() if 'done' in l]
    print(f"{name}: {time.time()-t0:.0f}s  {done[-1] if done else 'NO OUTPUT'}", flush=True)
    if r.returncode != 0 or not done:
        print(log[-1200:], flush=True)

server.terminate()
print("\nALL DONE")
for f in sorted(os.listdir('out')):
    if f.endswith('.mp4'): print(f"  {f}  {os.path.getsize('out/'+f)//1024} KB")
'''))

CELLS.append(code(r"""#@title 5 - Package (zipfile, not the shell zip), download, mirror to Drive
import glob, zipfile, subprocess
os.chdir('/home/user/ahmed-motion-studio')
mp4s = sorted(glob.glob('out/*.mp4'))
print("MP4s found:", len(mp4s))
for m in mp4s:
    print("  ", os.path.basename(m), os.path.getsize(m)//1024, "KB")

if not mp4s:
    print("\nNO MP4s - the renders did not complete. Re-run cell 4 and share its output.")
else:
    z = '/home/user/student-reels.zip'
    with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as zf:
        for m in mp4s:
            zf.write(m, os.path.basename(m))
    print("\nzip:", os.path.getsize(z)//1024, "KB")

    try:
        from google.colab import drive
        drive.mount('/content/drive')
        dest = '/content/drive/MyDrive/01_Ahmed Academy/03_Content & Media/Motion Studio/Reels 2026-09-30'
        os.makedirs(dest, exist_ok=True)
        for m in mp4s:
            subprocess.run(['cp', m, dest], check=True)
        subprocess.run(['cp', z, dest], check=True)
        print("mirrored to Drive:", dest)
    except Exception as e:
        print("Drive mirror failed:", e)

    try:
        from google.colab import files
        files.download(z)
        print("download started")
    except Exception as e:
        print("auto-download unavailable:", e)
"""))

B64 = pathlib.Path('/tmp/studio3.b64').read_text().strip()
CHUNK = '\n'.join(B64[i:i+110] for i in range(0, len(B64), 110))
Q = chr(34) * 3
UNPACK = (
    "#@title 2 - Unpack the studio (code + headshot + gold logo)\n"
    "STUDIO_B64 = " + Q + "\n" + CHUNK + "\n" + Q + "\n"
    "raw = base64.b64decode(''.join(STUDIO_B64.split()))\n"
    "DEST = '/home/user/ahmed-motion-studio'\n"
    "os.makedirs(DEST, exist_ok=True)\n"
    "with tarfile.open(fileobj=io.BytesIO(raw), mode='r:gz') as tf:\n"
    "    tf.extractall(DEST)\n"
    "for f in ['assets/face.jpg', 'assets/logo_gold.png']:\n"
    "    p = os.path.join(DEST, f)\n"
    "    print(f, os.path.getsize(p)//1024, 'KB')\n"
)
CELLS[2] = code(UNPACK)

nb = {"cells": CELLS,
      "metadata": {"colab": {"provenance": [], "toc_visible": True},
                   "kernelspec": {"name": "python3", "display_name": "Python 3"},
                   "language_info": {"name": "python"}},
      "nbformat": 4, "nbformat_minor": 0}

out = pathlib.Path('/home/musaahmedml/ahmed-motion-studio/AA_STUDENT_REELS_COLAB.ipynb')
out.write_text(json.dumps(nb, indent=1))
print("wrote", out, round(out.stat().st_size/1024), "KB,", len(nb['cells']), "cells")
