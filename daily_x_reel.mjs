#!/usr/bin/env node
// DAILY X-REEL (SLOW-PACED GRAPHIC ANIMATION REEL)
//
// Renders or stages today's Ahmed Academy slow-paced graphic motion reel
// and drops it into Daily Marketing/<date>/daily_x_reel.mp4 for Unified Hub approval.
//
//   node daily_x_reel.mjs                # today
//   node daily_x_reel.mjs 2026-10-05     # specific date
//

import { spawnSync, spawn } from 'node:child_process';
import { mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DATE = process.argv[2] || new Date().toISOString().slice(0, 10);
const DAILY_DIR = `/home/musaahmedml/CHROMEOS_BACKUP/MacroStudyHub/Daily Marketing/${DATE}`;

// The slow-paced X-reel pool: diagram-led motion graphics built by OpenCode
const FILMS = [
  { id: '15-recall', dur: 38.4, title: 'Re-reading is not revision.' },
  { id: '05-paper', dur: 34.0, title: 'The Page · Exam Sheet & Derivations' },
  { id: '08-constellation', dur: 30.0, title: 'The Map · Syllabus Constellation' },
  { id: '04-character', dur: 30.0, title: 'The System · Technical Blueprint Schematic' },
  { id: '06-glide', dur: 30.0, title: 'The Product · Dynamic Glide Deck' },
  { id: '01-kinetic', dur: 26.0, title: 'The Words · Kinetic Typography' },
];

// Deterministic rotation: anchor launch day (<= 2026-10-05) to 15-recall, then rotate daily
const dayIndex = Math.floor(new Date(DATE + 'T00:00:00Z').getTime() / 86400000);
const launchDays = Math.floor(new Date('2026-10-05T00:00:00Z').getTime() / 86400000);
const offset = dayIndex - launchDays;
const selectedIndex = offset <= 0 ? 0 : offset % FILMS.length;
const selected = FILMS[selectedIndex];

console.log(`[x-reel] ${DATE} selected film: ${selected.id} ("${selected.title}")`);

mkdirSync(DAILY_DIR, { recursive: true });
mkdirSync(resolve(ROOT, 'out'), { recursive: true });

const OUT_LOCAL = resolve(ROOT, `out/${selected.id}__9x16.mp4`);

// If already rendered locally, reuse; otherwise render
if (!existsSync(OUT_LOCAL)) {
  console.log(`[x-reel] Rendering ${selected.id} via headless motion studio...`);
  
  // Ensure serve.mjs is running
  try {
    const probe = spawnSync('bash', ['-lc', 'curl -sf --max-time 2 http://127.0.0.1:8171/index.html -o /dev/null']);
    if (probe.status !== 0) {
      const server = spawn('node', ['serve.mjs', '8171'], { cwd: ROOT, detached: true, stdio: 'ignore' });
      server.unref();
      spawnSync('sleep', ['2']);
    }
  } catch {}

  const r = spawnSync('node', [
    'render.mjs', '--film', selected.id, '--fmt', '9x16',
    '--dur', String(selected.dur), '--fps', '30', '--sub', '1', '--crf', '16',
    '--out', OUT_LOCAL
  ], { cwd: ROOT, encoding: 'utf8' });

  if (!existsSync(OUT_LOCAL)) {
    console.error('[x-reel] RENDER FAILED:', (r.stderr || r.stdout || '').slice(-300));
    process.exit(1);
  }
}

// Copy to Daily Marketing
const dst = join(DAILY_DIR, 'daily_x_reel.mp4');
copyFileSync(OUT_LOCAL, dst);
console.log(`[x-reel] Drop complete: ${dst} (${selected.id})`);
