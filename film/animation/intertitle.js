import { fade } from './timeline.js';

const MAX_LINE_CHARACTERS = 30;
const FADE_SECONDS = 0.3;

// Shows an intertitle on the black card over the stage: the text fades in and out.
export function showIntertitle(card, text, seconds, length) {
  const lines = wrap(text).map((line) => Object.assign(document.createElement('span'), { textContent: line }));
  card.replaceChildren(...lines);
  card.style.setProperty('--text-opacity', fade(seconds, length, FADE_SECONDS));
  card.hidden = false;
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
