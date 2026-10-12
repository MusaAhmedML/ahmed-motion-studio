// REEL 3 of 4 — "Six topics wrong. Which one is costing you the grade?"
// Pain: revision paralysis. The X-ray is the hook.
import { makeStudentReel } from '../lib/student-reel.js';
import GRID from '../lib/beatgrid.js';
const film = makeStudentReel({
  id: '13-which', dur: 19, badge: 'EXAM SEASON',
  hook: 'Six topics wrong. Which one is costing you the grade?',
  key: 'six topics',
  truth: ['One of them is', 'costing you everything.'],
  truthKey: 'everything',
  fix: [
    ['STOP REVISING ALL SIX', 'you have no time to fix six', 'cyan'],
    ['RANK THEM BY MARKS', 'which topic costs the most paper marks', 'emerald'],
    ['FIX THE TOP ONE', 'it usually moves the whole grade', 'gold'],
  ],
  note: 'The roadmap tells you the order. Free.',
}, GRID);
export const DURATION = film.duration;
export const assets = film.assets;
export function setup() { film.setup(); }
export function draw(g, L, t) { film.draw(g, L, t); }
export const sfx = film.sfx;
