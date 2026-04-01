# Gap 2 Documentation Reconciliation Summary

> **Created:** 2026-04-01 (P9-G2-01)
> **Status:** Complete

## 1. Reconciliation Outcome

**Former Gap 2 concern — resolved as not a gap by validation.**

A hypothesis asserted two gaps in the SPFx packaging/runtime-config flow:
1. The build/package flow silently defaults Project Setup to `ui-review`.
2. `apiAudience` is not wired end-to-end through the SPFx shell/build pipeline.

Both claims were **disproven** by direct repo-truth inspection and fresh `.sppkg` build artifact verification. The authoritative validation is documented in `project-setup-packaging-runtime-config-gap-validation.md`.

---

## 2. Documents Reviewed

| Document | File | Finding |
|----------|------|---------|
| Phase 7 remediation report | `project-setup-phase-7-production-alignment-remediation-report.md` | **No changes needed.** Correctly describes P7-02 removal of `ui-review` defaults. Already consistent with validation. |
| Phase 8 remediation report | `project-setup-phase-8-remediation-report.md` | **Context annotations added.** P8-01 section used present-tense language to describe the pre-P8-02 `apiAudience` state, which could be misread as current. Annotated with strikethrough and cross-references to P8-02 closure and validation report. |
| Phase 1-5 implementation report | `project-setup-phase-1-through-5-implementation-and-gap-report.md` | **No changes needed.** References to `ui-review` mode are accurate descriptions of the bounded fallback mechanism, not gap claims. |
| Gap validation report | `project-setup-packaging-runtime-config-gap-validation.md` | **No changes needed.** This is the authoritative validation. Already conclusive. |

---

## 3. Stale Claims Corrected

| Location | Original Text | Correction |
|----------|---------------|------------|
| Phase 8 report, P8-01, line ~52 | "The shell webpart does NOT inject `apiAudience` via DefinePlugin. There is no `__API_AUDIENCE__` constant." | Strikethrough + annotation: "Resolved in P8-02 — `__API_AUDIENCE__` is now the 6th DefinePlugin constant." |
| Phase 8 report, P8-01, line ~121 | "`apiAudience` is NOT injected by the shell. This is the documented P3-02 carry-forward." | Strikethrough + annotation: "This described the pre-P8-02 state. As of P8-02, `apiAudience` IS injected." |
| Phase 8 report, P8-01 carry-forward table, line ~167 | CF-01 listed as carry-forward targeting Prompt-02 | Strikethrough + annotation: "Closed by P8-02." |

All corrections are annotations that preserve the original text (strikethrough) while clearly marking it as resolved. No historical context was erased.

---

## 4. Normalized Final Wording

Across all affected documents, the consistent description is:

> **Former Gap 2 concern — resolved as not a gap by validation.**

Specific sub-points:
- The build does not default to `ui-review`. `resolveDefaultBackendMode()` returns `''` and the app defaults to `'production'` (P7-02).
- The shell does not silently inject `ui-review`. The runtime production-readiness safeguard that falls back to `ui-review` is intentional, observable, and not a build/shell default (P7-02).
- `apiAudience` IS wired end-to-end through the SPFx packaging/shell/runtime chain (P8-02).
- Both conclusions are independently confirmed by fresh `.sppkg` build artifact inspection.

---

## 5. Historical Context Preserved

The P8-01 section of the Phase 8 report retains its original observations via strikethrough, with annotations explaining that the state described was accurate at P8-01 time but was resolved by P8-02. This preserves the audit trail showing that the gap was real at one point in the implementation sequence and was closed by subsequent work.

---

## 6. Remaining Unresolved Questions

None for Gap 2 itself.

The only tangentially related open item is **Teams Personal App auth readiness** (OI-03/CF-03), which is a separate concern about whether `aadTokenProviderFactory` resolves correctly in the Teams host context. This is not a packaging/runtime-config gap and should not be conflated with the disproven Gap 2.

---

## 7. Closure Note

**Future Project Setup audits should not re-identify the packaging/runtime-config topic as an open gap unless new repo truth emerges that contradicts the validation report.**

The authoritative resolution is: `project-setup-packaging-runtime-config-gap-validation.md`

That report provides:
- Source-code evidence for both claims
- Fresh `.sppkg` build artifact evidence (two builds: empty env + populated env)
- Compiled shell render() method inspection
- Explicit verdict with evidence index

If a future audit suspects a regression, the correct approach is to re-run the build verification described in that report against current source, not to reopen the gap based on older snapshot language.
