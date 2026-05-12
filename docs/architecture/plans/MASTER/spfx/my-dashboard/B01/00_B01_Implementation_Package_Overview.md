# 00 — B01 Implementation Package Overview

## Objective

Implement the **remaining repository documentation alignment work** required for:

```text
B01 — HB Intel My Dashboard Foundation, Scope, and Repo-Truth Development
```

The implementation objective is not to create a runtime My Dashboard app. The live repository already contains the B01 batch artifact. The needed work is to make the surrounding repo documentation **durably inherit B01** and stop active docs from contradicting B01’s repo-truth conclusions.

---

## Why B01 is a documentation/planning implementation batch

B01 closes product-boundary and taxonomy questions that later implementation batches must inherit:

- **My Dashboard** = standalone SPFx product/domain.
- **My Work** = user-facing operating shell/surface inside My Dashboard.
- **Adobe Sign Action Queue** = first My Dashboard module.
- **PCC** = shell-construction reference, not product owner.
- **HB Homepage** = communication-site host-fit / shell-boundary reference, not My Work shell family.
- **`@hbc/my-work-feed`** and **Personal Work Hub** already exist and must not be duplicated or contradicted.
- PCC `adobe-sign` and My Dashboard `adobe-sign-action-queue` must remain distinct.

These are planning/governance decisions. They need to be reflected in repo authority seams before later code implementation expands further.

---

## Key repo-truth findings that shape this package

### Finding 1 — B01 is already present on live `main`
The canonical B01 batch artifact already exists in:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/
```

The same folder also contains:
- the comprehensive outline, and
- the B02 detailed planning artifact.

### Finding 2 — The folder lacks a local README / authority index
A folder-level index is needed because multiple artifacts now coexist and carry different authority roles. Without it, later sessions can mistake the broad outline for the final authority or fail to understand how B01 and B02 relate.

### Finding 3 — The outline is not sufficiently batch-aware
The outline still reads as the broad master scaffold. It should now visibly state that:
- B01 governs Sections 0–5,
- B02 governs Sections 6, 7, 8, 14, and 19,
- batch artifacts outrank the outline for their developed sections,
- live repo truth outranks all planning docs.

### Finding 4 — A stale My Work contract still contradicts implemented truth
`docs/reference/workflow-experience/my-work-alignment-contract.md` still states that `@hbc/my-work-feed` does not exist and remains research-stage only. Current code, ADR-0115, SF29, the package README, the API reference, and the PWA My Work page contradict that statement.

### Finding 5 — Active docs still reference the stale alignment contract as if it remains a current authority
At minimum, active docs that still point readers toward that contract must be corrected or caveated:
- `docs/reference/work-hub/runway-definition.md`
- `docs/reference/provisioning/work-hub-publication-contract.md`
- `docs/reference/workflow-experience/primitive-integration-checklist.md`

### Finding 6 — Active SF29 docs contain ADR-number drift
The live repo contains:
- accepted My Work Feed ADR: `ADR-0115-my-work-feed-architecture.md`
- a different ADR-0114 that is unrelated to My Work Feed.

However, active SF29 planning docs still reference a nonexistent My Work `ADR-0114`. This is a real authority-chain defect and should be corrected while B01 My Work authority alignment is being hardened.

---

## Required package structure

This package intentionally separates:
1. the implementation plan,
2. the authority map,
3. the validation requirements,
4. the issue register,
5. the code-agent prompts.

This prevents a local code agent from improvising file scope or collapsing unrelated doc changes into one vague task.

---

## Closure standard

B01 implementation is closed only when the repo has:

1. a folder-level My Dashboard planning README/index,
2. an outline that defers to batch authority properly,
3. a superseded/archival marker on the stale My Work alignment contract,
4. corrected active cross-references to that stale contract,
5. corrected active SF29 ADR references,
6. validation proof that these changes landed,
7. no runtime code or premature B02–B08 implementation.
