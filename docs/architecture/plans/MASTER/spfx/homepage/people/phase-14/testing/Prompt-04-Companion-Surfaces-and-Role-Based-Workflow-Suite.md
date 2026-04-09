# Prompt 04 — Companion Surfaces and Role-Based Workflow Suite

## Objective

Build comprehensive coverage for the companion/admin workflow layers and role-aware behavior across the refactored People & Culture and HB Kudos surfaces.

## Coverage targets

At minimum, cover where repo/schema/runtime truth supports them:
- editor vs approver/admin role behavior
- approvals inbox behavior
- claim / reassign workflow
- homepage-governance workflow
- milestone review workflow
- limited intake workflow
- notification-driving state changes where assertable
- moderation/publish audit traceability where assertable

## Your tasks

1. Identify the actual role-aware seams present at local HEAD.
2. Build focused companion/work-management test modules.
3. Avoid claiming UI-heavy coverage unless it is actually asserted via stable seams.
4. Document workflows that still require human/manual validation.

## Required outputs

1. Companion/role-aware suite modules under the chosen suite structure
2. `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/companion-role-based-comprehensive-test-matrix.md`
3. `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/companion-role-based-test-notes.md`

The notes must explicitly separate:
- automated API/list/assertion coverage
- smoke-only coverage
- manual validation still required
