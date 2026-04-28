# PROMPT PFV-04 — Validation, Package Proof, Hosted Proof, and Closure

You are working in the `RMF112018/hb-intel` repository after PFV-02 and PFV-03.

## Objective

Validate the Foleon preview full-window viewer implementation end-to-end and prepare package/version proof and hosted proof instructions.

## Critical instruction

Do not re-read files that are still within your current context or memory unless needed to verify current repo truth, line-level details, contradictions, dependency behavior, or drift after changes.

## Required source proof

Confirm:

- Preview targets are openable.
- Preview targets render local preview content.
- Preview path does not mount `FoleonIframeHost`.
- Ready iframe path still mounts `FoleonIframeHost`.
- Provider refusal behavior remains for `canOpen: false`.
- Lane layouts do not mark preview cards disabled.
- Ready disabled targets still show visible reason and refusal marker.
- No origin policy or accepted-origin files changed.
- No schema/backend files changed.

## Required commands

Run:

```bash
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
```

Conditional:

```bash
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
pnpm --filter @hbc/homepage-launcher check-types
```

Run package authority/version tests if any version file changed.

## Version/package instructions

Inspect current repo package authority before bumping.

If runtime-visible homepage source changed and repo policy requires a bump, update the lockstep set together:

```text
apps/hb-homepage/config/package-solution.json
apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
packages/homepage-launcher/src/constants.ts
```

Do not change `HOMEPAGE_EMBEDDED_FOLEON_PACKAGE_VERSION` unless repo truth proves it pins the changed deployable artifact.

## Hosted proof checklist

After package deployment, verify:

1. Project Spotlight preview card opens full-window preview.
2. Company Pulse preview card opens full-window preview.
3. Leadership Message preview card opens full-window preview.
4. Preview viewer is clearly labeled.
5. Preview viewer has no iframe.
6. Close button works.
7. Escape closes.
8. Focus returns to launch card.
9. Ready record still opens real governed iframe.
10. Disabled ready record still refuses with visible reason.
11. No right-edge overflow at desktop/tablet/mobile.

## Closure report format

Return:

```text
Summary:
Files changed:
Target/viewer contract:
Preview behavior:
Ready iframe behavior:
Disabled/refusal behavior:
Validation:
Version/package proof:
Hosted proof:
Risks:
Rollback:
Commit summary:
Commit description:
```

## Commit summary target

```text
HB Homepage: enable full-window preview reader fallback
```

## Commit description target

```text
Adds an explicit preview render mode to the Foleon full-window viewer contract so preview article cards open the shared viewer shell with local React preview content instead of being blocked as disabled. Preserves governed iframe rendering for ready Foleon records, keeps true disabled ready-state refusals structured, avoids inline iframes for preview, maintains focus/keyboard viewer behavior, and leaves origin policy/backend/schema paths unchanged.
```
