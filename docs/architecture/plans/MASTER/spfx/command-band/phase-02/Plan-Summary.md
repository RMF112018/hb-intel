# Plan Summary

## Phase 1 — Framing

### Objective
Produce a complete implementation prompt package for `PriorityActionsRail` and `PriorityActionsRailAdmin`, grounded in repo truth, the carried-forward spec files, the governing SPFx doctrine, the homepage benchmark package, and the documented HBCentral SharePoint list schemas.

### Attached governing files carried forward
This package carries forward:

- `Carry-Forward/PriorityActionsRail-and-Admin-Spec.md`
- `Carry-Forward/UI-Doctrine-SPFx-Governing-Standard.md`
- `Carry-Forward/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `Carry-Forward/Doctrine-Breakpoint-Update-README.md`

### Codebase under audit
The audited codebase is the live `main` branch of `RMF112018/hb-intel`, with emphasis on:

- `apps/hb-webparts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/`
- `apps/hb-webparts/src/webparts/hbHeroBannerAdmin/`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/mount-priority-actions-rail-proof-case.tsx`
- `apps/hb-webparts/src/homepage/**`
- `packages/ui-kit/src/homepage/**`
- `docs/reference/sharepoint/list-schemas/hbcentral/**`
- `docs/architecture/plans/MASTER/spfx/benchmark/**`

### Governing doctrine and benchmark authorities
This package assumes the following are binding or enforcement-level authorities:

- SPFx host-aware posture
- homepage import discipline through `@hbc/ui-kit/homepage`
- anti-safety-zone posture
- premium-stack usage where relevant
- manifest adjacency and packaging proof
- shell-level and application-level breakpoint governance
- authoring safety and credible loading/empty/error states
- benchmark-grade implementation rigor with proof-based closure

### SharePoint list-schema documentation requirement
The list schema docs are treated as canonical implementation input, not supplemental reference. The package assumes no code agent may hand-wave list integration or postpone descriptor/adapter/writer work.

### Complete package requirement
The output is intentionally a package, not a summary. It includes execution prompts, schema appendices, a gap register, a dependency map, and a proof checklist.

### No-deferral rule
Work needed to reach the intended implementation target is included now. Nothing material is pushed to “future work,” “cleanup,” or “optional polish.”

### Unconstrained prompt-count rule
Prompt count is driven by dependency order and architectural boundaries, not by a target number.

---

## Phase 2 — Repo-truth implementation map

### Verified current seams
#### Public rail and homepage runtime
- `PriorityActionsRail` is already a shipped homepage webpart target in `apps/hb-webparts`.
- `src/mount.tsx` already dispatches the public rail by manifest id.
- `src/mount-priority-actions-rail-proof-case.tsx` already exists as a dedicated proof seam for the public rail.
- `apps/hb-webparts/README.md` documents the homepage package structure, import rules, and the current webpart inventory.

#### Shared homepage implementation territory
- `apps/hb-webparts/src/homepage/shared/`
- `apps/hb-webparts/src/homepage/helpers/`
- `apps/hb-webparts/src/homepage/webparts/`
- `apps/hb-webparts/src/homepage/models/`

These are the most likely current local homepage seams for contracts, shell-fit behavior, and helper reuse.

#### Authoring/admin precedent
- `apps/hb-webparts/src/webparts/hbHeroBannerAdmin/` is the strongest verified current precedent for admin/configuration experience patterns in the homepage package.

#### Package and manifest seams
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/**`
- `tools/build-spfx-package.ts`
- adjacent manifests for homepage webparts

### SharePoint schema seams
The documented lists that govern this work are:

- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/List-Map.md`

### Benchmark and doctrine seams
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/00-Plan-Summary.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/06-Closure-Checklist.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

---

## Phase 3 — Gap assessment against the attached specs

### What already supports the spec
- The public rail already exists as a mounted homepage webpart target.
- The repo already has homepage-local shared seams and a dedicated proof-case mount seam.
- The repo already has an admin/configuration precedent (`HbHeroBannerAdmin`).
- The SharePoint lists are already provisioned and documented with internal names, join keys, and runtime intent.
- The homepage package already has governed import policy and packaging structure.

### What partially supports the spec but is insufficient
- The public rail exists, but the list schema docs say the direct public list-read adapter is still pending.
- The repo has shared homepage structure, but the spec calls for a dedicated promoted surface family under `packages/ui-kit/src/homepage/surfaces/priority-rail/`; this is not proven to exist yet.
- There is an admin precedent, but there is no verified Priority Actions admin product yet.
- Mount/package seams exist, but they do not yet prove the new admin webpart is wired, packaged, or validated.

### What directly conflicts or trails the spec target
- Current repo truth does not show `PriorityActionsRailAdmin` in the homepage webpart inventory.
- The list docs still describe runtime adapter work as pending, which conflicts with the spec’s requirement for explicit read/write seams and canonical typed contracts.
- Without a dedicated surface family, the public rail risks remaining too local, insufficiently reusable, or visually inconsistent with the spec’s required preview/shared-render model.
- Without new write seams and draft-state handling, the admin experience would fall back to raw list editing or weak form-only behavior, both explicitly prohibited by the spec.

### What is missing
- Dedicated canonical typed contract layer spanning public/admin/list rows/draft/write commands
- list descriptor modules and adapter/mapping seams
- explicit read seams
- explicit write seams
- shared public+preview rail surface family
- admin webpart folder, manifest, component, and authoring workflow
- validation kernel
- hosted proof package and scorecard closure artifacts

### What must be added or restructured
- Public rail should be refactored onto explicit read/normalize/breakpoint seams and the shared rail surface family.
- Admin must be introduced as a full webpart, not a property-pane substitute or ad hoc list editor.
- List integration must be hardened into descriptors, raw-row contracts, resolvers, filters, validators, and writers.
- Shared UI should be promoted to governed homepage surface exports where reuse is part of the product architecture.

---

## Phase 4 — SharePoint schema alignment assessment

### Supported schema assumptions
The list docs already support the two-list architecture the spec expects:

#### `Priority Actions Band Config`
- exact list title is documented
- exact internal field names are documented
- one active row per `BandKey` is documented
- active-row resolution order is documented
- layout mode and max-visible breakpoint settings are documented

#### `Priority Actions Band Items`
- exact list title is documented
- exact internal field names are documented
- `BandKey + ActionKey` identity model is documented
- item status, priority, overflow, audience, device visibility, and schedule fields are documented
- normalization intent is documented

### Missing code-facing hardening implied by the schema docs
The docs themselves say the direct public list-read adapter is still pending. That means the package must explicitly include:

- descriptor modules for both lists
- raw row interfaces keyed to internal names
- active-config resolver
- item adapters and normalization functions
- schedule and audience predicates
- deterministic overflow and breakpoint resolvers
- explicit writers for config/item/save/reorder/archive operations
- validator coverage for duplicate-active-row, required href/title, key stability, and valid date ranges

### Canonical list truth the implementation must treat as binding
- `BandKey` is the join key between config and items
- `ActionKey` is the stable runtime/admin identity for items
- `Enabled` + `IsActive` + newest `Modified` + highest `ID` governs active config resolution
- `ItemStatus=Enabled` governs render eligibility before audience/schedule/device gates
- `OverflowOnly=true` overrides base priority for render treatment
- device visibility flags and max-visible counts must be resolved together, not independently
- `AudienceKeys` is newline-delimited at storage time and array-normalized at runtime/admin time

---

## Phase 5 — Doctrine and benchmark implementation implications

### Binding doctrine implications
This effort must be explicitly shaped by:

- page-canvas ownership without fake shell chrome
- `@hbc/ui-kit/homepage` import discipline
- premium-stack usage where relevant
- rejection of stock white-card/sharepoint-quick-links outcomes
- real iconography through `lucide-react`
- shell-aware and application-aware breakpoint governance
- credible behavior in edit mode, narrow sections, and constrained heights
- adjacent manifest correctness and packaged-result proof

### Benchmark implications
This effort must achieve:

- contract/data rigor comparable to Kudos-grade work
- purpose-fit differentiation: utility-first public rail, authoring-first admin
- proof-based closure, not visual uplift alone
- scorecard closure with no category under 2
- hosted screenshots, keyboard/focus validation, and runtime evidence
- anti-homogenization: quality parity with Kudos, not layout mimicry

### Premium-stack implications
At minimum the implementation should materially use:

- `lucide-react` for the icon system
- `motion/react` for restrained hover/press/reveal/sticky transitions
- `@floating-ui/react` for overflow anchoring
- `@radix-ui/react-tooltip` for compact affordance clarification
- `@radix-ui/react-scroll-area` where overflow containers need polished scrolling
- `class-variance-authority` and `clsx` for shared variant logic

---

## Phase 6 — Implementation dependency architecture

### Structural groundwork
1. Lock schema truth, descriptors, contracts, and baseline repo findings.
2. Establish explicit read/write/validate seam ownership.

### Shared surface work
3. Build the shared rail surface family in the homepage entry point with breakpoint variants and preview support.

### Public rail work
4. Refactor the existing public rail to consume shared surfaces and normalized runtime contracts.

### Admin work
5. Build write commands, draft state, and validation orchestration.
6. Build `PriorityActionsRailAdmin` as a full authoring webpart with preview fidelity.

### Packaging and runtime work
7. Wire mount/manifest/package seams and proof-case support.
8. Validate in hosted runtime and complete benchmark closure artifacts.

---

## Phase 7 — Final package generation

This package includes:

- package guide: `README.md`
- main analysis: `Plan-Summary.md`
- carried-forward governing files: `Carry-Forward/`
- prompt set: `Prompts/`
- supporting appendices and checklists

---

## Phase 8 — Executive summary

### Biggest implementation gaps
- Missing admin webpart
- missing or incomplete list adapters/readers/writers
- missing shared promoted rail surface family
- missing hosted proof and scorecard closure package

### Most important structural work
- Hardening the two-list model into real code seams
- refactoring the public rail onto normalized contracts
- creating the admin around the same shared preview/public surface family

### Biggest doctrine / benchmark risks
- Falling back to Quick Links-like cards or dominant Fluent admin chrome
- weak breakpoint behavior that technically renders but stresses under nested widths
- closing on visual polish without data/write/runtime rigor

### Biggest SharePoint schema integration risks
- drifting from documented internal names
- weak active-row resolution
- unstable `ActionKey` handling
- inconsistent treatment of `OverflowOnly`, device gates, and audience/schedule filters

### Most important execution-order decisions
- Do not build admin UI before the descriptors/contracts/read-write seams exist.
- Do not refactor the public rail before the shared surface family exists.
- Do not claim closure before hosted validation and scorecard proof exist.

### Why this package structure is correct
The prompts separate true dependency boundaries:
- schema and seams first
- shared rendering second
- public runtime third
- admin authoring fourth
- package/host proof last

That order minimizes rework and keeps the code agent operating against stable contracts rather than rewriting finished UI around late-arriving data truths.
