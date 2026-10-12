// Shared raster-plate registry.
// A film declares `assets = [...]`; index.html starts loading them and the
// renderer blocks until they decode. Films must read plates through `plate()`
// here, never via their own `new Image()` — a fresh Image is async, so an
// immediate `.complete` check always reports false and the plate silently
// renders as an empty box.
const REG = new Map();

export function requestPlate(name) {
  if (REG.has(name)) return REG.get(name);
  const el = new Image();
  el.decoding = 'sync';
  el.src = '/assets/' + name;
  REG.set(name, el);
  return el;
}

export function plate(name) {
  const el = REG.get(name) || requestPlate(name);
  return (el.complete && el.naturalWidth > 0) ? el : null;
}

export function plateName(name) {
  const el = REG.get(name) || requestPlate(name);
  return el.naturalWidth || 0;
}

// Diagnostics: plates are created with `new Image()` and never appended to the
// DOM, so document.images cannot see them. Expose the registry instead.
export function plateReport() {
  const o = {};
  for (const [n, el] of REG) o[n] = el.naturalWidth ? `${el.naturalWidth}x${el.naturalHeight}` : (el.complete ? 'FAILED' : 'pending');
  return o;
}

export function platesReady() {
  for (const el of REG.values()) {
    if (!el.complete) return false;
    if (el.complete && el.naturalWidth === 0) return true; // failed to load; not a blocker
  }
  return true;
}

// Cover-fit an image into a rect, cropped to fill.
export function coverFit(g, el, x, y, w, h, radius = 0) {
  if (!el) return false;
  const ir = el.naturalWidth / el.naturalHeight;
  const rr = w / h;
  let dw = w, dh = h;
  if (ir > rr) dw = h * ir; else dh = w / ir;
  g.save();
  g.beginPath();
  if (radius > 0) g.roundRect(x, y, w, h, radius); else g.rect(x, y, w, h);
  g.clip();
  g.drawImage(el, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  g.restore();
  return true;
}

// Contain-fit an image centred on (cx, cy) inside a box of `size`.
export function containFit(g, el, cx, cy, size) {
  if (!el) return false;
  const ir = el.naturalWidth / el.naturalHeight;
  const w = ir >= 1 ? size : size * ir;
  const h = ir >= 1 ? size / ir : size;
  g.drawImage(el, cx - w / 2, cy - h / 2, w, h);
  return true;
}
