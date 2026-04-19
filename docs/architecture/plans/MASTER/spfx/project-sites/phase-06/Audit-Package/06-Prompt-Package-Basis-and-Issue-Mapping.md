# 06 — Prompt Package Basis and Issue Mapping

## Why the prompt count increases

The attached prompt package had eight prompts.

The replacement package increases the count because the live repo needs narrower issue boundaries for safe closure:

1. merged identity is its own issue
2. fallback adapter shape is its own issue
3. resolver/emission is its own issue
4. browse authority and year gating are their own issue
5. hook/normalizer consumption is its own issue
6. source-aware filtering/search is its own issue
7. user-facing truthfulness is its own issue
8. regression coverage is its own issue
9. comments/docs drift is its own issue
10. optional provenance hardening remains optional

This is a repo-driven increase, not arbitrary prompt inflation.

---

## Mapping from old package to replacement package

### Old Prompt-01 — Build Merged-Source Contract and Fallback Descriptor Seams
Replaced by:
- new Prompt-01 — merged record identity and contract
- new Prompt-02 — fallback registry adapter seam

Reason:
the old prompt bundled two separable concerns.

---

### Old Prompt-02 — Dedicated Merge Resolver and Synthetic Legacy-Only Entries
Replaced by:
- new Prompt-03 — resolver and synthetic emission

Reason:
directionally correct already, but the new prompt sharpens approved-linkage precedence and duplicate suppression requirements.

---

### Old Prompt-03 — Rework Dual-Source Scope and Available-Years Authority
Replaced by:
- new Prompt-04 — browse authority and year gating

Reason:
same core idea, but the new prompt explicitly includes root-surface gating and fallback-only availability proof.

---

### Old Prompt-04 — Refactor Hook and UI Consumption to Operate on Merged Records
Replaced by:
- new Prompt-05 — hook / normalization / launch-target consumption

Reason:
kept, but narrowed so the hook does not become a hidden resolver.

---

### Old Prompt-05 — Add Source-Aware Filter, Search, and Truthful Launch UX
Replaced by:
- new Prompt-06 — source-aware filtering/search/facets
- new Prompt-07 — user-facing truthfulness

Reason:
the old prompt bundled two distinct closure concerns.

---

### Old Prompt-06 — Add Merged-Source Regression Coverage
Replaced by:
- new Prompt-08 — regression coverage

Reason:
same category, stronger proof requirements.

---

### Old Prompt-07 — Refresh Docs, Comments, and User-Support Copy
Replaced by:
- new Prompt-07 — user-facing truthfulness
- new Prompt-09 — comments/docs refresh

Reason:
user-visible truth and maintainer docs should not be merged into one vague late-stage cleanup task.

---

### Old Prompt-08 — Optional Provenance and Support Diagnostics Hardening
Replaced by:
- new Prompt-10 — optional provenance/support diagnostics hardening

Reason:
still optional, but now explicitly constrained behind core closure.

---

## Issue-to-prompt matrix

- P0-01 → Prompt-03, Prompt-04, Prompt-08
- P1-02 → Prompt-01, Prompt-03, Prompt-08
- P1-03 → Prompt-03, Prompt-08
- P1-04 → Prompt-04, Prompt-08
- P1-05 → Prompt-03, Prompt-04
- P2-06 → Prompt-02, Prompt-03
- P2-07 → Prompt-05
- P2-08 → Prompt-06
- P2-09 → Prompt-07
- P2-10 → Prompt-08
- P3-11 → Prompt-09
- P3-12 → Prompt-10
