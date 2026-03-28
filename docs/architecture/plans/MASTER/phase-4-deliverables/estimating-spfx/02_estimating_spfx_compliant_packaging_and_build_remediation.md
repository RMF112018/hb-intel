# Prompt 02 — Estimating SPFx Compliant Packaging and Build Remediation

## Objective

You are my local Claude Code agent working inside the HB Intel repo.

Your objective is to implement the **minimum set of code, build, packaging, and configuration changes** required to move the Estimating SPFx deployment path from its current noncompliant / hybrid state to a **Microsoft-compliant, web-part-only SPFx packaging flow** that can be successfully deployed to SharePoint.

This prompt is about **implementation**, not another generic audit.

## Critical Instructions

- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction, recover exact evidence, or inspect a file you have not yet opened.
- The target is **web part only**. Do not implement `SharePointFullPage`.
- Preserve the current React/Vite dev posture where possible, but do not allow Vite-first decisions to control the production package-generation path.
- Do not keep the custom `.sppkg` generation path as the deployable source of truth if it conflicts with supported SPFx requirements.
- Prefer a **thin compliant packaging layer** over a broad rewrite.
- Minimize blast radius, but do not under-fix the real deployment defect.

## Locked Outcome

When this prompt is complete, Estimating must have a deployment path that:

- is explicitly **web-part-only**
- uses a compliant SPFx package-generation path
- no longer depends on a custom `.sppkg` assembly script as the authoritative deployment artifact generator
- produces a package structure and metadata SharePoint can actually use at deployment/runtime

## Required Work

### 1. Decide and implement the correct compliant packaging strategy

Based on repo truth and current Microsoft requirements, choose and implement the least-disruptive compliant strategy.

Acceptable outcome patterns include:

- a thin native SPFx packaging boundary added around the existing app
- a dedicated deployment wrapper that uses official SPFx package-solution tooling
- a partial project reshaping that preserves the Vite dev harness while shifting deployment packaging to supported tooling

Unacceptable outcome patterns include:

- continuing to rely on the current custom OPC/ZIP `.sppkg` assembly as the production deployment package
- treating a copied source manifest as sufficient deployment metadata
- leaving deployment correctness dependent on undocumented or inferred behavior

### 2. Reconcile build vs deployment responsibilities

Refactor the Estimating app/build pipeline so the responsibilities are explicit:

- local dev / mock / fast iteration
- production-compatible build artifacts
- SPFx packaging / package-solution / deployable artifact generation
- deployment validation

Make the repo reflect those boundaries clearly.

### 3. Update the repo scripts and pipeline

Update all relevant package scripts, tools, and workflows so that:

- the Estimating deployment package is generated through the new compliant path
- legacy scripts that produce misleading or invalid artifacts are removed, retired, or clearly marked non-authoritative
- CI/CD uses the correct package-generation path
- build commands and deployment commands are unambiguous

### 4. Remove or retire the invalid packaging seam

You must explicitly address:

- `tools/package-sppkg.*` if it is currently authoritative or misleading
- any scripts that imply the custom package is valid for deployment when it is not
- any validation tooling that incorrectly signals correctness despite noncompliant packaging

### 5. Preserve operational posture where correct

Keep intact where possible:

- existing React application composition
- existing app logic
- existing SPFx boundary approach
- Vite-based local development and dev harness behavior
- shared package and auth/shell integration model

Only change what must change to make deployment compliant and successful.

## Files to Inspect and Update

At minimum, inspect and update as needed:

- `apps/estimating/package.json`
- `apps/estimating/config/package-solution.json`
- `apps/estimating/config/serve.json`
- any Heft / Gulp / rig / SPFx config files needed to support compliant packaging
- `apps/estimating/vite.config.*`
- `tools/package-sppkg.*`
- `tools/validate-manifests.*`
- root/package-level scripts and any related workspace pipeline files
- `.github/workflows/*` related to SPFx build/package/deploy
- any repo docs that describe the packaging path inaccurately

## Deliverables

1. Implement the code/config/build changes required for compliant packaging.
2. Create or update:
   - `docs/architecture/reviews/estimating-spfx-packaging-remediation.md`
3. In that review, document:
   - the old packaging path
   - why it was invalid or insufficient
   - the new packaging path
   - what was preserved
   - what was retired
   - how deployment artifacts are now generated
4. In your final response, provide:
   - files changed
   - exact packaging command(s)
   - exact deployment artifact path(s)
   - residual risks, if any
   - what the next prompt must validate

## Acceptance Criteria

Do not consider this prompt complete until:

- Estimating no longer relies on a noncompliant custom `.sppkg` generation path as the production deployment authority
- the repo has a clear compliant packaging/build boundary for the Estimating web part
- CI/CD and scripts point to the correct package-generation path
- the packaging remediation review document exists
- the next prompt can focus on runtime/SharePoint registration rather than reopening packaging compliance