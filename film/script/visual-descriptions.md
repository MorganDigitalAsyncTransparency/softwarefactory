# Visual descriptions

This file owns how the film looks: the style, the captions, continuity and one prompt
per scene for an animator or an AI video tool. What happens in each scene, when, and
the text of each caption are in [script.md](script.md), under the same scene ID.

## How to use the prompts

- Paste the [style block](#style-block) first in every prompt, then the scene's prompt.
- Make the overview frame of S02 first and use it as an image reference for every other
  scene, so the factory looks the same throughout.
- Scenes longer than 6–8 seconds may need to be generated in two parts.
- Captions are added in the editing tool, not generated: AI tools often distort text.

## Style block

```text
Clean modern 3D animation, simple solid shapes with soft daylight and shadows, calm
muted palette, no text, no logos, no brand colors, no flags, neutral global setting.
Smooth, steady camera. Four layers that never share a color: the building has
sand-colored walls with windows; the machines are steel grey with black belts; the
product is plain cardboard boxes; IT is blue. Simple stylised characters with
minimal facial detail, diverse, gender-neutral silhouettes. Color-coded workwear:
Builders wear yellow vests and hard hats; IT infrastructure staff wear blue overalls;
Users wear warm orange; Carriers wear plain grey. AI agents are small identical
rounded white robots with a single soft blue light. Test stations are grey tunnels
over the belts with a blue screen and a small light. Above the factory floats a
white cloud carrying dark blue server racks and AI robots, with long blue cables
hanging down to stations in the factory. Flow always goes left to right. Behind the
hall a yellow tower crane lifts wall panels.
```

## Captions

- White text in a clean sans-serif, centered at the bottom of the picture over a soft
  dark gradient, never on a black card.
- Large enough to read in a small browser window: about 4–5 % of the frame height.
- Fades in and out with its scene, over about half a second. No decoration.

## Continuity

- One continuous picture: each scene's camera starts where the one before stopped. Only
  the split panels of S07 fade through black.
- The same layout throughout: ten small belts on the left, joined in pairs into five
  belts in the middle, joined into one belt out to the loading dock on the right. Every
  belt passes at least two test stations.
- The gaps in the middle are always in the same places, so S11 shows which ones have
  been closed.
- The cables from the cloud always run to the same stations.
- The factory is never finished. The back wall rises bay by bay all through the film,
  the crane keeps lifting panels, and the front belt in the middle is still being laid
  in the last frame.

## Scene prompts

### S01

```text
Slow descending aerial camera over a 3D factory hall under construction, open at the
front. The factory appears one layer at a time: the hall, the belts, the boxes, and last
the cloud, which sinks into place as its cables reach down. Scaffolding at the
half-built back wall, a crane behind it, builders in yellow working. Calm, steady,
wide establishing shot.
```

### S02

```text
Wide, steady view of the whole factory. Ten narrow belts of small boxes on the left
are joined in pairs into five belts of larger boxes, which a large machine joins into
one belt carrying one large box out to the loading dock. The crane lifts a wall panel.
```

### S03

```text
Camera glides in to the left section of the factory. Small boxes arrive at an even
rhythm on ten narrow automated belts. Each pair of belts passes two test stations; at
the first a small white robot watches, and a small green light glows as each box is
checked. Smooth, orderly, rhythmic motion.
```

### S04

```text
Camera pans right along the front of the factory to the loading dock. One large neat
box passes two test stations, rolls out of the door and is received by a few Users.
Calm, satisfying, orderly.
```

### S05

```text
Camera moves from the dock back to the middle of the factory floor. The five belts
end abruptly with gaps between them.
```

### S06

```text
Close on the middle of the factory floor. Workers in plain grey carry boxes by hand
between belts, hurrying. Boxes arrive at irregular times: one too early, one too late.
One box is dented, one is the wrong size. Small piles build up, one worker stands
waiting. Uneven, stop-start rhythm, slightly chaotic but not comic.
```

### S07

Three vertical panels side by side. Generate each panel on its own and combine them in
the edit.

```text
Panel 1: close-up of two conveyor belts at mismatched heights, a box stuck on the edge.
Panel 2: close-up of a long cable hanging from a cloud, too short to reach a socket,
the plug shape does not match the socket.
Panel 3: close-up of two box halves that should snap together into a larger box but
do not fit. End each panel with a soft red warning light.
```

### S08

```text
Builders install a gate between two conveyor belts. A dented box arrives and
the gate stops it with a red light; an intact box arrives and passes through with a
green light. An IT infrastructure worker connects a long cable from the cloud into the gate.
Clear, deliberate, satisfying.
```

### S09

```text
A gap between two conveyor belts is closed with a new belt section. Nearby, a small
white robot takes over carrying boxes on a stretch where a grey-clad worker used to
carry them. That worker puts on a yellow vest and walks off to build the next gate.
Positive, matter-of-fact.
```

### S10

Keep the composition of S08 and S09 so the viewer sees that it is the same factory.

```text
Same composition as the middle of the factory. Everything smoothly morphs into a
digital version: boxes become plain glowing warm-white cubes without any marks,
conveyor belts become luminous pipeline lanes, gates become checkpoints with a green
light, cables from the cloud become glowing cyan integration lines, the large box
becomes one larger glowing cube. Keep layout identical, only the material changes.
```

### S11

```text
The picture turns physical again as the camera pulls back to the same wide view as
the opening. Some of the gaps in the middle are now closed with belts and gates,
others still have grey-clad workers carrying boxes by hand. Builders and IT staff work
in parallel, the cloud above with its cables. Boxes keep flowing out to users on the
right. Calm, ongoing, unfinished.
```

### S12

```text
The camera rises slowly over the whole factory. The line keeps running, the crane
lifts another panel and the front belt is still being laid. Fade to black.
```

## Sound

Calm, modern instrumental music, such as piano and light synths, with no vocals. In S06
the rhythm turns uneven and halting; from S08 on it is steady and forward-moving again.
Use royalty-free music licensed for internal and web use.
