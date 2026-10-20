// The voice that reads the captions. Each caption has its own recording, made from
// the script when the film is published (ADR 0006); a film served without them, as
// from a fresh clone, plays without the voice.
const DRIFT_SECONDS = 0.25;

export function createVoice(sceneIds) {
  const clips = new Map(sceneIds.map((id) => [id, load(id)]));
  let current;
  return {
    // Keeps the scene's recording at the caption's offset, so a pause or a jump
    // takes the voice along; a negative offset is before the caption starts.
    follow(id, offset) {
      const clip = offset >= 0 ? clips.get(id) : undefined;
      if (current !== clip) current?.pause();
      current = clip;
      // A seek still under way is left to finish, or it would start again each frame.
      if (!clip || clip.seeking || offset >= clip.duration) return;
      if (Math.abs(clip.currentTime - offset) > DRIFT_SECONDS) clip.currentTime = offset;
      if (clip.paused && !clip.ended) clip.play().catch(untilClicked);
    },
    stop() {
      current?.pause();
      current = undefined;
    },
  };

  function load(id) {
    const clip = new Audio(`voice/${id}.mp3`);
    clip.preload = 'auto';
    clip.addEventListener('error', () => clips.delete(id));
    return clip;
  }
}

// The browser plays sound only after the viewer has clicked or pressed a key; until
// then each try is refused, and the next frame tries again.
function untilClicked(error) {
  if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') throw error;
}
