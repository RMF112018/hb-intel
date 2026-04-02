# 08 — Hosted Staging Validation Checklist

**Status:** Ready for execution (repo-side complete; hosted validation pending)
**Full memo:** [accounting-hosted-staging-validation-and-tenant-approval-readiness.md](../../../../reviews/accounting-hosted-staging-validation-and-tenant-approval-readiness.md)

## Proof Tier Summary

| Tier | Category | Items | Status |
|------|----------|-------|--------|
| Repo | Packaging, contract, permissions, injection, dependencies, continuity, artifact | P11-01 through P11-07 | **Complete** |
| Hosted | App catalog, API approval, token, connectivity, CORS, smoke | H1–H23 | **Pending** |
| External | App registration, admin approval, Function App, CI/CD | E1–E9 | **Pending** |

## Hosted Validation Quick Reference

| # | Step | Owner |
|---|------|-------|
| H1–H3 | App catalog deploy + trust | SharePoint Admin |
| H4–H6 | API access approval | SharePoint Admin |
| H7–H9 | Token acquisition validation | Developer + Admin |
| H10–H11 | Function App URL resolution | Developer |
| H12–H14 | Backend route connectivity | Developer |
| H15–H16 | CORS verification | DevOps + Developer |
| H17 | `/api/users/me/*` isolation confirmation | Developer |
| H18–H23 | Smoke workflow (render, queue, detail, action, complexity, navigation) | Developer |

## Critical Blockers (must resolve first)

| # | Prerequisite | Owner |
|---|-------------|-------|
| E1 | App registration `hb-intel-api-production` in Entra ID | IT / Identity |
| E5 | SharePoint admin API access approval | SharePoint Admin |
| E6 | Function App deployed with `API_AUDIENCE` + `AZURE_TENANT_ID` | DevOps |
| E8 | CI/CD builds `.sppkg` with `FUNCTION_APP_URL` + `API_AUDIENCE` | DevOps |

## What Later Prompts Can Assume

1. All repo-side evidence is complete — no further repo work needed for hosted validation.
2. The 23-item hosted checklist and 9-item prerequisite register are ready for execution.
3. Hosted validation cannot proceed until at minimum E1, E5, E6, and E8 are resolved.
4. The final Phase 11 closure (P11-09) should collect hosted evidence or document its absence.
