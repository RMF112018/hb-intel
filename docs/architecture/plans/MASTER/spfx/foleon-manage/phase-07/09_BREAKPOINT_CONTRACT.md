# 09 — Breakpoint Contract

## Implementation Requirement

Replace viewport-only behavior with container-aware behavior using `ResizeObserver` and/or CSS container queries. The Manager must react to practical canvas width, not only `window.innerWidth`.

## Breakpoint Modes

| Mode | Practical Width | Layout |
|---|---:|---|
| Ultrawide desktop | 1440px+ container | Command header + status strip; inbox and lane board side by side; preview split panel available. |
| Standard desktop/laptop | 1100–1439px | Inbox 40% / lane board 60%; placement panel overlays or right drawer. |
| Tablet landscape | 900–1099px | Two-column only if content remains readable; otherwise inbox over lane board. |
| Tablet portrait | 600–899px | Single-column stack: inbox, selected content, lane board. Placement opens drawer/full-width panel. |
| Phone portrait | 360–599px | Compact segmented nav; cards become rows; only critical fields visible. |
| Phone landscape / short height | Any width with height <640px | Compress header; sticky action bar; preview full-screen; no tall sticky rails. |
| Narrowest stable nested mode | <360px | Minimal mode: status summary, tabs, single-column list rows, full-screen workflow panels. |

## What Stays Visible

- Current app identity.
- System readiness summary.
- Inbox filter/search.
- Lane status summary.
- Primary next action.

## What Collapses

- Header secondary copy.
- Status chips into a compact status summary.
- Admin diagnostics behind disclosure.
- Lane details into expandable rows.
- Placement detail into panel.

## What Becomes Overflow

- Long content lists use Radix ScrollArea only when necessary.
- Admin diagnostic tables use horizontal scroll within bounded regions.
- No primary action should require horizontal page scroll.

## What Stacks

- Content inbox.
- Selected content detail.
- Lane board.
- Placement workflow.
- Preview.

## Preview Behavior

- Desktop/ultrawide: split preview or side panel.
- Tablet: drawer or modal.
- Phone/short-height: full-screen modal with focus trap and return focus.

## Acceptance Criteria

- No horizontal page scroll for primary workflow.
- Touch targets remain credible.
- Primary action visible without hunting.
- Keyboard flow remains logical.
- Empty/OAuth states are useful at all modes.
