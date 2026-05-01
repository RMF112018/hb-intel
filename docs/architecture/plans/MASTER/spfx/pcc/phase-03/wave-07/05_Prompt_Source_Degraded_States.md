# 05 — Prompt: Source State / Degraded-State Rendering

## Role

You are a local code agent working in:

```text
/Users/bobbyfetting/hb-intel
```

You are implementing the source-state behavior slice for **Project Control Center Phase 3 / Wave 7 — HB Document Control Center**.

## Objective

Implement safe, user-facing source-state and degraded-state rendering for the HB Document Control Center.

This is UI/read-model rendering only. It must not perform live source health checks, repairs, Graph calls, folder creation, or external API calls.

## Preconditions

Complete before starting this prompt:

1. `03A_Prompt_SPFX_Document_Control_Read_Model_Parity.md`
2. `03B_Prompt_SPFX_Three_Lane_UI.md`
3. `04_Prompt_Permission_Action_Rendering.md`

## Mandatory Preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -10
md5 pnpm-lock.yaml
```

Protect unrelated working-tree changes.

Do not re-read files that are still within current context or memory.

## Files to Inspect

```text
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
packages/models/src/pcc/DocumentControl.ts
packages/models/src/pcc/PccReadModels.ts
```

## Files You May Modify

```text
apps/project-control-center/src/surfaces/documents/**
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
```

Only modify fixture data if needed to provide deterministic test coverage for missing/degraded states.

## Required States

Render safe UI handling for these states where represented by read-model data:

- `missing-config`
- `access-issue`
- `source-unavailable`
- `throttled`
- `partial-results`
- `pending-initialization`
- `folder-creation-failed`
- `disabled`
- empty state / no source configured

If the current source-health enum differs, map current enum values to user-safe labels without inventing runtime behavior.

## Required User-Safe Messaging

Messages must be clear, non-technical, and non-leaking.

Examples:

```text
This source is not configured for the current project.
```

```text
You may not have access to this source. Request access or ask a PCC administrator to review the mapping.
```

```text
This source is temporarily unavailable. Try again later or ask an administrator to review source health.
```

```text
Microsoft 365 temporarily limited the request. No live retry is active in this preview.
```

Do not expose:

- raw Graph errors;
- access tokens;
- tenant IDs unless intentionally safe fixture IDs;
- stack traces;
- SDK exception names;
- external API responses.

## Required Behavior by Lane

### Project Record

- Missing SharePoint binding should show missing configuration.
- Access issue should show a safe access/mapping message.
- Throttled/unavailable should show safe degraded state.
- No live repair or revalidation button.

### My Project Files

- Pending initialization should show a safe not-yet-initialized message.
- Folder creation failed should show a safe support/admin message.
- Never show root folder browsing.
- Never show other-project folders.
- No live OneDrive folder creation.

### External Systems

- Missing config should show mapping required.
- Access issue should show request access/mapping correction cue.
- Disabled should show intentionally disabled/not used for project.
- Launch remains preview/non-executable.

## Required Tests

Tests must prove:

1. each required state renders a safe label/message where fixture data includes it;
2. raw Graph/API error text is not rendered;
3. missing-config does not trigger source discovery;
4. access-issue does not render live repair or launch behavior;
5. throttled/partial-results render safely;
6. pending-initialization/folder-creation-failed for My Project Files render safely;
7. disabled external source renders safely;
8. no executable action handlers introduced;
9. no live `href` links introduced;
10. root My Project Files and other-project folders remain absent.

## Forbidden Changes

Do not:

- call Microsoft Graph;
- call SharePoint REST or PnP;
- call Procore;
- call Adobe Sign;
- call Document Crunch;
- implement live source repair;
- implement live folder creation;
- implement runtime source health check;
- add dependencies;
- change lockfile;
- package/deploy SPFx;
- mutate tenant/external systems;
- edit `docs/architecture/plans/**`.

## Validation Commands

```bash
pnpm --filter @hbc/spfx-project-control-center test -- PccDocumentsSurface
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
md5 pnpm-lock.yaml
```

## Closeout Requirements

Include:

- files changed;
- tests run and results;
- lockfile checksum before/after;
- states implemented;
- confirmation no raw API/Graph errors leak;
- confirmation no live source repair/revalidation/folder creation;
- confirmation no live integrations;
- recommended next prompt: `06_Prompt_Reviews_Approvals_Summary.md`.

## Suggested Commit Summary

```text
feat(pcc): add document control source state rendering
```

## Suggested Commit Description

```text
Adds safe HB Document Control Center source-state and degraded-state rendering for Project Record, My Project Files, and External Systems using read-model data.

No live source checks, repairs, Graph/PnP/SharePoint REST calls, folder creation, external system runtime, package changes, lockfile changes, SPFx packaging, or deployment behavior is introduced.
```
