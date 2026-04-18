# Homepage Shell Wave 01 — Enhanced Replacement Package

## Purpose

This package replaces the attached Wave 01 prompt set with a repo-truth-validated sequence for correcting the flagship HB Central homepage experience on `main`.

This is not a cosmetic refresh of the prior package.

It is a narrower, deeper, better-scoped execution package built around what is **actually still open** in the live codebase.

## What changed from the attached Wave 01 package

The attached package was directionally correct, but it materially under-modeled current repo reality.

Most important corrections in this replacement package:

1. **Priority Actions is no longer treated as greenfield.**
   - The public rail already exists.
   - The SharePoint list readers already exist.
   - The admin authoring surface already exists.
   - The replacement package therefore focuses on **flagship-page cutover, condition alignment, and closure proof**, not on inventing the feature from scratch.

2. **Rail / shell alignment is no longer framed as a blank-slate problem.**
   - The live repo already contains a governance seam aligning rail device classes to shell entry-state vocabulary.
   - The open work is the remaining **runtime/device-condition mismatch**, especially reliance on coarse `window.innerWidth` buckets.

3. **Acceptance work is no longer framed as “add tests from nothing.”**
   - The shell already has policy and conformance tests.
   - The open work is integrated flagship acceptance proof across the real entry stack and real viewport states.

4. **First-lane recomposition is split into two prompts.**
   - One prompt defines the **content-state signal contract**.
   - One prompt implements the **promotion / demotion resolver**.
   - This avoids mixing contract design with orchestration behavior.

5. **Repo/document drift is treated as part of closure.**
   - Multiple docs still describe Priority Actions readers as pending even though those readers now exist.
   - The package requires cleanup of any touched docs so implementation truth and documentation truth match.

## Scope boundaries

Wave 01 remains limited to immediate flagship homepage correction:

- entry-stack vertical budget
- action-layer cutover on the flagship page
- shell / action-layer runtime alignment
- first-lane non-empty-first behavior
- integrated acceptance proof

This package does **not** expand into full preset-library growth, broad tenant control-panel delivery, or large product-composition decisions for WorkHub / SmartSearch beyond what is required for correct Wave 01 closure.

## Execution order

Run prompts in this order:

1. `Prompt-01-Entry-Stack-Vertical-Budget-and-Hero-Governance.md`
2. `Prompt-02-Flagship-Page-Action-Layer-Cutover-and-Proof.md`
3. `Prompt-03-PriorityActionsRail-Container-Aware-Alignment.md`
4. `Prompt-04-First-Lane-Content-State-Contract.md`
5. `Prompt-05-First-Lane-Recomposition-Resolver.md`
6. `Prompt-06-Integrated-Flagship-Acceptance-Proof.md`

## Dependency notes

- Prompt 01 establishes the vertical budget target the later prompts must preserve.
- Prompt 02 replaces the live flagship action layer and must finish before final acceptance proof.
- Prompt 03 hardens the rail’s runtime alignment and may affect Prompt 02 validation output.
- Prompt 04 defines the shell-visible content-state contract consumed by Prompt 05.
- Prompt 05 depends on Prompt 04.
- Prompt 06 must run after all prior prompts and should update any stale docs touched by the implemented work.

## Closure standard

Wave 01 is complete only when all of the following are true:

1. the flagship page no longer depends on an OOB Quick Links row as its live action layer
2. `PriorityActionsRail` is the live governed action layer on the flagship page
3. the first shell lane begins on first load at the standard laptop baseline
4. the shell no longer allows empty / invalid / low-signal occupants to dominate early flagship positions when a stronger legal candidate exists
5. rail behavior is aligned to shell / container reality rather than coarse viewport-only assumptions
6. integrated acceptance proof exists for:
   - standard laptop baseline
   - tablet portrait
   - phone portrait
   - short-height constrained state
7. any docs touched by this work are updated so they no longer describe already-live seams as pending

## Required execution posture for every prompt

Every prompt in this package already requires the code agent to:

- stay narrowly scoped
- inspect exact files and seams first
- avoid unrelated edits
- define completion with proof, not just code changes
- **not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes**
