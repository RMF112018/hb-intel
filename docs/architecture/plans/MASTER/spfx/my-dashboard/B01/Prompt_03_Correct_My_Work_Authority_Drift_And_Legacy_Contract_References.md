# Prompt 03 — Correct My Work Authority Drift and Legacy Contract References

## 1. Objective

Resolve the live documentation contradiction around My Work Feed by:
1. clearly superseding the stale alignment contract,
2. correcting active references that still route readers toward that contract as if it were current,
3. removing active wording that falsely frames My Work implementation as future-only.

---

## 2. Why this work exists

B01 explicitly identifies that:

```text
docs/reference/workflow-experience/my-work-alignment-contract.md
```

still says `@hbc/my-work-feed` does not exist and is research-stage only.

That is no longer true. Current repo truth includes:
- accepted ADR-0115,
- SF29 master plan,
- implemented `@hbc/my-work-feed` package documentation,
- API reference,
- PWA My Work page runtime.

Leaving the stale contract unmarked creates a direct repo-truth contradiction that can mislead downstream My Dashboard work.

---

## 3. Current repo-truth problem or gap

### Direct contradiction
The stale alignment contract says:
- `@hbc/my-work-feed` does not exist,
- no code implementation is permitted.

### Current truth
The repo now has:
- `docs/architecture/adr/ADR-0115-my-work-feed-architecture.md`
- `docs/architecture/plans/shared-features/SF29-My-Work-Feed.md`
- `packages/my-work-feed/README.md`
- `docs/reference/my-work-feed/api.md`

### Active cross-reference drift
These active docs still mention the old contract in a way that can read as current:
- `docs/reference/work-hub/runway-definition.md`
- `docs/reference/provisioning/work-hub-publication-contract.md`
- `docs/reference/workflow-experience/primitive-integration-checklist.md`

---

## 4. Attached B01 authority / plan basis

B01 directs later work to:
- treat the old alignment contract as stale relative to current repo truth,
- use ADR-0115 / SF29 / package docs / API reference as authority,
- avoid reintroducing “future only” My Work language.

Implement exactly that correction.

---

## 5. Exact files, folders, docs, and symbols to inspect

### Files to update
```text
docs/reference/workflow-experience/my-work-alignment-contract.md
docs/reference/work-hub/runway-definition.md
docs/reference/provisioning/work-hub-publication-contract.md
docs/reference/workflow-experience/primitive-integration-checklist.md
```

### Current authority references to inspect and cite in changed language
```text
docs/architecture/adr/ADR-0115-my-work-feed-architecture.md
docs/architecture/plans/shared-features/SF29-My-Work-Feed.md
packages/my-work-feed/README.md
docs/reference/my-work-feed/api.md
```

---

## 6. Required implementation outcome

After editing:
1. no reader should mistake `my-work-alignment-contract.md` for current normative authority,
2. active docs should refer to it only as legacy/superseded archival context if they retain the link at all,
3. the primitive integration checklist should describe cross-module work aggregation as conflicting with **implemented `@hbc/my-work-feed` authority**, not with a future feature.

---

## 7. Detailed change instructions

## A. Supersede the stale alignment contract

### File
```text
docs/reference/workflow-experience/my-work-alignment-contract.md
```

### Required modifications
1. Replace or revise the top classification so it no longer claims to be current canonical normative authority.
2. Add a prominent supersession block immediately after the title/header area.

Use language substantively equivalent to:

> **Supersession notice — 2026-05-12**  
> This document preserves a pre-SF29 alignment posture and is retained only for historical provenance. It is **not** a current implementation authority. Current My Work Feed authority is established by `ADR-0115-my-work-feed-architecture.md`, `SF29-My-Work-Feed.md`, `packages/my-work-feed/README.md`, and `docs/reference/my-work-feed/api.md`. Any statement below that `@hbc/my-work-feed` does not exist or remains research-stage only is superseded.

3. Preserve the historical body below the banner unless a small wording change is absolutely required for heading consistency. Do **not** rewrite the whole archival document.

---

## B. Correct `runway-definition.md`

### File
```text
docs/reference/work-hub/runway-definition.md
```

### Required modification
In the related-docs list, replace the current alignment-contract description with a clearly legacy/superseded label.

Target posture:
- retain the link only as archival context,
- state that it is not the current My Work Feed authority.

---

## C. Correct `work-hub-publication-contract.md`

### File
```text
docs/reference/provisioning/work-hub-publication-contract.md
```

### Required modification
At the “Key Source Files” section:
- remove the stale alignment contract from the role of active “key source file,”
- replace it with a concise legacy note immediately below the table or in a clearly labeled note block.

The note must state:
- the alignment contract is superseded archival context,
- current publication authority is the implemented My Work Feed architecture/docs.

---

## D. Correct `primitive-integration-checklist.md`

### File
```text
docs/reference/workflow-experience/primitive-integration-checklist.md
```

### Required modifications
1. In the “Package Boundary Drift Prevention” table, update the rationale:

Old posture:
```text
Conflicts with future My Work implementation
```

New posture:
```text
Conflicts with implemented `@hbc/my-work-feed` ownership of cross-module work aggregation
```

2. In the “Related reference documents” section, revise the My Work Alignment Contract entry so it is explicitly:
- legacy,
- superseded,
- archival only,
- not current My Work Feed authority.

---

## 8. What done looks like

Done means:
- stale contract visibly self-identifies as superseded,
- active docs do not point to it as current authority,
- primitive checklist no longer speaks as though My Work Feed is future-only,
- current My Work authority references are unambiguous.

---

## 9. Strict constraints / prohibitions

Do not:
- delete the stale alignment contract,
- rewrite archive plans,
- alter runtime My Work code,
- change My Dashboard B01/B02 docs in this prompt,
- make broad opportunistic doc cleanup beyond the specified files.

---

## 10. Validation requirements

Run:

```bash
rg -n "Superseded|Archived|Supersession notice|ADR-0115|SF29-My-Work-Feed|packages/my-work-feed/README.md|docs/reference/my-work-feed/api.md" \
  docs/reference/workflow-experience/my-work-alignment-contract.md

rg -n "Legacy My Work Alignment Contract|superseded archival|ADR-0115|@hbc/my-work-feed" \
  docs/reference/work-hub/runway-definition.md \
  docs/reference/provisioning/work-hub-publication-contract.md \
  docs/reference/workflow-experience/primitive-integration-checklist.md

! rg -n "future My Work implementation" \
  docs/reference/workflow-experience/primitive-integration-checklist.md
```

---

## 11. Proof of closure

Report:
- exact files updated,
- the supersession language inserted,
- the active reference changes made,
- the checklist rationale correction,
- grep validation results.

---

## 12. Commit/closeout expectations

Do not commit unless instructed.  
Prepare a concise change summary suitable for inclusion in the final B01 closeout.

---

## 13. Do not re-read files already in active context unless needed to confirm drift

Use active context; re-open only the exact files being edited and the specific authority docs needed to confirm link labels.
