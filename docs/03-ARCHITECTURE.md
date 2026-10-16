# Architecture

How the code in this repository is built. What it must do is in
[02-REQUIREMENTS.md](02-REQUIREMENTS.md); why it is built this way is in the
[decision records](decisions/README.md).

## The film animation

A static page, `film/index.html`, loads plain ES modules from `film/animation/` and
draws a 3D scene with three.js into one canvas with a 16:9 frame. Each scene's caption
is HTML text at the bottom of the canvas. There is no framework and no build step;
three.js comes from a CDN through the page's import map (ADR 0004).

```text
film/script/script.md ─fetch─▶ script-parser ─▶ timeline ─▶ player ─┬─▶ caption (HTML)
                                                                   │
                                          scenes (shot: camera + state)
                                                                   │
                                                                   ▼
                                     stage ─▶ world ─┬─ building, office
                                       │             ├─ lanes ─▶ machines, flow
                                       │             ├─ people ─▶ wander
                                       │             ├─ cloud, wiring, server-room, new-lane
                                       │             └─ figures
                                       └─▶ panels
  (who calls whom, not every import: the 3D modules also share figures, shapes and materials)
```

| Module             | Responsibility                                                                      |
| ------------------ | ----------------------------------------------------------------------------------- |
| `script-parser.js` | Pure: turns the script's scene tables into a list of scenes (R1)                    |
| `timeline.js`      | Pure: finds the scene and its progress at a time, fades, and parses `?t=` (R5)      |
| `player.js`        | Loads the script, runs the clock, wires the controls and shows each frame (R4)      |
| `caption.js`       | The caption at the bottom of the picture, with balanced line wrapping (R3)          |
| `scenes.js`        | Pure: maps each scene ID to a shot: a camera path, a world state and fades; throws on a missing ID; the line's clock (R2, R8, R9) |
| `flow.js`          | Pure: where boxes, carriers and robots are at a time, and what a gate stops         |
| `wander.js`        | Pure: where a person who works here and there is at a time                          |
| `layout.js`        | Pure: the positions shared by every scene, in metres, how far the building has come, and repeatable noise |
| `stage.js`         | The renderer, camera and light; draws the factory or the split panels               |
| `world.js`         | Puts the factory together and shows its layers one by one in the opening           |
| `building.js`      | The hall: floor, walls, windows and roof, and the site where it is still being built: the rising bay, scaffolding and crane |
| `office.js`        | The open office left of the hall, with a desk at the start of every small belt     |
| `server-room.js`   | The small server room in the corner of the hall, and its racks as they are installed |
| `new-lane.js`      | The sixth lane, laid during the film, with its test stations                        |
| `wiring.js`        | Every cable, from the cloud or the server room, how far it is pulled in, and red while the cloud is down |
| `people.js`        | Who walks about where, by role, and the Users at the dock                           |
| `lanes.js`         | Each lane: two small belts and their joiner, the belt with its gaps, flowing boxes, carriers, test stations, gates and the belt still being laid |
| `machines.js`      | Belts, gates, test stations, joiners, the assembly machine and the output to the dock |
| `cloud.js`         | IT: the cloud with its growing server racks and AI agents, cables, and the alarm when it fails |
| `figures.js`       | People by role, robots and boxes                                                    |
| `panels.js`        | The three close-ups where factory, IT and product do not fit                        |
| `shapes.js`        | Meshes from shared geometries                                                       |
| `materials.js`     | One material per surface, each with a physical and a digital look                   |

### The world and the camera

Every factory scene draws the same world and changes only two things: the camera,
which glides along a path over the scene and starts where the scene before stopped,
and the state, which says which gaps in the middle are closed, gated or carried by a
robot, whether the cloud has failed, and who works where. How far the hall, the cloud and
the unfinished belts and test stations have come is not part of a scene: it follows the share of the film
that has played, so the factory grows all through the film and is never finished. That
keeps the layout identical across scenes, as the continuity rules in
[visual-descriptions.md](../film/script/visual-descriptions.md#continuity) ask.
What changes only with the state (the hall, the belts, the cables) is built once and
kept; what moves is drawn again each frame.

Motion is a pure function of time: a box's position is computed from the clock, never
stored, so seeking to any time draws the same frame. There are two clocks. The film's
clock drives the camera, the building site, the cloud and the stations being built. The line's clock is the
film's clock minus the seconds the line has stood still while the cloud was down; it
drives the belts, the boxes and the people, so they stop and go on from where they
were (R9). The digital look blends every material between its two looks instead of
drawing a second world.

### Tests

Node's built-in test runner runs `tests/`: the parser, the timeline, the motion of
boxes and people, the line's clock, caption wrapping, that every scene has a drawing
and continues the camera of the one before, that the layout gives every belt two test
stations, one of them working from the start, and is never finished, and that the script itself keeps its timing rules.
None of them needs three.js. The drawings are checked by eye: open a frame with `?t=`
per scene.
