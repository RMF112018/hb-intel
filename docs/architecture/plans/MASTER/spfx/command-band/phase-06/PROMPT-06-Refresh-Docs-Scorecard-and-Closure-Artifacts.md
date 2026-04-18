# Prompt 06 — Refresh Docs, Scorecard, and Closure Artifacts

## Objective

Update repo documentation and closure artifacts so they accurately reflect the remediated implementation and its hosted proof, and so stale “code-path only” confidence cannot masquerade as final closure.

## Current condition

The earlier package correctly called for hosted validation, but it did not create a dedicated implementation unit for documentation refresh. That leaves a real risk that old scorecards and closure notes continue to overstate completion.

## Why the current condition is inadequate

A remediation package is not truly complete if the code changes and the closure artifacts disagree. Stale docs actively degrade future audit quality.

## Intended future state

After implementation and hosted validation, all relevant local documentation should:
- describe the preserved ownership boundary correctly
- describe the new flagship surface contract correctly
- describe the hosted closure outcome honestly
- list any remaining defects plainly if any remain

## What done looks like

- stale closure wording is removed or corrected
- scorecard / validation notes reflect actual hosted proof
- README-style guidance aligns with final implementation state

## Exact repo seams to inspect

- any current scorecards or audit notes tied to homepage shell / priority actions rail
- `docs/reference/spfx-surfaces/benchmark/**` if relevant files exist locally
- any package README or closure note updated by this remediation
- any new validation note produced during execution

## Governing authorities

- live repo implementation after prompts 01–05
- `docs/architecture/blueprint/current-state-map.md`
- homepage / SPFx doctrine files

## Required implementation tasks

1. Identify stale or overconfident closure language.
2. Refresh scorecards / notes only after implementation and hosted proof are complete.
3. Preserve an honest record of any remaining defects if any remain.
4. Ensure future reviewers can understand what changed and why.

## Constraints and anti-patterns

### Do not do these things
- do not declare final closure without hosted evidence
- do not delete historical evidence in a way that hides the evolution of the work
- do not leave ambiguous wording such as “mostly done” or “benchmark-grade” without proof

## Proof of closure

Provide:
- file list updated
- summary of stale language removed or corrected
- final documentation/scorecard posture after proof capture

## Mandatory directive

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
