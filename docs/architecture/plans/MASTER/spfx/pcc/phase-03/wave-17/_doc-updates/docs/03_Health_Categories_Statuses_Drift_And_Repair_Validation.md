# 03 — Health Categories, Statuses, Drift, and Repair Validation

## Health Categories

Use this controlled category registry:

- `provisioning`
- `template-compliance`
- `site-metadata`
- `library-compliance`
- `list-schema-compliance`
- `permission-posture`
- `team-access-alignment`
- `settings-health`
- `external-system-source-health`
- `document-control-posture`
- `project-readiness-dependency`
- `priority-action-dependency`
- `integration-source-availability`
- `audit-evidence`
- `security-redaction`
- `hbi-grounding`
- `admin-verification`
- `repair-readiness`

## Severity Registry

| Severity | Meaning | Priority Action Eligible |
|---|---|---|
| `info` | Informational signal with no action required | No |
| `notice` | Low-risk signal that may be useful for admin review | No |
| `warning` | Operational issue or drift that should be reviewed | Yes, when persistent |
| `high` | Meaningful project-site readiness or governance risk | Yes |
| `critical` | Major blocker to project-site operation, access posture, or governance | Yes |
| `blocked` | Site Health cannot assess due to missing source, authorization, or required dependency | Yes, when visible to authorized persona |

## Status Registry

- `healthy`
- `attention-required`
- `degraded`
- `drift-detected`
- `missing-config`
- `missing-object`
- `schema-mismatch`
- `permission-mismatch`
- `source-unavailable`
- `backend-unavailable`
- `stale`
- `pending-review`
- `admin-verification-required`
- `repair-ready`
- `repair-requested`
- `repair-blocked`
- `suppressed`
- `resolved`
- `unauthorized`
- `forbidden`
- `fixture-only`

## Repair / Action Mode Registry

- `read-only`
- `view-evidence`
- `request-review`
- `request-repair`
- `approval-required`
- `admin-verification-required`
- `future-command-gated`
- `manual-external-action-required`
- `blocked-by-policy`
- `blocked-by-role`
- `not-applicable`

## Drift Classification Rules

| Difference | Classification | Default Status | Default Severity |
|---|---|---|---|
| Required list missing | `missing-object` | `missing-object` | `high` |
| Required library missing | `missing-object` | `missing-object` | `critical` |
| Required field missing | `schema-mismatch` | `schema-mismatch` | `high` |
| Field type differs | `schema-mismatch` | `schema-mismatch` | `high` |
| Required indexed column missing | `schema-mismatch` | `attention-required` | `warning` |
| Required view missing | `schema-mismatch` | `attention-required` | `warning` |
| Permission inheritance unexpectedly broken | `permission-mismatch` | `permission-mismatch` | `critical` |
| Extra unique item/folder permissions exceed policy | `permission-mismatch` | `attention-required` | `high` |
| Team role not mapped to SharePoint access | `team-access-alignment` | `attention-required` | `high` |
| Settings validation failure | `settings-health` | `degraded` | `high` |
| External source unavailable | `external-system-source-health` | `source-unavailable` | `warning` |
| Last successful read exceeds stale threshold | `integration-source-availability` | `stale` | `warning` |
| HBI lacks sufficient evidence | `hbi-grounding` | `blocked` | `notice` |

## Desired-State Versus Observed-State Algorithm

1. Load desired-state records from Standard Project Site Template Contract, project-site-template schemas, Wave 16 settings definitions, and HB Central project metadata.
2. Load observed-state records from read-only source snapshots and existing fixtures.
3. Normalize object keys to stable internal identifiers.
4. Compare required object families in this order:
   - site metadata;
   - lists;
   - libraries;
   - fields;
   - views;
   - indexes;
   - permission posture;
   - team/access alignment;
   - settings health;
   - external source health.
5. Classify each difference using the drift classification table.
6. Attach evidence references for every finding.
7. Apply persona redaction.
8. Generate Priority Action candidates for eligible unresolved findings.
9. Generate Wave 14 checkpoint candidates for repair-request or exception workflows.
10. Return read-model envelope with source status, warnings, and no command execution.

## Stale and Unavailable Source Rules

| Condition | Status | Display Behavior |
|---|---|---|
| Backend route unavailable | `backend-unavailable` | Show degraded banner, disable repair/request actions |
| Source system unavailable | `source-unavailable` | Show source-specific warning and last successful read |
| Last successful read older than threshold | `stale` | Show stale chip and evidence timestamp |
| Viewer lacks permission | `forbidden` | Show redacted summary and disabled reasons |
| User not authenticated | `unauthorized` | Show access state and no finding details |
| Fixture mode | `fixture-only` | Clearly label fixture/demo source |

## Lifecycle State Machine

Allowed transitions:

```text
healthy -> attention-required
attention-required -> pending-review
attention-required -> admin-verification-required
degraded -> pending-review
drift-detected -> admin-verification-required
missing-object -> admin-verification-required
schema-mismatch -> admin-verification-required
permission-mismatch -> admin-verification-required
admin-verification-required -> repair-ready
repair-ready -> repair-requested
repair-requested -> pending-review
pending-review -> resolved
pending-review -> suppressed
suppressed -> attention-required
resolved -> attention-required
```

Blocked transitions:

```text
permission-mismatch -> automatic-repair
schema-mismatch -> tenant-schema-mutation
missing-object -> tenant-object-create
settings-health -> settings-writeback
external-system-source-health -> external-system-writeback
repair-ready -> executed-repair
```

## Repair Eligibility

A finding is repair-request eligible only when:

- evidence confidence is `high` or `medium`;
- finding is not redacted for the actor;
- actor persona is allowed to request review or repair;
- admin verification has enough evidence;
- Wave 14 checkpoint routing is available;
- action remains future-command-gated and does not execute repair.

Repair eligibility does not imply repair execution.
