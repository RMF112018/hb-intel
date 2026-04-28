# 14 — Acceptance Scorecard

| Category | Target | Acceptance Definition |
|---|---:|---|
| Purpose-fit IA | 4/4 | Reads as a news/feed manager within 3 seconds. |
| Default workflow clarity | 4/4 | Queue + slots + inspector make first action obvious. |
| Visual hierarchy | 4/4 | No stacked bands/cards; clear product composition. |
| Empty/blocked state quality | 4/4 | Setup and sync blockers are actionable. |
| Feed slot management | 4/4 | Slots managed inside Feed Desk, not separate top nav. |
| Editorial queue | 4/4 | Search/filter/list/table model supports daily management. |
| Schedule model | 3+/4 | Active/upcoming/expired/missing window visible. |
| Preview model | 3+/4 | Honest and governed; no fake iframe. |
| Admin separation | 4/4 | Diagnostics subordinate and isolated. |
| Accessibility | 3+/4 | Keyboard nav, row selection, inspector/drawer behavior pass. |
| SPFx host fit | 3+/4 | Full-width and constrained views credible. |
| Data discipline | 4/4 | No invented fields/content. |
| Security preservation | 4/4 | Auth/readiness/gating unchanged. |
| Package proof | 4/4 | Build/package proof passed and hosted proof captured. |

## Hard Stops

The effort fails if any remain true:

- Primary nav still includes `Lane Board`.
- Header still shows a row of 6+ top-level buttons.
- Default view still shows empty buckets as the main object.
- Admin/diagnostics dominates the first impression.
- Queue and placement remain detached.
- Preview invents output or iframes ungoverned content.
- CSS still uses `.panel` as the dominant top-level section wrapper.
- Hosted screenshots still look like a jumbled band/card stack.

