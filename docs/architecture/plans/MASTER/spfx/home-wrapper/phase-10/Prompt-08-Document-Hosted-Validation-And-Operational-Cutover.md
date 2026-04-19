# Prompt 08 — Document Hosted Validation and Operational Cutover

## Objective

Create or update the homepage runbook/documentation needed to deploy, validate, and sign off the new unified flagship hero composition in a real hosted SharePoint environment.

## Why this matters

The repo already contains package-effectiveness and hosted-verification guidance for homepage rail work. The unified hero cutover needs the same operational rigor or it will fail at the last mile.

## Exact repo seams to inspect

- `docs/how-to/verify-hb-intel-homepage-sppkg.md`
- any homepage package verification doc tied to hosted deployment
- any closure report/checklist seam that should reflect the single-hero flagship cutover
- runtime markers introduced by Prompt 07

## Current implementation problem

Even a correct implementation can still be mis-deployed or mis-authored. The team needs a deterministic way to prove:
- the right package is deployed,
- the flagship page is authored correctly,
- one hero is rendering,
- and the runtime markers reflect the intended unified entry stack.

## Required implementation outcome

Create or update hosted validation guidance that covers, at minimum:
- what page-authoring state the flagship homepage must have,
- how to verify the wrapper-owned hero is active,
- how to verify the old standalone hero is removed from the flagship page,
- which DOM markers prove correct region order and shared state,
- which screenshots and DevTools captures are required for closure,
- and what signals mean the wrong surface or stale package is still being rendered.

## Specific constraints / guardrails

- Do **not** leave this as tribal knowledge.
- Do **not** rely on subjective “looks right” signoff.
- Keep the runbook concise, deterministic, and anchored to real runtime markers.
- Reuse the repo’s existing homepage package-verification posture where practical.

## Proof of closure

Closure requires all of the following:

1. Hosted validation instructions explicitly describe the new single-hero flagship page composition.
2. The runbook identifies the exact DOM/runtime markers to verify.
3. The runbook names failure signals for stale package, stale authoring, or duplicate-hero conditions.
4. The runbook requires concrete evidence capture for signoff.
5. A future reviewer could perform the cutover and verify it without relying on chat history.

## Explicit prohibition on unrelated changes

Do not:
- widen this into generic SharePoint deployment guidance,
- document unrelated applications,
- or omit the operational single-hero cutover requirement.

## Local code-agent operating instruction

Do **not** re-read files that are already in your active context unless you need to verify drift, dependencies, uncertainty, or the impact of your changes after implementation.

## Required output from the local code agent

Return:

1. files changed,
2. exact structural changes made,
3. why those changes satisfy this prompt,
4. any risks or follow-up observations,
5. and concrete proof of closure against the criteria above.
