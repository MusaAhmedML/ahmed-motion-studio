// REEL 2 of 4 — "Do you actually know why you lost it?"
// Pain: no feedback loop. Diagnosis is the product.
import { makeStudentReel } from '../lib/student-reel.js';
import GRID from '../lib/beatgrid.js';
const film = makeStudentReel({
  id: '12-why', dur: 19, badge: 'ANY SUBJECT',
  hook: 'Do you actually know why you lost it?',
  key: 'why',
  truth: ['You found out', 'the mark was wrong.'],
  truthKey: 'wrong',
  fix: [
    ['READ THE SCHEME', 'every lost mark has a reason written on it', 'cyan'],
    ['MARK YOUR OWN', 'the one question you drop every time', 'emerald'],
    ['THAT IS THE ONE', 'rebuild it and the grade follows', 'gold'],
  ],
  note: 'GCSE · A-Level — maths, English, science, CS.',
}, GRID);
export const DURATION = film.duration;
export const assets = film.assets;
export function setup() { film.setup(); }
export function draw(g, L, t) { film.draw(g, L, t); }
export const sfx = film.sfx;
