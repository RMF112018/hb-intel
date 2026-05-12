# B03 Targeted Web Verification Notes

## Objective

Record the current external guidance that supports the B03 shell/navigation/UX decisions without turning the implementation package into a general-purpose UX research dossier.

## 1. SharePoint full-width host fit remains a real implementation constraint

Microsoft’s current SharePoint Framework guidance continues to state that:

- full-width columns are a communication-site layout,
- SPFx web parts must set `supportsFullBleed: true` to participate,
- the SharePoint Workbench cannot fully validate full-width hosting.

### B03 implication
B03 should preserve B02’s full-width host-fit posture and avoid hero/grid patterns that only work in narrow local test containers.

## 2. Tabs and menu buttons remain the correct accessibility pattern

The W3C ARIA Authoring Practices still support:

- `tablist` / `tab` / `tabpanel` semantics,
- Enter/Space tab activation,
- Home/End tab movement,
- menu-button semantics with `aria-haspopup`, `aria-expanded`, and `role="menu"` / `role="menuitem"`.

### B03 implication
The My Work Home tab + attached Adobe module launcher is not merely a visual style. It requires a real tab/menu interaction contract.

## 3. WCAG 2.2 raises the bar for focus and control usability

W3C WCAG guidance continues to emphasize:

- Focus Not Obscured,
- visible focus indicators,
- target size minimums,
- reflow without ordinary two-dimensional scrolling.

### B03 implication
B03 should treat the nav launcher, menu items, card CTAs, and filter affordances as accessibility-sensitive interaction points, not decorative chrome.

## 4. Fluent 2 continues to support the layout/card strategy used by B03

Fluent guidance supports:

- layout hierarchy created through spacing and proportional emphasis,
- responsive grids and deliberate reflow,
- cards that hold information and actions related to one concept/object,
- concise, action-oriented card content.

### B03 implication
The B03 decision to avoid generic overview filler cards and instead use tightly scoped card roles is aligned with current design-system guidance.

## 5. Dashboard research continues to support usefulness and next-action clarity

The cited 2025 dashboard and interruption-recovery research continues to support:

- user-relevant dashboards over information-dense but low-action dashboards,
- cues that help users identify the next action after interruptions.

### B03 implication
The home queue card and focused Adobe module should emphasize:
- what requires attention,
- what state the source is in,
- what the user can do next,
while avoiding unnecessary analytics density.

## 6. Explainability should be used to clarify posture, not overclaim intelligence

The cited explainability study remains best used as cautionary support:

- explanation can improve trust perception,
- it does not automatically produce better decisions.

### B03 implication
B03’s governance microcopy and source-readiness explanations should be precise and modest:
- queue visibility,
- source actions remain elsewhere,
- read-only posture,
not “smart assistant” overclaiming.

## Verification outcome

The B03 planning decisions remain externally defensible as of 2026-05-12. The implementation package should proceed with:

- PCC-inspired shell semantics,
- attached module launcher menu,
- hero/state swap,
- bento grid choreography,
- strict accessibility validation,
- no fake search,
- no analytics in MVP.
