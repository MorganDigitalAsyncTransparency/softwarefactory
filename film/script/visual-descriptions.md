# Visual descriptions

This file owns how the film looks: the style, the intertitle cards, continuity and one
prompt per scene for an animator or an AI video tool. What happens in each scene, when,
and the text of each intertitle are in [script.md](script.md), under the same scene ID.

## How to use the prompts

- Paste the [style block](#style-block) first in every prompt, then the scene's prompt.
- Make the overview frame of S02 first and use it as an image reference for every other
  scene, so the factory looks the same throughout.
- Scenes longer than 6–8 seconds may need to be generated in two parts.
- Intertitles are made in the editing tool, not generated: AI tools often distort text.

## Style block

```text
Clean modern 2D isometric animation, flat shapes with soft shadows, calm muted palette
(warm greys, off-white, soft teal), no text, no logos, no brand colors, no flags,
neutral global setting. Smooth, steady camera. Simple stylised characters with
minimal facial detail, diverse, gender-neutral silhouettes. Color-coded workwear:
Builders wear yellow vests and hard hats; IT infrastructure staff wear blue overalls;
Users wear warm orange; Carriers wear plain grey. AI agents are small identical
rounded white robots with a single soft blue light. Above the factory floats a
stylised cloud containing small server racks and AI robots, with long thin cables
hanging down to stations in the factory. Flow always goes left to right.
```

## Intertitle cards

- Black background with centered white text in a clean sans-serif.
- Text large enough to read in a small browser window: about 6–8 % of the frame height.
- Fade in and out over about 0.3 seconds. No decoration.

## Continuity

- The same factory layout in every overview: four or five belts start on the left and
  the loading dock is on the right.
- The gaps in the middle are always in the same places, so S19 shows which ones have
  been closed.
- The cables from the cloud always run to the same stations.

## Scene prompts

### S02

```text
Slow descending aerial camera over an isometric factory floor under construction.
Four to five parallel conveyor belts start on the left, carrying many small boxes in.
A loading dock on the right. In the middle of the floor the belts have visible gaps.
Scaffolding, one half-built wall, builders in yellow working. A stylised cloud above
with long thin cables down to stations. Calm, steady, wide establishing shot.
```

### S04

```text
Camera glides in to the left section of the factory. Many small boxes arrive at an
even rhythm on several automated conveyor belts. At each belt a small white robot
scans each box and a small green light glows. Smooth, orderly, rhythmic motion.
```

### S06

```text
Camera pans right to the loading dock. One large neat box rolls out of the dock and is
received by a few Users. Calm, satisfying, orderly.
```

### S09

```text
Camera moves to the middle of the factory floor. Conveyor belts end abruptly with gaps
between them. Workers in plain grey carry boxes by hand between belts, hurrying.
Boxes arrive at irregular times: one too early, one too late. One box is dented, one is
the wrong size. Small piles build up, one worker stands waiting. Uneven, stop-start
rhythm, slightly chaotic but not comic.
```

### S11

Three vertical panels side by side. Generate each panel on its own and combine them in
the edit.

```text
Panel 1: close-up of two conveyor belts at mismatched heights, a box stuck on the edge.
Panel 2: close-up of a long cable hanging from a cloud, too short to reach a socket,
the plug shape does not match the socket.
Panel 3: close-up of two box halves that should snap together into a larger box but
do not fit. End each panel with a soft red warning light.
```

### S13

```text
Builders install a gate between two conveyor belts. A dented box arrives and
the gate stops it with a red light; an intact box arrives and passes through with a
green light. An IT infrastructure worker connects a long cable from the cloud into the gate.
Clear, deliberate, satisfying.
```

### S15

```text
A gap between two conveyor belts is closed with a new belt section. Nearby, a small
white robot takes over carrying boxes on a stretch where a grey-clad worker used to
carry them. That worker puts on a yellow vest and walks off to build the next gate.
Positive, matter-of-fact.
```

### S17

Keep the composition of S13 and S15 so the viewer sees that it is the same factory.

```text
Same composition as the gate scene. Everything smoothly morphs into a digital
version: boxes become plain glowing cubes without any marks, conveyor belts become
luminous pipeline lanes, gates become checkpoints with a green light, cables from the
cloud become glowing integration lines, the large box becomes one larger glowing cube.
Keep layout identical, only the material changes.
```

### S19

```text
Slow zoom out to the same wide isometric view as the opening. Some of the gaps in the
middle are now closed with belts and gates, others still have grey-clad workers
carrying boxes by hand. Builders and IT staff work in parallel, the cloud above with
its cables. Boxes keep flowing out to users on the right. Calm, ongoing, unfinished.
```

## Sound

Calm, modern instrumental music, such as piano and light synths, with no vocals. In S09
the rhythm turns uneven and halting; from S13 on it is steady and forward-moving again.
Use royalty-free music licensed for internal and web use.
