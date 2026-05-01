# PCC Phase 3 / Wave 7 — HB Document Control Center Implementation Prompt Package

## Purpose

This package instructs a local code agent working in:

```text
/Users/bobbyfetting/hb-intel
```

to implement the remaining **Project Control Center Phase 3 / Wave 7 — HB Document Control Center** work based on current repo truth.

This is an implementation package, not a planning addendum. The closed decisions are incorporated directly into the prompt sequence.

## Controlling Implementation Decisions

### Decision 1 — Shared Contract Before UI

The local agent must correct **SPFx fixture/read-model parity** before or as the first step of any three-lane UI work.

Do not render only the current legacy `sources` fixture sample as the final implementation basis. The current Wave 7 target requires the SPFx consumer layer to consume the additive Wave 7 read-model fields already represented in the backend mock provider.

Required outcome:

- SPFx fixture client `getDocumentControl()` returns the same Wave 7 shape as the backend mock provider.
- Legacy `sources` compatibility remains.
- No live HTTP, Graph, PnP, Procore, Adobe Sign, or Document Crunch runtime is introduced.

### Decision 2 — Split Prompt 03 Into 03A and 03B

The implementation package uses the following preferred split:

1. `03A_Prompt_SPFX_Document_Control_Read_Model_Parity.md`
2. `03B_Prompt_SPFX_Three_Lane_UI.md`

The local agent must complete 03A before 03B.

### Decision 3 — Local Repo State Gate

Before implementation, the local agent must run:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -10
md5 pnpm-lock.yaml
```

If unrelated changes exist:

- do not overwrite them;
- do not stage them;
- do not include them in the implementation commit;
- list them in closeout as pre-existing unrelated work.

### Decision 4 — No Live File Operations in Wave 7 UI Work

Wave 7 implementation remains preview/read-model driven.

Forbidden:

- live Microsoft Graph file listing/upload/download/copy-link;
- direct broad SPFx Graph execution;
- PnP/SharePoint REST runtime;
- Procore writeback;
- Adobe Sign agreement execution;
- Document Crunch runtime writeback;
- tenant mutation;
- permission mutation;
- `.sppkg` packaging/deployment;
- package dependency changes;
- `pnpm-lock.yaml` changes.

## Current Repo-Truth Summary

Remote GitHub repo was accessible. Local uncommitted working-tree state was not visible from the audit environment, so the local agent must treat local status as a hard preflight gate.

Known remote findings:

- Default branch: `main`.
- Audited remote `main` HEAD: `9d8a61fb8b82a8fd93cd85148ea1352731605db4`.
- Wave 7 architecture commit present: `1c90b66db436400c2636309a44ee46696f9bfebd`.
- Wave 7 deterministic fixture commit present: `1ccf8acb27f4ffc744d5a276df3e1ff7cb3f8d32`.
- Phase 3 Wave 7 is defined as **HB Document Control Center**.
- Responsibility Matrix remains Wave 11.
- Backend mock provider already returns additive Wave 7 document-control fields.
- SPFx fixture read-model client still needs parity with backend Wave 7 document-control fields.
- SPFx Documents surface still renders the older two-lane preview and must be migrated to the three-lane model.

## Implementation Sequence

1. `03A` — SPFx document-control read-model fixture parity.
2. `03B` — SPFx three-lane HB Document Control Center UI shell.
3. `04` — Permission/action rendering and hard-no guardrails.
4. `05` — Source state/degraded-state UI behavior.
5. `06` — Reviews & Approvals summary.
6. `07` — Closeout and validation.
7. `08` — Fresh reviewer audit.

## Package File List

- `README.md`
- `00_Repo_Truth_Audit_Summary.md`
- `01_Outside_Research_Summary.md`
- `02_Implementation_Roadmap.md`
- `03A_Prompt_SPFX_Document_Control_Read_Model_Parity.md`
- `03B_Prompt_SPFX_Three_Lane_UI.md`
- `04_Prompt_Permission_Action_Rendering.md`
- `05_Prompt_Source_Degraded_States.md`
- `06_Prompt_Reviews_Approvals_Summary.md`
- `07_Prompt_Closeout_Validation.md`
- `08_Reviewer_Prompt.md`

## Universal Agent Instructions

Apply these to every prompt in this package.

- Do not re-read files that are still within current context or memory.
- Do not overwrite unrelated working-tree changes.
- Do not edit `docs/architecture/plans/**` unless explicitly authorized and consistent with repo governance.
- Do not introduce package dependencies.
- Do not change `pnpm-lock.yaml`.
- Do not run `pnpm install`, `pnpm add`, or equivalent.
- Do not package or deploy SPFx.
- Do not mutate tenant or external systems.
- Do not introduce secrets/app settings.
- Do not perform live Graph/Procore/Adobe/Document Crunch operations.
- Use targeted tests first.
- Preserve legacy read-model compatibility until all consumers migrate.
