# 11 — Accessibility and Responsive Requirements

## Accessibility Requirements

### Tabs

Use accessible tab semantics:

- `role="tablist"` on tab container.
- `role="tab"` on each tab.
- `aria-selected` on active tab.
- `aria-controls` linking tab to panel.
- `role="tabpanel"` on panel.
- keyboard support for horizontal tabs:
  - Tab enters/leaves tablist;
  - Arrow keys move focus between tabs;
  - Enter/Space activates tab if manual activation is used.

If existing project conventions use button-based tabs instead of ARIA tabs, preserve semantic clarity and keyboard behavior.

### Status Messages

- Critical errors and warnings should be announced appropriately without overwhelming the user.
- Avoid multiple assertive alerts stacked at the top.
- Informational status should be polite.
- Dynamic loading should use appropriate `role="status"` or equivalent existing patterns.

### Disabled Actions

- Disabled buttons must provide visible reason text and/or accessible description.
- Prefer keeping the blocker reason adjacent to the action.
- Tooltips must not be the only source of critical information.
- If a tooltip is used, connect it with `aria-describedby`.

### Focus Management

- Opening editor/drawer should move focus to the drawer title.
- Closing drawer should return focus to the triggering control.
- Copy diagnostic proof should announce success without disruptive focus changes.

### Color and Status

- Status must not rely on color only.
- Chips must include text labels.
- Focus-visible styles must be clear.
- Text and interactive controls must meet WCAG AA contrast where applicable.

### Tables

- Tables must have clear headers.
- Diagnostic tables should not be primary workflow UI.
- On narrow widths, tables must wrap, collapse, or convert into stacked rows.

## Responsive / SharePoint Host-Fit Requirements

### General

- No horizontal overflow inside SharePoint page canvas.
- Avoid fixed widths that exceed the webpart zone.
- Header chips and actions must wrap cleanly.
- Lane cards must stack on narrow widths.

### Recommended Layout Breakpoints

These should follow repo doctrine/breakpoint authority if different.

| Width condition | Behavior |
|---|---|
| Wide desktop | Header chips/actions inline; three lane cards across; selected workspace below or beside library. |
| Medium desktop/tablet | Two lane cards across, third wraps; action group wraps. |
| Narrow / mobile | Single-column cards; actions stack; diagnostics collapsed; tables become stacked sections. |

### SharePoint Page Constraints

- Assume the property pane can reduce usable width.
- Avoid layouts that depend on full browser width.
- Ensure usable display inside standard modern page sections.
- Avoid heavy nested card chrome that consumes width.

## Screenshot Proof Requirements

Final wave must capture or describe proof for:

- wide desktop SharePoint canvas;
- medium/narrow canvas;
- API consent missing;
- Homepage Content default tab;
- Config tab with collapsed diagnostics;
- disabled publish/sync reasons;
- selected-lane workflow;
- no horizontal overflow.
