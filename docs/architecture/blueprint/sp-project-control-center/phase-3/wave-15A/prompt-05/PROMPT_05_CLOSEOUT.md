# Wave 15A Prompt 05 Closeout

## Summary

Prompt 05 standardized the PCC state model and the user-facing product language across every routed surface. The eight-state `PccPreviewState` catalog was preserved; default copy was rewritten to product-grade strings; optional `reason` and `nextStep` slots were added; a narrow `PccDisabledAffordance` helper was introduced so inert controls always carry a user-facing reason; and a centralized `pccSurfacePostureCopy` module replaces the developer-leak vocabulary that used to live as ad-hoc strings on every surface header.

- No backend / API changes
- No `@hbc/models` changes
- No router ID changes
- No active-panel ownership changes
- No layout / bento / footprint redesign
- No live integrations (Graph / PnP / Procore / Document Crunch / Adobe Sign)
- No app-catalog work, no `.sppkg` generation, no CI workflow edits
- Lockfile unchanged

## SPFx version before / after

| File | Before | After |
| --- | --- | --- |
| `apps/project-control-center/config/package-solution.json` (solution) | `1.0.0.7` | `1.0.0.8` |
| `apps/project-control-center/config/package-solution.json` (feature) | `1.0.0.7` | `1.0.0.8` |
| `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json` | `1.0.0.7` | `1.0.0.8` |

## Files Changed

### New — state primitive, disabled-affordance helper, posture vocabulary

- `apps/project-control-center/src/ui/PccDisabledAffordance.tsx`
- `apps/project-control-center/src/ui/PccDisabledAffordance.module.css`
- `apps/project-control-center/src/ui/PccDisabledAffordance.test.tsx`
- `apps/project-control-center/src/ui/pccSurfacePostureCopy.ts`
- `apps/project-control-center/src/surfaces/documents/sourceStateMessaging.test.ts`

### Modified — state model + surface copy migration

- `apps/project-control-center/src/ui/PccPreviewState.tsx` — product-grade defaults across the eight states; added optional `reason` / `nextStep` props with `data-pcc-preview-state-reason` / `data-pcc-preview-state-next-step` markers
- `apps/project-control-center/src/ui/PccPreviewState.module.css` — minimal styling for the new slots
- `apps/project-control-center/src/surfaces/documents/sourceStateMessaging.ts` — scrubbed `"in this preview"` (throttled) and `"Showing preview-safe state"` (backend-unavailable)
- `apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx` — posture copy via `pccSurfacePostureCopy(...)`
- `apps/project-control-center/src/surfaces/documents/PccDocumentControlLaneCard.tsx` — inert action chips now carry `aria-describedby` paired reason captions; lane-empty copy product-grade
- `apps/project-control-center/src/surfaces/documents/PccDocumentControlPermissionsCard.tsx` — product-grade lane description and empty-state copy
- `apps/project-control-center/src/surfaces/documents/PccDocumentControlReviewsCard.tsx` — product-grade lane description and empty-state copy
- `apps/project-control-center/src/surfaces/documents/PccDocumentsSurface.module.css` — `.actionReason` style for paired captions
- `apps/project-control-center/src/surfaces/approvals/PccApprovalsSurface.tsx` — posture copy via posture module; inert action row routed through `PccDisabledAffordance`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx` — posture copy via posture module
- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.tsx` — `Preview only` chip → `Reference`
- `apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx` — posture copy + product-grade titles across hero / loading / error / inert chips
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts` — readiness `READ_ONLY_BADGE_TEXT` and `NO_EXECUTION_CAPTION` constants rewritten
- `apps/project-control-center/src/surfaces/projectReadiness/lifecycleReadinessAdapter.ts` — lifecycle copy constants rewritten
- `apps/project-control-center/src/surfaces/projectReadiness/permitInspectionControlCenterViewModel.ts` — read-only / degraded captions rewritten
- `apps/project-control-center/src/surfaces/projectReadiness/PccPermitInspectionControlCenterRegions.tsx` — empty-lane notes scrubbed of wave references
- `apps/project-control-center/src/surfaces/responsibilityMatrix/responsibilityMatrixAdapter.ts` — `READ_ONLY_CAPTION` / `NO_EXECUTION_CAPTION` rewritten
- `apps/project-control-center/src/surfaces/constraintsLog/constraintsLogAdapter.ts` — caption constants rewritten
- `apps/project-control-center/src/surfaces/buyoutLog/buyoutLogAdapter.ts` — caption constants rewritten
- `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsLaunchPadHeaderCard.tsx` — posture copy via posture module
- `apps/project-control-center/src/surfaces/externalSystems/PccExternalSystemsAddEditLinkDrawer.tsx` — drawer lead, save-unavailable button, URL-policy heading, and policy reason copy product-graded
- `apps/project-control-center/src/surfaces/externalSystems/launchPadAdapter.ts` — surface subtitle scrubbed
- `apps/project-control-center/src/surfaces/siteHealth/PccSiteHealthOverviewCard.tsx` — posture copy via posture module
- `apps/project-control-center/src/surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx` — posture copy + product-grade titles + missing-config items
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx` — posture copy via posture module + product-grade `PccPreviewState` body
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessLaneShell.tsx` — restriction card title + product copy
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamViewerLaneCard.tsx` — viewer-cue copy
- `apps/project-control-center/src/surfaces/teamAccess/PccPermissionRequestLaneCard.tsx` — request lane title, banner, intro, button labels, deferred-state copy
- `apps/project-control-center/src/surfaces/teamAccess/PccAccessManagerLaneCard.tsx` — manager lane title, button labels, deferred-state copy
- `apps/project-control-center/src/surfaces/teamAccess/PccAccessRequestQueue.tsx` — `View detail (preview)` → `View detail`
- `apps/project-control-center/src/surfaces/teamAccess/PccAccessReviewControls.tsx` — banner pill product-graded
- `apps/project-control-center/src/surfaces/teamAccess/PccExecutionStatusPanel.tsx` — banner pill product-graded
- `apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessReadModelContent.tsx` — error-state copy product-graded
- `apps/project-control-center/src/preview/projectPlaceholder.ts` — header subtitle / pills scrubbed of wave references
- `apps/project-control-center/src/api/pccFixtureReadModelClient.ts` — EX04 description scrubbed
- `apps/project-control-center/config/package-solution.json` — version bump
- `apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json` — version bump

### Modified — tests aligned with new product copy

- `apps/project-control-center/src/PccApp.test.tsx`
- `apps/project-control-center/src/tests/PccPreviewState.states.test.tsx` — full exact-string matrix for the eight specs + reason/nextStep slot coverage
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx`
- `apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx`
- `apps/project-control-center/src/tests/PccPrompt07.surfaces.test.tsx`
- `apps/project-control-center/src/tests/PccTeamAccessSurface.test.tsx`
- `apps/project-control-center/src/tests/PccApprovalsSurface.test.tsx` — disabled-action assertion now traces through the `PccDisabledAffordance` `aria-describedby` chain
- `apps/project-control-center/src/surfaces/projectHome/PccPriorityActionsRail.test.tsx`
- `apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.test.ts`

## Commands and Results

```text
1. pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
   pass

2. pnpm --filter @hbc/spfx-project-control-center test
   pass — 74 test files / 1604 tests

3. pnpm exec prettier --write <changed files>
   pass — all formatted; rerun --check returns clean
```

No build / app-catalog / hosted commands were run. Workspace-wide validation was not run (no exports / contracts changed; all changes scoped to the SPFx PCC app).

## Lockfile MD5 before / after

| When | `pnpm-lock.yaml` MD5 |
| --- | --- |
| Before edits (`HEAD = dc7a11337`) | `c56df7b79986896624536aab74d609f4` |
| After edits | `c56df7b79986896624536aab74d609f4` |

No drift. No `pnpm install` / `pnpm add` invocations.

## Forbidden-token grep results (user-visible JSX / aria text)

Final scan over `apps/project-control-center/src` excluding `*.test.*`, JSDoc comments, `@hbc/models` enum literals, and the `pccSurfacePostureCopy` module's own commentary:

| Token pattern | Hits |
| --- | --- |
| `"Read-only preview"` | 0 |
| `"Fixture default"` | 0 |
| `"Preview confidence"` | 0 |
| `"Pending envelope"` | 0 |
| `"Read-model available"` | 0 |
| `"Envelope confidence"` | 0 |
| `"Runtime envelope timestamp"` | 0 |
| `"Not connected in this prompt"` | 0 |
| `"in this preview"` | 0 |
| `"in this prompt"` | 0 |
| `"preview-safe"` | 0 |
| `"fixture-driven"` | 0 |
| `"preview mode"` | 0 |
| `"Inert preview"` | 0 |
| `>Preview only<` (JSX text) | 0 |
| `\bWave [0-9]+\b` in JSX text or string literals | 0 |
| `\bPrompt [0-9]+\b` in JSX text or string literals | 0 |

## State-model behavior covered by tests

- `PccPreviewState` catalog: 8 states × {badge, title, description} exact-string assertions; `aria-busy` on loading; `role="alert"` on error.
- `PccPreviewState` slots: `reason` renders `[data-pcc-preview-state-reason]`; `nextStep` renders `[data-pcc-preview-state-next-step]`; both omitted when not provided.
- `PccDisabledAffordance`: `aria-disabled="true"` on the rendered button; `aria-describedby` resolves to a node containing the supplied reason; `nextStep` renders only when provided; bypassing the type system to pass `onClick` does not invoke the handler (defensive strip).
- `sourceStateMessaging`: exact-string assertions for throttled and backend-unavailable copy across all three lanes; available source returns `undefined`.
- Approvals surface: every `data-pcc-approvals-action-key` action item now renders a `PccDisabledAffordance` button with non-empty `aria-describedby` reason content.
- Project Home priority rail: every `[data-pcc-priority-rail-disabled-action]` chip is a `<span>` with text `Reference`.

## Screenshot evidence

`evidence/screenshots/after/` reserved for representative state captures (preview, error, empty, disabled-with-reason, missing-config). **OPERATOR-PENDING** — captures must be taken from a running PCC dev harness; screenshot capture was not performed in this execution and is queued for the operator before tenant validation in Prompt 09.

## Tenant evidence

**OPERATOR-PENDING — deferred to Prompt 09.** Wave 15A README explicitly forbids hosted tenant claims before Prompt 09 closeout. No tenant probe, no app-catalog upload, no `.sppkg` generation, no Graph / PnP / Procore call was executed.

## Residual risks

- **Product-review pass on revised copy.** The new product-grade strings (e.g. `Reference view`, `Reference content`, `Workflow execution and approvals are managed by your PCC administrator.`) are tighter than the developer phrasing they replace, but final wording remains subject to product-owner review. Strings live in centralised modules (`PccPreviewState`, `pccSurfacePostureCopy`, surface adapter caption constants) so future copy adjustments are low-touch.
- **`pccSurfacePostureCopy` is presentational only.** Surfaces that need project-context-driven posture (e.g. archived projects) will need to extend the kind set; the const-map shape is stable.
- **Approvals action markers narrowed.** The previous `data-pcc-approvals-action-state="preview-disabled"` marker was retired in favour of the structural `[data-pcc-disabled-affordance-variant]` selector exposed by the new helper. Any downstream automation reading the old attribute must migrate.
- **`Wave 7 / Prompt 03B` and similar internal references in JSDoc / source-file headers were left intact** when not user-visible. JSDoc / comments are not user-facing copy and were intentionally not normalised — that scope belongs to a documentation pass, not the state-model and product-language remediation.

## Stop conditions encountered

None. No backend status that the read model does not yet expose was needed; no copy choice required product-owner adjudication beyond the obvious developer-language → product-language substitution.

## Next prompt

`Prompt_06_Project_Home_And_Team_Access_Surface_Remediation.md`
