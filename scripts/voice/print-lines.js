// Prints the voice's lines as JSON for speak.py, read from the script (R1).
import { readFileSync } from 'node:fs';
import { parseScript } from '../../film/animation/script-parser.js';
import { voiceLines } from './lines.js';

const script = readFileSync(new URL('../../film/script/script.md', import.meta.url), 'utf8');
console.log(JSON.stringify(voiceLines(parseScript(script))));
