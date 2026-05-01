# Repo-Truth Audit Findings

The package was prepared after auditing the live GitHub repo through the available repository connector. The local code agent must still re-run the baseline commands at the start of each prompt because local working-tree state may differ.

### 2.1 Baseline commands required in every prompt

Every implementation prompt must begin with:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Each prompt must record:

- current branch;
- current HEAD;
- recent relevant commits;
- working-tree state;
- unrelated pre-existing changes;
- `pnpm-lock.yaml` checksum before edits.

### 2.2 Current wave alignment

Current repo truth establishes this alignment:

| Wave | Repo-truth identity | Current posture |
| ---: | --- | --- |
| 7 | HB Document Control Center | Recently implemented/closed via Wave 7 prompt sequence; no live file operations |
| 8 | Project Readiness Module Framework | Shared framework/shell layer; current docs require implementation authorization gate |
| 9 | Project Lifecycle Readiness Center | Downstream lifecycle/checklist module seeded by Startup, Safety, Closeout checklist-definition files |
| 10 | Permit Log | Downstream readiness module |
| 11 | Responsibility Matrix / RACI | Downstream readiness module; not Wave 8 |
| 12 | Constraints Log | Downstream readiness module |
| 13 | Buyout Log | Downstream readiness module |
| 14 | Approvals / Checkpoints | Downstream readiness/approval module |

### 2.3 Current Wave 8 scope-lock tension

Existing Wave 8 scope-lock path:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md
```

Current repo truth correctly names Wave 8 as:

- technical/framework name: **Project Readiness Module Framework**;
- user-facing surface name: **Project Readiness Center**.

However, the current Wave 8 scope-lock also states that the prior documentation correction pass does **not** authorize:

- readiness runtime implementation;
- backend route creation;
- persistence model implementation;
- scoring engine implementation;
- approval execution runtime;
- tenant/deployment/package operations.

Therefore, **Prompt 01 is mandatory**. It must convert Wave 8 from prior documentation-only correction posture into a bounded implementation posture before source work begins. If repo truth has already changed locally, Prompt 01 must verify and document that change rather than duplicate it.

### 2.4 Wave 9 boundary

Existing Wave 9 target architecture path:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Target_Architecture.md
```

Wave 9 is the downstream module that:

- consumes Wave 8 framework contracts;
- implements the lifecycle readiness/checklist module;
- uses checklist-definition files derived from:
  - `docs/reference/example/Project_Startup_Checklist.pdf`
  - `docs/reference/example/Project_Safety_Checklist.pdf`
  - `docs/reference/example/Project_Closeout_Checklist.pdf`
- must not be a single giant checklist screen, three static tabs, a PDF replacement, a Procore clone, or a dead-end compliance tracker.

Wave 8 must not import the Wave 9 item library or implement checklist-specific content. Wave 8 may include minimal framework sample fixtures that demonstrate domains/gates/status/evidence/blocker behavior without copying the Startup/Safety/Closeout checklist library.

### 2.5 Existing shared model/read-model posture

Important paths:

```text
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccUserRoles.ts
packages/models/src/pcc/PccCapabilities.ts
packages/models/package.json
```

Known package name and scripts:

```text
@hbc/models@0.5.1
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/models build
pnpm --filter @hbc/models lint
```

Current read-model envelope posture includes:

- `mode`
- `sourceStatus`
- `readOnly: true`
- `viewerPersona`
- `warnings`
- `generatedAtUtc`
- `data`

Current `PccReadModelResponseMap` includes:

- `profile`
- `modules`
- `home`
- `priority-actions`
- `document-control`
- `external-links`
- `site-health`
- `team-access`
- `settings`

No readiness-specific read-model currently exists. Prompt 02 should add it only after Prompt 01 authorizes Wave 8 implementation.

### 2.6 Existing backend read-model posture

Important paths:

```text
backend/functions/src/hosts/pcc-read-model/
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/package.json
```

Known package name and scripts:

```text
@hbc/functions@00.000.151
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm --filter @hbc/functions lint
```

Existing route tests assert exactly eight approved GET-only route handlers. Adding Wave 8 readiness route support requires explicitly updating route tests to expect nine GET-only routes and preserving:

- GET-only methods;
- no POST/PUT/PATCH/DELETE;
- existing auth wrapper posture;
- response shape `{ data: envelope }`;
- source-unavailable behavior for unknown projects;
- no Graph/PnP/SharePoint REST/Procore/Document Crunch/Adobe Sign runtime;
- no persistence or mutation.

### 2.7 Existing SPFx PCC app posture

Important paths:

```text
apps/project-control-center/package.json
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/priorityActions/
apps/project-control-center/src/surfaces/teamAccess/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/tests/
```

Known package name and scripts:

```text
@hbc/spfx-project-control-center@0.0.1
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center lint
```

Current `PccProjectReadinessSurface.tsx` is static preview content. Wave 8 should replace/enhance it with a framework-driven Project Readiness Center shell while preserving fixture-first/no-runtime posture.

### 2.8 Package/lockfile boundary

No dependency/package/lockfile/manifest changes should be needed for Wave 8. Any prompt that touches package files or `pnpm-lock.yaml` must stop unless repo truth proves it is absolutely required and the user explicitly authorizes the scope change.

---
