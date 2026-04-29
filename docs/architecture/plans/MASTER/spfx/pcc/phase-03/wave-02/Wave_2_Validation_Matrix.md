# Phase 3 Wave 2 — Validation Matrix

## Validation Philosophy

Wave 2 validates the PCC shell frame and UI/UX foundation. It does not validate live tenant behavior, backend read models, Procore APIs, access execution, approvals, or Site Health repair.

## Repo Truth Validation

| Check | Command / Evidence | Required Result |
|---|---|---|
| Clean working tree before work | `git status --short` | No unrelated changes. |
| Wave 1 closeout present | inspect `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md` | Confirms shared foundations. |
| PCC shared exports available | inspect `packages/models/src/pcc/index.ts` | Required model exports available. |
| Basis image present | inspect `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` | File exists and is referenced in docs. |
| Existing app pattern understood | inspect `apps/project-sites/` and `packages/spfx/src/webparts/projectSites/` | Scaffold pattern documented. |

## Package Validation

Use actual package names from repo truth. Expected package name is `@hbc/spfx-project-control-center`.

| Area | Command | Required Result |
|---|---|---|
| PCC app typecheck | `pnpm --filter @hbc/spfx-project-control-center check-types` | Pass. |
| PCC app build | `pnpm --filter @hbc/spfx-project-control-center build` | Pass. |
| PCC app lint | `pnpm --filter @hbc/spfx-project-control-center lint` | 0 new errors. |
| PCC app tests | `pnpm --filter @hbc/spfx-project-control-center test` | Pass. |
| Models regression | `pnpm --filter @hbc/models check-types` / `pnpm --filter @hbc/models test` | Pass. |
| SPFx package regression if touched | `pnpm --filter @hbc/spfx check-types` / `pnpm --filter @hbc/spfx test` / `pnpm --filter @hbc/spfx build` | Pass if touched. |

## UI/UX Acceptance

| Requirement | Evidence |
|---|---|
| Basis-of-design path referenced | Docs and closeout reference `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`. |
| Dark project intelligence header | Screenshot/local render notes or component tests. |
| HB-orange left app rail | Screenshot/local render notes or component tests. |
| Eight MVP surfaces render | Navigation tests. |
| Project Home bento dashboard exists | Component tests and card registry. |
| Cards support unique footprints | Card registry/layout tests. |
| No fixed paired-row homepage layout | Source-scan test and implementation review. |
| Responsive behavior documented | Wireframe/layout docs and component CSS. |
| Fallback states implemented | Component tests. |
| Accessibility basics present | Focus/keyboard tests and semantic elements. |

## Boundary Guard Validation

| Forbidden Behavior | Evidence |
|---|---|
| No backend route/API work | `git diff --name-only` excludes `backend/functions/**`. |
| No provisioning/template mutation | `git diff --name-only` excludes `packages/project-site-template/**` and `packages/project-site-provisioning/**`. |
| No live Graph/PnP | Source-scan tests. |
| No Procore runtime/API/secrets | Source-scan tests. |
| No tenant mutation | Source-scan tests and no backend/provisioning changes. |
| No manifest/version bump unless authorized | Diff review. |
| No app catalog deployment | No `.sppkg`, no CI/CD or deployment workflow changes. |

## Closeout Required Statement

Wave 2 closeout must explicitly state:

- what was implemented;
- what was not implemented;
- which validation commands passed;
- that PCC shell remains fixture/preview-only;
- that Wave 3 is required for backend read-model and live operational behavior.
