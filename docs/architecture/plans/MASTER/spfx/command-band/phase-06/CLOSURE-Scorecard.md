# Phase 06 — Closure Scorecard

Records the honest closure posture for the Priority Actions Rail +
`hbHomepage` remediation package. Updated after PROMPTs 01–05 landed and
regression coverage was added. Hosted SharePoint proof is still
**pending** and is not claimed as done.

## Closure posture at a glance

| Category | Status | Evidence |
|---|---|---|
| Architecture boundary preserved | Done | `HbHomepageEntryStack.tsx` still renders rail pre-shell; shell occupant registry still excludes priority-actions (see `hbHomepageEntryStack.test.tsx` "shell boundary integrity — no occupant migration"). |
| Homepage flagship surface contract | Done | `PriorityRailContext` added in `packages/ui-kit/src/HbcPriorityRail/types.ts`; threaded through `HbcPriorityRailSurface` → `PriorityActionsRail` → `HbHomepageEntryStack` (`surfaceContext="homepage-flagship"`). |
| Flagship visual rebuild | Done in code | `priority-rail.module.css` flagship override block replaces card silhouette with flush, edge-to-edge command band (3px brand top rule, uppercase masthead, taller decisive rows). |
| Overflow hardening (menu / sheet / inline) | Done in code | `HbcPriorityRailOverflow.tsx` rewrite uses `@floating-ui/react` (`FloatingFocusManager`, `FloatingPortal`, collision + size middleware) and `@radix-ui/react-scroll-area` for tall lists; Esc + outside-click + trigger-focus-return in all modes. |
| Entry-stack envelope recalibration | Done | `HbHomepageEntryStack.module.css` narrower inline padding than shell at every breakpoint, tighter hero → actions → shell rhythm, protects first-shell-lane on first view. |
| Regression coverage | Done | `hbHomepageEntryStack.test.tsx` + `priorityActionsRailRuntime.test.tsx` assert flagship opt-in, default-context standalone behavior, and compact+menu posture under short-height override. |
| Build + typecheck proof | Done | `pnpm --filter @hbc/ui-kit check-types` clean. `pnpm --filter @hbc/ui-kit build` clean. `pnpm --filter @hbc/spfx-hb-webparts check-types` clean. |
| Targeted unit / component tests | Done | `HbcPriorityRail` tests 4/4; `hbHomepageEntryStack` + `priorityActionsRailRuntime` + `priorityActionsPresentation` 17/17. |
| Hosted SharePoint proof | **Pending** | Not yet captured. Required categories listed below are explicitly open. |
| Accessibility hosted proof | **Pending** | Keyboard traversal, focus return, Esc dismissal, pointer-safe compact rows — all need hosted verification. |
| Console-error hosted proof | **Pending** | Browser console review under hosted state not captured. |
| Visual regression across breakpoints | **Pending** | Standard desktop, narrow tablet, high-zoom, short-height, overflow-open, first-shell-lane-above-fold captures not yet taken. |

## Files changed in this phase

### PROMPT-01 — Lock architecture boundary and flagship variant
- `packages/ui-kit/src/HbcPriorityRail/types.ts`
- `packages/ui-kit/src/HbcPriorityRail/variants.ts`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css.d.ts`
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailSurface.tsx`
- `packages/ui-kit/src/HbcPriorityRail/index.tsx`
- `packages/ui-kit/src/homepage.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`

### PROMPT-02 — Rebuild flagship surface
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`

### PROMPT-03 — Harden overflow + accessibility
- `packages/ui-kit/src/HbcPriorityRail/HbcPriorityRailOverflow.tsx`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`
- `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css.d.ts`

### PROMPT-04 — Recalibrate entry-stack envelope
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`

### PROMPT-05 — Regression coverage
- `apps/hb-webparts/src/webparts/hbHomepage/__tests__/hbHomepageEntryStack.test.tsx`
- `apps/hb-webparts/src/homepage/__tests__/priorityActionsRailRuntime.test.tsx`

### PROMPT-06 — Closure artifacts
- `docs/architecture/plans/MASTER/spfx/command-band/phase-06/CLOSURE-Scorecard.md` (this file)

## Honest remaining work

1. **Hosted SharePoint validation** — Execute the steps in
   `PROMPT-VALIDATION-Hosted-Runtime-and-Closure-Verification.md` on a
   live SharePoint site (view + edit modes), at a minimum capturing:
   standard desktop (~1280–1440px), narrower tablet width, 125 %/150 %
   zoom, short-height container, overflow-open states, and confirmation
   that the first shell lane is visible on first load.
2. **Accessibility hosted proof** — Tab traversal of rail rows, Tab into
   overflow menu, focus return after Esc, focus trap in sheet mode.
3. **Console hygiene** — Review the browser console in hosted state for
   new warnings/errors tied to the flagship rail or floating-ui portals.
4. **Visual acceptance vs fail indicators** — Compare against
   `AUDIT-07-Validation-and-Closure-Standards.md` pass/fail indicators;
   record whether the "bordered card inside a blank region" reading is
   actually gone in hosted state (not just in the code).
5. **Manifest / version bump** — A SharePoint 4-part manifest bump on
   `hb-intel-homepage` and/or `hb-intel-priority-actions-rail` should
   follow hosted confirmation, not precede it. Do not bump manifest
   versions on the basis of code remediation alone.

## Language discipline

The following terms are **not** used in this closure posture and should
be rejected if they appear in follow-on notes without hosted evidence:

- "benchmark-grade"
- "mostly done"
- "closure complete"
- "flagship ready"

Any of these require captured hosted proof attached to this scorecard.

## Preserved historical evidence

Prior audit artifacts under `docs/architecture/plans/MASTER/spfx/command-band/phase-06/AUDIT-*.md`
remain untouched so the evolution of this work is visible. This
scorecard is an addition, not a rewrite of history.
