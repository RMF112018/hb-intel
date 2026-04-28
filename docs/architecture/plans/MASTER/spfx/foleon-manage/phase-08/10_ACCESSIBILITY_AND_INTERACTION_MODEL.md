# 10 — Accessibility and Interaction Model

## Primary Navigation

Use WAI-ARIA tab pattern if using tabs:

- `role="tablist"`
- `role="tab"`
- `aria-selected`
- `aria-controls`
- `role="tabpanel"`
- Arrow key navigation
- Home/End support
- Focus visible states

## Queue

Queue rows must be real buttons or links if they open the inspector.

Requirements:

- keyboard selectable,
- focus visible,
- selected state announced,
- row title and status understandable to screen reader users,
- no hover-only meaning.

## Inspector

Wide desktop:

- persistent complementary panel is preferred.
- It should not trap focus if always visible.

Tablet/phone:

- if drawer/modal, follow dialog expectations.
- Escape closes.
- Focus moves into drawer on open.
- Focus returns to trigger on close.

## Utility Menu

If actions move into a utility menu, use a proper menu button pattern or accessible popover. Do not create hover-only controls.

## Empty and Blocked States

Must be announced as status/callout regions where appropriate.

## Preview

Do not iframe ungoverned content. If preview route is blocked, the blocked state must be readable and actionable.

