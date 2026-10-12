// Bit-faithful ports of the two Remotion primitives the brand reel depends on.
// If these drift, every animation in the film drifts with them — so they are
// derived from the damped-oscillator solution (initial velocity 0) rather than
// eyeballed, which is what Remotion itself does.
//
// Unit-step response of a damped spring:
//   underdamped  x(t) = 1 - e^(-zw0 t) [ cos(wd t) + (z w0 / wd) sin(wd t) ]
//   critical     x(t) = 1 - e^(-w0 t) (1 + w0 t)
//   overdamped   x(t) = 1 - (r2 e^(r1 t) - r1 e^(r2 t)) / (r2 - r1)

/** Remotion `interpolate` with clamp on both ends (the reel uses clamp everywhere). */
export function lerpClamp(input, ranges, values) {
  if (input <= ranges[0]) return values[0];
  const last = ranges.length - 1;
  if (input >= ranges[last]) return values[last];
  for (let i = 0; i < last; i++) {
    if (input >= ranges[i] && input <= ranges[i + 1]) {
      const t = (input - ranges[i]) / (ranges[i + 1] - ranges[i]);
      return values[i] + (values[i + 1] - values[i]) * t;
    }
  }
  return values[last];
}

export function remotionSpring(frame, fps, { damping = 10, mass = 1, stiffness = 100 } = {}) {
  const t = frame / fps;
  if (t <= 0) return 0;

  const w0 = Math.sqrt(stiffness / mass);
  const z = damping / (2 * Math.sqrt(stiffness * mass));

  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  if (Math.abs(z - 1) < 1e-6) {
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  }
  const r = w0 * Math.sqrt(z * z - 1);
  const r1 = -z * w0 + r, r2 = -z * w0 - r;
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
}

/** The reel's own helper: spring with stiffness 120, mass 0.7. */
export function enter(frame, at, fps, damping = 200) {
  return remotionSpring(frame - at, fps, { damping, mass: 0.7, stiffness: 120 });
}

export function exitFade(frame, from, dur) {
  return lerpClamp(frame, [from, from + dur], [1, 0]);
}

/** Standard outro: 18-frame fade finishing 4 frames before the Sequence ends. */
export function fadeOut(f, dur) {
  return exitFade(f, dur - 22, 18);
}