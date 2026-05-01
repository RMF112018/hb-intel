# 03B — Prompt: SPFx Three-Lane HB Document Control Center UI

## Role

You are a local code agent working in the live repository:

```text
/Users/bobbyfetting/hb-intel
```

You are implementing **Project Control Center Phase 3 / Wave 7 — HB Document Control Center**.

## Objective

Update the SPFx Documents surface to render the Wave 7 three-lane **HB Document Control Center** shell from the document-control read model.

This prompt assumes `03A_Prompt_SPFX_Document_Control_Read_Model_Parity.md` is complete. If it is not complete, stop and complete 03A first.

## Mandatory Preflight

Run:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -10
md5 pnpm-lock.yaml
```

Rules:

- If unrelated changes exist, do not overwrite them.
- Do not stage unrelated changes.
- Record pre-existing unrelated changes in closeout.
- Do not re-read files that are still within your current context or memory.

## Files to Inspect

```text
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/surfaces/teamAccess/
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/DocumentControl.ts
```

Use existing Project Home and Team & Access read-model opt-in patterns as implementation references.

## Files You May Modify

Primary allowed files:

```text
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
```

Possible new files:

```text
apps/project-control-center/src/surfaces/documents/useDocumentControlReadModel.ts
apps/project-control-center/src/surfaces/documents/documentControlViewModel.ts
apps/project-control-center/src/surfaces/documents/PccDocumentControlReadModelContent.tsx
apps/project-control-center/src/surfaces/documents/PccDocumentControlLaneCard.tsx
```

Avoid modifying shared model files unless a type export is missing and required.

## Required Implementation

### 1. Add a narrow read-model seam for Documents

Introduce a narrow interface similar to Project Home / Team & Access patterns.

Required method:

```ts
getDocumentControl(projectId, viewerPersona?)
```

Do not pass the full read-model client deeper than needed if a narrow interface is sufficient.

### 2. Thread the read-model client through router

Update `PccSurfaceRouter.tsx` so:

```tsx
case 'documents':
  return <PccDocumentsSurface readModelClient={readModelClient} />;
```

Adjust the router read-model client interface to include the narrow Documents method.

### 3. Render the Wave 7 module name

The surface header must render:

```text
HB Document Control Center
```

Do not use only the legacy label:

```text
Document Control Center
```

except where historical/secondary text is needed.

### 4. Render three lanes

Render exactly these lanes from read-model data:

```text
Project Record
My Project Files
External Systems
```

Lane source:

- Prefer `wave7LaneVocabulary` and `sourceRegistry` from read model.
- Do not hard-code app-local source/lane taxonomy except as safe fallback text for empty/degraded states.
- Preserve legacy `sources` compatibility where needed, but do not let legacy `microsoft-files` / `external-document-systems` control the primary Wave 7 layout.

### 5. Project Record lane

Render a card/section for SharePoint project record sources.

Required copy posture:

- Formal project files live in SharePoint project-site document libraries.
- Project Record is the formal project record.
- File actions are preview/read-only until later approved implementation.

Allowed UI:

- source display name;
- source health/status;
- binding metadata safe display;
- disabled/preview action chips;
- no live file browse/upload/download/copy-link behavior.

### 6. My Project Files lane

Render a card/section for the current user's project-specific OneDrive working folder.

Required warning text:

```text
Files in My Project Files are working files for this project. They are not part of the formal project record unless submitted to Project Record.
```

Required guardrails:

- Never render the full `My Project Files` root as a browsable folder.
- Never render folders for other projects.
- Render only the currently loaded project's folder binding/path.
- `Submit to Project Record` may appear only as disabled/preview/deferred. No runtime execution.

### 7. External Systems lane

Render cards/sections for:

- Procore
- Document Crunch
- Adobe Sign
- future approved systems if present in read model

Required posture:

- launch/status/missing-config/access-issue only;
- no external writeback;
- no sync;
- no mirror;
- no Procore replacement;
- no Adobe Sign agreement execution;
- no Document Crunch replication.

Do not render live `<a href="https://...">` links. If a launch cue appears, it must be disabled/preview/non-executable.

### 8. Degraded/empty states

If read model is unavailable or missing Wave 7 fields:

- show safe preview/degraded state;
- do not crash;
- do not attempt source discovery;
- do not call live APIs.

### 9. Maintain bento/grid conventions

Preserve current invariants:

- Cards remain direct children of the bento grid where current patterns require it.
- Exactly one active surface panel marker for `documents`.
- Follow current card footprint conventions.

## Required Tests

Update:

```text
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
```

Tests must prove:

1. Header renders **HB Document Control Center**.
2. Exactly three Wave 7 lanes render:
   - Project Record
   - My Project Files
   - External Systems
3. Project Record lane renders SharePoint project record binding/source data.
4. My Project Files lane renders the required warning text.
5. My Project Files lane does not render root folder browsing.
6. My Project Files lane does not render other-project folder browsing.
7. External Systems lane renders Procore, Document Crunch, and Adobe Sign from read-model data.
8. External systems are launch/status only.
9. No live `http(s)` anchor links are rendered.
10. No executable file action handlers are introduced.
11. Disabled/preview actions remain non-operational.
12. Legacy `sources` compatibility does not break the render.
13. Backend-unavailable / source-unavailable states render safely.
14. Direct bento-grid child invariant remains true.
15. Exactly one `[data-pcc-active-surface-panel="documents"]` exists.

## Forbidden Changes

Do not:

- introduce package dependencies;
- run `pnpm install`, `pnpm add`, or equivalent;
- change `pnpm-lock.yaml`;
- modify SPFx manifests;
- package or deploy SPFx;
- call Microsoft Graph;
- call SharePoint REST or PnP;
- call Procore;
- call Adobe Sign;
- call Document Crunch;
- create runtime upload/download/copy-link handlers;
- create runtime external launch links;
- mutate tenant/external systems;
- edit `docs/architecture/plans/**`.

## Validation Commands

Run targeted validation:

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccDocumentsSurface
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
md5 pnpm-lock.yaml
```

If exact test filtering differs, use the nearest targeted equivalent and document it.

## Closeout Requirements

In your response, include:

- files changed;
- tests run and results;
- lockfile checksum before/after;
- confirmation the surface renders three lanes;
- confirmation no root My Project Files exposure;
- confirmation no other-project folder exposure;
- confirmation no live Graph/PnP/SharePoint REST runtime;
- confirmation no external writeback/sync/mirror;
- confirmation no SPFx packaging/deployment;
- recommended next prompt: `04_Prompt_Permission_Action_Rendering.md`.

## Suggested Commit Summary

```text
feat(pcc): render document control three-lane shell
```

## Suggested Commit Description

```text
Updates the PCC Documents surface to render the Wave 7 HB Document Control Center three-lane shell from the document-control read model: Project Record, My Project Files, and External Systems.

Preserves read-only/preview posture and legacy compatibility. No live file operations, Graph/PnP/SharePoint REST calls, external system writeback, runtime launch behavior, package changes, lockfile changes, SPFx packaging, or deployment changes are introduced.
```
