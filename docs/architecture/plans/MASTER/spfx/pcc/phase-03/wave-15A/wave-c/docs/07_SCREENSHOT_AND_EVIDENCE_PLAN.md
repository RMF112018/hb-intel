# 07 — Screenshot and Evidence Plan

## Objective

Provide evidence-backed closure for Wave C without claiming final `56/56`.

## Screenshot matrix

Capture every current routed surface:

1. Project Home
2. Team & Access
3. Documents
4. Project Readiness
5. Approvals
6. External Systems
7. Control Center Settings
8. Site Health

Capture each in these modes:

| Mode | Required? | Notes |
|---|---:|---|
| Desktop wide | Yes | Full command-center posture. |
| SharePoint constrained simulated | Yes | Primary host-fit proof before tenant. |
| Tablet | Yes | Validate rail/header/context fit. |
| Narrow / phone | Yes where harness allows | Prior Prompt 03 deferred non-home narrow captures; close this gap where practical. |
| Tenant-hosted SharePoint | Deferred | Required for final validation wave, not necessarily Wave C unless environment is available. |

## Required image naming convention

Use:

```text
wave-c-<surface-id>-<viewport>-after.png
```

Examples:

```text
wave-c-project-home-desktop-wide-after.png
wave-c-documents-sharepoint-constrained-after.png
wave-c-approvals-tablet-after.png
wave-c-site-health-narrow-after.png
```

## Evidence path

Recommended path for local execution:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/prompt-03/evidence/screenshots/after/
```

If this standalone Wave C package is used as a new prompt sequence, use:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-C/evidence/screenshots/after/
```

The agent must document the actual path used.

## What screenshots must prove

Each screenshot must visibly show:

- app/shell header;
- selected surface;
- project identity in shell or surface context;
- surface context header;
- posture/source/freshness context;
- next action or limitation where applicable;
- no duplicate/competing header hierarchy;
- no horizontal overflow;
- no card-title collision with surface context.

## Non-screenshot evidence

Required closeout evidence:

- file map before changes;
- exact files changed;
- test/validation command outputs;
- scorecard impact notes;
- residual risks;
- tenant evidence status;
- accessibility/keyboard status;
- local branch/commit if available.

## Evidence limitations

The agent must not claim final host-fit or `56/56` readiness unless:

- tenant-hosted SharePoint screenshots exist;
- keyboard path is manually or automatically validated;
- accessibility hard stops are cleared;
- final scorecard has been completed across all categories;
- Wave 15A final validation prompt confirms closure.
