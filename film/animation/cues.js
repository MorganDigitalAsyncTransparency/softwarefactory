// Short sounds that mark a moment the viewer should notice, found by comparing the
// shot of the frame before with this one's: the cloud failing and coming back, a gate
// or a closed gap put in place, a robot taking over, someone starting to talk, a gate
// fitted for new boxes and the picture turning digital and back.
export function cues(before, now) {
  const [was, is] = [before.shot.state ?? {}, now.shot.state ?? {}];
  return [
    ...(!was.outage && is.outage ? ['powerDown'] : []),
    ...(was.outage && !is.outage ? ['powerUp'] : []),
    ...added(was.gaps, is.gaps),
    ...(spoken(is).some((says) => !spoken(was).includes(says)) ? ['blip'] : []),
    ...(fittedBetween(is.fitted, before.clock.film, now.clock.film) ? ['chime'] : []),
    ...(Math.round(was.digital ?? 0) !== Math.round(is.digital ?? 0) ? ['shimmer'] : []),
  ].map((kind) => ({ kind }));
}

// A robot whirs into place and anything else built into a gap clanks. Gaps are built
// one at a time; several that change at once are a cut to a later moment, so silent.
function added(was = {}, is = {}) {
  const changed = Object.entries(is).filter(([gap, kind]) => was[gap] !== kind);
  if (changed.length !== 1) return [];
  return [changed[0][1] === 'robot' ? 'whirr' : 'clank'];
}

function spoken({ crew = [], siteTalk }) {
  return [...crew.map(({ says }) => says), siteTalk && 'code'].filter(Boolean);
}

// Fitted gates are listed by the film time from which they pass new boxes.
function fittedBetween(fitted = {}, from, to) {
  return Object.values(fitted).some((at) => at > from && at <= to);
}
