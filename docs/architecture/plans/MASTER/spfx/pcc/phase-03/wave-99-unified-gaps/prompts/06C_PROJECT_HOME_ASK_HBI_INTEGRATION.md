# Prompt 06C — Project Home Ask-HBI Preview Integration

## Objective

Integrate the Ask-HBI / unified project search grounding preview into the existing Project Home read-model-driven path as one compact card.

This prompt must not create a standalone search workspace, shell route, or department-specific area. Ask-HBI belongs inside the existing PCC project operating layer.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompt 06B has completed.

Expected available seams:

- `useUnifiedSearchReadModel` or equivalent hook/controller.
- `AskHbiGroundingPreviewPanel` or equivalent panel component.
- Existing Project Home read-model path from Prompt 05B.
- Existing Project Home fixture-only path remains 10-card baseline unless intentionally changed and tested.

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify uncommitted files as user-owned, agent-owned, or unknown.

## Files to Inspect

Inspect current Project Home integration only:

- `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx`
- `apps/project-control-center/src/surfaces/projectHome/projectHomeViewModel.ts`
- `apps/project-control-center/src/surfaces/projectHome/PccProjectHomeUnifiedLifecycleSection.tsx`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/components/AskHbiGroundingPreviewPanel.tsx`
- `apps/project-control-center/src/tests/PccProjectHome.test.tsx`
- `apps/project-control-center/src/tests/PccApp.optIn.test.tsx`

## Required Work

Add one compact Ask-HBI card to the Project Home read-model-driven path.

Recommended approach:

- create `PccProjectHomeAskHbiSection.tsx` or add a bounded card to the existing Project Home unified lifecycle section if that is cleaner;
- use `PccDashboardCard`;
- render `AskHbiGroundingPreviewPanel` inside the card;
- pass the same read-model client and project ID;
- keep loading/error state localized to this card;
- do not block or gate existing Project Home cards;
- do not add to fixture-only fallback path unless intentionally revised and tested.

Recommended card title:

```text
Ask HBI — Grounded Project Answers
```

Recommended footprint:

```text
wide
```

If layout is too crowded, use `standard` and document the decision.

## Client Interface

If Project Home narrow client interface needs `getUnifiedSearch`, add it as an inline method, similar to `getUnifiedLifecycle`.

Do not import or reference the full `IPccReadModelClient` in non-api surface files if that violates dormancy/source guards.

## Card Count

Project Home read-model-driven path currently has 14 cards after Prompt 05B.

After this prompt:

- fixture-only path should remain 10 cards;
- read-model-driven Project Home should become 15 cards if one new Ask-HBI card is added.

Update tests explicitly and only where needed.

## Tests

Add/update tests proving:

1. fixture-only Project Home still renders original 10 cards and no Ask-HBI card;
2. read-model-driven Project Home renders 15 cards including Ask-HBI card;
3. Ask-HBI card renders project-scoped / HBI-not-source-truth copy;
4. Ask-HBI card renders grounded result with citations/source chips from fixtures;
5. refusal/insufficient evidence state can render through fixture or local test stub;
6. no separate route/workspace marker is introduced:
   - no `data-pcc-surface-id="unified-search"`;
   - no `data-pcc-surface-id="ask-hbi"`;
   - no `data-pcc-active-surface-panel="unified-search"`;
   - no `data-pcc-active-surface-panel="ask-hbi"`;
7. no live external URL anchors are added;
8. existing 14 Project Home cards still render;
9. `useProjectHomeReadModel` does not call `getUnifiedSearch`; the new card/panel consumes it separately.

Update `PccApp.optIn.test.tsx` only if backend-mode Project Home now makes an additional `unified-search` request. If updated, document it as a mechanical downstream test update, similar to Prompt 05B.

## Explicit Non-Goals

Do not modify:

- Project Readiness.
- Shell/router/mount source.
- API client files.
- backend.
- models.
- package files.
- lockfile.
- docs.
- manifests.

Do not create:

- standalone search/HBI route;
- search workspace;
- live LLM/vector/search integration;
- external writes.

## Validation

Run and report:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
md5 pnpm-lock.yaml
```

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Project Home files changed.
4. Ask-HBI card integration summary.
5. Tests added/updated.
6. Validation results.
7. Lockfile MD5 before/after.
8. Remaining gaps for Prompt 06D.
9. Commit hash if committed.
10. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 06C-owned files. Do not push unless explicitly instructed.

Recommended commit message:

```text
feat(spfx-pcc): integrate ask-hbi preview into project home
```
