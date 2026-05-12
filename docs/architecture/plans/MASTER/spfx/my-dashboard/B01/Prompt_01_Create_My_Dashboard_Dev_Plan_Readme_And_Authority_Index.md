# Prompt 01 — Create My Dashboard Dev-Plan README and Authority Index

## 1. Objective

Create the missing folder-level authority/index README for:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/
```

This README must make the My Dashboard plan family self-explanatory for later planning batches and local implementation agents.

---

## 2. Why this work exists

The live repo already contains:
- the B01 foundation artifact,
- the B02 hosting/auth/runtime artifact,
- the umbrella comprehensive outline.

However, the folder lacks a local README / authority map. Without one, future agents can:
- misread the outline as overriding developed batch artifacts,
- fail to understand B01 vs. B02 scope,
- reopen closed taxonomy decisions,
- miss the “live repo truth first” hierarchy.

---

## 3. Current repo-truth problem or gap

Current folder state:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/
├── B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md
├── B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md
└── HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

Missing:
```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

---

## 4. Attached B01 authority / plan basis

Use B01 as the foundation authority for:
- My Dashboard product/domain boundary,
- My Work shell terminology,
- Adobe Sign Action Queue naming,
- PCC vs. My Dashboard separation,
- HB Homepage reference limitations,
- `@hbc/my-work-feed` / Personal Work Hub compatibility guardrail.

Do not broaden B01 into runtime implementation.

---

## 5. Exact files, folders, docs, and symbols to inspect

Inspect only what is necessary:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/
├── B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md
├── B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md
└── HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md
```

You may also inspect nearby repo documentation style if needed to keep headings/tables conventional, but do not broaden scope.

---

## 6. Required implementation outcome

Create:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

The README must:
1. identify the folder as the My Dashboard development-plan family,
2. define the local authority hierarchy,
3. describe the role of the outline, B01, and B02,
4. state that live repo truth outranks planning docs,
5. state that detailed batch artifacts outrank the outline for their developed sections,
6. summarize B01’s closed foundation decisions,
7. identify that B02 already exists and governs its own section set,
8. define how later B03–B08 work should inherit prior batches,
9. state that this folder is planning documentation, not runtime implementation code.

---

## 7. Detailed change instructions

Author the README with the following sections:

### A. Title
```md
# My Dashboard Development Plan — Authority Index
```

### B. Folder purpose
Briefly state that the folder houses the authoritative staged development-plan artifacts for HB Intel My Dashboard / My Work / Adobe Sign Action Queue.

### C. Authority hierarchy
Use a clear ordered list:
1. live repo truth,
2. applicable detailed batch artifact,
3. umbrella outline,
4. older or historical references.

### D. Artifact index table
Include at minimum:

| Artifact | Role |
|---|---|
| `HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md` | Umbrella scaffold / topic map |
| `B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development.md` | Authoritative Sections 0–5 foundation |
| `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md` | Authoritative detailed development for Sections 6, 7, 8, 14, and 19 |

### E. B01 closed foundation decisions
Summarize these explicitly:
- My Dashboard is standalone SPFx product/domain, not PCC extension.
- My Work is the user-facing operating shell/surface inside My Dashboard.
- Adobe Sign Action Queue is the first My Dashboard module.
- PCC is a shell-construction reference only.
- HB Homepage is a host-fit / shell-boundary reference only.
- `@hbc/my-work-feed` and Personal Work Hub already exist and must not be duplicated or silently contradicted.
- PCC `adobe-sign` and My Dashboard `adobe-sign-action-queue` remain distinct.

### F. Later batch inheritance rule
State:
- B03–B08 planning should read this README first,
- then live repo truth,
- then B01/B02 and the applicable later batch artifact,
- the outline cannot override a more detailed batch artifact.

### G. Scope boundary
Add a brief paragraph:
- these are planning docs,
- runtime implementation belongs to later code-agent execution packages,
- do not infer that the presence of B01/B02 means runtime app scaffolding already exists.

### H. Metadata/style
Use a simple metadata block if consistent with adjacent docs. Do not invent a new repo-wide classification scheme.

---

## 8. What done looks like

Done means:
- README exists at the exact path,
- it clearly indexes outline/B01/B02,
- it closes ambiguity about authority,
- it preserves the B01 taxonomy guardrails,
- it prepares downstream batches without adding runtime scope.

---

## 9. Strict constraints / prohibitions

Do not:
- modify runtime code,
- create `apps/my-dashboard`,
- modify B01 or B02 content during this prompt,
- rewrite the comprehensive outline during this prompt,
- add speculative future batch details,
- phrase authority rules as optional.

---

## 10. Validation requirements

Run:

```bash
test -f docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md

rg -n "B01_My_Dashboard_Foundation_Scope_And_Repo_Truth_Development|B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development|outline|live repo truth|Sections 0.?5|Sections 6" \
  docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/README.md
```

---

## 11. Proof of closure

Report:
- created file path,
- section headings added,
- confirmation that B01/B02/outline roles are explicitly mapped,
- validation output summary.

---

## 12. Commit/closeout expectations

Do not commit unless instructed by the user/session controller.  
Prepare a concise change summary suitable for a later commit.

---

## 13. Do not re-read files already in active context unless needed to confirm drift

Use current active context where still reliable. Re-open only when exact wording/path confirmation is necessary.
