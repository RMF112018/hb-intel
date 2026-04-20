# Prompt 01 — Estimating SPFx Web-Part-Only Root Cause and Target-State Lock

## Objective

You are my local Claude Code agent working inside the HB Intel repo.

Your objective is to **prove the actual root cause of the Estimating SPFx deployment failure**, validate that the current target state must remain **web part only**, and establish the exact implementation boundary required before major remediation changes proceed.

This is not a generic audit. This is a **repo-truth-grounded, implementation-driving validation pass** that must immediately feed code changes in later prompts.

## Critical Instructions

- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction, recover exact evidence, or inspect a file you have not yet opened.
- Do not treat this as a greenfield redesign.
- Do not drift into full-page SPFx application work.
- Do not add `SharePointFullPage`.
- Do not preserve any deployment approach that is noncompliant with Microsoft-supported SPFx deployment requirements merely because it is clever or convenient.
- Prefer official Microsoft documentation over community references; use community references only to fill gaps.
- Preserve the current React/Vite development posture where possible, but **do not** allow Vite-first assumptions to control deployment packaging decisions.

## Locked Target State

For this remediation effort, the Estimating SPFx surface is:

- **a SharePoint web part only**
- expected to be **addable to a SharePoint page**
- **not** expected to launch as a full-page SPFx application
- **not** expected to use single-part app pages
- **not** expected to implement `SharePointFullPage`

Treat any contradictory language in repo docs, code comments, manifests, build scripts, packaging scripts, or validation scripts as a defect to be identified and resolved.

## Required Research and Inspection Scope

### Repo truth / documentation

Inspect and reconcile at minimum:

- `docs/README.md`
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/Target-Architecture-Blueprint.md` or the authoritative replacement if repo truth points elsewhere
- `docs/architecture/blueprint/package-relationship-map.md`
- `docs/architecture/plans/MASTER/README.md`
- relevant ADRs and plan files related to:
  - SPFx boundaries
  - SPFx hosting
  - packaging
  - breakout webparts
  - Vite-first SPFx posture
  - deployment / CI-CD
  - SharePoint hosting and runtime expectations

### Estimating implementation / packaging surface

Inspect at minimum:

- `apps/estimating/package.json`
- `apps/estimating/vite.config.*`
- `apps/estimating/config/package-solution.json`
- `apps/estimating/config/serve.json`
- `apps/estimating/config/deploy-azure-storage.json`
- any `write-manifests` / Heft / Gulp / rig / package-solution related config if present
- `apps/estimating/src/main.*`
- `apps/estimating/src/App.*`
- `apps/estimating/src/webparts/estimating/EstimatingWebPart.*`
- `apps/estimating/src/webparts/estimating/EstimatingWebPart.manifest.json`
- any supporting SPFx bootstrap/auth/host bridge files
- all scripts that create or validate `.sppkg` packages
- `tools/package-sppkg.*`
- `tools/validate-manifests.*`
- any CI/CD files or package scripts that build or deploy the Estimating SPFx package

### External research

Conduct focused web research on current Microsoft guidance for:

- SPFx web part deployment
- SPFx package generation
- `package-solution`
- manifest generation and loader metadata
- runtime asset loading
- web part toolbox visibility
- add-to-page behavior
- causes of “package uploads but cannot be used”
- causes of “web part not visible / not addable / not rendering after deployment”

## Required Work

### 1. Prove the actual current package reality

Determine and state clearly:

- whether the current Estimating implementation is truly a web part at source level
- whether the current deployment path is actually compliant
- whether the current package is:
  - compliant
  - operational but noncompliant
  - partially compliant
  - structurally incompatible
  - invalid hybrid

### 2. Lock the target host model

Produce a definitive statement in your findings and, if needed, in repo docs/comments that:

- the Estimating surface is **web part only**
- full-page SPFx behavior is out of scope for this remediation
- any packaging or manifest changes must optimize for **SharePoint page placement as a web part**

### 3. Identify every contradictory seam

Explicitly identify contradictions across:

- docs
- manifests
- packaging scripts
- CI/CD
- validation tooling
- code comments
- runtime assumptions
- deployment expectations

Examples of contradiction categories:

- source says “web part” but docs imply “application”
- package can upload but packaging path is not Microsoft-compliant
- validation tooling checks presence and GUIDs but not actual SPFx package correctness
- dev harness assumptions bleed into deployment assumptions

### 4. Produce the implementation decision record for the next prompts

At the end of this prompt, produce a concise implementation decision record that states:

- the current root cause
- the locked target state
- the selected remediation direction
- which files must change first
- which files must not be changed yet
- which legacy/custom packaging behavior must be retired

## Deliverables

Create the following artifacts:

1. `docs/architecture/reviews/estimating-spfx-webpart-only-root-cause-review.md`
   - evidence-based review
   - exact contradictions
   - exact root cause
   - locked target state
   - implementation direction for next prompts

2. A concise execution summary in your final response containing:
   - confirmed root cause
   - confirmed target state
   - exact first code changes to make next
   - repo docs that need alignment

3. If repo docs currently overstate or misclassify the Estimating host model, make the **minimum precise doc corrections** needed to eliminate ambiguity.

## Acceptance Criteria

Do not consider this prompt complete until:

- you have proven whether the current deployment path is compliant or not
- you have explicitly locked the Estimating target state to **web part only**
- you have identified every meaningful contradiction that could mislead the next remediation step
- you have written the review artifact
- the next prompt can proceed without reopening the host-model question