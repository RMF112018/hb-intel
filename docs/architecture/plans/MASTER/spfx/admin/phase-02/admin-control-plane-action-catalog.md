# Admin Control Plane — Action Catalog, Risk Levels, and Execution Modes

## Purpose

This is the canonical admin action vocabulary for the IT Control Center. It defines the domains, action identifiers, risk levels, and execution modes that all later phases use when implementing backend APIs, adapter logic, operator-console workflows, and audit records.

The shared type surface lives in `@hbc/models/admin-control-plane`. This document is the human-readable reference.

## Admin domains

8 domains, aligned with the [Phase 1 domain taxonomy](../phase-01/admin-spfx-domain-taxonomy.md):

| Domain key | Label | Description |
|------------|-------|-------------|
| `setup-install` | Setup / Install | Backend install, bootstrap, and environment setup |
| `validation-readiness` | Validation / Readiness | Environment readiness checks and dependency validation |
| `provisioning-rollout` | Provisioning / Rollout | Site provisioning and rollout execution |
| `sharepoint-control` | SharePoint Control | HB Intel-managed SharePoint asset control |
| `entra-control` | Entra Control | Entra ID user/group administration |
| `standards-config` | Standards / Config | Standards and configuration governance |
| `health-observability` | Health / Observability | Health monitoring, alerts, and infrastructure probes |
| `repair-recovery` | Repair / Recovery | Repair, recovery, and remediation actions |

**Typed as**: `AdminDomain` enum in `@hbc/models`.

## Action identifier format

Actions use a scoped triple: **`domain:family:verb`**

- **domain**: one of the 8 `AdminDomain` values
- **family**: a noun grouping within the domain (e.g., `saga`, `group`, `site`, `config`)
- **verb**: the specific operation (e.g., `launch`, `create`, `detect`, `apply`)

**Typed as**: `AdminActionKey` template literal type in `@hbc/models`.

### Examples

| Action key | Meaning |
|------------|---------|
| `provisioning-rollout:saga:launch` | Launch a provisioning saga run |
| `provisioning-rollout:saga:retry` | Retry a failed provisioning run |
| `entra-control:group:create` | Create an Entra security group |
| `entra-control:user:modify` | Modify an Entra user |
| `sharepoint-control:site:repair` | Repair a SharePoint site to standard |
| `sharepoint-control:drift:detect` | Detect drift on managed sites |
| `standards-config:config:apply` | Apply a standards configuration |
| `setup-install:backend:bootstrap` | Bootstrap backend infrastructure |
| `validation-readiness:environment:check` | Run environment readiness check |
| `health-observability:probe:run` | Execute an infrastructure probe |
| `repair-recovery:run:retry` | Retry a failed admin run |

## Risk levels

5 risk levels, each with clear criteria:

| Risk level | Key | Criteria | Safety controls required |
|------------|-----|----------|------------------------|
| **Read-only** | `read-only` | No state change. Pure observation or reporting. | None. |
| **Low** | `low` | Minor state change. Reversible. Affects only the initiating context. | Audit record. |
| **Moderate** | `moderate` | State change affecting shared resources. Reversible with effort. | Audit record. Operator confirmation. |
| **High** | `high` | State change affecting tenant resources or identity. Difficult to reverse. | Audit record. Operator confirmation. Impact preview. Evidence chain. |
| **Critical** | `critical` | Irreversible or destructive action. Affects tenant-wide state. | Audit record. Operator confirmation. Preview/dry-run mandatory. Impact summary. Post-action validation. Evidence chain. |

**Typed as**: `AdminRiskLevel` enum in `@hbc/models`.

## Execution modes

4 execution modes that determine how the control plane processes an action:

### Seamless

Runs straight through from start to finish. The system only pauses if a failure or error occurs.

- **Used when**: the action sequence is well-understood, low-to-moderate risk, and has proven retry/compensation behavior.
- **Locked decision**: provisioning stays seamless unless failure handling requires interruption (LD-05).
- **Operator role**: initiate and monitor. No mid-flow approval gates.

### Checkpointed

Pauses at defined checkpoints for operator review before continuing.

- **Used when**: the action affects shared or tenant resources, carries moderate-to-high risk, or involves multiple steps where intermediate review adds safety value.
- **Locked decision**: risky admin actions outside provisioning may require checkpointed automation (LD-06).
- **Operator role**: review checkpoint output, approve or reject continuation.

### Destructive

Irreversible or high-impact action requiring maximum safety controls.

- **Used when**: the action permanently alters or removes tenant state (site deletion, permission removal, config reset).
- **Locked decision**: single-admin execution requires strong safety controls (LD-10).
- **Required controls**: preview/dry-run, impact summary, explicit confirmation, post-action validation, evidence chain.
- **Operator role**: review preview, confirm execution, verify results.

### Advisory

Read-only observation or analysis. Produces a report without making any state changes.

- **Used when**: the action is pure observation (drift detection, readiness check, health probe, standards comparison).
- **Operator role**: review results. No approval needed.

**Typed as**: `AdminExecutionMode` enum in `@hbc/models`.

## Mapping rules: risk level → execution mode

The default execution mode is determined by risk level, but domains may override with justification:

| Risk level | Default execution mode | Override allowed? |
|------------|----------------------|-------------------|
| Read-only | Advisory | No — read-only is always advisory |
| Low | Seamless | Yes — may be checkpointed if the domain requires intermediate review |
| Moderate | Checkpointed | Yes — may be seamless if the action has proven retry/compensation (e.g., provisioning) |
| High | Checkpointed | Yes — may be destructive if the action is irreversible |
| Critical | Destructive | No — critical actions always require destructive-mode safety controls |

**Override rule**: An override must be documented in the action catalog entry with rationale. The provisioning saga override (moderate risk → seamless) is the canonical example — it is explicitly allowed by LD-05.

## Domain-to-action catalog

### Setup / Install (`setup-install`)

| Action key | Risk | Mode | Preview | Phase | Description |
|------------|------|------|---------|-------|-------------|
| `setup-install:backend:bootstrap` | High | Checkpointed | Yes | 6 | Deploy backend infrastructure (Function App, storage, SignalR) |
| `setup-install:backend:validate` | Read-only | Advisory | No | 6 | Validate backend deployment prerequisites |
| `setup-install:backend:upgrade` | High | Checkpointed | Yes | 6 | Upgrade backend infrastructure version |

### Validation / Readiness (`validation-readiness`)

| Action key | Risk | Mode | Preview | Phase | Description |
|------------|------|------|---------|-------|-------------|
| `validation-readiness:environment:check` | Read-only | Advisory | No | 6 | Run full environment readiness assessment |
| `validation-readiness:dependency:verify` | Read-only | Advisory | No | 6 | Verify provisioning dependency state |
| `validation-readiness:permission:audit` | Read-only | Advisory | No | 6 | Audit current permission posture |

### Provisioning / Rollout (`provisioning-rollout`)

| Action key | Risk | Mode | Preview | Phase | Description |
|------------|------|------|---------|-------|-------------|
| `provisioning-rollout:saga:launch` | Moderate | **Seamless** | No | 7 | Launch provisioning saga (LD-05 override: seamless) |
| `provisioning-rollout:saga:retry` | Moderate | **Seamless** | No | 7 | Retry failed provisioning run |
| `provisioning-rollout:run:archive` | Low | Seamless | No | Existing | Archive a completed/failed run |
| `provisioning-rollout:run:escalate` | Low | Seamless | No | Existing | Escalate a failed run for admin attention |
| `provisioning-rollout:run:force-state` | High | Checkpointed | No | Existing | Expert-tier manual state override |

### SharePoint Control (`sharepoint-control`)

| Action key | Risk | Mode | Preview | Phase | Description |
|------------|------|------|---------|-------|-------------|
| `sharepoint-control:drift:detect` | Read-only | Advisory | No | 8 | Detect drift on HB Intel-managed sites |
| `sharepoint-control:standards:compare` | Read-only | Advisory | No | 8 | Compare site state against standard |
| `sharepoint-control:standards:preview` | Read-only | Advisory | No | 8 | Preview standards application (dry-run) |
| `sharepoint-control:standards:apply` | High | Checkpointed | Yes | 8 | Apply standards to managed sites |
| `sharepoint-control:site:repair` | High | Checkpointed | Yes | 8 | Repair site to standard |
| `sharepoint-control:catalog:inspect` | Read-only | Advisory | No | 8 | Inspect app catalog posture |
| `sharepoint-control:api-access:inspect` | Read-only | Advisory | No | 8 | Inspect API access posture |

### Entra Control (`entra-control`)

| Action key | Risk | Mode | Preview | Phase | Description |
|------------|------|------|---------|-------|-------------|
| `entra-control:group:create` | Moderate | Checkpointed | No | 9 | Create Entra security group |
| `entra-control:group:modify` | Moderate | Checkpointed | No | 9 | Modify group membership |
| `entra-control:group:remove` | Critical | Destructive | Yes | 9 | Remove Entra security group |
| `entra-control:user:create` | Moderate | Checkpointed | No | 9 | Create Entra user |
| `entra-control:user:modify` | Moderate | Checkpointed | No | 9 | Modify Entra user properties |
| `entra-control:user:remove` | Critical | Destructive | Yes | 9 | Remove Entra user |
| `entra-control:access:grant` | High | Checkpointed | Yes | 9 | Grant app-related access |
| `entra-control:access:revoke` | Critical | Destructive | Yes | 9 | Revoke app-related access |

### Standards / Config (`standards-config`)

| Action key | Risk | Mode | Preview | Phase | Description |
|------------|------|------|---------|-------|-------------|
| `standards-config:config:view` | Read-only | Advisory | No | 10 | View current configuration state |
| `standards-config:config:edit` | Moderate | Checkpointed | Yes | 10 | Edit governed live configuration |
| `standards-config:config:apply` | High | Checkpointed | Yes | 10 | Apply configuration to environment |
| `standards-config:config:revert` | High | Checkpointed | Yes | 10 | Revert to previous config version |
| `standards-config:version:compare` | Read-only | Advisory | No | 10 | Compare config versions |

### Health / Observability (`health-observability`)

| Action key | Risk | Mode | Preview | Phase | Description |
|------------|------|------|---------|-------|-------------|
| `health-observability:probe:run` | Read-only | Advisory | No | 12 | Execute infrastructure probe |
| `health-observability:alert:list` | Read-only | Advisory | No | Existing | List active alerts |
| `health-observability:alert:acknowledge` | Low | Seamless | No | Existing | Acknowledge an alert |
| `health-observability:health:assess` | Read-only | Advisory | No | 12 | Run health assessment |

### Repair / Recovery (`repair-recovery`)

| Action key | Risk | Mode | Preview | Phase | Description |
|------------|------|------|---------|-------|-------------|
| `repair-recovery:run:retry` | Moderate | Checkpointed | No | 7 | Retry a failed admin run (non-provisioning) |
| `repair-recovery:site:repair` | High | Checkpointed | Yes | 8 | Repair a specific site issue |
| `repair-recovery:permission:repair` | High | Checkpointed | Yes | 8 | Repair permission configuration |
| `repair-recovery:config:reapply` | High | Checkpointed | Yes | 10 | Reapply standards configuration |

## Explicit non-examples

These are **not** admin control-plane actions and must not appear in this catalog:

| Non-example | Why |
|-------------|-----|
| Project lead CRUD | Domain data operation, not admin control |
| Estimating tracker updates | Domain data operation, not admin control |
| User login/logout | Authentication flow, not admin action |
| Page navigation | UX concern, not admin action |
| Monitor/probe engine internals | Admin-intelligence implementation detail, not an operator-initiated action |
| Build/deploy CI/CD pipelines | DevOps concern, not in-app admin control |

## Cross-references

| Document | Relevance |
|----------|-----------|
| [Phase 1 domain taxonomy](../phase-01/admin-spfx-domain-taxonomy.md) | Domain definitions and maturity labels |
| [Phase 1 locked decisions](../phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md) | LD-05 (provisioning seamless), LD-06 (checkpointed risky actions), LD-10 (single-admin safety) |
| [Phase 1 boundary matrix](../phase-01/admin-spfx-boundary-matrix.md) | Capability-to-layer ownership |
| [Phase 2 prerequisite inventory](admin-spfx-phase-2-prereq-and-contract-inventory.md) | Current contract surfaces and gap analysis |
| `@hbc/models/admin-control-plane` | Shared type surface (enums, types) |
