# Wave 2 Repo Truth Audit — PCC SPFx Shell Frame

**Audit type:** Documentation-first.
**Audit scope:** Repository state on `main` at the time Wave 2 Prompt 01 runs.
**Audit constraint:** No implementation code, no app scaffold, no manifests, no version bumps, no package/lockfile churn, no backend/provisioning/tenant/Graph/PnP/Procore/deployment changes.

This audit closes the proof gates required to begin Wave 2 implementation prompts. It does **not** itself implement Wave 2.

---

## 1. Wave 1 Closeout

| Aspect                 | Finding                                                                                                                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Closeout document      | Present at `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md`.                                                                                                                 |
| Status                 | Complete. Confirms 205 tests across 29 files, deterministic shared-foundations surface in `@hbc/models`, and the Wave 1 scope lock (no SPFx UI, no Project Home UI, no backend, no live data, no deployment changes). |
| Implication for Wave 2 | The Wave 1 Closeout precondition required by W2-ODR-011 is satisfied.                                                                                                                                                 |

## 2. `@hbc/models/pcc` Shared Foundations

The PCC subpath is exposed via the `@hbc/models` package using its `./*` exports map; the PCC barrel is `packages/models/src/pcc/index.ts`, and the PCC fixture barrel is `packages/models/src/pcc/fixtures/index.ts`.

| Required symbol       | Source file (verified path)                 | Status                                                                                                                                                                  |
| --------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PCC_MVP_SURFACE_IDS` | `packages/models/src/pcc/PccMvpSurfaces.ts` | Present. Eight ids: `project-home`, `team-and-access`, `documents`, `project-readiness`, `approvals`, `external-systems`, `control-center-settings`, `site-health`.     |
| `PCC_MVP_SURFACES`    | `packages/models/src/pcc/PccMvpSurfaces.ts` | Present. Readonly record keyed by surface id; each entry carries `id`, `displayName`, `description`, `mvpTier`, `primaryWorkCenterIds`.                                 |
| `PCC_FIXTURES`        | `packages/models/src/pcc/fixtures/index.ts` | Present. Aggregate grouping deterministic samples for `projectProfiles`, `priorityActions`, `workflow`, `approvals`, `audit`, `comments`, `integrations`, `siteHealth`. |

Adjacent legitimate Wave 2 consumables under `packages/models/src/pcc/` (display/read-model only):

- Approval read-model: `ApprovalCheckpoint.ts`.
- Business audit read-model: `BusinessAuditEvent.ts`.
- External systems and launch-link read-model: `ExternalSystems.ts`.
- Site-health read-model: `SiteHealth.ts`, `RepairRequests.ts`.
- Personas/capabilities (display hints, not authoritative authorization): `PccUserRoles.ts`, `PccCapabilities.ts`.

## 3. Design Reference Asset

| Aspect         | Finding                                                           |
| -------------- | ----------------------------------------------------------------- |
| Path           | `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`.  |
| Readable       | Yes. Raster image, suitable as the visual basis-of-design source. |
| Sibling assets | None of substance under `docs/reference/ui-kit/dashboard/`.       |
| Implication    | W2-ODR-019 anchor confirmed.                                      |

## 4. Target App Status — `apps/project-control-center/`

| Aspect         | Finding                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Folder present | No. `apps/project-control-center/` does not exist.                                                                                                                                                     |
| Implication    | Consistent with W2-ODR-001 and with Prompt 01's documentation-only scope. The folder must remain absent at the end of this prompt; creation belongs to a later, explicitly authorized scaffold prompt. |

## 5. Existing SPFx App Pattern (Precedent Only)

| App                   | Role as precedent                                                                                                                                                                       |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/accounting/`    | Strongest precedent for Wave 2: `tsc --noEmit && vite build`, `vite --port <n>` and `vite preview --port <n>`, IIFE lib build, app-local tests, workspace-level deps via `workspace:*`. |
| `apps/project-sites/` | Sibling SPFx app pattern (`@hbc/spfx-project-sites`) demonstrating IIFE Vite build for an SPFx surface.                                                                                 |
| `apps/hb-webparts/`   | Multi-webpart SPFx app (`@hbc/spfx-hb-webparts`) hosting `hbHomepage` among others; **note: PCC must not inherit the homepage paired-row layout (W2-ODR-018)**.                         |
| `pnpm-workspace.yaml` | The `apps/*` glob already covers any future `apps/project-control-center` without workspace edits.                                                                                      |
| `turbo.json`          | `build`, `lint`, `check-types`, `test` pipelines auto-include new apps under `apps/*`.                                                                                                  |

This precedent informs the future scaffold prompt; **no scaffold is created in Prompt 01**.

## 6. Local Vite Preview & Dev-Harness Posture

| Subject                      | Finding                                                                                                                                                                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vite local preview precedent | Established repo-wide. Multiple SPFx apps (e.g. `apps/accounting/`) ship `dev` and `preview` Vite scripts with bound ports.                                                                                                                                                   |
| Dev-harness tab wiring       | `apps/dev-harness/` exists as the central integration harness, but Wave 2 does **not** wire a PCC tab into it. Per W2-ODR-004, dev-harness wiring remains deferred until an implementation agent proves a non-disruptive integration path. Precedent alone is not sufficient. |

## 7. Governing UI/UX Doctrine

| Doctrine document                                                                                                                 | Role for Wave 2                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`                                                           | Binding governing standard for any PCC SPFx surface: host-aware polish, premium non-generic composition, breakpoint resilience across ultrawide / laptop / tablet / phone / split-screen / zoom, dynamic-yet-stable composition. |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`                                                             | Referenced for explicit **non-inheritance**. PCC must not adopt the homepage paired-row overlay (W2-ODR-018).                                                                                                                    |
| `docs/reference/spfx-surfaces/**` (e.g. `complexity-application-map.md`, `responsive-failure-catalog.md`, homepage UX scorecards) | Informational cross-surface references for resilience and consistency only. Not PCC layout templates.                                                                                                                            |

## 8. Wave 2 Plan Folder (Source of Truth)

| Aspect            | Finding                                                                                                                                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan folder       | `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/` — present and populated.                                                                                                                                                                                                  |
| Decision register | `01_Wave_2_Decision_Closure_Register.md` — present and canonical for Wave 2 decisions (W2-ODR-001 … W2-ODR-019).                                                                                                                                                                      |
| Prompt sequence   | Prompts 01–09 present, plus supporting `00_Repo_Truth_And_Update_Summary.md`, `02_PCC_UIUX_Basis_of_Design.md`, `03_PCC_UI_Wireframe_and_Flexible_Layout_Contract.md`, `04_Wave_2_Scope_Lock_Implementation_Boundaries.md`, `Wave_2_Validation_Matrix.md`, `REFERENCE_ASSET_NOTE.md`. |

## 9. Wave 2 Blueprint Folder (this folder)

| Aspect                  | Finding                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Path                    | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/`.                                                                                                                          |
| Status before Prompt 01 | Did not exist.                                                                                                                                                                                    |
| Status after Prompt 01  | Created with five governing artifacts (this audit, scope lock, decision closure register, UI/UX basis of design, wireframe and layout contract). No code, manifests, or other repo state changed. |

## 10. Conflict Register

No material conflicts between repo truth and the closed decisions in `01_Wave_2_Decision_Closure_Register.md`. Specifically:

- The expected absence of `apps/project-control-center/` is consistent with W2-ODR-001 and Prompt 01's documentation-only scope.
- Vite local-preview precedent supports W2-ODR-004's "Vite/local preview wiring allowed" branch without contradicting its dev-harness deferral.
- All Wave 2 data sources called out (PCC fixtures, MVP surface enumerations) exist in `@hbc/models/pcc` and require no further plumbing for Wave 2 implementation prompts to begin.

## 11. Proof-Gate Resolution

| Decision   | Gate type           | Resolution from this audit                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W2-ODR-002 | Proof-gated         | **Released for the next scaffold prompt only.** Wave 1 closeout is verified and clean repo state for Prompt 01 is verified. This release authorizes a later, explicitly authorized scaffold prompt to create `apps/project-control-center/`; it is **not** itself an act of scaffold implementation, and `apps/project-control-center/` remains absent after Prompt 01 by design. |
| W2-ODR-004 | Proof-gated (split) | **Vite/local-preview portion released** for later implementation: repo-wide SPFx Vite precedent satisfies the proof requirement. **Dev-harness tab-wiring portion remains deferred** until an implementation agent demonstrates a non-disruptive existing pattern with no production/manifest impact.                                                                             |
| W2-ODR-011 | Proof-gated         | **Released.** Wave 1 closeout on `main` is verified by `Wave_1_Closeout.md` and supports the start of Wave 2 implementation prompts (in subsequent prompts, not this one).                                                                                                                                                                                                        |

W2-ODR-012 (deferred items) and all other Wave 2 decisions remain governed by the canonical register; this audit does not relax any of them.

## 12. Closeout

- Implementation code was not started.
- No app scaffold (`apps/project-control-center/` or otherwise) was created.
- No package, manifest, workspace, or lockfile churn occurred.
- No backend, provisioning, tenant, Graph, PnP, Procore, or deployment changes occurred.
- Only the five intended Wave 2 blueprint documents were added.
- Validation: `pnpm format:check` was run; results recorded in the Prompt 01 execution summary.

Prompt 02 may proceed.
