# 04 — Motion and Interaction Contract

## Objective

Define restrained, premium motion and interaction behavior for the PCC hero, disabled command affordance, and text-only tab rail.

## Motion Principles

- Motion should clarify state changes, not decorate them.
- Motion must not fight SharePoint host chrome.
- Motion should be fast, restrained, and accessible.
- Reduced-motion preference must be respected.

## Tab Rail Motion

### Active Indicator

Required behavior:

- active indicator moves or fades between selected tabs;
- duration: 160–220ms;
- easing: ease-out or equivalent smooth curve;
- reduced motion: no sliding transform; use immediate state or short opacity fade only.

Implementation options:

1. Per-tab active indicator that fades/scales when active.
2. Shared rail-level indicator that calculates selected tab position.

Recommendation:

- Use per-tab indicator first unless a shared animated indicator can be implemented cleanly and safely without brittle measurements.
- Avoid fragile DOM measurement unless the developer can prove resize/scroll correctness.

### Hover State

Required behavior:

- hover background tint or text strengthening;
- duration: 120–160ms;
- no large transforms;
- no hover-only meaning.

### Pressed State

Required behavior:

- subtle pressed background or inset tone;
- should feel responsive without shifting layout.

### Focus State

Required behavior:

- visible focus ring;
- focus ring must be visible on both active and inactive tabs;
- focus ring must not be hidden by overflow clipping.

## Hero Motion

Hero should not animate heavily on load.

Permitted:

- subtle content entrance only if existing motion package and reduced-motion support are already available;
- subtle hover/focus response on disabled preview command affordance if it remains focusable.

Avoid:

- large hero slide-in animation;
- animated metrics;
- pulsing status decoration;
- motion that competes with SharePoint page authoring mode.

## Disabled Command Affordance Interaction

The command affordance is disabled preview, not operational search.

Recommended behavior:

- render as a button-like or chip-like element with `aria-disabled="true"`;
- do not render a text input;
- do not show a blinking cursor;
- do not allow typing;
- optionally allow focus if it exposes helpful tooltip/help text;
- if focusable, pressing Enter/Space must not execute anything;
- if not focusable, ensure the preview limitation is visible in static text.

Preferred accessible pattern:

```text
<button type="button" aria-disabled="true">Command Search — Preview</button>
```

If implemented with a real `disabled` attribute, it will be skipped by keyboard focus. That is acceptable only if the explanatory helper text is visible without focus.

## Reduced Motion Contract

Add CSS support:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms;
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    scroll-behavior: auto;
  }
}
```

Prefer local component-scoped reduced-motion rules rather than global wildcard changes when possible.

## Tests / Evidence

Automated tests cannot fully prove visual motion quality, but they should assert:

- active indicator marker exists;
- active indicator state changes with selected tab;
- tab rail no longer renders icons;
- focus-visible classes/markers are present if structurally testable;
- disabled command affordance uses non-operational semantics;
- reduced-motion CSS exists in the relevant module, if test scanning is already used in the repo.

Hosted evidence must include screenshots or short capture notes for:

- active tab;
- hover state if practical;
- focus-visible state;
- reduced-motion behavior if available through browser settings.
