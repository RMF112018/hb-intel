# Project Sites Legacy Fallback — Unified Package

## Purpose

This package combines the enhanced audit package and the enhanced remediation prompt package into one repo-truth-aligned handoff set for the `project-sites` legacy fallback integration lane.

It is intended to be the single package you hand to a local code agent working against the live local clone of `RMF112018/hb-intel`.

## What this unified package contains

This package merges two previously separate outputs:

1. **Audit Package** — the repo-truth assessment of the current `project-sites` legacy fallback lane, including findings, architecture sufficiency, closure sequencing, and validation expectations.
2. **Remediation Prompt Package** — the ordered implementation prompts that direct a local code agent to close the lane one issue at a time.

## Bottom line

The live repo already contains a **partial bridge**, not a clean-slate gap.

The correct remediation posture is:
- complete the existing bridge into a true merged-source access surface
- preserve already-working launch-state and card behavior
- close the missing seams that still prevent fallback-only legacy records from surfacing and behaving truthfully

## Most important repo-truth conclusions

- The current implementation is still **`Projects`-first with fallback enrichment**, not a true merged-source resolver.
- The current repository only decorates existing `Projects` rows with fallback data and does not emit **synthetic legacy-only rows**.
- The normalized contract and UI already support fallback-aware launch behavior, so the remediation should focus on **architectural completion**, not wholesale replacement.
- The prompt count increased because the live repo requires additional explicit closure lanes for merged identity, browse authority, truthfulness, and regression proof.

## Package structure

### `/Audit-Package`

Contains the enhanced audit files:

- `00-Audit-Summary.md`
- `01-Package-vs-Repo-Truth-Comparison.md`
- `02-Current-Implementation-Map.md`
- `03-Expanded-Findings-Register.md`
- `04-Architecture-Sufficiency-and-Seam-Assessment.md`
- `05-Closure-Priority-Sequence.md`
- `06-Prompt-Package-Basis-and-Issue-Mapping.md`
- `07-Research-Basis-and-Implementation-Implications.md`
- `08-Validation-Matrix.md`

### `/Remediation-Prompt-Package`

Contains the ordered remediation package:

- `Plan-Summary.md`
- `Prompt-01-Establish-Merged-Record-Identity-and-Contract.md`
- `Prompt-02-Build-Consumer-Side-Fallback-Registry-Adapter.md`
- `Prompt-03-Implement-Merged-Resolver-and-Synthetic-Legacy-Only-Emission.md`
- `Prompt-04-Rework-Browse-Authority-Year-Gating-and-Fallback-Inclusive-Empty-Paths.md`
- `Prompt-05-Refactor-Hook-Normalization-and-Launch-Target-Consumption.md`
- `Prompt-06-Add-Source-Aware-Filtering-Search-and-Facets.md`
- `Prompt-07-Correct-User-Facing-Truthfulness-in-Root-States-and-Action-Copy.md`
- `Prompt-08-Add-Merged-Source-Regression-Coverage.md`
- `Prompt-09-Refresh-Comments-Docs-and-Architecture-Notes.md`
- `Prompt-10-Optional-Provenance-and-Support-Diagnostics-Hardening.md`

## Recommended use order

1. Read `/Audit-Package/00-Audit-Summary.md`
2. Read `/Audit-Package/05-Closure-Priority-Sequence.md`
3. Read `/Audit-Package/06-Prompt-Package-Basis-and-Issue-Mapping.md`
4. Read `/Remediation-Prompt-Package/Plan-Summary.md`
5. Execute the prompt files in numeric order

## Execution posture for the local code agent

- Work against the live local repo, not earlier package assumptions.
- Treat `packages/spfx/src/webparts/projectSites/**` as the primary active consumer lane.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Make no unrelated changes.
- Prove closure after each prompt before moving to the next.
- Do not introduce new runtime dependencies unless repo truth proves they are required.

## Non-negotiable closure standard

The work is not complete until all of the following are true:

- approved fallback-only records can surface as cards
- merged and legacy-only entries have stable unique keys
- approved linkage can outrank weaker heuristic joins where repo truth supports it
- year/scope authority can represent fallback-inclusive inventory
- empty/error/context copy is truthful for a merged-source surface
- regression coverage proves the bridge in the real cases that matter
