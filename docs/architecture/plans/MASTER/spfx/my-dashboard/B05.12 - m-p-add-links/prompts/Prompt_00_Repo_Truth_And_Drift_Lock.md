# Prompt 00 — Repo Truth and Drift Lock

## Objective
Conduct an exhaustive repo-truth audit before implementing the My Projects Custom Links Registry. Do not edit files in this prompt.

## Mandatory rules
1. Do not re-read files that remain in current context unless exact lines are needed or repo state changed.
2. Work from the local working tree, not stale plan docs.
3. Do not code yet.
4. Produce a final drift-aware implementation map for Prompts 01–07.

## Required audits
Inspect current repo seams for:

### Models
- `packages/models/src/myWork/MyProjectLinksReadModel.ts`
- model barrel exports
- fixtures relevant to project links

### Backend provider
- `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts`
- current Graph list client usage
- current route registration patterns for My Work and Adobe Sign action routes

### Frontend
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `ProjectPortfolioTile.tsx`
- `ProjectLaunchActions.tsx`
- client interfaces:
  - `myWorkReadModelClient.ts`
  - `myWorkBackendReadModelClient.ts`
  - fixture client
  - factory

### Provisioning
- current list-descriptor patterns
- current provisioning-service seams
- any existing operator scripts suited to a new list

## Required answers
1. What exact files will need changes?
2. What route registration seam should be used?
3. What provisioning mechanism is safest for a new list?
4. Does the current Graph client already support add/update needed for writes?
5. What exact frontend data refresh strategy matches current My Projects ownership?

## Output format
Return:

# Prompt 00 Closeout — Repo Truth and Drift Lock

## 1. Executive Verdict
## 2. Confirmed Current Repo Truth
## 3. Drift or Contradictions
## 4. Final File Impact Matrix
## 5. Final Implementation Sequence
## 6. Risk Gates
## 7. GO / NO-GO
