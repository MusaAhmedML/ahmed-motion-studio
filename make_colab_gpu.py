#!/usr/bin/env python3
"""Colab notebook #2: the GPU film.

Generates photographic base plates with an open diffusion model on the Colab GPU,
then renders FILM 09 on top of them (generate-then-trace). Everything happens in one
session: generate -> render -> package, so nothing has to make a round trip.

Also copies the finished MP4s to Drive as well as downloading them, because the
browser download is the part most likely to get lost.
"""
import json, pathlib

NOTE = r'''#@title Ahmed Academy — GPU film (generate-then-trace)
#
# **What this does, in one session:**
#   1. installs torch + diffusers
#   2. generates two photographic base plates on the GPU
#   3. unpacks the motion studio (embedded, nothing to upload)
#   4. renders FILM 09 on top of the plates, then all 8 CPU films
#   5. zips everything, downloads it, AND saves a copy to Drive
#
# **Pick L4 GPU** for the runtime. FLUX.1-schnell is used because it is 4-step,
# Apache-2.0 licensed, and fits comfortably in 24GB.

#@title 1 · GPU check + torch
import sys, subprocess, os, shutil, time
def sh(c, **k): print(f"$ {c}", flush=True); return subprocess.run(c, shell=True, **k)

!nvidia-smi --query-gpu=name,memory.total --format=csv,noheader || echo "NO GPU - CPU fallback will be slow"

sh("pip install -q torch --index-url https://download.pytorch.org/whl/cu124")
sh("pip install -q diffusers transformers accelerate sentencepiece protobuf")
import torch
print("torch", torch.__version__, "cuda", torch.cuda.is_available())
if torch.cuda.is_available():
    print("VRAM:", round(torch.cuda.get_device_properties(0).total_memory/1e9, 1), "GB")
'''

GEN = r'''#@title 2 · Generate the photographic plates on the GPU
# Two plates, both tuned to the brand: obsidian, crimson warmth, one-point depth.
import torch, os
from diffusers import DiffusionPipeline, DPMSolverMultistepScheduler

os.makedirs('/home/user/ahmed-motion-studio/assets', exist_ok=True)

MODEL = "black-forest-labs/FLUX.1-schnell"      # Apache-2.0, 4 steps, ~24GB
print("loading", MODEL, "- first run downloads ~24GB, so this takes a few minutes")
pipe = DiffusionPipeline.from_pretrained(MODEL, torch_dtype=torch.bfloat16)
pipe = pipe.to("cuda")
pipe.set_progress_bar_config(disable=True)
try:
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
except Exception:
    pass

def gen(name, prompt, w=768, h=1152, steps=4, seed=20260930):
    t0 = time.time()
    g = torch.Generator("cuda").manual_seed(seed)
    img = pipe(prompt=prompt, num_inference_steps=steps, guidance_scale=0.0,
               width=w, height=h, generator=g).images[0]
    p = f"/home/user/ahmed-motion-studio/assets/{name}.png"
    img.save(p)
    print(f"  {name}.png  {time.time()-t0:.0f}s  {os.path.getsize(p)//1024} KB")

# Plate 1 — the room. Must be dark, warm and deep so the crimson layer reads on top.
gen("room",
    "cinematic empty study room at night, a single warm desk lamp casting a pool of "
    "amber light across a wooden desk, deep obsidian shadows, volumetric haze in the "
    "beam, one-point perspective, shallow depth of field, moody chiaroscuro lighting, "
    "no people, no text, no logos, muted crimson accent in the shadows, "
    "shot on 35mm film, high detail, dark premium editorial photography",
    w=768, h=1152)

# Plate 2 — the paper. Warm off-white stock, the brand's print aesthetic.
gen("paper",
    "top-down macro photograph of aged cream paper stock on a dark desk, soft raking "
    "warm light from the left, subtle fibre texture and deckled edge, faint grid of "
    "graphite ruled lines, gentle shadow falloff, no text, no writing, no logos, "
    "shallow depth of field, premium stationery editorial photography",
    w=768, h=1152)

print("\nplates written:", os.listdir('/home/user/ahmed-motion-studio/assets'))
'''

PACK = r'''#@title 3 · Unpack the studio
import base64, io, tarfile
STUDIO_B64 = """
__B64__
"""
raw = base64.b64decode("".join(STUDIO_B64.split()))
DEST = '/home/user/ahmed-motion-studio'
os.makedirs(DEST, exist_ok=True)
with tarfile.open(fileobj=io.BytesIO(raw), mode='r:gz') as tf:
    tf.extractall(DEST)
# restore any plates generated in cell 2 (the tarball has no assets/ dir)
os.makedirs(f'{DEST}/assets', exist_ok=True)
print("unpacked ->", DEST)
print("assets   ->", os.listdir(f'{DEST}/assets'))
'''

RENDER = r'''#@title 4 · Render FILM 09 (GPU film) + the 8 CPU films
os.chdir('/home/user/ahmed-motion-studio')
os.makedirs('out', exist_ok=True); os.makedirs('out/audio', exist_ok=True)

GPU_FILM = ("09-plate", 30)
CPU_FILMS = [("01-kinetic",38),("02-uimorph",9),("03-parallax",30),("04-character",30),
             ("05-paper",34),("06-glide",30),("07-offer",26),("08-constellation",30)]

server = subprocess.Popen(["node","serve.mjs","8171"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)

def render(name, dur, fmt="9x16"):
    wav = f"out/audio/{name}.wav"
    if not os.path.exists(wav):
        sh(f'node sfx.mjs films/{name}.js {wav} {dur}')
    out = f"out/{name}__{fmt}.mp4"
    if os.path.exists(out) and os.path.getsize(out) > 100000:
        print("skip", out, flush=True); return
    t0 = time.time()
    r = subprocess.run(f"node render.mjs --film {name} --fmt {fmt} --dur {dur} "
                       f"--sub 1 --crf 16 --out {out} --audio {wav}",
                       shell=True, capture_output=True, text=True)
    log = (r.stdout + r.stderr)
    keep = [l for l in log.splitlines() if 'plates loaded' in l or 'done' in l or 'died' in l]
    print(f"[{fmt}] {name}: {time.time()-t0:.0f}s  {keep[-1] if keep else 'NO OUTPUT'}", flush=True)
    if r.returncode != 0:
        print(log[-1200:], flush=True)

t_all = time.time()
render(*GPU_FILM)
for n, d in CPU_FILMS:
    render(n, d)
server.terminate()
print(f"\nALL DONE in {time.time()-t_all:.0f}s")
for f in sorted(os.listdir('out')):
    if f.endswith('.mp4'):
        print(f"  {f}  {os.path.getsize('out/'+f)//1024} KB")
'''

DELIVER = r'''#@title 5 · Package, download, and mirror to Drive
import glob
sh("cd /home/user/ahmed-motion-studio/out && rm -f ../../ahmed-academy-reels.zip && zip -q -r /home/user/ahmed-academy-reels.zip *.mp4")
z = "/home/user/ahmed-academy-reels.zip"
print("zip:", z, os.path.getsize(z)//1024, "KB")

# Mirror to Drive — the browser download is the step most likely to get lost.
try:
    from google.colab import drive
    drive.mount('/content/drive')
    dest = '/content/drive/MyDrive/01_Ahmed Academy/03_Content & Media/Motion Studio'
    os.makedirs(dest, exist_ok=True)
    sh(f'cp {z} "{dest}/"')
    sh(f'cp /home/user/ahmed-motion-studio/out/*.mp4 "{dest}/"')
    print("mirrored to Drive:", dest)
except Exception as e:
    print("Drive mirror failed:", e)

try:
    from google.colab import files
    files.download(z)
    print("download started")
except Exception as e:
    print("auto-download unavailable:", e)
'''


def code(src): return {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [],
                       "source": src.splitlines(keepends=True)}

B64 = pathlib.Path('/tmp/studio2.b64').read_text().strip()
CHUNK = '\n'.join(B64[i:i+90] for i in range(0, len(B64), 90))

nb = {"cells": [code(NOTE), code(GEN), code(PACK.replace('__B64__', CHUNK)), code(RENDER), code(DELIVER)],
      "metadata": {"colab": {"provenance": [], "toc_visible": True},
                   "kernelspec": {"name": "python3", "display_name": "Python 3"},
                   "language_info": {"name": "python"}},
      "nbformat": 4, "nbformat_minor": 0}

out = pathlib.Path('/home/musaahmedml/ahmed-motion-studio/AA_MOTION_GPU_COLAB.ipynb')
out.write_text(json.dumps(nb, indent=1))
print("wrote", out, out.stat().st_size, "bytes,", len(nb['cells']), "cells")
