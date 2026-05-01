# Repo-Truth Basis and Known Constraints

Generated: 2026-05-01

This package is based on the current chat session, uploaded workbook source templates, prior repo-truth observations, and web research available during the session.

## Current Repo Truth Observed in Session

- Repository: `RMF112018/hb-intel`
- Default branch observed via GitHub connector: `main`.
- Current Phase 3 roadmap and module implementation docs still primarily identify Wave 10 as `Permit Log`.
- Existing PCC workflow module registry already includes both:
  - `permits`
  - `required-inspections`
- Existing Wave 8 documentation defines `Project Readiness Module Framework` as the shared framework used by Waves 9-14.
- Existing PCC personas include the required operating roles for permit and inspection workflows, including:
  - PCC Admin
  - IT / Tenant Admin
  - Executive Oversight
  - Project Executive
  - Project Manager
  - Superintendent
  - Project Accounting
  - Project Team Member
  - Project Viewer
  - Safety / QAQC
  - Manager of Operational Excellence
  - Estimating Coordinator
  - Estimator
  - Lead Estimator
  - Chief Estimator
  - Director of Preconstruction
  - Project Coordinator
  - external/deferred personas
- Existing PCC read-model contract observed in session did not yet include a dedicated permit/inspection read model.
- Existing backend PCC read-model routes observed in session are GET-only read-model routes and do not yet include a dedicated permit/inspection endpoint.

## Required Interpretation

Wave 10 should be updated from a narrow `Permit Log` to a combined flagship surface:

**Permit & Inspection Control Center**

The existing `permits` and `required-inspections` module IDs should be preserved as internal record/module families or source families, while the user-facing Wave 10 surface should be unified.

## Non-Negotiable Boundary

There must be no runtime interaction with AHJ websites or outside permitting systems in this wave beyond explicit launcher links.

Forbidden unless a later approved phase authorizes it:

- AHJ scraping
- AHJ API integration
- permit application submission
- inspection scheduling through AHJ systems
- automated AHJ status lookup
- external credential storage
- external writeback
- browser/bot automation
- hidden integration with permitting portals
- Procore runtime integration
- Microsoft Graph / SharePoint mutation caused by this documentation update
- Adobe / Document Crunch / Compass / Sage runtime integration
