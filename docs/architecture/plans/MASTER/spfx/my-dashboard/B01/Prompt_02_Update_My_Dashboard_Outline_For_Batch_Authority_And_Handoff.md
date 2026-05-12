# Prompt 02 — Update My Dashboard Outline for Batch Authority and Handoff

## 1. Objective

Update:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

so the umbrella outline clearly:
- defers to detailed B01/B02 batch artifacts,
- preserves B01 closed taxonomy decisions,
- prevents later sessions from using the outline to reopen or contradict developed batch guidance.

---

## 2. Why this work exists

The outline is still valuable as the master scaffold, but the repo now contains developed batch artifacts. Without an explicit authority note, later planning or implementation work can mistakenly treat the outline as the final, most detailed authority even where B01 or B02 now supersede it.

---

## 3. Current repo-truth problem or gap

The outline exists, and it already contains broad My Dashboard framing. But it does not sufficiently front-load:
- the folder’s batch authority model,
- B01’s authority for Sections 0–5,
- B02’s authority for its developed sections,
- the non-duplication boundary around Personal Work Hub / `@hbc/my-work-feed`.

---

## 4. Attached B01 authority / plan basis

B01 governs:
- product/taxonomy closure,
- repo-truth posture,
- My Work compatibility with existing HB Intel personal-work architecture,
- PCC / HB Homepage reference boundaries,
- Adobe Sign module distinction.

Update the outline to **inherit** B01, not paraphrase it loosely.

---

## 5. Exact files, folders, docs, and symbols to inspect

Primary file:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

Supporting references to inspect:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md
```

---

## 6. Required implementation outcome

The outline must gain:
1. a clear **batch authority posture** near the top,
2. a batch-artifact map table,
3. explicit precedence rules,
4. explicit incorporation of B01’s `@hbc/my-work-feed` / Personal Work Hub compatibility guardrail,
5. an explicit PCC `adobe-sign` vs. My Dashboard `adobe-sign-action-queue` distinction in a place readers will see before detailed implementation sections.

---

## 7. Detailed change instructions

### A. Add a “Batch Authority Posture” block near the document header
Place it after the initial metadata lines and before `# 0. Document Control`, or in the earliest location that keeps it highly visible.

It must state:
- the outline is an umbrella scaffold,
- developed batch artifacts are the detailed authority for their sections,
- live repo truth outranks the outline and the batch docs if implementation drift occurs.

### B. Add a batch artifact table
Include:

| Artifact | Developed authority |
|---|---|
| `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Sections 0–5 |
| `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md` | Sections 6, 7, 8, 14, and 19 |
| This outline | Umbrella scaffold and full-plan topic map |

### C. Update product positioning
Within the early executive/product-positioning area, add one concise bullet or row stating:

> **Personal Work Hub / `@hbc/my-work-feed`** = existing HB Intel personal-work architecture that My Dashboard must align with and must not silently duplicate or contradict.

Do not imply that My Dashboard replaces Personal Work Hub or that `@hbc/my-work-feed` is future-only.

### D. Strengthen B01 boundary language around Adobe Sign
Where the outline discusses PCC `adobe-sign` vs. My Dashboard `adobe-sign-action-queue`, keep the distinction explicit:
- PCC `adobe-sign` = project-context launch/reference concept,
- My Dashboard `adobe-sign-action-queue` = user-context action queue.

If the existing section already says this, refine only as needed for clarity and consistency with B01.

### E. Add one non-duplication guardrail in scope framing
Add a concise rule in the early scope/governance area:

> This initiative does not authorize a competing cross-module personal-work primitive beside `@hbc/my-work-feed`; later read-model/module decisions must preserve compatibility or explicitly justify a constrained boundary.

Keep this as a planning guardrail, not a runtime design.

### F. Preserve the outline’s purpose
Do not over-convert the outline into a batch artifact. It should remain a comprehensive topic map, now with correct authority framing.

---

## 8. What done looks like

Done means:
- a reader sees the batch authority posture before entering detailed sections,
- the outline directs them to B01/B02 rather than competing with those artifacts,
- B01’s My Work compatibility guardrail is visible in the outline,
- the Adobe Sign taxonomy is protected,
- no later-runtime detail is invented.

---

## 9. Strict constraints / prohibitions

Do not:
- rewrite B01,
- rewrite B02,
- use the outline update to implement B03+ decisions,
- modify runtime code,
- add speculative conclusions not supported by B01 or current repo truth.

---

## 10. Validation requirements

Run:

```bash
rg -n "Batch Authority|B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development|B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development|@hbc/my-work-feed|Personal Work Hub|adobe-sign-action-queue|live repo truth" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

---

## 11. Proof of closure

Report:
- sections modified,
- inserted authority table,
- inserted/updated My Work compatibility language,
- inserted/updated Adobe Sign distinction,
- validation result.

---

## 12. Commit/closeout expectations

Do not commit unless instructed.  
Prepare a summary suitable for a docs-focused commit.

---

## 13. Do not re-read files already in active context unless needed to confirm drift

Use active context efficiently. Re-open only the exact markdown files needed to apply the edits precisely.
