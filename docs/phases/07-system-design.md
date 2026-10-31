# Phase 7 — System design & interview readiness

**Time:** 2–3 weeks @ 8–12 hrs/week (overlaps with starting ForgeBoard)  
**Deliverable:** You can whiteboard ForgeBoard end-to-end without looking at notes.

## Skills and concepts

- API style tradeoffs: REST first; when GraphQL / RPC help
- Scaling vocabulary: load balancer, horizontal scale, sticky sessions, queues
- Consistency vs availability (practical level); read replicas (concept)
- Background jobs / workers (BullMQ, etc.)
- Designing a feature: entities → APIs → failure modes → observability
- Event loop awareness: what blocks Node, when to offload work

## Resources (free)

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [ByteByteGo YouTube](https://www.youtube.com/@ByteByteGo)
- [Node.js — Don’t block the event loop](https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop)
- Re-read your own phases 3–6: schema, auth, Redis, Docker

## Exercises

1. Read [docs/FORGEBOARD_DESIGN.md](../FORGEBOARD_DESIGN.md) once, then close it and redraw from memory.
2. Walk a friend (or rubber duck) through: “How would you design ForgeBoard?”
3. Pick one stretch: URL shortener **or** “notify workspace on new issue” with a queue.
4. Skim [docs/INTERVIEW_PREP.md](../INTERVIEW_PREP.md) and answer each prompt out loud.

## Milestone

Whiteboard ForgeBoard covering:

1. Requirements (functional + non-functional)  
2. Data model (workspaces, members, projects, issues)  
3. AuthZ (roles + ownership / membership checks)  
4. Hot paths + what to cache  
5. What to put on a queue  
6. Failure modes + how you’d observe them  

Then you’re ready to **build the capstone**.
