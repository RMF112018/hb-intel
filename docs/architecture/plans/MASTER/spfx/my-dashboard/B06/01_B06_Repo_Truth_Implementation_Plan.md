# 01 — B06 Repo-Truth Implementation Plan

## 1. Target end state

The final repo should make these facts unambiguous:

- B06 is already present and authoritative for its developed scope.
- The My Dashboard dev-plan README indexes through B06.
- The comprehensive outline identifies B06 in its batch-authority posture.
- The outline reflects B06’s closed operational/security decisions.
- B06’s own predecessor file reference points to the actual B05 filename present on `main`.
- The outline’s open-items list no longer carries B06-closed decisions as unresolved.

---

# 2. Exact files to update

## 2.1 B06 artifact
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B06_My_Dashboard_Operational_Resilience_Security_And_Risk_Development.md
```

### Required change
Correct predecessor filename drift:
- replace the nonexistent long-form B05 filename reference with the live repo filename:
  ```text
  B05_Adobe_Sign_Integration_Architecture_Development.md
  ```
- apply this correction wherever the wrong B05 filename appears inside B06.

Do not rewrite B06 content beyond this direct repo-truth correction.

---

## 2.2 Dev-plan README
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

### Required changes
1. Extend the artifact index to include:
   - B04
   - B05
   - B06
2. State B06’s authority scope:
   - Sections **22**, **23**, and **27**
   - required refinements to **Section 18**
3. Refresh any stale wording that implies only B01–B03 exist.
4. Add a compact “developed coverage through B06” summary or equivalent authority explanation.
5. Keep the README a folder authority index, not a duplicate of B06.

---

## 2.3 Comprehensive outline
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

### Required changes

#### A. Batch Authority Posture table
Expand the table to include:
- B03
- B04
- B05
- B06

#### B. Section 18
Refine Section 18 to reflect B06 operational route/error taxonomy, including:
- 429 / throttling translation,
- refresh-token failure → `authorization-required`,
- sanitized provider-error posture,
- telemetry/correlation classification,
- B04 HTTP/source-state semantics remain intact.

#### C. Section 22
Reconcile to B06’s closed refresh/caching/staleness/throttling posture:
- no auto-polling,
- manual refresh only in focused Adobe module,
- no durable queue cache,
- no persistent queue replay,
- freshness semantics,
- bounded retry / `Retry-After`,
- webhooks future-state only.

#### D. Section 23
Reconcile to B06’s security/privacy/telemetry posture:
- backend-only token material,
- prohibited telemetry fields,
- UI DTO vs. telemetry distinction,
- sanitized error-message requirement,
- evidence hygiene and queue-content restrictions.

#### E. Section 27
Upgrade the risk section so it reflects B06’s implementation-grade risk categories, at minimum:
- OAuth readiness,
- token storage/secrecy,
- provider error leakage,
- principal mapping,
- stale-data misrepresentation,
- throttling/retry amplification,
- unsafe source links,
- telemetry/evidence privacy leakage.

#### F. Section 29 open items
Remove or rewrite as closed the B06-resolved items:
- final backend source-unavailable transport choice,
- final backend queue cache posture.

If other open items remain outside B06 scope, leave them unless a prior batch’s already-implemented repo docs have explicitly closed them.

---

# 3. Sequencing logic

| Prompt | Purpose | Dependency |
|---|---|---|
| Prompt 01 | Correct B06 predecessor filename + refresh README | None |
| Prompt 02 | Update outline authority posture through B06 | Prompt 01 recommended first |
| Prompt 03 | Reconcile Section 18 | Prompt 02 preferred |
| Prompt 04 | Reconcile Sections 22/23/27 + prune open items | Prompt 03 preferred |
| Prompt 05 | Validate and close | All prior prompts |

---

# 4. What not to do

Do not:
- re-add B06,
- rename the B06 file,
- rename the B05 file,
- rewrite B05 as part of B06,
- modify runtime source code,
- implement telemetry or retry logic,
- create new tests,
- change manifests, packages, or lockfiles,
- expand the outline into a full duplicate of the detailed B06 artifact.

---

# 5. Intended final repo truth

After execution, a later developer should conclude:

1. B06 is the detailed operational/security/risk authority.
2. The outline is synchronized enough to avoid contradictory implementation cues.
3. The dev-plan README reflects the current artifact set through B06.
4. The B06 artifact points to the actual B05 predecessor file.
5. B06-closed decisions are not reopened by the outline’s open-items list.
