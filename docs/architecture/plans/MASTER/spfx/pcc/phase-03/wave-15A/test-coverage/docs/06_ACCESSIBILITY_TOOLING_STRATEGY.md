# Accessibility Tooling Strategy

## Required

- Playwright keyboard navigation tests.
- Focus order and focus-visible screenshots.
- ARIA relationship checks.
- Disabled affordance reason linkage.
- Touch target bounding box checks.
- Reduced-motion context.
- Color-independent status checks.

## Recommended Dependency

Add `@axe-core/playwright` unless the repo already has an approved accessibility scanner.

Rationale:

- Provides reproducible accessibility findings.
- Supports Pillar 8 and HS-07.
- Complements, not replaces, keyboard/focus/manual review.

## Axe Output

```text
accessibility/axe-results.json
accessibility/axe-summary.md
```

## Manual Review Still Required

Axe does not fully judge:

- cognitive load;
- visual hierarchy;
- construction clarity;
- whether color is the only practical carrier of meaning in context.
