# 00 — Repo Truth Audit Summary

## Audit Scope

This audit supports implementation of:

```text
Project Control Center Phase 3 / Wave 7 — HB Document Control Center
```

The goal is to establish implementation sequencing and guardrails for a local code agent, not to directly implement code in this package.

## Repository

```text
https://github.com/RMF112018/hb-intel.git
Expected local path: /Users/bobbyfetting/hb-intel
```

## Git / Repo State Findings

Remote GitHub state was visible during the audit. Local uncommitted working-tree state was not visible.

Known remote findings:

| Item | Finding |
|---|---|
| Default branch | `main` |
| Audited remote `main` HEAD | `9d8a61fb8b82a8fd93cd85148ea1352731605db4` |
| Wave 7 architecture commit | Present: `1c90b66db436400c2636309a44ee46696f9bfebd` |
| Wave 7 deterministic fixture commit | Present: `1ccf8acb27f4ffc744d5a276df3e1ff7cb3f8d32` |
| Local working tree | Unknown from audit environment; must be checked locally before edits |

## Required Local Preflight

Before any edits:

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
- list them in closeout.

## Governing Documentation Findings

Audited / targeted docs:

```text
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-07/
```

Confirmed direction:

- Phase 3 Wave 7 = **HB Document Control Center**.
- Wave 7 is not Responsibility Matrix / RACI.
- Responsibility Matrix remains Wave 11.
- Wave 7 target model is three-lane:
  - Project Record
  - My Project Files
  - External Systems
- Wave 7 remains conservative: no live file operations, no external writeback, no tenant mutation, no package/deployment changes.

## Shared Model Findings

Primary file:

```text
packages/models/src/pcc/DocumentControl.ts
```

Current state:

- Contains older two-lane model and comments:
  - `microsoft-files`
  - `external-document-systems`
- Contains additive Wave 7 scaffolding:
  - `DOCUMENT_CONTROL_WAVE7_LANES`
  - Project Record / My Project Files / External Systems vocabulary
  - legacy-to-Wave 7 lane mappings
  - Project Document Source Registry entry types
  - SharePoint binding types
  - My Project Files binding policy / binding types
  - external system binding types
  - source health states
  - PR/MP/SB/EX/WF action family vocabulary
  - R01–R23 role code vocabulary
  - review states/types
  - universal hard-no rules

Risk / gap:

- Wave 7 scaffolding is additive and incomplete compared with the full target architecture.
- `DOCUMENT_CONTROL_ACTION_CODES` currently appears sample-level rather than complete for all PR01–PR12, MP01–MP09, SB01–SB08, EX01–EX04, WF01–WF08.
- Role vocabulary includes R01–R23, but labels should be verified against governing docs before extending UI behavior.
- Review type vocabulary currently appears narrower than the governing target review list.

Implementation implication:

- UI should render from read-model fields, not hard-coded local app vocabulary.
- Prompt 03A should align SPFx fixture client with backend mock provider first.
- A later shared-model correction prompt may be appropriate before live operations, but the current UI implementation can remain read-model driven and preserve legacy `sources`.

## Backend Read-Model Provider Findings

Primary file:

```text
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
```

Current state:

- `getDocumentControl()` returns Wave 7 additive fields.
- Backend mock provider includes:
  - `wave7LaneVocabulary`
  - `sourceRegistry`
  - `sourceHealth`
  - `sourceHealthStates`
  - `reviewStates`
  - `reviewTypes`
  - `hardNoRules`
  - `roleActionAvailability`
  - `actionCatalog`
  - `reviewQueueSample`
  - legacy `sources`
- Contains deterministic source registry sample:
  - Project Record SharePoint library
  - My Project Files current-user folder
  - Procore launch-only external source
  - Document Crunch launch-only external source
  - Adobe Sign disabled external source
- Contains My Project Files path:
  - `/My Project Files/26-000-00-Stadium Enclave`
- Does not expose root `My Project Files` as a browsable list.
- Does not expose other-project folders.
- Keeps external integrations launch/status only.
- No live Graph/PnP/SharePoint REST/Procore/Document Crunch/Adobe Sign runtime is introduced in this file.

Risk / gap:

- Backend fixture assigned review queue sample uses R18/R19 labels from current vocabulary; verify alignment when rendering reviewer labels.
- Backend fixture action catalog is sample-level, not full target action matrix.

Implementation implication:

- Treat backend mock provider as the current best source of Wave 7 fixture shape.
- Prompt 03A should mirror this shape in SPFx fixture client.

## SPFx Fixture / Read-Model Client Findings

Primary file:

```text
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
```

Current state:

- `getDocumentControl()` returns only:
  - legacy `sources`
- It does not yet return the additive Wave 7 fields that the backend mock provider returns.
- It remains fixture-only and does not perform HTTP/auth/live integrations.

Implementation implication:

- This is the first implementation slice.
- Do not begin the three-lane Documents UI until this parity gap is closed.

## SPFx Document Surface Findings

Primary path:

```text
apps/project-control-center/src/surfaces/documents/
```

Current state:

- `PccDocumentsSurface.tsx` renders:
  - `PccDocumentsHeaderCard`
  - Microsoft file source cards for legacy `microsoft-files`
  - external doc system cards for legacy `external-document-systems`
- `shared.ts` derives lane/source membership from legacy two-lane `DOCUMENT_CONTROL_LANES`.
- Header card renders two legacy lanes.
- Existing tests assert:
  - legacy two-lane composition
  - disabled Microsoft action chips
  - external launch/visibility cues
  - no live HTTP links
  - no executable action handlers

Implementation implication:

- Prompt 03B must migrate this surface to a three-lane Wave 7 shell after 03A fixture parity.
- Tests must be updated from two-lane assertions to three-lane assertions.
- Retain non-operational posture:
  - no anchor `href` launches to live URLs;
  - no executable file actions;
  - no Graph/PnP/import/runtime additions.

## Router / Client Threading Findings

Primary file:

```text
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

Current state:

- Read-model client is threaded to:
  - Project Home
  - Team & Access
- Documents receives no read-model client:
  - `<PccDocumentsSurface />`

Implementation implication:

- Prompt 03B should introduce a narrow document-control read-model client interface and pass it only to Documents.
- Follow Project Home and Team & Access patterns.
- Do not expand the full client interface unnecessarily.

## Test / Script Findings

Root scripts:

```json
{
  "check-types": "turbo run check-types",
  "test": "pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell --filter=@hbc/sharepoint-docs --filter=@hbc/bic-next-move --filter=@hbc/complexity --filter=@hbc/data-access --filter=@hbc/functions",
  "format:check": "prettier --check \"**/*.{ts,tsx,md,json,yaml}\""
}
```

Models package:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

SPFx PCC package:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```

Backend functions package:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

Recommended targeted validation order:

1. `md5 pnpm-lock.yaml`
2. package-level tests for touched areas
3. package-level type checks
4. `git diff --check`
5. repeat `md5 pnpm-lock.yaml`

## Contradictions / Risks

| Issue | Risk | Resolution |
|---|---|---|
| Docs target three lanes; SPFx UI still renders two lanes | UI implementation may conflict with approved Wave 7 target | Close with Prompt 03B after fixture parity |
| Backend mock provider has Wave 7 fields; SPFx fixture client does not | Surface cannot consume equivalent fixture shape in frontend tests | Close with Prompt 03A first |
| Shared model contains legacy two-lane and additive Wave 7 vocabulary | Confusing imports and mixed terminology | Preserve backward compatibility; render Wave 7 fields from read model |
| Action catalog / review types appear sample-level | UI may look incomplete if interpreted as full target matrix | Render available read-model fields now; document full matrix as later model-hardening if needed |
| Local working tree unknown | Risk of overwriting active work | Treat status check as hard preflight gate |

## Closed Implementation Decisions

1. **Shared contract before UI.**
   - SPFx fixture/read-model parity must be closed before three-lane UI rendering.

2. **Prompt 03 split.**
   - Use `03A` for fixture/read-model parity.
   - Use `03B` for three-lane UI.

3. **Local repo state gate.**
   - `git status --short`, branch, log, and lockfile checksum are mandatory preflight steps.

4. **No live operations.**
   - Wave 7 remains preview/read-model driven until later explicit authorization.
