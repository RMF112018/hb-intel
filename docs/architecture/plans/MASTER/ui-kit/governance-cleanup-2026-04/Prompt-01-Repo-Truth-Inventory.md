# Prompt 01 Repo-Truth Inventory

## Scope

This inventory is documentation-only for Prompt 01. No product/runtime code, brand binary assets, or fonts were modified.

## Existing Prompt Package Inspection (Required)

Inspected existing package:

- `docs/architecture/plans/MASTER/ui-kit/wave-02/README.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Plan-Summary.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Interview-Decisions.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Repo-Truth-Audit-Targets.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Governance-Target-File-Map.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Validation-Matrix.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Prompt-01-Governance-Inventory-and-Scope-Lock.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Prompt-02-Doctrine-Index-and-Supersession-Cleanup.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Prompt-03-SPFx-Full-Page-Widget-Overlay-and-Scoring-Model.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Prompt-04-Brand-Governance-Docs-Reconciliation.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Prompt-05-Curated-Web-Ready-Brand-Assets.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Prompt-06-Font-Package-Placement-and-Theme-Governance.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Prompt-07-Pattern-Standards-and-PCC-Layout-Governance.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Prompt-08-Component-Reference-Hygiene.md`
- `docs/architecture/plans/MASTER/ui-kit/wave-02/Prompt-09-Validation-Closeout-and-Agent-Usage-Guide.md`

## Required Repo-Truth Checks

| Area                          | Path(s)                                                                 | Result  | Evidence Summary                                                                                |
| ----------------------------- | ----------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| UI kit index                  | `docs/reference/ui-kit/README.md`                                       | Present | Contains doctrine hierarchy, entry-point linkage, consumer governance map.                      |
| Doctrine index                | `docs/reference/ui-kit/doctrine/README.md`                              | Present | Exists; currently framed as breakpoint-update note.                                             |
| SPFx governing doctrine       | `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md` | Present | Binding SPFx doctrine with host-aware and premium-surface posture.                              |
| SPFx homepage overlay         | `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`   | Present | Homepage overlay inherits SPFx standard and adds homepage-specific binding rules.               |
| PWA governing doctrine        | `docs/reference/ui-kit/doctrine/UI-Doctrine-PWA-Governing-Standard.md`  | Present | Runtime-specific PWA doctrine exists.                                                           |
| Entry-point authority         | `docs/reference/ui-kit/entry-points.md`                                 | Present | Documents 8 `@hbc/ui-kit` entry points and homepage import policy.                              |
| UI-kit reference corpus       | `docs/reference/ui-kit/*.md`                                            | Present | Full reference set enumerated and classified in Prompt-01 matrix file.                          |
| SPFx homepage audit checklist | `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`         | Present | Exists for acceptance criteria routing.                                                         |
| SPFx homepage scorecard       | `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`         | Present | Exists for scoring reference.                                                                   |
| SPFx homepage audit evidence  | `docs/reference/spfx-surfaces/homepage-uiux-audit-evidence.md`          | Present | Exists for evidence alignment.                                                                  |
| SPFx benchmark package        | `docs/reference/spfx-surfaces/benchmark/**`                             | Present | README + `00`-`07` benchmark/governance docs present.                                           |
| Brand reference root          | `docs/reference/brand/README.md`                                        | Present | Brand governance hub exists.                                                                    |
| Brand asset inventory         | `docs/reference/brand/BRAND-ASSET-INVENTORY.md`                         | Present | Inventory expects source territory semantics and references Futura archive context.             |
| Brand usage governance        | `docs/reference/brand/BRAND-USAGE-GOVERNANCE.md`                        | Present | Binding logo/font rules and prohibited behaviors documented.                                    |
| Brand archive                 | `docs/reference/brand/HB-Brand-Guide.zip`                               | Present | Current archive location is at brand root.                                                      |
| Brand source directory        | `docs/reference/brand/source/`                                          | Absent  | Target source territory does not currently exist on this branch.                                |
| Branding registry             | `packages/ui-kit/src/branding/index.ts`                                 | Present | Exports `gritLogo`, `hbIconBlueBg`, `hbLogoIcon`, `hedrickLogo`, and `brandAssets`.             |
| Branding assets               | `packages/ui-kit/src/branding/assets/**`                                | Present | Current assets: `grit-logo.jpg`, `hb-icon-blue-bg.jpg`, `hb-logo-icon.jpg`, `hedrick-logo.png`. |
| Theme conventions             | `packages/ui-kit/src/theme/**`                                          | Present | Typography/theme tokens present; no new font-binary layer observed in scope.                    |
| UI-kit package config         | `packages/ui-kit/package.json`, `packages/ui-kit/tsconfig.json`         | Present | `./branding` export exists; TypeScript build/test/lint scripts present.                         |
| SPFx consumer proof scope     | `apps/hb-webparts/**`, `apps/project-sites/**`, `packages/spfx/**`      | Present | Read-only import-policy proof captured (see brand/font posture audit).                          |

## README Missing-Reference Check

Checked local links referenced by `docs/reference/ui-kit/README.md`.

Result: no missing local doc targets were found in the referenced link set.

## Prompt 01 Operational Boundaries Applied

- `wave-02` package inspected only; not modified.
- This package (`governance-cleanup-2026-04`) is used as Prompt-01 execution evidence/scope-lock output for this run.
- No cleanup implementation, asset curation, font handling, or runtime mutation was performed.
