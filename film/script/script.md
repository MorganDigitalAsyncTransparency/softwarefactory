# Script

This file owns the scenes, their timing and the text of every caption. How each
scene looks is in [visual-descriptions.md](visual-descriptions.md), under the same
scene ID. The title, audience, message and other decisions are in the
[film brief](../README.md).

## The layout

A factory hall seen from the front and above, with an open office to its left. Ten belts
become five, and five become one:

- **Far left:** an open office where Product developers write and test the product.
  Each finished part leaves a desk as a small box on one of ten belts into the hall.
- **Left:** each pair of belts is joined by a machine into one belt with larger boxes.
- **Middle:** five belts, with gaps where people carry boxes by hand. No two belts
  look alike: the gaps lie and measure differently on each, boxes are missing here and
  there, and now and then the person carrying stops for a round.
- **New needs:** now and then a box carries a pink band: the product needs something
  new. A gate that IT has not yet fitted for it cannot check it and pushes it off with
  an amber light, and racks in the cloud are upgraded with the same pink one after the
  other.
- **Right:** one machine joins the five into one belt, which carries one large,
  finished box out to the loading dock.
- **Everywhere:** every running belt has at least two test stations, at least one of
  them working from the start. People move about the floor, working here and there.
- **Front:** a sixth lane is laid while the others run: its small belts grow from the
  office into the hall and its belt across the middle, with no boxes on it yet.
- **Front right corner:** a small server room, with cables to some of the stations and
  up to the cloud, and a card reader that lets only IT developers in.
- **Access:** communication is access controlled, as
  [the brief](../README.md#decisions) decides: now and then an IT security developer
  changes a station's access and it stops testing until an IT developer puts it right,
  some new stations wait for theirs, and a firewall on the server room's link to the
  cloud stops the release's stations for a while when it is raised.
- **All through the film:** the factory is built while it runs, a piece at a time
  from the first scene to the last (see [the brief](../README.md#decisions)): test
  stations rise and are connected, belts are laid, and IT adds racks in the cloud and
  in the server room. Beside the builds that finish fast, a few in the lines crawl:
  belts reach slowly into two of the gaps and a gate rises over a belt, and none of them
  is near done in the last frame.
- **Around it:** the hall itself is being built all through the film. Walls rise bay
  by bay, a crane lifts panels and Software factory developers work on scaffolding. It
  is never finished.
- **Above:** the cloud, with tall server racks, IT developers working by them, AI
  robots, and long cables down to the
  stations. The cloud grows too: new racks rise and new cables are pulled in. When
  something in the cloud fails, every belt stops.

## Three zoom levels

The film moves between three levels with the same smooth camera move, so the viewer
always knows where they are:

1. **Overview:** the whole factory and the cloud.
2. **Section:** the office, the left, the middle or the right.
3. **Detail:** a single box, gate or cable.

## Roles

Each role wears its own color, defined in the
[style block](visual-descriptions.md#style-block), and the film introduces each one.

- **Product developers** write and test the product, the boxes. In the middle they
  still carry boxes by hand between belts.
- **Software factory developers** build the factory: belts, test stations, gates and
  machines, the CI/CD and the test frameworks.
- **IT developers** build and run the IT services: the cloud, the server room and their cables.
- **IT security developers** are IT developers who secure the factory: firewalls, access
  to the stations, the card reader and the seal on the release.
- **Users** receive the finished box.

## Act 1: Who is here (0:00–0:42), level 1 and 2

| ID  | Time      | Scene                                                                                                                                                                                                                                      | Caption                                                  |
| --- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| S01 | 0:00–0:09 | The camera descends over the factory as it appears one layer at a time: the hall, the belts, the boxes, and last the cloud with its cables.                                                                                                | A software factory. It runs while we build it. |
| S02 | 0:09–0:17 | The camera glides to the open office. Product developers work at their desks, and small boxes leave the desks on belts into the hall.                                                                                                      | Product developers, dressed in purple, write and test the product. |
| S03 | 0:17–0:25 | The camera follows the belts to the back wall, where Software factory developers build on scaffolding, lay a new belt and raise a half-built test station while the crane lifts a panel. On the scaffolding, one of them talks about code in a speech bubble.                                                 | Software factory developers, dressed in yellow, build the factory: pipelines and tests. |
| S04 | 0:25–0:33 | The camera rises to the cloud, where a new rack rises among the servers, IT developers and AI robots. Below, IT developers pull new cables to stations that are still being built, and in the server room in the corner, which talks to the stations and the cloud, a second rack is installed. | IT developers, dressed in blue, run the cloud and the server room. |
| S05 | 0:33–0:42 | The camera glides down past the server room, where an IT security developer raises a firewall on its link to the cloud and the release's test stations stop for a moment, until IT opens the way. Then it settles over the whole factory. Ten belts become five and five become one; a large box leaves at the dock. | IT security developers, in red hats, protect the factory, and sometimes stop parts of it. |

## Act 2: The ends work (0:42–1:02), level 2

| ID  | Time      | Scene                                                                                                                                   | Caption                                                 |
| --- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| S06 | 0:42–0:53 | Zoom to the left. Small boxes arrive at an even pace on ten belts. Each passes test stations, a robot watches, and a green light glows. | Shift left: machines test the small parts early. |
| S07 | 0:53–1:02 | Pan to the right. A large box passes a test station and one still being built, is loaded out and received by Users.                     | On the right, finished products go out to Users, dressed in orange. |

## Act 3: The middle (1:02–1:41), levels 1 to 3

| ID  | Time      | Scene                                                                                                                                                                                                     | Caption                                                            |
| --- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| S08 | 1:02–1:09 | Move to the middle. The five belts stop short.                                                                                                                                                            | In between, a different story.                                     |
| S09 | 1:09–1:20 | Product developers run with boxes between the belts. One box arrives too early and one too late; one is dented and one is the wrong size. Piles build up and someone waits.                               | Carried by hand, some parts arrive late or broken.                                |
| S10 | 1:20–1:31 | Level 3, split into three panels. **Factory:** two belts at different heights. **IT:** a cable from the cloud too short, with the wrong plug. **Product:** two parts that do not fit. All three turn red. | When factory, IT and product do not fit, people find workarounds. |
| S11 | 1:31–1:41 | Overview. A light on the cloud turns red and its cables with it. Every belt and every robot on the floor stops and every test station turns red. An IT developer works at the red light in the cloud. The people on the floor do not know why: they keep working, and the Software factory developers drop their work and run about like mad, stopping again and again to inspect what is near them, until the cloud is back and the belts run again.            | When a cloud service fails, every belt stops.                      |

## Act 4: What we are doing (1:41–2:15), levels 2 and 3

| ID  | Time      | Scene                                                                                                                                                                        | Caption                             |
| --- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| S12 | 1:41–1:53 | Software factory developers install a gate between two belts, one of them talking about code in a speech bubble. A box that looks whole is seen through by the gate, shows something wrong inside and is stopped, and an intact one passes. An IT developer connects a cable from the cloud to the gate. A Product developer walks over to the IT developer, a box with a pink band waits at the new gate with an amber light, and the Product developer shows the IT developer the new box in a speech bubble; the IT developer answers with an adapter in one, lowers it onto the gate, and the next banded box passes. | Gates stop broken and unsafe parts. New needs, marked in pink, wait for IT. |
| S13 | 1:53–2:05 | A gap between two belts is closed. The camera stays while an AI robot takes over a stretch that was carried by hand, and the Product developer who carried it walks off toward the office, back to the product.          | Step by step, automation takes over. People get back to the product. |
| S14 | 2:05–2:15 | The picture turns digital: boxes become code changes, belts become pipeline stages, gates become quality gates, cables become integrations, the large box becomes a release, and the Software factory developers hold glowing laptops. | This is the CI/CD pipeline that Software factory developers build. |

## Act 5: Today (2:15–2:30), level 1

| ID  | Time      | Scene                                                                                                                                                                                                                             | Caption                                 |
| --- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| S15 | 2:15–2:24 | The camera pulls back to the whole factory. Some stretches in the middle are connected and gated, others are still carried by hand. Software factory developers and IT developers work side by side, and boxes flow out to Users. | Some steps are automatic. Some are done manually.    |
| S16 | 2:24–2:30 | The camera rises slowly while the line keeps running and the hall keeps growing.                                                                                                                                                  | We build the factory while it runs. |
