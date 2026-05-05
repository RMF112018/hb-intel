# 06 — State Model and Content Language Standard

## 1. Purpose

This file defines the required state and product language model for Wave 15A. The current preview/read-only/unavailable language must be remediated because it is too developer-facing and makes surfaces feel unfinished.

## 2. Content Principle

Every state message must tell the user:

1. What is available.
2. What is not available.
3. Why.
4. What the user can do next.
5. Who owns resolution, when applicable.

## 3. Forbidden Primary User-Facing Language

The following terms should not appear as primary surface content unless they are inside a diagnostics drawer, admin-only panel, or implementation closeout:

- Fixture-driven
- Wave 2
- Wave 15A internal build
- No live data
- Read-model summary only
- Preview content not available
- No fixture content available
- Mock-only
- Route coverage
- Shell frame
- Implementation placeholder

## 4. Approved User-Facing Replacements

| Avoid | Use Instead |
|---|---|
| Fixture-driven | Sample project data |
| No live data | Sample data mode |
| Preview content not available | This source is not connected in the selected preview. |
| Read-model summary only | Read-only project summary |
| No workflow execution enabled | Actions are disabled in this preview. |
| Mock-only | Preview demonstration |
| Unavailable | Setup required / source unavailable / not connected |
| Wave 2 | Preview build status, diagnostics only |

## 5. Required State Taxonomy

### Live

Use when data is connected and actions are available.

Required message:

```text
Live project data is available. Actions are enabled for your role.
```

### Preview

Use when fixture/sample data demonstrates intended workflow.

Required message:

```text
This preview demonstrates the intended workflow using sample project data. Live updates are not being made.
```

### Read-Only

Use when real or sample data is visible but execution is disabled.

Required message:

```text
You can review this information. Updates are disabled in this preview.
```

### Unavailable

Use when a source is not available in the selected context.

Required message:

```text
This source is not connected in the selected preview context.
```

### Setup Required

Use when configuration is missing.

Required message:

```text
Configuration is required before this control can be activated.
```

### Degraded

Use when data exists but confidence is reduced.

Required message:

```text
Data is available, but source confidence is reduced. Review the listed warning before relying on this result.
```

### Blocked

Use when workflow cannot proceed.

Required message:

```text
This process is blocked until the listed issue is resolved.
```

### Error

Use when the app or source failed unexpectedly.

Required message:

```text
This information could not be loaded. Retry or contact the listed owner if the issue continues.
```

### Empty

Use when there are no records, not when content is missing.

Required message:

```text
No items match this view.
```

## 6. State Component Fields

Every reusable state component should support:

- `stateKind`
- `severity`
- `title`
- `summary`
- `whatIsAvailable`
- `whatIsDisabled`
- `why`
- `nextAction`
- `owner`
- `source`
- `lastUpdated`
- `diagnosticDetail`
- `actions`

## 7. Disabled Control Standard

A disabled control must be paired with one of:

- adjacent explanatory text,
- tooltip or help text,
- read-only alternative action,
- visible preview banner explaining disabled execution.

Bad:

```text
[Approve disabled]
```

Good:

```text
Approve
Disabled in this preview. Open the approval package to review the decision context.
```

## 8. Surface-Level State Rules

### Project Home

Preview state should be secondary. The user should primarily see project health and priority actions.

### Team & Access

If invites are disabled, show current roster, role coverage, and pending-request preview.

### Documents

If Browse/Open actions are disabled, show source binding health and explain activation requirements.

### Project Readiness

Blocked/degraded states must appear as operational posture, not generic banners.

### Approvals

No approval surface may be dominated by unavailable content. Show a preview-safe approval queue.

### External Systems

Unavailable integrations must still show purpose, owner, expected data direction, and activation state.

### Settings

Settings must distinguish locked, preview-only, missing, and editable.

### Site Health

Security-risk and repair states must be visually prominent and action-oriented.

## 9. Diagnostics Placement

Developer/build metadata belongs in:

- admin diagnostics drawer,
- footer diagnostics,
- query-enabled debug mode,
- test output,
- closeout documentation.

It should not be the primary user-facing product message.

## 10. Acceptance Criteria

- No primary surface shows generic placeholder content as the main experience.
- Every preview/read-only state explains operational consequence.
- Disabled actions are understandable.
- State language is consistent across surfaces.
- Diagnostic language is separated from user-facing product language.
