// The script's scene tables are the only source of scene times and intertitle text
// (docs/02-REQUIREMENTS.md R1, ADR 0004).
const SCENE_ROW = /^\|\s*(S\d+)\s*\|\s*(\d+:\d{2})\s*[–-]\s*(\d+:\d{2})\s*\|\s*(Scene|Intertitle)\s*\|(.*)\|\s*$/;

export function parseScript(markdown) {
  const scenes = markdown.split('\n').map(parseRow).filter(Boolean);
  if (scenes.length === 0) throw new Error('The script has no scene rows.');
  return scenes;
}

function parseRow(line) {
  const match = SCENE_ROW.exec(line);
  if (!match) return null;
  const [, id, start, end, type, content] = match;
  return {
    id,
    start: toSeconds(start),
    end: toSeconds(end),
    type: type.toLowerCase(),
    text: content.replaceAll('**', '').trim(),
  };
}

function toSeconds(clock) {
  const [minutes, seconds] = clock.split(':').map(Number);
  return minutes * 60 + seconds;
}
