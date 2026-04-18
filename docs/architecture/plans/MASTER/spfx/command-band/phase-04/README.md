# Priority Actions Rail — Enhanced Wave-02 Audit and Remediation Package

## Objective

This package replaces the attached thin `wave-02` package with a tighter repo-truth remediation package for the live `main` branch of `RMF112018/hb-intel`.

The attached package was directionally right about three themes:

- token / styling closure
- validation / runtime coherence
- hosted proof

But it was materially incomplete and partly mis-sequenced.

## Core repo-truth judgment

`wave-02` cannot be treated as polish-only work.

The live codebase still contains unresolved structural and product-grade gaps that were implicitly assumed to be closed before wave-02 began, including:

- index-coupled item persistence after reorder / add / archive
- an unused dedicated reorder seam
- immediate destructive archive behavior outside the save / discard model
- an unintegrated permission model
- preview/runtime divergence
- config/runtime drift on layout modes, icon handling, and grouping
- a shared surface family that still trails the spec’s breakpoint and overflow expectations
- stale closure docs that overstate completion

## What this package does differently

This package:

- reopens the unresolved structural work that still blocks truthful closure
- preserves the useful intent of the original wave-02 package
- splits under-scoped prompts into tighter closure units
- adds missing prompt coverage for admin workflow trust, breakpoint/overflow fidelity, preview parity, and stale closure-doc correction
- strengthens proof-of-closure requirements so cosmetic or partial fixes cannot masquerade as completion

## Package contents

### Audit and plan files
- `00-Enhanced-Audit-Summary.md`
- `01-Package-to-Repo-Mapping.md`
- `02-Granular-Findings.md`
- `03-Enhanced-Prompt-Plan.md`
- `04-Research-and-Standards-Notes.md`
- `05-Closure-Proof-Checklist.md`
- `Plan-Summary.md`

### Execution prompts
- `Prompt-01-Reopen-Structural-Closure-for-Persisted-Identity-and-Write-Trust.md`
- `Prompt-02-Productize-Admin-IA-Permission-States-and-Authoring-Workflow.md`
- `Prompt-03-Rebuild-Shared-Surface-and-Breakpoint-Overflow-System.md`
- `Prompt-04-Align-Contracts-Validation-and-Preview-with-Live-Runtime.md`
- `Prompt-05-Tokenize-and-Premiumize-Public-and-Admin-Styling.md`
- `Prompt-06-Verify-Manifests-Hosted-Behavior-and-Correct-Stale-Closure-Docs.md`

## Prompt order

1. Reopen structural closure for item identity, reorder trust, and destructive-action semantics.
2. Productize the admin into a real maintainer workflow with permission-aware behavior.
3. Rebuild the shared surface family into the actual command-band system the spec calls for.
4. Align contracts, validation, data seams, and preview/public runtime truth.
5. Complete token discipline and premium styling once the structure is correct.
6. Finish manifest/runtime verification, hosted proof, and honest closure docs.

## Why this sequence is correct

The original wave-02 package assumed the product model was already sound.

Repo truth says otherwise.

The corrected sequence first restores correctness and trust, then closes shared/public/admin product behavior, then performs styling hardening, and only then allows hosted-proof and closure claims.

## Execution rule carried into every prompt

Each prompt explicitly instructs the code agent:

- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- do not drift into unrelated repo work
- do not claim closure without the proof listed in that prompt
