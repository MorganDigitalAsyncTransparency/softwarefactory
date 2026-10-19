import { belt, joiner } from './machines.js';
import { developer } from './figures.js';
import { group } from './shapes.js';
import { signal, station } from './lanes.js';
import { BELT_WORKERS, HALL, INTAKE, INTAKE_SPAN, INTAKE_TESTS, JOINER, NEW_LANE, TEST_SPAN, smallLanes } from './layout.js';
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
    intake < INTAKE.end && crew(intake, state.outage),
    joined > 0 && rising,
    joined > 0 && joined < 1 && crew(JOINER.end, state.outage),
    middle > JOINER.end && belt(JOINER.end, middle, z),
    middle > JOINER.end && crew(middle, state.outage),
    ...INTAKE_TESTS.map((x, at) => station({ x, z, span: INTAKE_SPAN, key: `intake ${index} ${at}` }, state, light)),
    ...middleTests(index).map((x, at) => station({ x, z, span: TEST_SPAN, key: `middle ${index} ${at}` }, state, light)),
  ]);
}

// Two developers past the tip of a belt; none are drawn near the hall's wall, where
// they would stand in it.
function crew(tip, outage) {
  if (Math.abs(tip - HALL.left) < WALL_CLEARANCE) return null;
  const at = (dx, seed) => developer({ x: tip + dx, z: NEW_LANE.z + CREW_DISTANCE, seed: seed + 2 }, outage);
  return group(BELT_WORKERS.map(at));
}
