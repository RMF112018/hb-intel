# Prompt-07 — App Catalog and API Posture Validation Lane

## Objective

Add the package / API posture validation surfaces and backend support needed to make SharePoint rollout dependencies visible inside the SharePoint control lane.

## Important execution rules

- Keep this phase focused on visibility, validation, and constrained remediation support tied to HB Intel rollout needs.
- Do not drift into every possible tenant-wide app or permission management scenario.
- Reuse existing deployment / provisioning knowledge where possible.

## Inputs

Use:
- the Phase 8 audit
- provisioning and SharePoint adapter foundations
- any existing package posture or API-access helpers already in repo

## Scope of work

Implement or harden the smallest correct support for:
- app catalog presence / readiness visibility
- HB Intel package posture visibility
- API access posture visibility relevant to rollout / runtime health
- compatibility with preview / repair flows when remediation is in-scope

## Expected behavior

At minimum support:
- identifying missing or unhealthy posture relevant to HB Intel rollout
- producing normalized operator-readable findings
- distinguishing advisory findings from actionable in-scope repair / apply findings
- avoiding unsupported broad tenant-side mutation

## Documentation output

Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-8/admin-spfx-phase-8-package-and-api-posture.md`

Include:
1. posture categories covered
2. in-scope vs advisory-only cases
3. data collection path(s)
4. output shape / severity model
5. current constraints

## Validation

Run the smallest targeted validation needed to prove:
- posture checks work for the supported categories,
- findings can be surfaced in the admin console,
- and in-scope remediation linkage is explicit and bounded.

## Completion condition

Stop after the posture-validation lane is complete and documented.
