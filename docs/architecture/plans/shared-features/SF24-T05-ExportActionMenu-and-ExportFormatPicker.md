# SF24-T05 - ExportActionMenu and ExportFormatPicker

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-02, L-03, L-05, L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF24-T05 menu/picker UI task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Define export entry and format-picker contracts, including complexity behavior, review/handoff ownership cues, inline AI actions, and deep-link behavior.

---

## `ExportActionMenu`

Behavior:
- normalized export entry across modules with primitive-controlled format availability
- inline review/handoff ownership avatar projection for BIC-linked export intents
- entrypoint to composition and receipt surfaces where format/profile permits

Complexity:
- Essential: simple export action limited to CSV/XLSX
- Standard: full menu with branded PDF/Print options
- Expert: full menu + report composition entrypoint + configure link

AI constraints:
- inline only (no sidecar)
- source citation required
- explicit approval required before persistence or artifact mutation

---

## `ExportFormatPicker`

Behavior:
- enforces format compatibility with payload type and module policy
- surfaces context stamp preview before request submission
- blocks invalid format/output combinations with explicit guidance

Offline states:
- must preserve user-selected format in queued request model
- must project `Saved locally` and `Queued to sync` through linked receipt flow

---

## Verification Commands

```bash
pnpm --filter @hbc/export-runtime test -- ExportActionMenu
pnpm --filter @hbc/export-runtime test -- ExportFormatPicker
pnpm --filter @hbc/features-business-development test -- export-runtime-ui
pnpm --filter @hbc/features-estimating test -- export-runtime-ui
```

