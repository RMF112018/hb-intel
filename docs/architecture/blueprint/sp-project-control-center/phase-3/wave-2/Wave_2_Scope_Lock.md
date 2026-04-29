# Wave 2 Scope Lock — PCC SPFx Shell Frame

This document binds the implementation boundaries for Wave 2. It complements the canonical Wave 2 decision register at `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/01_Wave_2_Decision_Closure_Register.md`.

Prompt 01 itself is documentation-only. The scope below applies to Wave 2 implementation prompts that follow.

---

## 1. Implementation Location Boundaries

- **Wave 2 shell implementation code belongs in `apps/project-control-center/`.** This is the only app folder Wave 2 will produce or modify.
- **`packages/spfx` may only be used if the repository's existing SPFx host/root pattern proves it necessary.** No new shared SPFx primitives are added in Wave 2; if any host/root export is touched, the change must be the minimum required by the existing pattern and must be justified in the implementing prompt.
- **Documentation changes for Prompt 01 are limited to the approved Wave 2 blueprint folder:** `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/`. No other documentation, doctrine, or reference area is edited by this prompt.

## 2. Allowed Wave 2 Activities (Subsequent Prompts)

Wave 2 implementation prompts may, within `apps/project-control-center/` and subject to the constraints above:

- Author the SPFx Shell Frame UI: layout, navigation, visual hierarchy, responsive behavior, and accessibility.
- Compose `@hbc/ui-kit` primitives. New reusable visual primitives belong in `@hbc/ui-kit`, not in this app.
- Render preview content for each MVP surface enumerated by `PCC_MVP_SURFACE_IDS`.
- Bind to deterministic Wave 1 fixtures via `PCC_FIXTURES` from `@hbc/models/pcc` only.
- Implement the required state catalog: preview, empty, loading, error, missing-config, unavailable-fixture, and unauthorized-persona (W2-ODR-009).
- Provide app-local read-model adapters under `apps/project-control-center/src/` (W2-ODR-005). No shared adapter package is created in Wave 2.
- Use internal state/tab navigation keyed by `PCC_MVP_SURFACE_IDS` (W2-ODR-006). No router library.
- Add app-local guard tests for "no runtime calls" and "no forbidden imports" (W2-ODR-010). No promotion of these guards to a shared package in Wave 2.
- Wire optional local Vite preview consistent with existing SPFx app precedent (W2-ODR-004, Vite/local-preview portion).

## 3. Forbidden in Wave 2

The following are explicitly out of scope for Wave 2 in any combination:

- Any code, configuration, or asset outside `apps/project-control-center/` (and the narrow, justified `packages/spfx` host/root case noted above).
- Root configuration changes, workspace edits, package additions, or lockfile churn beyond what the app scaffold strictly requires.
- Manifest changes or version bumps in any SharePoint, package, or app manifest. SPFx four-part version bumps are not authorized in Wave 2.
- CI/CD pipeline edits and deployment changes.
- Backend service work, provisioning code, tenant configuration changes, or template-package modifications.
- Live data: any Microsoft Graph, PnP, Procore, REST, or other live runtime integration.
- Persisted project data, persistent stores, or live read-through data sources.
- Authoritative authorization. Persona and capability metadata from `@hbc/models/pcc` are display hints only (W2-ODR-008).
- Document workflow operations, file management, or check-in/check-out behaviors. Document Control surface in Wave 2 is a unified launch hub only (W2-ODR-013).
- External-system synchronization, mirroring, write-back, API clients, or secret handling. External-systems surface in Wave 2 is launch links plus missing-config states only (W2-ODR-014).
- Site-Health scanning, runners, or repair execution. Wave 2 surfaces a read-model summary plus a repair-request entry placeholder only (W2-ODR-015).
- Permission mutation, group mutation, access provisioning, approval execution, workflow execution, or repair execution.
- Live Site Health scanning, live workflow counts, live access execution, live approval execution, live repair execution, or any tenant seam (deferred per W2-ODR-012).
- Dev-harness tab wiring for PCC. Deferred until an implementation agent proves a non-disruptive existing pattern with no production/manifest impact (W2-ODR-004, dev-harness portion).
- Reuse of the homepage paired-row layout (W2-ODR-018). PCC layout is the controlled flexible bento/masonry composition described in `Wave_2_Wireframe_and_Layout_Contract.md`.

## 4. File Allowlist Sketch (For the Future Scaffold Prompt)

The implementing prompt that creates `apps/project-control-center/` is expected to introduce only:

- `apps/project-control-center/package.json` — `@hbc/spfx-project-control-center`, `workspace:*` dependencies on `@hbc/models`, `@hbc/ui-kit`, and any directly required workspace packages.
- `apps/project-control-center/vite.config.ts` — IIFE lib build for SPFx, Microsoft externals, alias chain consistent with existing SPFx apps.
- `apps/project-control-center/tsconfig.json` — strict, project-references aware, consistent with sibling apps.
- `apps/project-control-center/src/mount.tsx` — local mount entry consistent with existing SPFx app precedent.
- `apps/project-control-center/src/webparts/projectControlCenter/**` — the Shell Frame composition, surface lanes, state handling, and app-local adapters.
- `apps/project-control-center/src/__tests__/**` — app-local guard tests.
- `apps/project-control-center/README.md` — local ownership notes per `.claude/rules/04-documentation-standards.md`.

This sketch is descriptive, not prescriptive. The scaffold prompt is the authoritative scope for those files.

## 5. Data and Auth Boundaries

- The sole data source for Wave 2 is the deterministic fixture aggregate `PCC_FIXTURES` in `@hbc/models/pcc` (W2-ODR-007).
- Optional injected runtime context is permitted only as non-live display input. It is never a data fetch.
- Persona and capability metadata is display-only (W2-ODR-008). Authoritative authorization is not introduced in Wave 2.

## 6. Closeout (applies to Prompt 01)

- No app scaffold was created. `apps/project-control-center/` remains absent after Prompt 01 by design.
- No implementation code was started.
- No package, manifest, workspace, or lockfile churn occurred.
- No backend, provisioning, tenant, Graph, PnP, Procore, or deployment changes occurred.
- Only the five intended Wave 2 blueprint documents were added under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/`.
- `pnpm format:check` was run; the result is recorded in the Prompt 01 execution summary.

Prompt 02 may proceed.
