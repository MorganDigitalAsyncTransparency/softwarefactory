# Architecture

How the code in this repository is built. What it must do is in
[02-REQUIREMENTS.md](02-REQUIREMENTS.md); why it is built this way is in the
[decision records](decisions/README.md).

## The film animation

A static page, `film/index.html`, loads plain ES modules from `film/animation/` and
draws into one SVG with a fixed 1600 × 900 frame. There is no framework, no build step
and no dependency (ADR 0004).

```text
film/script/script.md ─fetch─▶ script-parser ─▶ timeline ─▶ player ─▶ SVG
                                                              │
                              intertitle ◀────────────────────┤
                              scenes ◀────────────────────────┘
                                │
                                ├─▶ world ─▶ belts
                                └─▶ panels
             (world, belts, panels and scenes draw with figures, layout and svg)
```

| Module             | Responsibility                                                                     |
| ------------------ | ---------------------------------------------------------------------------------- |
| `script-parser.js` | Pure: turns the script's scene tables into a list of scenes (R1)                   |
| `timeline.js`      | Pure: finds the scene and its progress at a time, and parses `?t=` (R5)            |
| `player.js`        | Loads the script, runs the clock, wires the controls and draws each frame (R4)     |
| `intertitle.js`    | The intertitle card: balanced line wrapping and fade (R3)                          |
| `scenes.js`        | Maps each scene ID to a camera, a world state and extras; throws on a missing ID (R2) |
| `world.js`         | The floor, walls, scaffolding, cloud, cables, assembly, dock and users             |
| `belts.js`         | The lanes: belts, gaps, flowing boxes, carriers, robots, gates and scanners        |
| `panels.js`        | The three-panel detail scene, where factory, IT and product do not fit             |
| `figures.js`       | People by role, robots, boxes and server racks                                     |
| `layout.js`        | The positions shared by every scene, and repeatable pseudo-random motion           |
| `svg.js`           | Creating SVG elements, and the physical and digital palettes                       |

### The world and the camera

Every factory scene draws the same world and only changes two things: the camera,
which is the SVG `viewBox` moved between two rectangles over the scene, and the state,
which says which gaps in the middle are closed, which have gates and which are still
carried by hand. That keeps the layout identical across scenes, as the continuity rules
in [visual-descriptions.md](../film/script/visual-descriptions.md#continuity) ask.

Motion is a pure function of time: a box's position is computed from the clock, never
stored, so seeking to any time draws the same frame.

### Tests

Node's built-in test runner runs `tests/`: the parser, the timeline, intertitle
wrapping, that every scene has a drawing, and that the script itself keeps its timing
rules. The drawings are checked by eye: open a frame with `?t=` per scene.
