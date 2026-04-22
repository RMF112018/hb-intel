# Prompt 01 — Retire or Quarantine the Legacy Homepage Launcher Family

## Objective
Make the dedicated `@hbc/homepage-launcher` package the **unambiguous** flagship homepage launcher authority in the repo by retiring, quarantining, or explicitly demoting the old `HbcHomepageLauncher` family that still lives under `packages/ui-kit/src/HbcHomepageLauncher/`.

## Governing repo authorities
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Files / seams to inspect
- `packages/ui-kit/src/homepage.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/index.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `packages/homepage-launcher/src/index.ts`
- any other imports that still reference `HbcHomepageLauncher` on the homepage path

## Current gap to close
The homepage cutover appears real, but the repo still exports a legacy launcher family and its constants still report `1.1.70.0`. That weakens render-authority clarity and makes runtime proof dirtier than it should be.

## Required implementation outcome
Deliver one of these clean outcomes:
1. fully retire the old `HbcHomepageLauncher` family from homepage-facing exports, or
2. explicitly quarantine it as compatibility-only legacy surface code with unmistakable naming and comments, while ensuring it cannot be mistaken for active homepage launcher authority.

Also:
- eliminate stale legacy launcher version markers from active homepage-facing exports
- leave the dedicated `@hbc/homepage-launcher` package as the only flagship homepage launcher authority
- preserve any still-needed standalone rail functionality
- do **not** break current homepage runtime behavior

## Proof of closure required
Provide:
- the final authoritative launcher boundary in plain language
- the exact files changed
- a grep or equivalent reference list showing what still imports the legacy launcher family after cleanup
- confirmation that the homepage path resolves through `HbHomepageLauncherBand -> @hbc/homepage-launcher`
- confirmation that no stale `1.1.70.0` launcher truth remains exposed as an active homepage launcher signal

## Prohibitions
- no unrelated homepage shell redesign
- no speculative refactors outside launcher ownership cleanup
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
