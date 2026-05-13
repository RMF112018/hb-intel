# 01 — B07 Repo-Truth Implementation Plan

## 1. Target end state

The final repo should make these facts unambiguous:

1. B07 already exists and is authoritative for its batch scope.
2. B07’s predecessor filename references match the live B05 artifact.
3. B07 preserves its original `9a1cef...` audit anchor while acknowledging current-main drift.
4. Current main already includes B03 shell/navigation/hero runtime, and B07 must not keep describing those seams as absent.
5. Current main still lacks hosted My Dashboard evidence/runtime-version proof, and those remain valid B07 validation requirements.
6. README and outline both surface B07 authority.

---

# 2. Exact files to update

## 2.1 B07 artifact
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B07_My_Dashboard_Validation_Evidence_And_Phase_Sequence_Development.md
```

### Required updates
1. Correct the stale B05 predecessor filename to:
   ```text
   B05_Adobe_Sign_Integration_Architecture_Development.md
   ```
2. Reconcile the repo-truth status sections so they distinguish:
   - original audit-anchor state at `9a1cef...`,
   - current `main` state after B03 runtime commits.
3. Replace/qualify stale statements that currently say:
   - the visible app body remains a B02 placeholder host,
   - My Work shell/navigation are not yet present.
4. Add/clarify that current main now includes:
   - `MyDashboardApp.tsx` mounting `MyWorkShell`,
   - My Work navigation registry,
   - shell state controller,
   - command-surface primary navigation,
   - hero band runtime.
5. Preserve still-valid B07 gaps:
   - hosted evidence lane absent,
   - runtime package-version proof seam absent,
   - package critical-runtime proof path expansion beyond the current scaffold list,
   - later read-model clients / surface router / Adobe queue card-module/evidence work remains pending where not yet present.
6. Upgrade B07’s package-truth follow-up framing:
   - critical runtime path expansion is no longer merely future-hypothetical; current main shell/runtime expansion now makes it a concrete next implementation need.

---

## 2.2 Dev-plan README
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

### Required updates
1. Extend the artifact index to include:
   - B04,
   - B05,
   - B06,
   - B07.
2. State B07’s authority scope:
   - Sections **25** and **26**,
   - hosted-validation refinements to Sections **6**, **8**, and **27**.
3. Refresh stale prose that implies only B01–B03 exist.
4. Preserve folder-level authority role; do not duplicate B07.

---

## 2.3 Comprehensive outline
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

### Required updates

#### A. Batch Authority Posture
Extend the authority table through B07.

#### B. Section 6
Reconcile hosting/deployment posture with B07:
- hosted communication-site proof is mandatory,
- target page URL must be locked before hosted evidence execution,
- production-host lane vs. conditional review-state lane distinction,
- full-width host-fit checks.

#### C. Section 8
Reconcile packaging/runtime proof posture:
- existing package/orchestrator baseline is repo truth,
- runtime marker exists but runtime package-version proof is absent,
- expected hosted version input (`MY_DASHBOARD_EXPECTED_PACKAGE_VERSION`) belongs in validation posture,
- critical runtime proof list must expand with the real runtime and is now immediately relevant.

#### D. Section 25
Replace or materially expand current validation text with B07’s layered validation matrix and Definition of Done.

#### E. Section 26
Replace or materially expand current phase sequence with B07’s dependency-gated sequence.

#### F. Section 27
Add B07 risk categories:
- local-only false confidence,
- package/runtime drift,
- runtime version not self-proving,
- critical runtime path list too narrow,
- clipping/overflow after navigation,
- screenshot false completeness,
- auth-state leakage,
- queue-content evidence leakage,
- deterministic state lane gaps,
- deployment page drift,
- permissions readiness gaps,
- evidence overclaiming.

#### G. B07-closed open items
If Section 29 or another outline area still treats any directly B07-closed validation decision as unresolved, remove or reframe it. Do not close unrelated B05/B06 items unless already settled by those batch artifacts.

---

# 3. Sequencing logic

| Prompt | Purpose | Dependency |
|---|---|---|
| Prompt 01 | Reconcile B07 artifact itself | None |
| Prompt 02 | Refresh README + outline authority posture | Prompt 01 recommended first |
| Prompt 03 | Reconcile Sections 6, 8, and 25 | Prompt 02 preferred |
| Prompt 04 | Reconcile Sections 26, 27, and B07-closed items | Prompt 03 preferred |
| Prompt 05 | Validate and close | All prior prompts |

---

# 4. What not to do

Do not:
- re-add B07,
- rename the B07 file,
- rename B05,
- modify runtime code,
- implement evidence lanes,
- change package versions/manifests,
- modify `tools/build-spfx-package.ts`,
- implement `runtimePackageVersion`,
- update app catalog or tenant settings,
- convert B07 into an implementation spec duplicate of the final comprehensive plan.

---

# 5. Intended final repo truth

After execution, a later developer should conclude:

1. B07 remains the authoritative validation/evidence/phase-sequencing batch.
2. Its original audit anchor is preserved, but its current repo-truth summary is no longer stale.
3. The live shell/navigation/hero runtime is acknowledged as already landed.
4. Hosted evidence/runtime-version/package-proof work remains a downstream implementation gate.
5. The README and outline accurately surface B07 authority.
