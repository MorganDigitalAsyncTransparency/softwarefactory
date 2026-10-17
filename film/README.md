# Film: The factory that builds itself while it produces

A short animated silent film that explains a software factory by comparing it with a
physical factory. This file is the film brief: who the film is for and the decisions
that shape it. The scenes themselves are in [script/script.md](script/script.md).

The film plays as an animation drawn in code: [`index.html`](index.html). How to watch
it is in the [contributing guide](../docs/01-CONTRIBUTING.md#watching-the-animation).

## Brief

| Question         | Decision                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Audience         | Employees, with a message from senior management. No IT knowledge assumed.               |
| Purpose          | Explain the current state, so that viewers understand it.                                |
| Length           | 90–150 seconds.                                                                          |
| Form             | Animated silent film in a modern style. No voices; captions, music and the sounds of the factory. |
| Tone             | Matter-of-fact: "this is how it is". No humor, no selling.                               |
| Language         | English captions.                                                                        |
| Where it is seen | On the web, on the viewer's own computer.                                                |
| Brand            | None. Neutral and global: no logo, no company colors, no national markers.               |

## Core message

A software factory is being built while it already produces software. The left end
(small units checked early, *shift left*) and the right end (release) have worked for
years. In between, much is still manual: boxes are carried by hand, arrive at random
times and in varying quality, and factory, IT and product do not always fit together.
We are building gates at every step and automating the manual steps away.

## Analogies

| Physical factory                         | Software factory                               |
| ---------------------------------------- | ---------------------------------------------- |
| Many small boxes arriving on the left    | Small code changes, checked early (shift left) |
| Conveyor belts                           | The CI/CD pipeline                             |
| Carrying boxes by hand between belts     | Manual hand-offs between pipeline stages       |
| Gates that stop damaged boxes            | Quality gates                                  |
| A box with a pink band                   | A change that needs something new              |
| An adapter or rack with the same band    | IT adapting its services for that change       |
| Long cables to the stations              | Integrations, tested at every step             |
| The cloud and the server room            | IT services, in the cloud and run in-house     |
| Robots                                   | Automation and AI agents                       |
| The large box at the loading dock        | A release                                      |
| The factory being built around the belts | The software factory built while it runs       |

## Decisions

- The software layer is revealed late, after the factory story, so the factory image
  carries the film.
- *Shift left* gets its own caption.
- The film is one continuous picture with captions at the bottom, not cut by black title
  cards, which broke its flow.
- The factory is never finished: about half of it is built while the film runs, spread
  over the whole film and not only at the start, and the hall, the IT, some belts and
  some test stations are still being built when it ends.
- The first version is an animation in code that makes its own sound in the browser
  (ADR 0005); any recording to a video file comes later.
- The film introduces the people first: Product developers, Software factory developers
  and IT developers each wear their own color, so they are always told apart (see
  [roles](script/script.md#roles)).
- IT is both the cloud and a small server room in the factory, and it grows during the
  film like everything else.
- The parts come from an open office where Product developers work, so viewers see
  where the product starts.
- When a service in the cloud fails, every belt stops while the people, who do not know
  why, keep working and run about to find the fault: the film shows how much the whole
  line depends on IT.
- People work here and there on the floor, not only along the belts.
- Security shows as access control, quietly: locks on the cables, a card reader at the
  server room and a sealed release. When an access is changed, one station stops testing,
  and boxes pass it unchecked, until IT puts it right: small and local, unlike the cloud
  outage that stops every belt. No
  caption names it, and the details are meant to be found by watching again.
- The middle is uneven, not a neat grid: gaps differ from belt to belt, the flow has holes,
  and some builds in the lines crawl while others finish fast, so viewers see both.
- IT has to adapt when the product needs something new: boxes with a new color band
  wait at a gate until IT has fitted it, a Product developer and an IT developer talk
  about it in speech bubbles without words, and racks in the cloud are upgraded in the
  same color. The film holds such details on purpose: it is meant to be stopped, wound
  back and talked about.
