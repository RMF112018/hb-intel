# Prompt 04 — Reconcile Outline Sections 26, 27, and B07-Dependent Closure Items

## 1. Objective

Update the comprehensive outline so:
- **Section 26. Development Phase Sequence**
- **Section 27. Risk Exposure Register**

inherit B07’s validation-first, dependency-gated posture, and remove/reframe any directly B07-closed unresolved items if present.

---

# 2. Exact file to update

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

Reference:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
```

---

# 3. Required Section 26 outcome

Replace or materially expand the current phase sequence with B07’s dependency-gated model.

At minimum, preserve these principles:
- scope lock and validation architecture adoption before downstream prompts,
- model/fixture contracts before backend/provider implementation,
- shell/runtime/state work before hosted shell validation,
- package/runtime proof before hosted acceptance,
- SharePoint deployment readiness before hosted production evidence,
- hosted evidence before final Done declaration,
- conditional/operator-pending gaps must be documented rather than masked,
- some workstreams may run in parallel, but key gates may not be shortcut.

The outline may summarize B07’s phase model rather than reproducing every line, but it must preserve the dependency logic and closeout gates.

---

# 4. Required Section 27 outcome

Section 27 must add or materially strengthen B07’s validation/evidence risk categories:

| Risk family | Required treatment |
|---|---|
| Local-only false confidence | Hosted communication-site proof required |
| Package/runtime drift | Package truth + hosted runtime proof |
| Runtime version not self-proving | Version seam required before final hosted acceptance |
| Critical runtime path list too narrow | Expand as runtime evolves |
| Horizontal clipping after navigation | Structural bounds/overflow checks |
| Screenshot false completeness | Screenshot + DOM metrics, not images alone |
| Auth/session artifact leakage | External storage state + unsafe artifact redaction |
| Live queue-content evidence leakage | No real queue row curation |
| Deterministic state lane absent | Conditional review-state lane or operator-pending |
| Deployment page drift | Exact page URL authority |
| Permissions not approved | Deployment-readiness gate |
| Evidence overclaiming | Review-support disclaimer posture |

---

# 5. B07-dependent closure items

Search the outline for directly B07-related unresolved decision language. Examples may include:
- final hosted validation lane,
- final Definition of Done,
- final evidence strategy,
- final phase sequencing,
- runtime-version proof posture.

If such items exist:
- remove them, or
- reframe them as closed by B07 with any remaining implementation action explicitly identified.

Do **not** use this prompt to close unrelated OAuth, token-store, urgency-window, or pagination items unless those were already closed by other batch artifacts and are directly contradicted here.

---

# 6. Strict constraints

Do not:
- modify Sections 6, 8, or 25 in this prompt,
- rewrite B07,
- add runtime implementation,
- overstate evidence as already generated,
- conflate B07 validation work with Adobe implementation work.

---

# 7. Validation requirements

```bash
rg -n "dependency-gated|Gate|Phase 0|Phase 10|hosted evidence|operator-pending|package-truth" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "local-only false confidence|package/runtime drift|runtime version|critical runtime|clipping|screenshot false|auth-state|queue-content|deployment page drift|permission|overclaim" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

Search unresolved-item language and report whether any B07-closed items were found and cleaned up:
```bash
rg -n "final hosted validation|final Definition of Done|final evidence|final phase sequence|runtime version proof" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

# 8. Proof of closure

Report:
- Section 26 changes,
- Section 27 changes,
- B07-dependent closure-item cleanup result,
- validation results.

---

# 9. Do not re-read files already in active context unless needed to confirm drift

Use the B07 and outline sections currently in context wherever possible.
