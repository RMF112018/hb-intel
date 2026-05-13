# Prompt 03 — Reconcile Outline Sections 6, 8, and 25 with B07 Validation Contract

## 1. Objective

Update the comprehensive outline so Sections:
- **6. Communication Site Hosting and SharePoint Deployment Contract**
- **8. Packaging and Runtime Registration Contract**
- **25. Validation Matrix and Definition of Done**

visibly inherit B07’s closed validation/evidence posture.

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

# 3. Required Section 6 outcome

Section 6 must state all of the following:

1. **Hosted proof is mandatory**
   - actual SharePoint communication-site validation is required,
   - workbench/local/package-only confidence is not final acceptance.

2. **Target hosted page must be locked**
   - record the final page URL before live evidence execution,
   - distinguish production acceptance page from any separate review-state page.

3. **Full-width host-fit validation**
   - final hosted validation must prove layout on the communication-site host class,
   - full-width fit, no clipping, no overflow, and page-chrome interaction belong in acceptance.

4. **Production-host vs. review-state-host distinction**
   - production-host lane proves real deployment and package wiring,
   - conditional review-state lane proves deterministic empty/auth/degraded UI states without depending on real live queue conditions.

---

# 4. Required Section 8 outcome

Section 8 must reflect:

1. **Existing repo truth**
   - My Dashboard package/orchestrator baseline already exists,
   - `supportsFullBleed: true` is already present in manifest truth,
   - package version surfaces exist and must remain governed.

2. **Runtime proof split**
   - runtime marker identity proves family/ID,
   - runtime package version proof is a separate requirement,
   - final hosted acceptance requires that version seam before version-level hosted proof is claimed.

3. **Expected package version input**
   - include `MY_DASHBOARD_EXPECTED_PACKAGE_VERSION` or equivalent closed posture from B07.

4. **Critical runtime path expansion**
   - the package-truth critical path list is scaffold-focused in current repo truth,
   - current main now includes shell/navigation/hero runtime,
   - therefore expanding package-truth coverage is an immediate downstream implementation need, not a purely hypothetical future concern.

5. **No overclaim**
   - package build proof is necessary but insufficient for hosted acceptance.

---

# 5. Required Section 25 outcome

Section 25 must materially reflect B07’s layered validation doctrine and strict Definition of Done.

At minimum, include or preserve:
- model/fixture tests,
- shell state/navigation tests,
- shell/hero semantic tests,
- UI component/source-state tests,
- frontend API client/factory tests,
- backend route tests,
- provider/adapter tests,
- B06 operational resilience tests,
- package-truth proof checks,
- hosted Playwright evidence,
- conditional hosted review-state evidence,
- final DoD requiring code/test + package-truth + deployment readiness + hosted evidence + sanitized curated proof.

Section 25 does not need to duplicate every B07 matrix row verbatim, but it must preserve the complete acceptance intent.

---

# 6. Strict constraints

Do not:
- modify Sections 26 or 27 in this prompt,
- rewrite B07,
- invent runtime implementation that does not exist,
- claim hosted evidence has already been produced,
- modify runtime code.

---

# 7. Validation requirements

```bash
rg -n "hosted|communication site|full-width|target page|review-state|production-host" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "runtime package version|runtimeMarkerId|MY_DASHBOARD_EXPECTED_PACKAGE_VERSION|critical runtime|package-truth" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md

rg -n "Validation Matrix|Definition of Done|hosted Playwright|package-truth|conditional hosted|curated evidence|provider|adapter|resilience" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

Perform a manual reading check confirming that Section 6, Section 8, and Section 25—not merely unrelated sections—carry the B07 posture.

---

# 8. Proof of closure

Report:
- Section 6 changes,
- Section 8 changes,
- Section 25 changes,
- validation results.

---

# 9. Do not re-read files already in active context unless needed to confirm drift

Re-open only the exact outline sections and B07 reference needed for precise edits.
