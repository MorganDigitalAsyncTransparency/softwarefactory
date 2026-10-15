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
  return value === null || Number.isNaN(time) ? null : time;
}
