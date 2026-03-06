# UI Kit Reference Audit — 2026-03-06 (Phase 4b.16)

## Purpose

Audit `@hbc/ui-kit` exported component families against `docs/reference/ui-kit/` and close remaining documentation gaps required by PH4B.16-C §7.

## Audit Method

1. Enumerate exported component-style symbols from `packages/ui-kit/src/index.ts`.
2. Compare against component reference markdown files in `docs/reference/ui-kit/`.
3. Create missing references and update cross-links in `entry-points.md`.

## Gaps Closed

- `HbcBarChart`
- `HbcDonutChart`
- `HbcLineChart`
- `HbcTextArea`
- `HbcRichTextEditor`
- `HbcToastProvider`
- `HbcToastContainer`

## Outcome

- Remaining component reference gaps identified in this audit: **0**
- Entry-point cross-links updated to include newly documented component references.

