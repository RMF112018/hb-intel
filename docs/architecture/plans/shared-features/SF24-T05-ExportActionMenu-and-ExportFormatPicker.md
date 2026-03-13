# SF24-T05 - ExportActionMenu and ExportFormatPicker

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-02, L-03, L-05, L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF24-T05 menu/picker UI task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Define export entry and format-picker contracts, including complexity behavior, recommended export logic, format-availability explainability, review/handoff ownership cues, and clear differentiation between analysis exports and presentation/report exports.

---

## `ExportActionMenu`

Behavior:

- normalized export entry across modules with primitive-controlled format availability
- inline review/handoff ownership avatar projection for BIC-linked export intents
- entrypoint to composition and receipt surfaces where format/profile permits
- top recommended export option surfaced with explicit reason

User-facing explainability requirements:

- show why a format is recommended in the current context
- show why a format is disabled, suppressed, or deferred
- distinguish whether the current export is intended for working analysis, presentation circulation, record audit, or handoff
- surface downstream owner visibility when the chosen export enters review or handoff flow

Complexity:

- Essential: reduced-choice menu limited to the highest-value CSV/XLSX or equivalent low-friction default
- Standard: full menu with branded PDF/Print options and trust-aware hints
- Expert: full menu + report composition entrypoint + configure link + deeper diagnostics

AI constraints:

- inline only (no sidecar)
- source citation required
- explicit approval required before persistence or artifact mutation

---

## `ExportFormatPicker`

Behavior:

- enforces format compatibility with payload type, module policy, and trust requirements
- surfaces context stamp preview before request submission
- blocks invalid or unsupported format/output combinations with explicit guidance
- remembers safe preferred formats where product policy allows

Safety requirements:

- clear differentiation between working-data export and presentation/report export
- duplicate accidental export generation is guarded where in-flight equivalent requests already exist
- unsupported-format fallback must remain visible and non-destructive

Offline states:

- must preserve user-selected format in queued request model
- must project `Saved locally` and `Queued to sync` through linked receipt flow
- must clearly distinguish queued local request success from remotely rendered artifact success

---

## UI Ownership Rule

Any reusable visual picker, receipt, or progress primitive introduced during SF24 implementation must live in `@hbc/ui-kit`.
`@hbc/export-runtime` consumes those primitives and supplies export lifecycle/truth/review state.

---

## Verification Commands

```bash
pnpm --filter @hbc/export-runtime test -- ExportActionMenu
pnpm --filter @hbc/export-runtime test -- ExportFormatPicker
pnpm --filter @hbc/features-business-development test -- export-runtime-ui
pnpm --filter @hbc/features-estimating test -- export-runtime-ui
```
