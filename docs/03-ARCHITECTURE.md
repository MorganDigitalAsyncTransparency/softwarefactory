# Architecture

How the code in this repository is built. What it must do is in
[02-REQUIREMENTS.md](02-REQUIREMENTS.md); why it is built this way is in the
[decision records](decisions/README.md).

## The film animation

A static page, `film/index.html`, loads plain ES modules from `film/animation/` and
draws a 3D scene with three.js into one canvas with a 16:9 frame. Each scene's caption
is HTML text at the bottom of the canvas. There is no framework and no build step; three.js comes from
a CDN through the page's import map (ADR 0004).

```text
film/script/script.md ─fetch─▶ script-parser ─▶ timeline ─▶ player ─┬─▶ caption (HTML)
                                                                   │
                                          scenes (shot: camera + state)
                                                                   │
                                                                   ▼
                                     stage ─▶ world ─┬─ building
                                       │             ├─ lanes ─▶ machines, flow
                                       │             ├─ cloud
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
| `scenes.js`        | Pure: maps each scene ID to a shot: a camera path, a world state and fades; throws on a missing ID (R2, R8) |
| `flow.js`          | Pure: where boxes, carriers and robots are at a time, and what a gate stops         |
| `layout.js`        | Pure: the positions shared by every scene, in metres, how far the building has come at a time, and repeatable noise |
| `stage.js`         | The renderer, camera and light; draws the factory or the S11 panels                 |
| `world.js`         | Puts the factory together and shows its layers one by one in the opening           |
| `building.js`      | The hall: floor, walls, windows and roof, and the site where it is still being built: the rising bay, scaffolding and crane |
| `lanes.js`         | Each lane: two small belts and their joiner, the belt with its gaps, flowing boxes, carriers, test stations, gates and the belt still being laid |
| `machines.js`      | Belts, gates, test stations, joiners, the assembly machine and the output to the dock |
| `cloud.js`         | IT: the cloud with server racks and AI agents, and the cables down to the stations  |
| `figures.js`       | People by role, robots and boxes                                                    |
| `panels.js`        | The three close-ups of S11, where factory, IT and product do not fit                |
| `shapes.js`        | Meshes from shared geometries                                                       |
| `materials.js`     | One material per surface, each with a physical and a digital look                   |

### The world and the camera

Every factory scene draws the same world and changes only two things: the camera,
which glides along a path over the scene and starts where the scene before stopped,
and the state, which says which gaps in the middle are closed, gated or carried by a
robot, and who works where. How far the hall and the unfinished belt have come is not
part of a scene: it follows the film's clock, so the factory grows all through the
film and is never finished. That keeps the layout identical across scenes, as the continuity
rules in [visual-descriptions.md](../film/script/visual-descriptions.md#continuity) ask.
What changes only with the state (the hall, the belts, the cables) is built once and
kept; what moves is drawn again each frame.

Motion is a pure function of time: a box's position is computed from the clock, never
stored, so seeking to any time draws the same frame. The digital look of S10 blends
every material between its two looks instead of drawing a second world.

### Tests

Node's built-in test runner runs `tests/`: the parser, the timeline, the motion,
caption wrapping, that every scene has a drawing and continues the camera of the one
before, and that the script itself keeps its timing rules. None of them needs three.js. The drawings are checked by eye: open a
frame with `?t=` per scene.
