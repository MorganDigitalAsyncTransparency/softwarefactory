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
- **Middle:** five belts, with gaps where people carry boxes by hand.
- **Right:** one machine joins the five into one belt, which carries one large,
  finished box out to the loading dock.
- **Everywhere:** every running belt has at least two test stations, at least one of
  them working from the start. People move about the floor, working here and there.
- **Front:** a sixth lane is laid while the others run: its small belts grow from the
  office into the hall and its belt across the middle, with no boxes on it yet.
- **Front right corner:** a small server room, with cables to some of the stations and
  up to the cloud.
- **All through the film:** about half of the factory is built while it runs, a piece
  at a time from the first scene to the last: test stations rise and are connected,
  belts are laid, and IT adds racks in the cloud and in the server room.
- **Around it:** the hall itself is being built all through the film. Walls rise bay
  by bay, a crane lifts panels and Software factory developers work on scaffolding. It
  is never finished.
- **Above:** the cloud, with servers and AI robots, and long cables down to the
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
- **Users** receive the finished box.

## Act 1: Who is here (0:00–0:41), level 1 and 2

| ID  | Time      | Scene                                                                                                                                                                                                                                      | Caption                                                  |
| --- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| S01 | 0:00–0:09 | The camera descends over the factory as it appears one layer at a time: the hall, the belts, the boxes, and last the cloud with its cables.                                                                                                | A factory.                                               |
| S02 | 0:09–0:17 | The camera glides to the open office. Product developers work at their desks, and small boxes leave the desks on belts into the hall.                                                                                                      | Product developers write and test the product.           |
| S03 | 0:17–0:25 | The camera follows the belts to the back wall, where Software factory developers build on scaffolding, lay a new belt and raise a half-built test station while the crane lifts a panel.                                                   | Software factory developers build the factory around it. |
| S04 | 0:25–0:33 | The camera rises to the cloud, where a new rack rises among the servers and AI robots. Below, IT developers pull new cables to stations that are still being built, and in the server room in the corner, which talks to the stations and the cloud, a second rack is installed. | IT developers run the cloud and the server room.         |
| S05 | 0:33–0:41 | The camera settles over the whole factory. Ten belts become five and five become one; a large box leaves at the dock.                                                                                                                      | Many parts in. One product out.                          |

## Act 2: The ends work (0:41–1:02), level 2

| ID  | Time      | Scene                                                                                                                                   | Caption                                                 |
| --- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| S06 | 0:41–0:53 | Zoom to the left. Small boxes arrive at an even pace on ten belts. Each passes test stations, a robot watches, and a green light glows. | Shift left: quality checked early. Automated for years. |
| S07 | 0:53–1:02 | Pan to the right. A large box passes a test station and one still being built, is loaded out and received by Users.                     | On the right: we can release.                           |

## Act 3: The middle (1:02–1:41), levels 1 to 3

| ID  | Time      | Scene                                                                                                                                                                                                     | Caption                                                            |
| --- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| S08 | 1:02–1:09 | Move to the middle. The five belts stop short.                                                                                                                                                            | In between, a different story.                                     |
| S09 | 1:09–1:20 | Product developers run with boxes between the belts. One box arrives too early and one too late; one is dented and one is the wrong size. Piles build up and someone waits.                               | Manual. Random timing. Varying quality.                            |
| S10 | 1:20–1:31 | Level 3, split into three panels. **Factory:** two belts at different heights. **IT:** a cable from the cloud too short, with the wrong plug. **Product:** two parts that do not fit. All three turn red. | When factory, IT and product don't fit together, everything waits. |
| S11 | 1:31–1:41 | Overview. A light on the cloud turns red and its cables with it. Every belt stops, every test station turns red and the people stand still, until the cloud is back and everything runs again.            | When a cloud service fails, every belt stops.                      |

## Act 4: What we are doing (1:41–2:15), levels 2 and 3

| ID  | Time      | Scene                                                                                                                                                                        | Caption                             |
| --- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| S12 | 1:41–1:53 | Software factory developers install a gate between two belts. A dented box is stopped, an intact one passes. An IT developer connects a cable from the cloud to the gate.    | We build gates at every step.       |
| S13 | 1:53–2:05 | A gap between two belts is closed. An AI robot takes over a stretch that was carried by hand, and the Product developer who carried it walks off toward the office.          | And automate the manual steps away. |
| S14 | 2:05–2:15 | The picture turns digital: boxes become code changes, belts become pipeline stages, gates become quality gates, cables become integrations, the large box becomes a release. | In software: our CI/CD pipeline.    |

## Act 5: Today (2:15–2:30), level 1

| ID  | Time      | Scene                                                                                                                                                                                                                             | Caption                                 |
| --- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| S15 | 2:15–2:24 | The camera pulls back to the whole factory. Some stretches in the middle are connected and gated, others are still carried by hand. Software factory developers and IT developers work side by side, and boxes flow out to Users. | Today: part automated, part by hand.    |
| S16 | 2:24–2:30 | The camera rises slowly while the line keeps running and the hall keeps growing.                                                                                                                                                  | We are building the line while it runs. |
