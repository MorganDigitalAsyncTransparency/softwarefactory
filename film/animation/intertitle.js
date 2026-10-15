import { el, group } from './svg.js';
import { FRAME } from './layout.js';

const FONT_SIZE = 64;
const LINE_HEIGHT = 84;
const MAX_LINE_CHARACTERS = 30;
const FADE_SECONDS = 0.3;

export function intertitle(text, seconds, length) {
  const lines = wrap(text);
  const firstLineY = FRAME.height / 2 - ((lines.length - 1) * LINE_HEIGHT) / 2;
  const opacity = Math.max(0, Math.min(1, seconds / FADE_SECONDS, (length - seconds) / FADE_SECONDS));
  return group([
    el('rect', { ...FRAME, fill: '#000000' }),
    group(lines.map((line, index) => el('text', {
      x: FRAME.width / 2,
      y: firstLineY + index * LINE_HEIGHT,
      fill: '#FFFFFF',
      'font-family': 'Helvetica, Arial, sans-serif',
      'font-size': FONT_SIZE,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
    }, [line])), { opacity }),
  ]);
}

// Lines are balanced: the narrowest width that still fits the fewest lines, so a long
// intertitle does not end with a single orphan word.
export function wrap(text) {
  const lineCount = Math.ceil(text.length / MAX_LINE_CHARACTERS);
  for (let limit = Math.ceil(text.length / lineCount); limit < MAX_LINE_CHARACTERS; limit += 1) {
    const lines = wrapAt(text, limit);
    if (lines.length <= lineCount) return lines;
  }
  return wrapAt(text, MAX_LINE_CHARACTERS);
}

function wrapAt(text, limit) {
  return text.split(' ').reduce((lines, word) => {
    const last = lines.at(-1);
    if (last && `${last} ${word}`.length <= limit) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
    return lines;
  }, []);
}
