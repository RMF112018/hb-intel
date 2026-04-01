# Gap 1 Final Reconciliation Audit — Document Set Consistency Review

> **Created:** 2026-04-01 (Phase 10, Prompt 1)
> **Status:** Scope frozen — ready for cleanup prompts
> **Scope:** Gap 1 validation/report cleanup, directly related Phase 8/deployment/connected-service docs, parameterization follow-on

## Executive Summary

The Phase 9 Gap 1 closure work (P9-G1-01 through P9-G1-05) successfully implemented the manifest declaration and updated the executive summaries and verdict sections of the affected documents. However, the body sections of several documents still contain stale pre-fix evidence narratives, outdated JSON snippets, present-tense descriptions of the gap as if it still exists, and evidence index rows that reference the pre-fix state. Two Phase 5 deployment documents outside the Gap 1 review set also contain stale SPFx permission language that predates the fix.

The contradictions are concentrated in two categories:
1. **Internal contradictions** — documents whose executive summary says "Resolved" but whose body sections still describe the gap in present tense
2. **Cross-document staleness** — deployment/runbook docs that were not updated during P9-G1-04

No contradictions were found in the build verification record, the closure record, or the connected-service-posture doc.

---

## 1. Documents Reviewed

| Document | File | Status |
|----------|------|--------|
| Gap validation report | `docs/architecture/reviews/project-setup-spfx-permission-declaration-gap-validation.md` | **Has contradictions** |
| Build verification record | `docs/architecture/reviews/project-setup-gap-1-build-verification.md` | Clean |
| Implementation closure record | `docs/architecture/reviews/project-setup-gap-1-implementation-closure.md` | Clean |
| Permission input freeze | `docs/architecture/reviews/project-setup-gap-1-permission-input-freeze.md` | **Minor staleness** |
| Phase 8 remediation report | `docs/architecture/reviews/project-setup-phase-8-remediation-report.md` | Clean (updated in P9-G1-04) |
| Connected-service-posture | `docs/reference/developer/project-setup-connected-service-posture.md` | Clean (updated in P9-G1-04) |
| Phase 5 Deployment Runbook | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md` | **Stale language** |
| Phase 5 Production Readiness Signoff | `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Production-Readiness-Signoff.md` | **Stale language** |
| `apps/estimating/config/package-solution.json` | Source config | Clean — declaration present, version `001.000.004` |

---

## 2. Exact Contradictions Found

### 2.1 Gap validation report — body contradicts resolved executive summary

**File:** `docs/architecture/reviews/project-setup-spfx-permission-declaration-gap-validation.md`

The executive summary (§0) and verdict (§5) were updated in P9-G1-04 to say "Resolved." However, the body evidence sections still describe the pre-fix state as current fact:

| Section | Line(s) | Stale Content | Problem |
|---------|---------|---------------|---------|
| §1.1 heading | 17 | `package-solution.json` — no `webApiPermissionRequests` | Heading states gap as current |
| §1.1 body | 19–41 | "The solution block declares... There is no `webApiPermissionRequests` array." + pre-fix JSON snippet with `version: "1.0.0.0"` | Describes pre-fix state as current repo truth |
| §1.2 | 45–48 | "A repo-wide grep for `webApiPermissionRequests` returns zero matches in application source, configuration, build scripts, or documentation." | False — the declaration now exists in `package-solution.json` and is referenced in multiple docs |
| §2.2 | 63–68 | "Shell `package-solution.json` has no permissions... It contains no `webApiPermissionRequests` because the source does not." | False — both source and shell now contain the declaration |
| §2.5 | 85–87 | "There is no mechanism in the packaging pipeline that adds `webApiPermissionRequests`... The omission in the source config propagates unchanged" | Misleading — the source now contains the declaration, so propagation is correct behavior |
| §6 point 3 | 230 | "The manifest does not declare the permission. `package-solution.json` has no `webApiPermissionRequests` array. No build step injects one. The `.sppkg` will not contain a permission request." | Present-tense statement of a condition that no longer exists |
| §6 point 4 | 232 | "The documentation gap compounds the config gap... the operator has no standard path to fulfill it because the `.sppkg` does not request the permission." | Present-tense statement of a resolved gap |
| §6 point 5 | 234 | "There is no evidence of an intentional alternate design." | Moot — the standard design is now implemented |
| Appendix row 1 | 293 | "No `webApiPermissionRequests` in solution config" | Evidence row describes pre-fix state without qualification |

**Recommended fix:** Content replacement. §1, §2, and §6 need rewriting to reflect current truth. The historical evidence can be preserved in past-tense or moved to a "Pre-fix baseline" subsection, but the present-tense assertions must be corrected. The Appendix evidence index row 1 should reflect current state.

### 2.2 Permission input freeze — minor staleness

**File:** `docs/architecture/reviews/project-setup-gap-1-permission-input-freeze.md`

| Section | Line(s) | Stale Content | Problem |
|---------|---------|---------------|---------|
| §6 item 1 | 136 | "Deferred to Prompt 2" | Prompt 2 did not implement parameterization; correct status is "Deferred" (as stated in the closure record) |
| §5 Evidence Index row | 125 | "No `webApiPermissionRequests` in current config" | Pre-fix evidence label; the declaration now exists |
| §7 | 144 | "frozen for use by Prompt 2" | Forward-looking language that is now historical; Prompt 2 has executed |

**Recommended fix:** Small edits. Update the deferred-to reference, qualify the evidence row as "pre-fix baseline," and change forward-looking language to past tense.

---

## 3. Cross-Document Staleness

### 3.1 Phase 5 Deployment Runbook

**File:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md`

| Line(s) | Stale Content | Problem |
|---------|---------------|---------|
| ~41 | `- [ ] SPFx API access request approved in SharePoint admin center` | Does not mention that the `.sppkg` now declares `webApiPermissionRequests` and the approval request surfaces automatically upon deployment. Language implies a manual request submission process. |

**Recommended fix:** Small edit. Update the checklist item to clarify the flow: deploy `.sppkg` → request surfaces in admin center → admin approves on API access page.

### 3.2 Phase 5 Production Readiness Signoff

**File:** `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Production-Readiness-Signoff.md`

| Line(s) | Stale Content | Problem |
|---------|---------------|---------|
| ~57 | `D6 \| SPFx API access approved in SP admin center \| IT / SharePoint admin \| Pending` | Same issue as runbook — does not clarify the manifest-declared approval flow |
| ~98 | `SPFx API access approved \| Phase-4_CORS-Permissions-Connected-Services.md` | Cross-reference lacks manifest context |

**Recommended fix:** Small edits. Update D6 description and cross-reference to reflect the standard `.sppkg`-declared approval flow.

---

## 4. Parameterization-Related Doc Gaps

The `resource` value `hb-intel-api-staging` is hardcoded in the source config. The following documents mention this value or the parameterization follow-on but vary in how completely they explain it:

| Document | Mentions parameterization? | Consistency |
|----------|--------------------------|-------------|
| Gap validation report §7.4 | Yes — "Deferred" | Consistent |
| Gap validation report §8 Q3 | Yes — "Deferred" | Consistent |
| Permission input freeze §6 item 1 | Yes — but says "Deferred to Prompt 2" | **Stale** — should say "Deferred" |
| Closure record §7 item 1 | Yes — "Low priority, not blocking" | Consistent |
| Build verification §2.1 | No — just shows `hb-intel-api-staging` | Acceptable — verification doc, not architecture doc |
| Connected-service-posture | Shows `hb-intel-api-staging` | Acceptable — reflects current config truth |

**Recommended fix:** Only the permission input freeze needs updating (covered in §2.2 above). All other docs are consistent.

---

## 5. Recommended Edit Order

| Order | File | Effort | Type |
|-------|------|--------|------|
| 1 | Gap validation report | **Medium** — content replacement in §1, §2, §6, Appendix | Rewrite stale body sections to reflect current truth while preserving historical evidence context |
| 2 | Permission input freeze | **Small** — 3 line-level edits | Update deferred reference, evidence label, forward-looking language |
| 3 | Phase 5 Deployment Runbook | **Small** — 1 checklist item edit | Clarify SPFx permission approval flow |
| 4 | Phase 5 Production Readiness Signoff | **Small** — 2 line-level edits | Clarify D6 and cross-reference |

---

## 6. Frozen Cleanup Scope

The following scope is frozen for the cleanup prompts:

### In scope

1. **Gap validation report body reconciliation** — rewrite §1 (repo evidence), §2 (packaging-path evidence), §6 (verdict justification), and Appendix to reflect post-fix truth. Preserve historical evidence as clearly labeled baseline context, not as current assertions.
2. **Permission input freeze minor updates** — correct the deferred-to reference, qualify the pre-fix evidence row, convert forward-looking language to past tense.
3. **Phase 5 Deployment Runbook** — update SPFx API permission checklist item with manifest-declared approval flow.
4. **Phase 5 Production Readiness Signoff** — update D6 prerequisite and cross-reference with manifest-declared approval flow.

### Out of scope

- Phase 8 remediation report (already reconciled in P9-G1-04)
- Connected-service-posture (already reconciled in P9-G1-04)
- Build verification record (clean)
- Implementation closure record (clean)
- IT setup guide (follow-on item, not a consistency gap)
- Build-time parameterization implementation (deferred, documented)
- General auth, RBAC, or provisioning refactors
- Unrelated Phase 5 stale references (e.g., "system-assigned MI" in the signoff doc — this is a P8-05 concern, not Gap 1)

---

## 7. Reconciliation Completion Note (P10-02)

> **Date:** 2026-04-01

### Files changed

| File | Edit type |
|------|-----------|
| `docs/architecture/reviews/project-setup-spfx-permission-declaration-gap-validation.md` | Content replacement — §1 (repo evidence), §2 (packaging-path evidence), §6 (verdict justification), Appendix row 1 |
| `docs/architecture/reviews/project-setup-gap-1-permission-input-freeze.md` | Small edits — §6 deferred reference, §5 evidence label, §7 forward-looking language |
| `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Deployment-Runbook.md` | Small edit — SPFx API permission checklist item |
| `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-5/Phase-5_Production-Readiness-Signoff.md` | Small edits — D6 prerequisite and cross-reference |
| `docs/architecture/reviews/project-setup-gap-1-final-reconciliation-audit.md` | This completion note added |

### Contradictions resolved

1. **Gap validation report body vs verdict** — §1, §2, §6 no longer describe the gap in present tense as an active defect. Body sections now reflect post-fix truth with historical baseline clearly labeled.
2. **Evidence index staleness** — Appendix row 1 in validation report and §5 evidence row in input freeze doc updated from pre-fix assertions to qualified historical references.
3. **Phase 5 deployment docs** — SPFx API permission items in the Deployment Runbook and Production Readiness Signoff now describe the manifest-declared approval flow instead of implying a manual request submission process.
4. **Forward-looking language in input freeze** — §7 decision freeze statement converted from future tense ("frozen for use by Prompt 2") to past tense ("frozen in P9-G1-01 and implemented in P9-G1-02").

### Historical context preserved

- Gap validation report §1.1 retains a clearly labeled "Pre-fix baseline (historical)" block showing the pre-fix state.
- Gap validation report §6 retains the original verdict reasoning with resolved items marked using strikethrough and resolution notes.

### Final open follow-on item

**Build-time parameterization of `webApiPermissionRequests` values** — the `resource` display name (`hb-intel-api-staging`) is currently a static staging default. If multi-environment builds require different app registration display names, the build orchestrator can template this value via environment variables, similar to `API_AUDIENCE`. This is a deferred enhancement, not a reopened Gap 1 defect. Consistently described across: gap validation report §7.4, §8 Q3; permission input freeze §6, §7; closure record §7 item 1.
