export function duration(scenes) {
  return scenes.at(-1).end;
}

export function frameAt(scenes, time) {
  const scene = scenes.find((candidate) => time < candidate.end) ?? scenes.at(-1);
  const progress = Math.min(1, (time - scene.start) / (scene.end - scene.start));
  return { scene, progress };
}

export function startTimeFrom(search) {
  const value = new URLSearchParams(search).get('t');
  const time = Number(value);
  return value === null || !Number.isFinite(time) ? null : time;
}

// How visible something that fades in and out over `edge` seconds is, `seconds` into a
// scene of `length` seconds.
export function fade(seconds, length, edge) {
  return Math.min(share(seconds, 0, edge), share(length - seconds, 0, edge));
}

// How far `value` has come from `from` to `to`, held within 0 and 1.
export function share(value, from, to) {
  return Math.min(1, Math.max(0, (value - from) / (to - from)));
}
