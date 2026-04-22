# Prompt 01 — Refresh Hosted Proof and Package Truth

## Objective

After row and drawer remediation, regenerate hosted/package closure evidence so source, package, and hosted runtime all agree.

## Governing authority

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/spfx-surfaces/homepage-hosted-breakpoint-evidence.md`

## Inspect exactly these seams

- `e2e/webparts/hb-homepage-host-fit.spec.ts`
- `docs/reference/spfx-surfaces/homepage-hosted-breakpoint-evidence.md`
- `tools/build-spfx-package.ts`
- any package/version seam touched by the launcher updates

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Gap to close

The evidence appendix is stale relative to current launcher versioning and the hosted result has not yet been re-proven after the launcher fixes.

## Required outcome

- package/version markers are current
- hosted breakpoint appendix is updated or repointed to current proof artifacts
- screenshot evidence reflects the corrected row and drawer
- tests align with the corrected runtime

## Proof of closure

Provide:
1. exact files changed
2. package version / launcher version markers after rebuild
3. test run summary
4. links/paths to refreshed screenshots and proof artifacts

## Prohibited

- no claiming closure without updated hosted/package proof
