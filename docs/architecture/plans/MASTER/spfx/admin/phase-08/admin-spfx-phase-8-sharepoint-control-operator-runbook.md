# Admin SPFx IT Control Center — Phase 8 SharePoint Control Operator Runbook

**Prompt:** P8-09 — Evidence, Audit, Docs, and Runbooks
**Date:** 2026-04-03
**Purpose:** Practical operator guidance for using the SharePoint control lane.

---

## What is in scope

The SharePoint control lane operates on **HB Intel-managed assets only**:

| Asset class | How identified |
|------------|---------------|
| HB Intel project sites | Created by provisioning saga; have ProvisioningStatus record |
| Core document libraries | Project Documents, Drawings, Specifications |
| Data lists | Core + workflow-family lists from provisioning Step 4 |
| Template files | Files uploaded by provisioning Step 3 |
| Entra security groups | `{ProjectNumber}-Leaders`, `{ProjectNumber}-Team`, `{ProjectNumber}-Viewers` |
| Hub site association | Association with configured HB Intel hub site |
| HB Intel SPFx package | Package identified by `HB_INTEL_SPFX_APP_ID` in tenant app catalog |
| API access permissions | Graph and SharePoint permissions for HB Intel operations |

**Not in scope:** Non-HB-Intel SharePoint sites, non-HB-Intel app catalog packages, tenant-level SharePoint settings, OneDrive, personal sites, or any broad tenant-wide SharePoint administration.

---

## How to run drift detection

1. Navigate to the **SharePoint** lane (`/sharepoint`).
2. Click **Run Drift Detection**.
3. The backend compares the target site against HB Intel standards (code-default-v1).
4. Results appear in the drift summary section:
   - **Per-area breakdown** shows which standards areas are compliant, drifted, or unknown.
   - **Drift findings** list each expectation that failed with severity and repairable/advisory status.

### Interpreting drift results

| Outcome | Meaning |
|---------|---------|
| **Compliant** | All checked expectations match standards — no action needed |
| **Drifted** | One or more expectations do not match — review findings |
| **Unknown** | One or more areas could not be inspected (permission denied, timeout) |
| **Error** | Inspection failed — investigate and retry |

| Severity | Meaning |
|----------|---------|
| **Critical** | Expected item is missing entirely |
| **Warning** | Item exists but value differs from standards |
| **Info** | Informational observation, not a failure |

---

## How to preview a repair

1. After drift detection shows drifted results, click **Preview Repair**.
2. The preview shows:
   - **Proposed changes** — items that will be created (all Phase 8 repairs are idempotent creates).
   - **Advisory only** — items that cannot be auto-repaired (require manual intervention).
   - **Warnings** — uninspectable areas and non-repairable critical findings.
3. Review the preview before proceeding.

### What "repairable" means in Phase 8

| Repairable | Action | Examples |
|-----------|--------|---------|
| Yes | Idempotent create (will not overwrite or delete) | Missing library, missing list, missing security group, missing hub association |
| No (advisory) | Requires manual intervention | Missing site (provisioning concern), app catalog package, API permissions, schema changes |

---

## How to apply a repair

1. After reviewing the preview, click **Apply Repair**.
2. The backend executes each repairable finding:
   - Creates missing items (idempotent — skips if already exists).
   - Records per-step results with timing.
3. Results show:
   - **All-repaired** — all repairable items were created or already existed.
   - **Partial** — some items created, some failed.
   - **None-repaired** — all repairs failed.

### Repair safeguards

- **Preview is required** before repair execution.
- **Only repairable findings** are attempted — advisory items are excluded.
- **No destructive operations** — Phase 8 only creates, never deletes or restructures.
- **Each step is independent** — one failure does not block other repairs.
- **Retry is safe** — all repairs are idempotent. Re-running will skip already-created items.

---

## How to check package and API posture

1. Click **Check Posture** on the SharePoint lane.
2. Results show 8 checks across two categories:

### App Catalog (4 checks)

| Check | What it validates | Severity if unhealthy |
|-------|------------------|----------------------|
| Tenant app catalog exists | App catalog site is reachable | Critical |
| HB Intel package present | .sppkg uploaded to catalog | Critical |
| HB Intel package deployed | Package deployed tenant-wide | Warning |
| HB Intel package version current | Latest version in catalog | Info |

### API Access (4 checks)

| Check | What it validates | Severity if unhealthy |
|-------|------------------|----------------------|
| Graph Sites.Selected permission | Required for site-level access | Critical |
| Graph Group.ReadWrite.All permission | Required for Entra group management | Critical |
| SharePoint Sites.FullControl.All permission | Required for SharePoint API access | Warning |
| Managed identity configured | Required for all backend operations | Critical |

**All posture checks are advisory-only.** They show status and recommended actions but do not trigger automatic remediation. Manual intervention is required in the Entra admin portal or SharePoint admin center.

---

## What evidence is captured

| Action | Evidence type | What is stored |
|--------|--------------|---------------|
| Drift detection | `DriftReport` | Asset, outcome, standards version, area summaries, all findings |
| Repair preview | `PreviewResult` | Asset, risk level, impact items, warnings |
| Repair execution | `StepResultDetail` | Asset, outcome, per-step results with timing and errors |
| Posture validation | `PostValidationSummary` | Overall health, per-check findings, recommended actions |

All evidence is stored inline (< 32 KB threshold) in the existing `AdminEvidence` Table Storage.

### Audit events

Every SharePoint control action records an audit event with:
- `domain: SharePointControl`
- Operator identity (from JWT)
- Action key (`detect-drift`, `preview-repair`, `apply-repair`, `posture:check`)
- Summary with counts and outcomes

Audit writes are fire-and-forget — they do not block the operation.

---

## What limitations remain

| Limitation | Detail |
|-----------|--------|
| API routes not yet wired | Backend services are ready; admin API route integration pending |
| Standards are code-default only | No operator-editable standards until Phase 10 |
| Template files checked at area level | "At least one present" — not individual file enumeration |
| Data lists checked at area level | "Core lists present" — not individual list/field enumeration |
| No live HTTP health probes | Format and presence checks only |
| No step-level resume for repair | Re-run retries all steps (idempotent, so safe) |
| Posture collectors not yet wired to live APIs | Injectable callback pattern ready for real implementation |
| No run envelope integration | Standalone workflow results, not wrapped in IAdminRunEnvelope |

---

## What later phases own

| Concern | Phase |
|---------|-------|
| Live-override and merged standards governance | Phase 10 |
| App catalog package deployment (ALM workflow) | Later maturity |
| API access permission grant automation | Requires tenant-admin consent — manual |
| List schema migration (field type changes) | Later maturity |
| Template file content versioning | Later maturity |
| Entra group membership posture comparison | Later maturity |
| Cross-site fleet-wide comparison aggregation | Later maturity |
| Full run-envelope orchestration for SharePoint control | Prompt-06 repair → later hardening |

---

## When to escalate

Escalate to a platform administrator when:
- Drift detection fails repeatedly on the same area.
- Repair fails on an item that should be creatable.
- Posture checks show critical missing permissions you cannot grant.
- A managed site does not appear in the asset list (provisioning issue).
- Audit or evidence capture fails persistently.

---

## Quick reference

| Action | Route | Backend service |
|--------|-------|----------------|
| Run drift detection | `/sharepoint` | `runSharePointDriftDetection()` |
| Preview repair | `/sharepoint` | `runSharePointRepairPreview()` |
| Apply repair | `/sharepoint` | `executeSharePointRepair()` |
| Check posture | `/sharepoint` | `runPostureValidation()` |
