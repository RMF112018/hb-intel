# @hbc/spfx-project-control-center

Wave 2 scaffold for the PCC (Project Control Center) SPFx app. Establishes
the dedicated app target at `apps/project-control-center/` with a Vite-IIFE
mount entry, a preview-only root component (`PccApp`), and a minimal test
skeleton.

## Scope

- **Wave 2 / Prompt 02**: safe app scaffold only.
- **No** SPFx webpart manifest, **no** `package-solution.json`, **no**
  app-catalog packaging.
- **No** Graph/PnP, **no** Procore runtime, **no** tenant mutation, **no**
  backend/provisioning.
- **No** version bumps.
- **No** full PCC UI (no bento dashboard, priority actions, launch cards,
  workflow panels, approvals execution, document workflows, Site Health
  scanning, or access execution). Those land in subsequent Wave 2 prompts.
- Fixture-driven preview only. The 8 MVP surface labels render directly from
  `@hbc/models/pcc` (`PCC_MVP_SURFACES`).

## File Tree

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
```

## Design Decisions

### PccApp lives in this app, not in `packages/spfx`

Prompt 02 lists `src/PccApp.tsx` explicitly and instructs that
`packages/spfx/src/webparts/projectControlCenter/` should not be created
unless necessary. Wave 2 is preview-only with no webpart manifest, so a
package-level export barrel is not required. The root component therefore
lives at `src/PccApp.tsx` here. When a real webpart manifest is introduced
in a later wave, the component may be promoted to `packages/spfx` if
package-oriented import discipline is required at that point.

### No auth bootstrap, no live runtime

Unlike `apps/project-sites/src/mount.tsx`, this scaffold's `mount()`
does **not** import `@hbc/auth/spfx`, does **not** call `bootstrapSpfxAuth`
or `resolveSpfxPermissions`, and does **not** create a `QueryClient`. Those
concerns belong with the eventual webpart manifest, not with the scaffold.
`mount(el, spfxContext?, config?)` accepts an optional `spfxContext`
parameter strictly for forward compatibility; the parameter is unused.

### CSS module instead of Griffel

Visual cues (dark navy header, HB-orange accent rail) are expressed in a
plain CSS module with hex literals. Griffel is intentionally avoided in
this scaffold to keep the dependency surface and toolchain footprint
minimal. Token-driven styling via `@hbc/ui-kit/theme` lands in Prompt 03
when the basis-of-design layout frame goes in.

## Local Preview

```bash
pnpm --filter @hbc/spfx-project-control-center dev
```

This starts the Vite dev server, which loads `index.html` → `src/preview.tsx`
→ `mount()`. The preview reads PCC surface metadata from `@hbc/models/pcc`
and renders the 8 MVP surface labels. There is no SharePoint context, no
auth, and no network I/O.

## Validation Commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center lint
```

The `build` script emits an IIFE bundle at
`dist/project-control-center-app.js` exposing
`window.__hbIntel_projectControlCenter.{ mount, unmount }` for future
SPFx host wiring. The bundle is not packaged into an `.sppkg` and is not
deployed.

## Governing References

- Wave 2 README:
  `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/README.md`
- Decision Closure Register:
  `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/01_Wave_2_Decision_Closure_Register.md`
- UI/UX basis of design:
  `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`
- Wireframe & layout contract:
  `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/03_PCC_UI_Wireframe_and_Flexible_Layout_Contract.md`
- Scope lock:
  `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/04_Wave_2_Scope_Lock_Implementation_Boundaries.md`
- Wave 1 closeout (PCC shared foundations):
  `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md`

## Prerequisites Verified by Wave 2 Governance

Prompt 02 prerequisites are satisfied through the committed Wave 2
governance docs, which together cover Prompt 01's verification scope:

| Prerequisite | Source |
| --- | --- |
| Wave 1 closeout present | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md` |
| Basis-of-design image exists | `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` |
| Target = `apps/project-control-center/` | Decision W2-ODR-001 (frozen), Wave 2 README, scope lock |
| `apps/project-control-center/` not yet present (correct prerequisite state) | Resolved by this scaffold |
| Allowed/forbidden file boundaries locked | `04_Wave_2_Scope_Lock_Implementation_Boundaries.md` |
| `@hbc/models/pcc` exposes `PCC_MVP_SURFACES`, `PCC_MVP_SURFACE_IDS` | `packages/models/src/pcc/PccMvpSurfaces.ts` (Wave 1) |
