# Wave 2 — Prompt 02 Closeout: PCC SPFx App Target and Scaffold

**Phase:** 3
**Wave:** 2
**Prompt:** 02 — SPFx App Target and Scaffold
**Status:** Complete
**Date:** 2026-04-29

## Objective Recap

Create the dedicated PCC SPFx app scaffold at `apps/project-control-center/`
with a Vite-IIFE mount entry, a preview-only root component (`PccApp`),
package scripts, a local preview shell, and a minimal test skeleton. No full
PCC UI, no SPFx webpart manifest, no app-catalog packaging, no version
bumps, no live integrations.

## Prerequisite Verification

Prompt 02's named prerequisites were verified through the committed Wave 2
governance docs already on disk in this directory:

| Prerequisite | Source on disk |
| --- | --- |
| Wave 1 closeout present | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md` |
| Basis-of-design image exists | `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` (1.37 MB) |
| Target = `apps/project-control-center/` | `Wave_2_Decision_Closure_Register.md` (W2-ODR-001 frozen), `Wave_2_Scope_Lock.md`, `Wave_2_Repo_Truth_Audit.md` |
| Allowed/forbidden file boundaries locked | `Wave_2_Scope_Lock.md` |
| `apps/project-control-center/` not yet present | Resolved by this scaffold |
| `@hbc/models/pcc` exposes `PCC_MVP_SURFACES`, `PCC_MVP_SURFACE_IDS` | `packages/models/src/pcc/PccMvpSurfaces.ts` (Wave 1 closure) |

Prompt 01's verification scope is satisfied by the committed Wave 2 closure
docs above; no additional prior-prompt closeout file is required.

## Files Created (exact list)

```text
apps/project-control-center/
├── .eslintrc.cjs
├── README.md
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── src/
    ├── PccApp.tsx
    ├── PccApp.test.tsx
    ├── mount.tsx
    ├── preview.tsx
    ├── test-setup.ts
    └── styles/
        └── PccApp.module.css

docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/
└── Wave_2_Prompt_02_Closeout.md   ← this file
```

No files outside the authorized scaffold and this closeout were modified by
Prompt 02 execution.

## Out-of-Scope Confirmations

The following were explicitly **not** introduced or modified:

- `packages/spfx/` — untouched. No `packages/spfx/src/webparts/projectControlCenter/` directory created. Webpart-package barrel deferred until a real SPFx manifest is required in a later wave.
- `apps/project-control-center/src/webparts/` — does not exist. No SPFx webpart manifest.
- `apps/project-control-center/config/package-solution.json` — does not exist. No app-catalog packaging.
- No backend, Azure Functions, or `packages/provisioning/` work.
- No Graph/PnP, Procore SDK, tenant mutation, app catalog deployment, or live runtime integrations.
- No CI/CD workflow files modified.
- No manifest version bumps. (No manifests exist in this scaffold.) The PCC SPFx package solution version is unchanged because this prompt creates no `package-solution.json`.
- No homepage paired-row layout code, bento dashboard, priority actions, launch cards, workflow panels, approvals execution, document workflows, Site Health scanning, or access execution. Those are Wave 2 Prompts 03–08.
- No Griffel direct usage, no `@hbc/auth`, no `@tanstack/react-query`, no `@pnp/sp` added as direct dependencies. The scaffold's runtime deps are limited to `@hbc/models`, `@hbc/ui-kit`, `react`, `react-dom`. (Note: `@hbc/ui-kit` is declared but not directly imported in scaffold source; it is retained as a dep so subsequent prompts can introduce token-driven styling and primitives without a separate package change. If a leaner posture is preferred, `@hbc/ui-kit` may be removed in a follow-up prompt.)
- `mount(el, spfxContext?, config?)` accepts an optional `spfxContext` parameter for forward compatibility but performs **no** auth bootstrap, **no** permission resolution, **no** Graph/PnP calls, and **no** live runtime behavior. `bootstrapSpfxAuth` and `resolveSpfxPermissions` are not imported.

## Validation Results

All four required validation commands passed.

| Command | Result |
| --- | --- |
| `git status --short` | Confirmed only `apps/project-control-center/`, `pnpm-lock.yaml`, plus pre-existing unrelated modifications to `CLAUDE.md` and `.claude/settings.local.json` (both pre-existing before this prompt; not staged for Prompt 02 commit). |
| `pnpm --filter @hbc/spfx-project-control-center check-types` | **PASS** — `tsc --noEmit` succeeded with no diagnostics. |
| `pnpm --filter @hbc/spfx-project-control-center build` | **PASS** — emitted `dist/project-control-center-app.js` (147.17 kB · gzip 47.59 kB) and `dist/spfx-project-control-center.css` (1.46 kB · gzip 0.67 kB). The IIFE bundle exposes `__hbIntel_projectControlCenter.{ mount, unmount }` on the global. The bundle was **not** packaged into `.sppkg` and **not** deployed. |
| `pnpm --filter @hbc/spfx-project-control-center test` | **PASS** — 2/2 vitest tests passed (`renders the preview-only banner`, `renders every PCC MVP surface label and description from @hbc/models/pcc`). |
| `pnpm --filter @hbc/spfx-project-control-center lint` | **PASS** — eslint clean, no findings. |

## Lockfile Status

`pnpm-lock.yaml` gained exactly **43 added lines** — solely the new
`apps/project-control-center` importer entry. `git diff --stat
pnpm-lock.yaml` shows `1 file changed, 43 insertions(+)`. There is **no
resolved-version churn** in the `packages:` block; every dependency
declared by the new package resolves to a version already present in the
lockfile (reused from peer apps `apps/hb-shell-extension` and
`apps/hb-intel-foleon`). This matches the explicit acceptance condition
stated in the Prompt 02 corrections: *"strictly new-package importer
metadata with no resolved-version churn."*

A single `pnpm install --workspace-root=false` invocation was required so
pnpm could materialise `node_modules` for the new workspace package; no
`pnpm add`, `pnpm update`, or `pnpm install <pkg>` was used. The install
introduced no new resolved versions.

## Design Decisions Captured

1. **`PccApp` lives in this app, not in `packages/spfx`.** Prompt 02 lists
   `src/PccApp.tsx` explicitly and instructs that
   `packages/spfx/src/webparts/projectControlCenter/` should not be created
   unless necessary. Wave 2 is preview-only with no webpart manifest, so a
   package-level export barrel is not required. Promotion to
   `packages/spfx` will be re-evaluated when a real SPFx manifest is
   introduced.

2. **No auth bootstrap, no `QueryClient`.** Unlike
   `apps/project-sites/src/mount.tsx`, this scaffold's `mount()` does not
   import `@hbc/auth/spfx`. The scaffold has no SharePoint host wiring, so
   auth is dead code at this stage. `mount(el, spfxContext?, config?)`
   accepts an optional context parameter strictly for forward
   compatibility.

3. **Plain CSS module instead of Griffel.** Visual cues (dark navy header,
   HB-orange accent rail, MVP surface tile grid) are expressed in a plain
   CSS module with hex literals. Griffel is intentionally avoided in this
   scaffold to keep the dependency surface and toolchain footprint
   minimal. Token-driven styling via `@hbc/ui-kit/theme` lands when the
   basis-of-design layout frame is implemented in a later Wave 2 prompt.

4. **Surface labels from `@hbc/models/pcc`, not duplicated.** `PccApp`
   imports `PCC_MVP_SURFACES` and `PCC_MVP_SURFACE_IDS` directly from
   `@hbc/models/pcc`. The display names and descriptions render straight
   from the read-model. The vitest spec asserts every MVP surface row is
   present and matches the model's `displayName` and `description` —
   guaranteeing the scaffold drifts with the model rather than inventing
   parallel taxonomy.

## Repo State After Execution

- `apps/project-control-center/` directory created with the file set above.
- `pnpm-lock.yaml` extended with a 43-line importer block; no version churn.
- No other tracked files modified by Prompt 02. Pre-existing modifications
  to `CLAUDE.md` and `.claude/settings.local.json` were already present
  before this prompt began and are not part of the Prompt 02 commit.

## Next Steps (forward look — informational only)

Subsequent Wave 2 prompts (03–09) will:

- Promote dark-header / orange-rail visual cues from hex literals to
  `@hbc/ui-kit/theme` tokens.
- Introduce the basis-of-design dashboard layout frame and bento grid.
- Implement individual MVP surfaces (Project Home, Team & Access, Documents,
  Project Readiness, Approvals, External Systems, Control Center Settings,
  Site Health) as fixture-driven preview surfaces.
- Wire fixture sources from `@hbc/models/pcc` (`PCC_FIXTURES` and
  per-domain `SAMPLE_*` exports) into the surfaces.
- Maintain the no-runtime / no-tenant / no-deployment posture until Wave 3
  formally introduces those concerns.

This closeout records only what Prompt 02 delivered and verified; nothing
above the "Next Steps" line constitutes execution beyond Prompt 02 scope.
