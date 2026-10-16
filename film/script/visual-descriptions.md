# Visual descriptions

This file owns how the film looks: the style, the captions, continuity and one prompt
per scene for an animator or an AI video tool. What happens in each scene, when, and
the text of each caption are in [script.md](script.md), under the same scene ID.

## How to use the prompts

- Paste the [style block](#style-block) first in every prompt, then the scene's prompt.
- Make the overview frame of S05 first and use it as an image reference for every other
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
minimal facial detail, diverse, gender-neutral silhouettes. Each role wears its own
color: Product developers wear purple; Software factory developers wear yellow with
hard hats; IT developers wear the blue of IT; Users wear warm orange. AI agents are
small identical rounded white robots with a single soft blue light. Test stations
are grey tunnels over the belts with a blue screen and a small light. Above the
factory floats a white cloud carrying dark blue server racks and AI robots, with long
blue cables hanging down to stations in the factory. Flow always goes left to right.
```

## Captions

- White text in a clean sans-serif, centered at the bottom of the picture over a soft
  dark gradient, never on a black card.
- Large enough to read in a small browser window: about 4–5 % of the frame height.
- Fades in and out with its scene, over about half a second. No decoration.

## Continuity

- One continuous picture: each scene's camera starts where the one before stopped. The
  picture fades in at the start of S01, through black around the split panels of S10,
  and out at the end of S16.
- The same layout throughout, as [the script](script.md#the-layout) lays it out: the
  open office on the left, the hall, the cloud above.
- People move about the floor all the time, walking to a spot, working there a while
  and walking on, each role in its own color. Only the boxes ride the belts.
- The gaps in the middle are always in the same places, so S15 shows which ones have
  been closed.
- The cables from the cloud and from the server room always run to the same stations;
  a station that is still being built has its cable pulled in as it is built. While the cloud
  fails in S11 every cable turns red together with a light on the cloud and every
  station light; the belts stop, but the people keep working.
- The factory is never finished, and something is being built in every scene. The back
  wall rises bay by bay, a yellow tower crane behind the hall keeps lifting panels, new
  racks rise in the cloud and in the server room, new test stations rise one after the
  other with a Software factory developer and an IT developer at each, a sixth lane is
  laid in front, and two belts in the middle are still being laid in the last frame.

## Scene prompts

### S01

```text
Slow descending aerial camera over a 3D factory hall under construction, open at the
front, with an open office beside it on the left. The factory appears one layer at a
time: the hall and the office, the belts, the boxes, and last the cloud, which sinks
into place as its cables reach down. Calm, steady, wide establishing shot.
```

### S02

```text
Camera glides down to the open office left of the hall. Product developers in purple
work at white desks with screens. From each desk in the row nearest the hall a narrow
belt runs into the hall through a hatch in its wall, carrying small cardboard boxes. A few
developers walk between the desks.
```

### S03

```text
Camera follows the belts into the hall to the back wall, which is still being built.
Software factory developers in yellow with hard hats work on scaffolding, a tower crane
lifts a wall panel, and others lay the frame of a new belt section and raise the walls of a half-built test
station.
```

### S04

```text
Camera rises to the white cloud above the factory: dark blue server racks, a new rack
rising at the end of the row, small white robots walking between them, and long blue
cables hanging down to the stations. Below, IT developers in blue pull new cables to
half-built stations. In the front corner of the hall a small server room with one
rack standing and an IT developer installing a second has cables of its own to the
stations nearby and up to the cloud.
```

### S05

```text
Wide, steady view of the whole factory and the office. Ten narrow belts of small boxes
are joined in pairs into five belts of larger boxes, which a large machine joins into
one belt carrying one large box out to the loading dock. People in their role colors
walk about and work here and there.
```

### S06

```text
Camera glides in to the left section of the factory. Small boxes arrive at an even
rhythm on ten narrow automated belts. Each pair of belts passes two or three test
stations, some of them still half-built; in front, two new narrow belts are being laid
from the office; a small white robot watches, and a small green light
glows as each box is checked. Smooth, orderly, rhythmic motion.
```

### S07

```text
Camera pans right along the front of the factory to the loading dock. One large neat
box passes a test station and a half-built one, rolls out of the door and is received
by a few Users.
Calm, satisfying, orderly.
```

### S08

```text
Camera moves from the dock back to the middle of the factory floor. The five belts
end abruptly with gaps between them.
```

### S09

```text
Close on the middle of the factory floor. Product developers in purple carry boxes by
hand between belts, hurrying. Boxes arrive at irregular times: one too early, one too
late. One box is dented, one is the wrong size. Small piles build up, one developer
stands waiting. Uneven, stop-start rhythm, slightly chaotic but not comic.
```

### S10

Three vertical panels side by side. Generate each panel on its own and combine them in
the edit.

```text
Panel 1: close-up of two conveyor belts at mismatched heights, a box stuck on the edge.
Panel 2: close-up of a long cable hanging from a cloud, too short to reach a socket,
the plug shape does not match the socket.
Panel 3: close-up of two box halves that should snap together into a larger box but
do not fit. End each panel with a soft red warning light.
```

### S11

```text
Wide view of the whole factory. A red light on the cloud starts to blink and every
cable from the cloud turns red. All belts and the robots on the floor stop at once, every test station light
turns red and boxes stand still mid-belt. The people do not know why: they keep
working and hurry about, some running between the stations to find the fault. Then
the light goes out, the cables turn blue and the belts move again from where they
stopped. The
camera glides down to the middle of the floor.
```

### S12

```text
Software factory developers in yellow install a gate between two conveyor belts. A
dented box arrives and the gate stops it with a red light; an intact box arrives and
passes through with a green light. An IT developer in blue connects a long cable from
the cloud into the gate. Clear, deliberate, satisfying.
```

### S13

```text
A gap between two conveyor belts is closed with a new belt section. Nearby, a small
white robot takes over carrying boxes on a stretch where a Product developer used to
carry them. The developer walks back toward the office. Positive, matter-of-fact.
```

### S14

Keep the composition of S12 and S13 so the viewer sees that it is the same factory.

```text
Same composition as the middle of the factory. Everything smoothly morphs into a
digital version: boxes become plain glowing warm-white cubes without any marks,
conveyor belts become luminous pipeline lanes, gates become checkpoints with a green
light, cables from the cloud become glowing cyan integration lines, the large box
becomes one larger glowing cube. Keep layout identical, only the material changes.
```

### S15

```text
The picture turns physical again as the camera pulls back to the same wide view as
the opening. Some of the gaps in the middle are now closed with belts and gates,
others still have Product developers carrying boxes by hand. Software factory
developers and IT developers work side by side, the cloud above with its cables. Boxes
keep flowing out to users on the right. Calm, ongoing, unfinished.
```

### S16

```text
The camera rises slowly over the whole factory and the office. The line keeps running,
the crane lifts another panel, a rack is rising in the cloud, and two belts, the new
lane in front and some stations are still being built. Fade to black.
```

## Sound

Calm, modern instrumental music, such as piano and light synths, with no vocals. In S09
the rhythm turns uneven and halting, and in S11 it stops with the belts and starts again
with them; from S12 on it is steady and forward-moving.

Under the music, the sounds of the factory: a low hum of the running belts with the
noise of the hall, a soft click in time with the belts, and a thud each time the crane
sets a panel while the factory is in view. Two alerts: a two-tone alarm the whole time the cloud is down
in S11, while the belts fall quiet, and a slow warning beep while the panels of S10
show their red lights. All of it fades with the picture.

The animation makes this sound in the browser (ADR 0005). A video made with other
tools uses royalty-free music and effects licensed for internal and web use.
