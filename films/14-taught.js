// REEL 4 of 4 — "Bad at maths — or just never taught properly?"
// Pain: identity damage. Strongest emotional stake; keep it kind.
import { makeStudentReel } from '../lib/student-reel.js';
import GRID from '../lib/beatgrid.js';
const film = makeStudentReel({
  id: '14-taught', dur: 19, badge: 'MATHS · PHYSICS · CS',
  hook: 'Bad at maths — or just never taught properly?',
  key: 'never taught',
  truth: ['Nobody is bad at this.', 'Nobody.'],
  truthKey: 'nobody',
  fix: [
    ['IT IS THE TEACHING', 'not the student, not the syllabus', 'cyan'],
    ['METHOD, NOT MOTIVATION', 'shown once, then repeated until automatic', 'emerald'],
    ['THEN IT MOVES', 'confidence follows the marks, not the reverse', 'gold'],
  ],
  note: 'I did it. A*A*AAA, straight 9s. Now I show you.',
}, GRID);
export const DURATION = film.duration;
export const assets = film.assets;
export function setup() { film.setup(); }
export function draw(g, L, t) { film.draw(g, L, t); }
export const sfx = film.sfx;
