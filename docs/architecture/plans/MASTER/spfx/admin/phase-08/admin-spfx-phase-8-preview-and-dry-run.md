# Admin SPFx IT Control Center — Phase 8 Preview and Dry-Run

**Prompt:** P8-05 — Preview / Dry-Run and Impact Summary Execution
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Document the preview / dry-run behavior for SharePoint control repair operations.

---

## 1. Preview semantics

The preview service converts drift detection output (`ISharePointComparisonResult`) into an operator-reviewable impact summary (`IAdminPreviewResponse`) showing what a repair would change before any privileged execution occurs.

### Workflow

1. **Input** — A completed drift comparison result from `runSharePointDriftDetection()` (P8-04).
2. **Transform** — `generateRepairPreview()` classifies each drift finding:
   - Repairable findings → `changeType: 'create'` impact items (Phase 8 repairs are idempotent creates)
   - Non-repairable findings → `changeType: 'no-change'` items with explanation
3. **Warn** — Uninspectable areas and non-repairable critical findings generate operator warnings.
4. **Audit** — `runSharePointRepairPreview()` records an audit event and captures evidence.
5. **Display** — The `IAdminPreviewResponse` is returned for operator review in the SharePoint control lane.

### Action flow

```
Drift Detection → ISharePointComparisonResult → generateRepairPreview() → IAdminPreviewResponse → Operator Review → [Approve/Cancel]
```

Repair execution (Prompt-06) only proceeds after operator review and explicit approval.

---

## 2. Non-destructive guarantees

| Guarantee | How enforced |
|-----------|-------------|
| Preview makes no SharePoint API calls | `generateRepairPreview()` is a **pure function** — it transforms an already-collected comparison result |
| Preview does not modify any external state | No side effects in the transform function; audit/evidence writes are separate and fire-and-forget |
| Preview cannot escalate risk | Risk level is always `Low` (idempotent creates) or `ReadOnly` (advisory only) |
| Phase 8 repairs are idempotent creates only | All repairable items use `changeType: 'create'` — no `delete` or destructive `update` |
| Non-repairable items are clearly marked | `changeType: 'no-change'` with explanation text |

---

## 3. Impact-summary shape

The preview output uses the existing `IAdminPreviewResponse` contract from Phase 2:

```typescript
interface IAdminPreviewResponse {
  actionKey: AdminActionKey;       // 'sharepoint-control:standards:preview-repair'
  impactSummary: IAdminPreviewImpactItem[];
  riskLevel: AdminRiskLevel;       // Low or ReadOnly
  warnings: string[];
}

interface IAdminPreviewImpactItem {
  resource: string;                // e.g., 'Document Library: Library "Drawings"'
  changeType: 'create' | 'no-change';  // Phase 8 only uses these two
  description: string;             // Human-readable action description
}
```

### Impact item examples

| Finding | changeType | Resource | Description |
|---------|-----------|----------|-------------|
| Missing library | `create` | `Document Library: Library "Drawings"...` | `Create missing document library — present, versioning=true` |
| Missing security group | `create` | `Security Group: Entra security group "2025-001-Team"` | `Create missing security group — exists in Entra` |
| Value mismatch (repairable) | `create` | `Document Library: Library "..."` | `Restore document library to expected state — expected "...", found "..."` |
| Site missing (non-repairable) | `no-change` | `Site: Site exists at ...` | `Not auto-repairable in Phase 8 — ...` |
| Web part missing (advisory) | `no-change` | `Web Part: HB Intel SPFx package...` | `Not auto-repairable in Phase 8 — ...` |

### Risk level logic

| Condition | Risk level |
|-----------|-----------|
| At least one repairable item | `Low` (idempotent creates) |
| Only non-repairable items | `ReadOnly` (advisory only) |
| No drift (compliant) | `ReadOnly` |

---

## 4. Audit / evidence expectations

### Audit event

| Field | Value |
|-------|-------|
| `eventType` | `StandardsApplied` |
| `domain` | `SharePointControl` |
| `actionKey` | `sharepoint-control:standards:preview-repair` |
| `summary` | `Repair preview for {projectNumber}: {N} repairable, {M} advisory, {W} warnings` |

### Evidence capture

| Field | Value |
|-------|-------|
| `evidenceType` | `PreviewResult` |
| `storageLocator` | `inline://sharepoint-preview/{projectId}/{timestamp}` |
| `payload` | Asset, comparison outcome, standards version, risk level, impact items, warnings |

Both audit and evidence writes are fire-and-forget — failures do not block preview generation.

---

## 5. Current exclusions or limitations

| Limitation | Phase 8 state | Future extension |
|-----------|---------------|-----------------|
| No `delete` or `update` change types | Phase 8 repairs are idempotent creates only | Later phases may add controlled updates |
| No cost or duration estimates | Preview shows what, not how long | Later phases may add time estimates |
| No dependency ordering in preview | Items listed as independent creates | Repair orchestration (Prompt-06) handles ordering |
| No partial-repair selection | Preview shows all-or-nothing | Later phases may allow item-level selection |
| Preview is synchronous | Pure function transform, no async work | Stays synchronous since input is already collected |
| No tenant-admin consent preview | Non-repairable items noted but consent flow not previewed | Phase 9+ may add consent-aware previews |

---

## Validation

### Verified

| Check | Command | Result |
|-------|---------|--------|
| Backend typecheck | `pnpm --filter @hbc/functions check-types` | **Pass** |
| Backend tests | `pnpm --filter @hbc/functions test` | **Pass** — 1377 passed, 3 skipped |
| New test suite | `sharepoint-preview-service.test.ts` | **Pass** — 13 tests |

### Test coverage

| Test group | Tests | Coverage |
|-----------|-------|----------|
| generateRepairPreview | 10 | Compliant input, repairable items, non-repairable items, warnings, mixed findings, risk levels, uninspectable areas, restore descriptions, pure-function guarantee |
| runSharePointRepairPreview | 3 | End-to-end preview, audit/evidence invocation |

### Not run

| Check | Reason |
|-------|--------|
| Models build | No model changes — P8-03 dist already current |
| Admin lint/build | No frontend changes |

---

## Cross-references

- [Phase 8 Control Baseline](admin-spfx-phase-8-sharepoint-control-baseline.md) — preview requirement (section 8.2)
- [Drift Detection Workflow](admin-spfx-phase-8-drift-detection-workflow.md) — input to preview
- Service code: `backend/functions/src/services/admin-control-plane/sharepoint-preview-service.ts`
- Test code: `backend/functions/src/services/admin-control-plane/__tests__/sharepoint-preview-service.test.ts`
- Contracts: `packages/models/src/admin-control-plane/IAdminApi.ts` — `IAdminPreviewResponse`, `IAdminPreviewImpactItem`
