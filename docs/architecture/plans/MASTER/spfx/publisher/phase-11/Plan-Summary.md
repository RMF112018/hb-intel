# Plan Summary

## Objective
Replace the earlier Publisher remediation package with a narrower, more exact, repo-truth-aligned closure package for the live `apps/hb-publisher` implementation on `main`.

The new package does **not** assume every previously-audited issue is still open.
It closes only the remediation items that are still truly live in the repo.

## Repo-truth verdict
The current Publisher remediation scope is no longer six active issues.

The live open work is concentrated in four areas:

1. **First persistence / save-readiness truthfulness**
   - the shell still exposes a misleading first-save boundary relative to the tenant-required `HB Articles` schema
   - save readiness is not modeled explicitly enough before the user clicks **Save draft**

2. **Template-registry / bootstrap preflight health**
   - template resolution is critical, but unusable environment state is still discovered too late

3. **Promotion-rule health truthfulness**
   - rule-load failure still degrades silently to an empty ruleset

4. **Closure proof**
   - the remediation package needs an explicit final validation and reporting step

## Prompts removed from the original package
The following earlier prompts are intentionally **not** carried forward as active remediation steps because repo truth shows they are already closed on `main`:

- `companyPulse` operational drift
- `milestoneSpotlight` operational drift
- `scheduled` dead-branch handling

See `00-Audit-Reconciliation.md` for the exact justification.

## Sequence
1. Make first persistence and save readiness truthful.
2. Add authoring-health preflight for template-registry/bootstrap state.
3. Make promotion-rule health fail-truthful.
4. Prove closure with tests, type-checking, build, and a final closure report.

## Why this order
- Prompt 01 fixes the most user-visible and structurally important authoring defect.
- Prompt 02 closes the environment-health blind spot that otherwise keeps save/publish behavior reactive and surprising.
- Prompt 03 hardens policy-health truthfulness once the authoring health model exists.
- Prompt 04 prevents the package from ending as a “code changed, assume done” artifact.

## Recommended implementation posture
Use explicit, typed, declarative UI state for authoring health instead of scattered booleans and silent fallbacks.

In practical terms, prefer:
- discriminated unions or similarly explicit state models
- one authoritative source for save/publish/preflight health
- actionable inline guidance tied to the affected fields or system seams
- status surfaces that distinguish:
  - validation failure
  - unsupported branch
  - environment/bootstrap failure
  - policy-load failure
  - in-flight busy state

Do **not** widen scope into a separate persistence platform unless you can prove that is required to close the defect.
The repo already treats `HB Articles` as the authoritative master record; the most repo-compatible closure path is to make the existing persistence boundary truthful, not to invent a second draft store.
