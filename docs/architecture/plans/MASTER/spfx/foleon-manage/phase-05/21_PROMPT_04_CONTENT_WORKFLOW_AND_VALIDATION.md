# Prompt 04 — Homepage Content Workflow and Validation

You are working in the `RMF112018/hb-intel` repo on the live `main` branch unless instructed otherwise.

Do not re-read files that are still within your current context or memory unless you need to verify a contradiction, line number, or current repo truth.

## Objective

Implement or complete lane-specific Foleon content workflows in the Manager after the registry-first foundation and two-tab shell are in place.

Supported homepage lanes:

```text
Project Spotlight
Company Pulse
Leadership Message
```

## Required Scope

Add workflows for create/edit content, reader lane assignment, homepage slot assignment, active edition management, display dates, archive group, cadence, primary audience, production URL validation, embed eligibility, open mode, publish/suppress content, placement alignment, preview/live/blocked/empty state, and sync status.

## Validation Rules

Do not allow a record to become live unless required checks pass:

```text
published URL present when required
embed URL present when inline reader is required
origin allowlisted
preview URL not promoted to production when preview disallowed
publish status valid
is visible true
homepage eligible true
active edition conflict check passes
reader lane assigned
homepage slot assigned
required display dates valid
```

## Active Edition Rules

Detect and warn/block duplicate active records for:

```text
ReaderKey + HomepageSlot + ActiveEdition + IsHomepageEligible + PublishStatus + display window overlap
```

## UI Requirements

- Make active content obvious per lane.
- Show why a lane will render live, preview, blocked, or empty.
- Provide a publish readiness checklist.
- Use plain language for marketing users.
- Keep admin diagnostics available but not dominant.

## Backend / Data Requirements

Use existing backend routes where possible:

```text
/foleon/content
/foleon/content/{id}
/foleon/content/{id}/validate
/foleon/content/{id}/publish
/foleon/content/{id}/suppress
/foleon/placements
/foleon/placements/{id}
/foleon/sync/status
/foleon/sync/runs
```

Do not create new routes unless repo truth proves an existing route cannot support the workflow.

## Testing Requirements

Add or update tests for lane-specific filtering, active edition conflict detection, preview URL blocked for production, origin allowlist enforcement, publish readiness checklist, placement validation, and marketing-safe status messages.

## Validation Commands

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

## Final Response Required From Agent

Return:

```text
Summary:
Changed Files:
Lane Workflows Implemented:
Validation Rules Implemented:
Tests Added:
Commands Run:
Validation Results:
Manual Tenant Validation Needed:
Commit Message:
```
