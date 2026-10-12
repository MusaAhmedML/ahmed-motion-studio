// REEL 1 of 4 — "Still spending three hours for one mark?"
// Pain: effort without progress. Only the config differs; the template is shared.
import { makeStudentReel } from '../lib/student-reel.js';
import GRID from '../lib/beatgrid.js';
const film = makeStudentReel({
  id: '11-effort', dur: 19, badge: 'A-LEVEL MATHS',
  hook: 'Still spending three hours for one mark?',
  key: 'three hours',
  truth: ['Three hours is not the', 'problem.'],
  truthKey: 'problem',
  fix: [
    ['THE ROUTINE IS FINE', 'your method is; the question is not', 'cyan'],
    ['THE SAME GAP', 'every paper, the same three topics', 'emerald'],
    ['FIX THAT FIRST', 'marks move within two sittings', 'gold'],
  ],
  note: 'Effort only pays when it is aimed.',
}, GRID);
export const DURATION = film.duration;
export const assets = film.assets;
export function setup() { film.setup(); }
export function draw(g, L, t) { film.draw(g, L, t); }
export const sfx = film.sfx;
