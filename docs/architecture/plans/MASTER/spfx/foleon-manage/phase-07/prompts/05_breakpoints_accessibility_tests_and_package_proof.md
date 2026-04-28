# Fresh Code-Agent Prompt — HB Intel Foleon Manager

You are working in the live `hb-intel` repository. Use `main` as repo truth unless the user provides another branch.

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth or resolve a contradiction.

Preserve security and runtime boundaries:
- Do not weaken `withAuth`.
- Do not weaken route authorization.
- Do not weaken token validation.
- Do not weaken safe-config gates.
- Do not leak secrets or raw diagnostics into the browser.
- Preserve registry-first runtime configuration.
- Preserve redacted diagnostics.
- Preserve package/runtime proof.

Required validation commands for final proof:

```bash
git status --short
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
pnpm --filter @hbc/spfx-hb-intel-foleon build
npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

## Objective

Complete breakpoint behavior, accessibility, test coverage, packaging, and hosted proof for flagship acceptance.

## Files to Inspect

- `useManageBreakpoint.ts`
- all files under `apps/hb-intel-foleon/src/pages/manage/`
- `apps/hb-intel-foleon/src/pages/__tests__/`
- `apps/hb-intel-foleon/config/package-solution.json`
- package proof scripts
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Files Likely to Change

- `useManageBreakpoint.ts`
- `manageShell.module.css`
- `manageFields.module.css`
- component tests
- package proof docs/evidence

## New Files to Consider

- `useManagerContainerMode.ts`
- `managerBreakpointContract.ts`
- `IMPLEMENTATION_CLOSURE_EVIDENCE.md`

## Guardrails

- Do not call the implementation complete without hosted screenshots.
- Do not accept forced multi-column fragility.
- Do not leave aria-hidden focus traps.
- Do not leave primary actions unreachable at common zoom or short-height states.
- Do not rely on local dev screenshots only.

## Steps

1. Replace or supplement viewport-only breakpoint logic with container-aware mode detection.
2. Define layout modes:
   - ultrawide
   - desktop
   - tablet landscape
   - tablet portrait
   - phone portrait
   - short-height
   - narrowest stable nested
3. Add CSS for each mode.
4. Add keyboard/focus tests:
   - content inbox
   - lane board
   - workflow panel
   - preview panel
   - admin diagnostics
5. Add reduced-motion handling.
6. Run all validation commands.
7. Build SPPKG and run package proof.
8. Capture hosted screenshots and network proof.
9. Write final implementation evidence document.

## Acceptance Criteria

- Target score can credibly reach 53 / 56.
- No category below 3.
- No hard-stop failures remain.
- Package proof and hosted proof are attached.
- The result visibly differs from the old card-heavy manager.
- The hosted Manager reads as a premium content operations console.

## Commit Message

`SPFx Foleon Manager: complete breakpoints accessibility tests and package proof`
