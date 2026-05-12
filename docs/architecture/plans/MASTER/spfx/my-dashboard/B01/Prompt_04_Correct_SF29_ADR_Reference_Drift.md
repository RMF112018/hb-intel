# Prompt 04 — Correct SF29 ADR Reference Drift

## 1. Objective

Correct active My Work Feed planning documents that still reference a nonexistent My Work `ADR-0114` path and normalize them to the actual accepted My Work Feed ADR:

```text
docs/architecture/adr/ADR-0115-my-work-feed-architecture.md
```

---

## 2. Why this work exists

The current repo has:
- `ADR-0115-my-work-feed-architecture.md` as the accepted My Work Feed ADR,
- a different ADR-0114 that is unrelated to My Work Feed.

However, active SF29 planning docs still refer to:
- `ADR-0114-my-work-feed.md`,
- “ADR-0114: My Work Feed,”
- verification commands expecting ADR-0114.

This is authority-chain drift. It should be corrected while B01 documentation truth is being hardened.

---

## 3. Current repo-truth problem or gap

### Incorrect references remain in:
```text
docs/architecture/plans/shared-features/SF29-My-Work-Feed.md
docs/architecture/plans/shared-features/SF29-T09-Testing-and-Deployment.md
```

### Current correct authority:
```text
docs/architecture/adr/ADR-0115-my-work-feed-architecture.md
```

---

## 4. Attached B01 authority / plan basis

B01 identifies ADR-0115 as the current My Work Feed architecture authority and depends on that truth for the My Dashboard non-duplication guardrail.

Correct the SF29 docs so they reinforce, rather than undercut, that authority chain.

---

## 5. Exact files, folders, docs, and symbols to inspect

Inspect and update:

```text
docs/architecture/plans/shared-features/SF29-My-Work-Feed.md
docs/architecture/plans/shared-features/SF29-T09-Testing-and-Deployment.md
```

Inspect for authority confirmation:

```text
docs/architecture/adr/ADR-0115-my-work-feed-architecture.md
docs/architecture/blueprint/current-state-map.md
```

---

## 6. Required implementation outcome

After editing:
- no active SF29 doc should point to `ADR-0114-my-work-feed.md`,
- no active SF29 doc should call the My Work Feed ADR “ADR-0114,”
- all active SF29 ADR references should identify ADR-0115 My Work Feed Architecture.

---

## 7. Detailed change instructions

## A. Update `SF29-My-Work-Feed.md`

### Required change
Replace the stale header line:

```text
ADR Required: docs/architecture/adr/ADR-0114-my-work-feed.md
```

with a current-state line such as:

```text
Architecture ADR: docs/architecture/adr/ADR-0115-my-work-feed-architecture.md
```

Use exact current file naming.

---

## B. Update `SF29-T09-Testing-and-Deployment.md`

Replace all stale My Work Feed ADR-0114 references, including:

1. Objective text:
   - change “ADR-0114” to “ADR-0115.”

2. 3-Line Plan:
   - change “Publish ADR-0114” to a closure posture consistent with an already authored/accepted ADR-0115, or revise to “Confirm ADR-0115 and required docs/index/state-map updates.”

3. Documentation checklist:
   - change the ADR path from:
     ```text
     docs/architecture/adr/ADR-0114-my-work-feed.md
     ```
     to:
     ```text
     docs/architecture/adr/ADR-0115-my-work-feed-architecture.md
     ```

4. Heading:
   - change:
     ```text
     ## ADR-0114: My Work Feed
     ```
     to:
     ```text
     ## ADR-0115: My Work Feed Architecture
     ```

5. File line under that heading:
   - use the actual ADR-0115 path.

6. Final `rg` verification command:
   - replace ADR-0114 token expectations with ADR-0115 token expectations.

Do not rewrite unrelated SF29 content.

---

## 8. What done looks like

Done means:
- SF29 master and T09 both identify ADR-0115 as the My Work Feed ADR,
- no stale ADR-0114 My Work path remains in those active docs,
- the correction matches current repo classification truth.

---

## 9. Strict constraints / prohibitions

Do not:
- rename actual ADR files,
- create a new ADR,
- edit unrelated SF29 task documents unless the exact same stale ADR string is found and the session controller approves broader scope,
- modify My Dashboard batch docs in this prompt,
- alter runtime package code.

---

## 10. Validation requirements

Run:

```bash
! rg -n "ADR-0114-my-work-feed|ADR-0114: My Work Feed|docs/architecture/adr/ADR-0114-my-work-feed.md" \
  docs/architecture/plans/shared-features/SF29-My-Work-Feed.md \
  docs/architecture/plans/shared-features/SF29-T09-Testing-and-Deployment.md

rg -n "ADR-0115-my-work-feed-architecture|ADR-0115: My Work Feed Architecture" \
  docs/architecture/plans/shared-features/SF29-My-Work-Feed.md \
  docs/architecture/plans/shared-features/SF29-T09-Testing-and-Deployment.md
```

---

## 11. Proof of closure

Report:
- stale ADR text removed,
- current ADR text added,
- files updated,
- validation output summary.

---

## 12. Commit/closeout expectations

Do not commit unless instructed.  
Include this correction in the final B01 closeout summary as an authority-chain hardening fix.

---

## 13. Do not re-read files already in active context unless needed to confirm drift

Use active context efficiently. Re-open only the two target SF29 docs and the current accepted ADR reference if exact wording must be confirmed.
