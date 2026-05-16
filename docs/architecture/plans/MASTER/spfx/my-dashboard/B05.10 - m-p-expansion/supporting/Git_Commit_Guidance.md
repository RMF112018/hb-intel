# Git Commit Guidance

## Recommended commit title

```text
my-dashboard(my-projects): add multi-platform launch schema and read model
```

## Recommended full commit description

```text
Expand My Dashboard My Projects from SharePoint + Procore dual-launch
semantics into a multi-platform assigned-project launch contract spanning
SharePoint, Procore, Autodesk BuildingConnected, and Document Crunch.

- Extend the My Projects source-list schema descriptor, readiness checks,
  and provisioning flow for BuildingConnected and Document Crunch link
  columns plus Registry-side project stage continuity.
- Preserve the existing Projects project-stage source through field_6 and
  avoid introducing a duplicate Projects projectStage column.
- Expand the My Project Links read model with BuildingConnected and
  Document Crunch launch actions, warnings, readiness counts, and an
  all-platform readiness summary while retaining backward-compatible
  dualLaunchReadyCount semantics.
- Update the backend project-links provider to read, normalize, and emit
  the new link actions, apply locked stage/link source precedence, and
  maintain existing diagnostics and source-of-record boundaries.
- Extend the My Projects launch-menu UX to four platform options, update
  module copy, and consolidate unavailable-destination messaging.
- Refresh fixtures, provider/UI tests, schema/operator docs, and final
  validation coverage for the new multi-platform posture.
```
