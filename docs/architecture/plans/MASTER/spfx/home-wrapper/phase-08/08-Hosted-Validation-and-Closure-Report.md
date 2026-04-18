# HB Homepage Host-Fit Closure Report (Phase-08 Prompt-07)

## Outer Envelope Authority
- The authoritative outer envelope remains wrapper-owned at `HbHomepageEntryStack` via:
  - `data-hb-homepage-outer-envelope-owner="hb-homepage-wrapper"`
  - `data-hb-homepage-outer-envelope-contract="hb-homepage-wrapper-outer-envelope-v1"`
  - `--hb-homepage-outer-envelope-max-width` sourced from `HB_HOMEPAGE_OUTER_ENVELOPE_MAX_WIDTH_PX`.
- The shell no longer declares competing outer envelope authority (`max-width`/centering removed from shell root), so page-canvas authority is single-source.

## Inner Inset Policy
- Actions strip and shell body use intentionally separate inset policies inside the shared outer contract:
  - Actions strip: `--hb-homepage-actions-inset-*` in `HbHomepageEntryStack.module.css`.
  - Shell body: `--hb-homepage-shell-body-inset-*` in `HbHomepageShell.module.css`.
- Region ownership and policy separation are inspectable at runtime:
  - `data-hb-homepage-region-inset-policy="actions-strip-inner-inset"` for wrapper actions.
  - `data-hb-homepage-region-inset-policy="shell-body-inner-inset"` for shell region.

## Measurement Model
- Measurement was rebased to authoritative usable width:
  - Authoritative width source: closest wrapper root (`[data-hb-homepage-entry-stack="root"]`).
  - Usable width rule: `authoritativeWidth - shellInlineInsetTotal` (clamped at `>= 0`).
- Entry-state selection now uses usable width plus measured height, not shell self-geometry as implicit authority.
- Inspectable width-truth markers are stable:
  - `data-shell-width-source="entry-stack-outer-envelope"`
  - `data-shell-width-accounting="authoritative-minus-shell-inline-inset"`

## Wrapper-Owned Actions Region Boundary
- Wrapper ownership is preserved and explicit:
  - Actions region remains rendered in `HbHomepageEntryStack` above shell.
  - `PriorityActionsRail` remains wrapper-embedded React surface (not shell occupant/preset/band member).
- Shared containment contract is explicit for both wrapper regions:
  - `data-hb-homepage-region-contained-by="hb-homepage-wrapper-outer-envelope-v1"` on actions and shell regions.
- Shell ownership remains post-actions orchestration only.

## Diagnostics Added or Changed
- Retained canonical shell diagnostics:
  - `data-shell-entry-state`
  - `data-shell-entry-state-reason`
  - `data-shell-width`
  - `data-shell-width-authoritative`
  - `data-shell-width-inline-inset-total`
  - `data-shell-short-height-constrained`
- Added/strengthened diagnostics:
  - `data-shell-width-source`
  - `data-shell-width-accounting`
  - `data-shell-fit-path` (`usable-width-accounted` or `short-height-override`)
  - `data-shell-width-authoritative` and inline inset total now used as closure-grade width-truth evidence.

## Tests Added or Updated
- Updated `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepageEntryStack.test.tsx`
  - Verifies explicit outer contract ownership and region containment/inset policy separation.
- Added/updated shell proof tests:
  - `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/useShellContainer.test.ts`
  - `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/shellConformance.test.ts`
  - `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/shellHarness.test.ts`
  - `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/shellClosureProof.test.ts`
- New hosted-proof automation:
  - `e2e/webparts/hb-homepage-host-fit.spec.ts`
  - Covers required viewport classes with overflow, diagnostics, and degradation assertions.

## Hosted Validation Evidence
- Hosted target executed: dev-harness Playwright via `playwright.webparts.config.ts`.
- Command executed:
  - `pnpm exec playwright test --config=playwright.webparts.config.ts e2e/webparts/hb-homepage-host-fit.spec.ts`
- Result:
  - `6 passed` (single worker, Chromium).
- Cases executed and validated:
  - Standard laptop baseline (`1440x900`)
  - Ultrawide desktop (`1920x1080`)
  - Tablet landscape (`1024x768`)
  - Tablet portrait (`820x1180`)
  - Phone portrait (`390x844`)
  - Short-height constrained (`1300x420`, with shell-height constraint style to exercise short-height path)
- Evidence captured per case:
  - Full-page screenshot attachment for each viewport case in Playwright test artifacts.
  - Inspectable runtime diagnostics asserted in test:
    - outer contract ownership/containment attributes
    - width source/accounting markers
    - entry-state id + reason
    - fit-path and width-accounting invariants
    - no horizontal overflow on wrapper root, shell root, harness content, and app root.

## Residual Risks
- Validation target for this prompt is dev harness, not live SharePoint-hosted page instance.
- Short-height case in harness uses a test-applied shell height constraint to exercise the override path deterministically; this proves behavior in harness runtime but is not a substitute for all tenant chrome permutations.
- Live tenant chrome interactions and tenant-specific authored content extremes remain best validated in a dedicated live-hosted follow-up lane.

## Final Closure Statement
Based on the implemented code changes, focused regression suites, and hosted dev-harness validation evidence, the original defect class — a visible screenshot-class right-edge host-fit failure — is **not reproducible** in the validated Prompt-07 cases.

Closure is accepted for the prompt-defined scope (wrapper/shell host-fit governance and diagnostics) with residual risk bounded to live SharePoint tenant-host permutations not exercised in this dev-harness lane.
