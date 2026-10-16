// The script's scene tables are the only source of scene times and captions
// (docs/02-REQUIREMENTS.md R1, ADR 0004).
const SCENE_ROW = /^\|\s*(S\d+)\s*\|\s*(\d+:\d{2})\s*–\s*(\d+:\d{2})\s*\|(.*)\|(.*)\|\s*$/;

export function parseScript(markdown) {
  const scenes = markdown.split('\n').map(parseRow).filter(Boolean);
  if (scenes.length === 0) throw new Error('The script has no scene rows.');
  return scenes;
}

function parseRow(line) {
  const match = SCENE_ROW.exec(line);
  if (!match) return null;
  const [, id, start, end, , caption] = match;
  return { id, start: toSeconds(start), end: toSeconds(end), caption: caption.trim() };
}

function toSeconds(clock) {
  const [minutes, seconds] = clock.split(':').map(Number);
  return minutes * 60 + seconds;
}
