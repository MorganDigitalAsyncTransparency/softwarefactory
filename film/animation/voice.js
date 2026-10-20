// The voice that reads the captions, one of the three layers of the film's sound
// (sound.js). Each caption has its own recording, made from the script when the film is
// published (ADR 0006). It plays in the same audio context as the music and the effects,
// so the three are mixed and none of them stops the others.
const DRIFT_SECONDS = 0.25;

export function createVoice(context, destination) {
  const recordings = new Map();
  let playing = null;
  return {
    // Keeps the scene's recording at the caption's offset, so a pause or a jump takes
    // the voice along; a negative offset is before the caption starts.
    follow(id, offset) {
      // The recording is fetched while the scene waits for its caption, so the first
      // word is not lost.
      const buffer = recordingFor(id);
      if (!buffer || offset < 0 || offset >= buffer.duration) return stop();
      const drift = playing?.id === id ? Math.abs(context.currentTime - playing.startedAt - offset) : Infinity;
      if (drift > DRIFT_SECONDS) start(id, buffer, offset);
    },
    stop,
  };

  function start(id, buffer, offset) {
    stop();
    const source = new AudioBufferSourceNode(context, { buffer });
    source.connect(destination);
    source.start(0, offset);
    playing = { id, source, startedAt: context.currentTime - offset };
  }

  function stop() {
    playing?.source.stop();
    playing = null;
  }

  // A recording is fetched once, the first time its scene plays. A film served
  // without them, as from a fresh clone, has none and plays without the voice.
  function recordingFor(id) {
    if (!recordings.has(id)) {
      recordings.set(id, undefined);
      load(`voice/${id}.mp3`).then((buffer) => recordings.set(id, buffer), () => {});
    }
    return recordings.get(id);
  }

  async function load(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`No recording at ${url} (${response.status}).`);
    return context.decodeAudioData(await response.arrayBuffer());
  }
}
