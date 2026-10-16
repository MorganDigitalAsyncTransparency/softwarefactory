// The film's sound, made in the browser with the Web Audio API so that no recording is
// kept (ADR 0005). It plays what score.js describes; the browser lets it start only
// after the viewer has clicked or pressed a key on the page.
const VOLUME = 0.5;
const GLIDE = 0.05;
const MIX = { hum: 0.12, room: 0.05, pad: 0.05, alert: 0.07, note: 0.08, click: 0.05, thud: 0.3 };

export function createSound() {
  let voices = null;
  return {
    resume() {
      voices ??= build(new AudioContext());
      voices.context.resume();
    },
    suspend() {
      voices?.context.suspend();
    },
    play({ volume, levels, events }) {
      if (voices?.context.state !== 'running') return;
      steady(voices, { volume, ...levels });
      events.forEach((event) => SHORT[event.kind](voices, event));
    },
  };
}

function build(context) {
  const master = gainNode(context, VOLUME, context.destination);
  const hum = gainNode(context, 0, master);
  [55, 110].forEach((frequency) => tone(context, { type: 'sawtooth', frequency }, filtered(context, 'lowpass', 180, hum)));
  noise(context, filtered(context, 'bandpass', 900, gainNode(context, MIX.room / MIX.hum, hum)));
  const pad = gainNode(context, 0, filtered(context, 'lowpass', 900, master));
  const chord = [0, 1, 2].map(() => tone(context, { type: 'triangle', frequency: 220 }, pad));
  const alert = gainNode(context, 0, filtered(context, 'lowpass', 2400, master));
  const siren = tone(context, { type: 'square', frequency: 880 }, alert);
  return { context, master, hum, pad, chord, alert, siren };
}

function steady(voices, { volume, hum, pad, chord, alert }) {
  const glide = (param, value) => param.setTargetAtTime(value, voices.context.currentTime, GLIDE);
  glide(voices.master.gain, VOLUME * volume);
  glide(voices.hum.gain, MIX.hum * hum);
  glide(voices.pad.gain, MIX.pad * pad);
  voices.chord.forEach((oscillator, index) => glide(oscillator.frequency, chord[index]));
  glide(voices.alert.gain, MIX.alert * alert.level);
  voices.siren.frequency.setValueAtTime(alert.pitch, voices.context.currentTime);
}

// Sounds that start, swell for a moment and die away.
const SHORT = {
  note: (voices, { pitch }) => pluck(voices, { type: 'sine', frequency: pitch, level: MIX.note, seconds: 1.2 }),
  click: (voices) => pluck(voices, { type: 'square', frequency: 2400, level: MIX.click, seconds: 0.03 }),
  thud: (voices) => pluck(voices, { type: 'sine', frequency: 60, level: MIX.thud, seconds: 0.4 }),
};

function pluck({ context, master }, { type, frequency, level, seconds }) {
  const now = context.currentTime;
  const envelope = gainNode(context, 0, master);
  envelope.gain.linearRampToValueAtTime(level, now + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  const oscillator = tone(context, { type, frequency }, envelope);
  oscillator.stop(now + seconds);
}

function tone(context, { type, frequency }, destination) {
  const oscillator = new OscillatorNode(context, { type, frequency });
  oscillator.connect(destination);
  oscillator.start();
  return oscillator;
}

function noise(context, destination) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  buffer.getChannelData(0).forEach((_, index, samples) => { samples[index] = Math.random() * 2 - 1; });
  const source = new AudioBufferSourceNode(context, { buffer, loop: true });
  source.connect(destination);
  source.start();
}

function gainNode(context, gain, destination) {
  const node = new GainNode(context, { gain });
  node.connect(destination);
  return node;
}

function filtered(context, type, frequency, destination) {
  const filter = new BiquadFilterNode(context, { type, frequency });
  filter.connect(destination);
  return filter;
}
