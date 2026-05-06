# 04 — Heading, ARIA, and Accessibility Contract

## Objective

Make card semantics match visual hierarchy and preserve keyboard/screen-reader clarity across the full PCC surface set.

## Heading Rules

| Card Type | Required Heading |
| --- | --- |
| Route command card | `h2` |
| Tier 2 operational card | `h3` |
| Tier 3 reference/detail card | `h3` |
| Nested card body subsection | `h4` |
| State route card replacing command card | `h2` |
| State card below command card | `h3` |

## `PccDashboardCard` Labeling Rules

If a visible title exists:

```tsx
<article aria-labelledby={headingId}>
  <HeadingTag id={headingId}>...</HeadingTag>
</article>
```

If no visible title exists:

```tsx
<article aria-label={ariaLabel}>
```

Do not use both `aria-labelledby` and `aria-label` for the same card unless a specific exception is documented.

## `aria-describedby`

Use `aria-describedby` when:

- card is a state/deferred card and has a reason paragraph
- card has a source-confidence strip that materially qualifies the content
- card has disabled actions with explanatory copy

Do not create fragile IDs manually if the card primitive can generate IDs.

## Disabled Affordance Rules

All unavailable controls must satisfy:

- no executable handler
- `aria-disabled="true"` when focusable
- visible or screen-reader-visible reason
- no misleading `href`
- no mutation behavior

Use `PccDisabledAffordance` where a disabled control is intentionally visible.

## Error and Loading State Rules

- Error state must use `role="alert"` via `PccPreviewState`.
- Loading state must use `aria-busy="true"` via `PccPreviewState`.
- Route-level loading/error cards may carry active panel only while ready command card is absent.
- Loading/error variants must not introduce wrapper elements between bento grid and card.

## Keyboard Rules

- Do not add focusable wrappers around cards.
- Preserve logical DOM order matching visual scan order.
- Disabled controls that are not meant to be focusable should use native `disabled`.
- Inert preview controls intended to communicate unavailable future capability may remain focusable only if they provide reason text and no action.

## Test Requirements

Add tests that verify:

- Tier 1 command card heading is `h2`.
- Normal operational/reference cards render `h3`.
- Card article has `aria-labelledby` pointing to the visible title.
- Cards with no title and explicit `ariaLabel` use `aria-label`.
- Error state cards include `role="alert"`.
- Loading state cards include `aria-busy="true"`.
- Disabled affordances expose reason text through `aria-describedby`.
