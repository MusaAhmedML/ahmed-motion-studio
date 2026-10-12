// DAILY LINE ROTATION
//
// The brandreel is identical every day except its first two clips: a SETUP line
// that names the default approach, and an ANSWER that names ours. Those are the
// only things that change, so a day's reel is a pure function of the date.
//
// Constraints that shaped every line here:
//   - METHOD claims only. Never a result, a grade, a testimonial or a count.
//   - Nothing about a specific student. Nothing about outcomes.
//   - Each pair must be a genuine contrast: what most tuition does vs what we do.
//   - Same rough length so the spring timing and type measure never shift.
//
// `linesForDate` is deterministic: the same date always yields the same reel, so
// a re-run reproduces a published video byte for byte.

export const LINES = [
  { setup: 'Most tuition starts with a guess.',        a: 'We start with a',      b: 'diagnosis.' },
  { setup: 'Revision lists get built from the syllabus.', a: 'We build them from', b: 'your last paper.' },
  { setup: 'Everyone calls the same topic hard.',     a: 'We find out what',     b: 'it actually is.' },
  { setup: 'Past papers get done in order.',          a: 'We do them in',        b: 'mark order.' },
  { setup: 'Notes get copied, then reread.',         a: 'Notes get built from', b: 'your own errors.' },
  { setup: 'The same method gets explained again.',  a: 'So we change',         b: 'the method.' },
  { setup: 'Two hours on the topic they hate.',      a: 'Twenty minutes on',    b: 'the right one.' },
  { setup: 'Practice, with nobody checking.',        a: 'Every question gets',  b: 'checked.' },
  { setup: 'Exam questions get saved for the exam.',  a: 'They get used in',     b: 'week one.' },
  { setup: 'Confidence comes after the grade.',      a: 'The grade comes after', b: 'the method.' },
  { setup: 'The syllabus gets read front to back.',  a: 'The mark scheme gets', b: 'read line by line.' },
  { setup: 'Full answers get written every time.',   a: 'Answers get marked',   b: 'as they land.' },
  { setup: 'One method for every question.',         a: 'The method changes',   b: 'with the question.' },
  { setup: 'Help gets asked at the end of the chapter.', a: 'Help gets asked', b: 'at the first error.' },
  { setup: 'Timetables get built on motivation.',    a: 'They get built on',    b: 'mark weight.' },
  { setup: 'Students get grouped by year group.',     a: 'Grouped by what',      b: "they can't do." },
  { setup: 'The weak topic is whatever is last.',    a: 'The weak topic is',    b: 'the one that costs most.' },
  { setup: 'An explanation stops when it clicks once.', a: 'It stops when',      b: "it has been done three times." },
  { setup: 'Homework gets set by chapter.',          a: 'Homework gets set',    b: 'by mistake.' },
  { setup: 'Progress gets judged by the grade.',     a: 'Progress gets judged', b: 'by topic.' },
  { setup: 'Topics get covered in order.',           a: 'Topics get ranked',    b: 'by cost.' },
  { setup: 'Everyone starts from the same notes.',   a: 'Everyone starts from', b: 'their own paper.' },
  { setup: 'Mistakes get avoided.',                  a: 'Mistakes get',         b: 'used.' },
  { setup: 'The easy-looking topic gets skipped.',   a: 'It gets',              b: 'checked first.' },
  { setup: 'Practice gets counted in hours.',        a: 'Progress gets counted', b: 'in marks.' },
  { setup: 'Feedback arrives at the end.',           a: 'Feedback arrives',     b: 'at the first error.' },
  { setup: 'Explanations start from the textbook.',  a: 'Explanations start from', b: 'your paper.' },
  { setup: 'The student guesses what the mark wants.', a: 'The mark scheme tells', b: 'you what it wants.' },
  { setup: 'Errors get corrected quietly.',          a: 'Errors get',           b: 'tracked.' },
  { setup: 'Study time gets split evenly.',          a: 'Study time follows',   b: 'what costs marks.' },
  { setup: 'Past papers get filed away.',           a: 'They get',             b: 'worked.' },
  { setup: 'The tutor sets the pace.',               a: 'The paper sets',       b: 'the pace.' },
];

/** Deterministic pick: anchor launch day (<= 2026-10-05) to line 0 (Diagnosis), then cycle through pool daily. */
export function linesForDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const days = Math.floor(d.getTime() / 86400000);
  const launchDays = Math.floor(new Date('2026-10-05T00:00:00Z').getTime() / 86400000);
  const diff = days - launchDays;
  const idx = diff <= 0 ? 0 : diff % LINES.length;
  return { ...LINES[idx], index: idx, total: LINES.length, date: dateStr };
}

/** Stable per-day seed, so anything random is reproducible too. */
export function seedForDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  return (d.getTime() / 86400000) | 0;
}