// Pure: where the camera looks in each stage, framed for the screen's shape. The camera
// drifts slowly around its shot so the picture never stands still.
const SHOTS = [
  { position: [-16, 5, 12], target: [-5, 0.5, 0] },
  { position: [-2, 7, 17], target: [5, 0.5, 0] },
  { position: [-14, 11, 21], target: [0, 0, 0] },
  { position: [6, 20, 34], target: [0, 0, 0] },
  { position: [-34, 24, 42], target: [0, 3, 0] },
  { position: [0, 230, 300], target: [0, 0, -40] },
];
const CODE_SHOT = { position: [4, 40, 58], target: [18, 0, 0] };
const DRIFT = 0.06;
// On a tall screen the camera turns to look along the belts, so they fill its height.
const PORTRAIT_TURN = 0.9;

export function shotFor(stage, time, aspect, coding = false) {
  const { position, target } = coding ? CODE_SHOT : SHOTS[stage];
  const away = Math.max(1, 1.2 / aspect) ** 0.7;
  const angle = Math.sin(time * DRIFT) * 0.25 + (aspect < 1 ? PORTRAIT_TURN : 0);
  const offset = position.map((value, axis) => (value - target[axis]) * away);
  const [x, y, z] = offset;
  const turned = [x * Math.cos(angle) - z * Math.sin(angle), y, x * Math.sin(angle) + z * Math.cos(angle)];
  return { position: turned.map((value, axis) => value + target[axis]), target };
}
