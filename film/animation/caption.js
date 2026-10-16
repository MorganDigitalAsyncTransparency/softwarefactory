const MAX_LINE_CHARACTERS = 44;

// Shows a scene's caption at the bottom of the picture. The lines are rebuilt only when
// the text changes, so a screen reader announces each caption once.
export function showCaption(element, text, opacity) {
  element.style.opacity = opacity;
  if (element.dataset.text === text) return;
  element.dataset.text = text;
  element.replaceChildren(...wrap(text).map((line) => Object.assign(document.createElement('span'), { textContent: line })));
}

// Lines are balanced: the narrowest width that still fits the fewest lines, so a long
// caption does not end with a single orphan word.
export function wrap(text) {
  if (!text) return [];
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
