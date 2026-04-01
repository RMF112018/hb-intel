# Prompt 6 — Phase 7 Managed Identity, CORS, and Connected-Service Posture

## Title
Phase 7 — Tighten managed identity abstractions, connected-service posture, and operational CORS/config documentation

## Objective
Refine the connected-service layer so that managed identity abstractions are accurate, connected-service gates are properly scoped, and CORS / Azure / SharePoint operational requirements are clearly documented and consistent with repo truth.

## Critical instructions
- Keep this prompt focused on service posture and operational correctness, not broad feature expansion.
- Separate true code/runtime issues from external deployment prerequisites.
- Prefer precise service abstractions over misleading generic wrappers.
- Document where Azure resource configuration, rather than repo code, is the source of truth.

## Required work
1. Review managed identity service abstractions and identify any misleading “generic token acquisition” behavior that is actually SharePoint-specific.
2. Refactor service code or naming where needed so repo truth accurately reflects what each service does.
3. Review Graph-service permission gates and ensure they are scoped to the operations that truly require them.
4. Reconcile connected-service docs and config examples, especially where samples still imply outdated secrets or obsolete settings.
5. Review CORS-related repo truth and update docs so they clearly distinguish:
   - what is configured in repo/runtime code,
   - what must be configured at the Azure Function App / App Service level,
   - and what origins/credential behavior are required for the Project Setup production surface.
6. Update setup docs and operational guidance where needed.
7. Add or update targeted tests for any refactored service behavior that is feasible to validate in repo truth.
8. Update the cumulative Phase 7 report.

## Deliverables
- Refined managed identity / service abstractions.
- Updated config samples and operational docs.
- Clear CORS / connected-service posture documentation.
- Updated cumulative report.

## Required report content for this prompt
Add a section named:
`Prompt 6 completion notes`

Include:
- managed identity/service changes,
- config/doc corrections,
- CORS posture clarifications,
- any remaining external Azure/SharePoint setup dependencies,
- and evidence of issues retired.

## Acceptance criteria
- Service abstractions no longer materially misrepresent what they do.
- Repo docs clearly separate code truth from Azure resource configuration truth.
- Config samples are aligned with the current implementation.
- The Project Setup solution’s connected-service posture is clearer and safer.
