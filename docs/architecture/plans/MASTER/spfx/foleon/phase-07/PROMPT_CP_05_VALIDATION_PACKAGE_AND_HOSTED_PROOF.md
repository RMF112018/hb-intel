# CP-05 — Validation, Package Proof, and Hosted Proof

## Objective

Validate that the revised Company Pulse access-point implementation is correct, accessible, packaged from repo truth, and visibly improved in SharePoint.

## Required validations

```bash
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
```

If homepage package/runtime behavior changes:

```bash
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
pnpm --filter @hbc/homepage-launcher check-types
npx tsx tools/build-spfx-package.ts --domain hb-homepage
```

## Package proof

Record:
- command run;
- package path;
- modified timestamp;
- file size;
- SHA-256;
- manifest/package version;
- bundled string proof for:
  - `company-pulse-edition-launcher`;
  - `Open Company Pulse`;
  - no digest-board ready-state strings if removed.

## Hosted proof checklist

Capture screenshots at:
- desktop full width;
- row-paired homepage placement;
- tablet/narrow;
- mobile stack;
- preview state;
- ready state;
- disabled/refusal state.

Confirm:
- no white-card-inside-colored-card composition;
- Company Pulse visually aligns with Project Spotlight quality level but is distinct;
- no inline iframe in lane;
- full-window viewer opens correctly;
- preview viewer opens without iframe;
- disabled record refuses visibly;
- no horizontal overflow;
- archive action works or is explicitly non-functional/hidden based on repo truth.

## Closure report format

```text
Summary:
Files changed:
Tests run:
Package proof:
Hosted proof:
Risks:
Rollback:
Commit summary:
Commit description:
```
