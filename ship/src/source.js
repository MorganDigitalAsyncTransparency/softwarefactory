import { onTrace } from './trace.js';

const HOLD_MS = 450;
const KEYWORDS = /\b(import|export|from|const|let|function|return|if|else|for|of|new|while|continue)\b/g;

// The code view: the page reads its own source files, shows them, and lights up the
// function that is drawing or playing at this moment.
export async function loadSource(panel) {
  const files = sourceFiles();
  const texts = await Promise.all(files.map((file) => fetch(file).then((response) => response.text())));
  const rows = texts.map((text, index) => fileView(panel, files[index], text));
  onTrace(follow(rows));
  return texts.reduce((sum, text) => sum + text.split('\n').length - 1, 0);
}

// Every text file the page loaded from its own address: the page, its style and its
// modules. Nothing else is needed to draw or play anything.
function sourceFiles() {
  const loaded = performance.getEntriesByType('resource').map((entry) => entry.name);
  const own = loaded.filter((name) => new URL(name).origin === location.origin && /\.(js|css)$/.test(name));
  return [location.pathname, ...new Set(own)];
}

function fileView(panel, file, text) {
  const title = document.createElement('h3');
  title.textContent = new URL(file, location.href).pathname.split('/').slice(-2).join('/');
  const code = document.createElement('pre');
  const lines = text.split('\n').map((line) => row(line));
  code.append(...lines);
  panel.append(title, code);
  return { text, lines };
}

function row(line) {
  const element = document.createElement('code');
  element.innerHTML = paint(line) || ' ';
  return element;
}

function paint(line) {
  const safe = line.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  if (/^\s*(\/\/|\/\*|\*)/.test(line)) return `<i>${safe}</i>`;
  return safe.replace(KEYWORDS, '<b>$1</b>');
}

function follow(rows) {
  let shown = { at: 0, lines: [] };
  return (name) => {
    if (performance.now() - shown.at < HOLD_MS) return;
    shown.lines.forEach((line) => line.classList.remove('live'));
    shown = { at: performance.now(), lines: functionLines(rows, name) };
    shown.lines.forEach((line) => line.classList.add('live'));
    shown.lines[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };
}

// The lines of the named function, from its first line to the closing brace at the
// start of a line.
function functionLines(rows, name) {
  const start = new RegExp(`^(export )?(async )?function ${name}\\(`);
  for (const { lines } of rows) {
    const first = lines.findIndex((line) => start.test(line.textContent));
    if (first < 0) continue;
    const last = lines.findIndex((line, index) => index > first && line.textContent === '}');
    return lines.slice(first, last + 1);
  }
  return [];
}
