# Prompt 03 — Backend Repository, Entitlement, and Command Routes

## Objective
Implement the backend custom-link repository/service, entitlement validation, and authenticated command routes.

## Required implementation
- Add Graph-backed custom-links repository.
- Add validation helpers:
  - title,
  - URL,
  - visibility,
  - parent project identity.
- Add entitlement helper using the same My Projects assignment truth.
- Add create/update/delete command service.
- Add routes:
  - POST create
  - PATCH update
  - DELETE soft delete
- Add route/service tests.

## Mandatory rules
1. No direct trust of client project IDs.
2. Create revalidates actor entitlement to the project.
3. Update/delete require creator ownership.
4. Soft delete only.
5. No raw PII/token logging.
6. Do not yet alter My Projects read-model provider to attach links; that is Prompt 04.

## Output format
Return:

# Prompt 03 Closeout — Repository, Entitlement, and Command Routes
## 1. Executive Verdict
## 2. Routes Implemented
## 3. Entitlement and Ownership Enforcement
## 4. Files Changed
## 5. Test Results
## 6. Remaining Work for Prompt 04
