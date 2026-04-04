# Standards and Configuration Governance — Operator Guide

> **Doc Classification:** How-To Guide (Diataxis) — Procedural guidance for administrators managing live-governed standards and configuration through the Admin IT Control Center.

**Audience:** Platform administrators with admin console access  
**Phase:** 10 — Live Admin-Maintained Standards and Configuration Governance  
**Last Updated:** 2026-04-04

---

## Overview

Phase 10 introduces a hybrid source-of-truth model for standards and configuration. Some settings can now be managed live through the Admin console without code deployments, while infrastructure and secret settings remain controlled through environment variables and Key Vault.

**Key concepts:**
- **Code default** — the value defined in source code; always present as a fallback
- **Live override** — a published admin-maintained value that takes precedence over the code default
- **Infrastructure value** — a value from the environment (App Settings / Key Vault) that cannot be changed through the admin console
- **Provenance** — every resolved value shows where it came from and who last changed it

---

## How to view current configuration

1. Navigate to the **Standards** lane in the Admin console (`/standards-config`).
2. Use the **domain tabs** to filter by category (Access Control, Rollout, SharePoint, etc.) or view all domains.
3. Each item shows:
   - **Key** — the config identifier
   - **Effective value** — the currently active value
   - **Source badge** — `Live Override` (green), `Infrastructure` (gray), or `Code Default` (blue)
   - **Version badge** — `v1`, `v2`, etc. for items with live overrides
   - **Last changed by / when** — for items with live overrides

**Live-editable items** appear in the "Live-Editable Standards" section with Edit and Revert buttons.  
**Protected items** appear in the "Protected Settings" section as read-only.

---

## How to publish a configuration change

1. Navigate to the **Standards** lane.
2. Find the item you want to change in the "Live-Editable Standards" section.
3. Click **Edit**.
4. In the modal:
   - Review the current value and its source.
   - Enter the **new value**.
   - Enter a **reason** (required) explaining why you are making this change.
5. Click **Publish**.

The change takes effect immediately. An audit record is created with your identity, the old value, the new value, and your reason.

**If you see a "Concurrency conflict" error:** Another admin published a change to this item while you were editing. Close the modal, refresh the page to see the latest value, and try again.

---

## How to revert a bad change

1. Navigate to the **Standards** lane.
2. Find the item with the live override you want to revert.
3. Click **Revert**.
4. In the confirmation modal:
   - Enter a **reason** (required) explaining why you are reverting.
5. Click **Revert to Default**.

The effective value falls back to the code default. The override is not deleted — a new version is created with status `reverted`, preserving the full audit trail.

---

## How to view version history

1. Navigate to the **Standards** lane.
2. Click **History** on any item.
3. The history modal shows all versions, newest first:
   - Version number
   - Event type (Created / Updated / Reverted)
   - Who made the change
   - When the change was made
   - The reason provided
4. Click **Diff** on any version to see a before/after comparison.

---

## How to determine what config a run used

When a downstream run executes (provisioning, SharePoint control, etc.), it captures a **config snapshot** — a frozen record of the effective configuration at run start time.

1. Locate the run in the **Runs** lane.
2. The run's `configSnapshotRef` field (visible in run detail) links to the snapshot.
3. The snapshot contains:
   - The effective value of every config item at run time
   - Which items had live overrides vs. code defaults
   - The version number of each live override

**Key property:** The snapshot is immutable. If configuration changed after the run started, the snapshot still reflects what the run actually used.

---

## How to handle invalid config or stale-write conflicts

### Stale-write conflict

**Symptom:** You see "Concurrency conflict: expected version X but found Y" when publishing.

**Cause:** Another admin changed the same item between when you loaded the page and when you clicked Publish.

**Resolution:**
1. Close the edit modal.
2. Refresh the page to load the latest values.
3. Review the current value (it may already reflect what you intended).
4. If you still need to make a change, edit again with the updated version.

### Invalid value

**Symptom:** The API rejects your publish with a validation error.

**Cause:** The value you entered does not match the catalog's validation rule for this item (e.g., invalid email format for a UPN field).

**Resolution:** Check the validation error message, correct the value, and try again.

---

## How to add a new live-governed config item (developer guide)

This requires a code change — it cannot be done through the admin console.

1. **Add the catalog entry** in `backend/functions/src/config/catalog/entries/<domain>.ts`:
   - Set `liveEditable: true`
   - Set `secret: false` and `infrastructureControlled: false`
   - Define `valueType`, `validationRule`, `defaultValue`, `riskTier`
   - Choose the correct `domain` and `subdomain` from the taxonomy

2. **Register the entry** in the catalog barrel export.

3. **Add to resolution catalog.** Ensure the new entry is included in the `IResolvableCatalogEntry[]` array passed to `ConfigResolutionService`.

4. **Deploy.** After deployment, the item will appear in the Standards & Configuration lane with its code default value. Admins can then publish overrides.

**Constraints:**
- Items marked `secret: true` cannot be `liveEditable: true` (mutual exclusion enforced by catalog).
- Items marked `infrastructureControlled: true` cannot be `liveEditable: true`.
- All live-editable items must have `versioningBehavior: 'versioned'` and `auditPayload: 'full'`.

---

## Phase 10 documentation index

All Phase 10 artifacts are located under `docs/architecture/plans/MASTER/spfx/admin/phase-10/`:

| Document | Purpose |
|----------|---------|
| `Admin-SPFx-IT-Control-Center-Phase-10-Summary-Plan.md` | Phase overview and acceptance criteria |
| `admin-spfx-phase-10-repo-truth-and-gap-audit.md` | P10-01: Repo-truth audit and gap map |
| `admin-spfx-phase-10-hybrid-config-baseline.md` | P10-02: Frozen hybrid source-of-truth baseline |
| `admin-spfx-phase-10-standards-config-taxonomy.md` | P10-03: Domain taxonomy and subdomain breakdown |
| `admin-spfx-phase-10-config-catalog-model.md` | P10-03: Canonical `IConfigCatalogEntry` field model |
| `admin-spfx-phase-10-config-store-implementation-notes.md` | P10-04: Override store design and storage shape |
| `admin-spfx-phase-10-version-audit-model.md` | P10-05: Version lifecycle, concurrency, publish/revert semantics |
| `admin-spfx-phase-10-resolution-and-traceability.md` | P10-06: Resolution engine and run-to-config traceability |
| `admin-spfx-phase-10-seeding-and-reconciliation.md` | P10-09: Seeding strategy and wave-0 drift reconciliation |

### Related reference documents

| Document | Purpose |
|----------|---------|
| `docs/reference/configuration/wave-0-config-registry.md` | Wave 0 configuration registry (reconciled to v2.0 in P10-09) |
| `docs/reference/configuration/sites-selected-validation.md` | Sites.Selected permission governance |

### Implementation locations

| Area | Location |
|------|----------|
| Config override store | `backend/functions/src/services/admin-control-plane/config-override-store.ts` |
| Config versioning service | `backend/functions/src/services/admin-control-plane/config-versioning-service.ts` |
| Config resolution service | `backend/functions/src/services/admin-control-plane/config-resolution-service.ts` |
| Config snapshot store | `backend/functions/src/services/admin-control-plane/config-snapshot-store.ts` |
| Shared DTOs | `packages/models/src/admin-control-plane/IConfigGovernance.ts`, `IConfigVersioning.ts` |
| Admin app page | `apps/admin/src/pages/StandardsConfigPage.tsx` |
| Admin app hook | `apps/admin/src/hooks/useStandardsConfig.ts` |
| Service factory wiring | `backend/functions/src/hosts/admin-control-plane/service-factory.ts` |
