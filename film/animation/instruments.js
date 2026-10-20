// The instruments that play the score's short sounds (sound.js): a piano for the music,
// the belts' click, the crane's thud and the cues. Each starts, swells for a moment and
// dies away.
const PIANO_PARTIALS = [1, 0.45, 0.2, 0.08];

export const SHORT = {
  note: piano,
  click: (voices) => pluck(voices, { type: 'triangle', frequency: 520, level: 0.04, seconds: 0.06 }),
  thud: (voices) => pluck(voices, { type: 'sine', frequency: 60, level: 0.3, seconds: 0.4 }),
  powerDown: (voices) => pluck(voices, { type: 'sawtooth', frequency: 240, to: 30, level: 0.08, seconds: 1.6 }),
  powerUp: (voices) => pluck(voices, { type: 'sawtooth', frequency: 30, to: 240, level: 0.06, seconds: 1.2 }),
  clank: (voices) => [140, 1250].forEach((frequency) => pluck(voices, { type: 'square', frequency, level: 0.05, seconds: 0.25 })),
  whirr: (voices) => pluck(voices, { type: 'sawtooth', frequency: 300, to: 700, level: 0.03, seconds: 0.9 }),
  blip: (voices) => pluck(voices, { type: 'sine', frequency: 880, level: 0.05, seconds: 0.15 }, voices.ring),
  chime: (voices) => [1047, 1568].forEach((frequency) => pluck(voices, { type: 'sine', frequency, level: 0.06, seconds: 1.8 }, voices.ring)),
  shimmer: (voices) => pluck(voices, { type: 'triangle', frequency: 400, to: 1600, level: 0.04, seconds: 1.4 }, voices.ring),
};

// A soft piano: a few overtones of the note, the higher ones dying away sooner.
function piano(voices, { pitch, seconds, level }) {
  PIANO_PARTIALS.forEach((share, index) => pluck(voices, {
    type: 'sine', frequency: pitch * (index + 1), level: level * share, seconds: seconds / (index + 1) + 0.3,
  }, voices.music));
}

function pluck({ context, master }, { type, frequency, to, level, seconds }, destination = master) {
  const now = context.currentTime;
  const envelope = gainNode(context, 0, destination);
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(level, now + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  const oscillator = tone(context, { type, frequency }, envelope);
  if (to) oscillator.frequency.exponentialRampToValueAtTime(to, now + seconds);
  oscillator.stop(now + seconds);
}

export function tone(context, { type, frequency }, destination) {
  const oscillator = new OscillatorNode(context, { type, frequency });
  oscillator.connect(destination);
  oscillator.start();
  return oscillator;
}

export function gainNode(context, gain, destination) {
  const node = new GainNode(context, { gain });
  node.connect(destination);
  return node;
}
