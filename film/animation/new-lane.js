import { belt, joiner } from './machines.js';
import { person } from './figures.js';
import { group } from './shapes.js';
import { signal, station } from './lanes.js';
import { BELT_WORKERS, HALL, INTAKE, INTAKE_SPAN, INTAKE_TESTS, JOINER, NEW_LANE, smallLanes } from './layout.js';
import { middleTests, newLaneLaid } from './schedule.js';

// The crew laying the lane works in front of it, toward the camera.
const CREW_DISTANCE = 1.6;
const WALL_CLEARANCE = 2;

// The sixth lane, laid while the factory runs: its two small belts grow from the office
// into the hall, its joiner rises, then its belt grows across the middle, Software
// factory developers at each tip and its test stations built behind them. No boxes run
// on it yet, but its lights turn red with every other while the cloud is down.
export function newLane(state) {
  const { intake, joiner: joined, middle } = newLaneLaid(state.buildShare);
  const { index, z } = NEW_LANE;
  const rising = joiner(index);
  rising.scale.y = joined;
  const light = signal(state, null);
  return group([
    ...smallLanes(index).map((small) => intake > INTAKE.start && belt(INTAKE.start, intake, small, INTAKE.width)),
    intake < INTAKE.end && crew(intake),
    joined > 0 && rising,
    joined > 0 && joined < 1 && crew(JOINER.start),
    middle > JOINER.end && belt(JOINER.end, middle, z),
    middle > JOINER.end && crew(middle),
    ...INTAKE_TESTS.map((x, at) => station({ x, z, span: INTAKE_SPAN, key: `intake ${index} ${at}` }, state, light)),
    ...middleTests(index).map((x, at) => station({ x, z, span: 2.2, key: `middle ${index} ${at}` }, state, light)),
  ]);
}

// Two developers at the tip of a belt. Near the hall's wall, where the small belts pass
// through it, they are on its other side and out of sight.
function crew(tip) {
  if (Math.abs(tip - HALL.left) < WALL_CLEARANCE) return null;
  const at = (dx, seed) => group([person('factory', { seed: seed + 2 })], { position: [tip + dx, 0, NEW_LANE.z + CREW_DISTANCE] });
  return group(BELT_WORKERS.map(at));
}
