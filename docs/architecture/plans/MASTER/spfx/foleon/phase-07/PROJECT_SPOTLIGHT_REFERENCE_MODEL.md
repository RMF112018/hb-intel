# Project Spotlight Reference Model

## Why Project Spotlight is the controlling pattern

The reworked Project Spotlight lane already reflects the correct relationship between HB Central and Foleon:

- The lane is an employee-facing visual showcase.
- The lane is not the full publication.
- The lane uses a single strong access card.
- The lane opens the shared full-window viewer.
- Inline iframe rendering is intentionally ignored.
- The visual CTA is not a second nested control; it is part of the single card-launch button.
- Project metadata is minimal and only supports the launch decision.

## Company Pulse should mirror this structure conceptually

Company Pulse should not reuse the exact Project Spotlight look. It should use the same product logic:

| Principle | Project Spotlight | Company Pulse |
|---|---|---|
| Content source | Foleon publication | Foleon publication |
| Lane purpose | Access point to monthly project feature | Access point to current company update |
| Main UI | One visual showcase card | One editorial edition card |
| Launch behavior | Full-window viewer | Full-window viewer |
| Inline iframe | No | No |
| Secondary content | Minimal facts only | Minimal edition cues only |
| Ready-state data honesty | No invented fields | No invented stories/categories |
| Visual hierarchy | Media-first | Edition-cover / newsroom-banner first |

## What Company Pulse should borrow

- One dominant card.
- Scrim/gradient/media staging.
- One launch control.
- Employee-facing CTA language.
- Stable data attributes and refusal semantics.
- Preview and ready state using the same layout skeleton.
- No "inner card inside outer colored card" structure.

## What Company Pulse should not borrow

- Project/client/location language.
- Project fact chips.
- Monthly spotlight-specific cadence.
- Visual styling too close to Project Spotlight; Company Pulse should feel like company communications, not a project feature.
