# Accounting Phase 9 Prompt Package Audit Report

## Executive Summary

The attached Phase 9 package is **well structured and directionally correct**, but it is **not yet strong enough to serve as a release-decision package without revision**.

Its best qualities are:

- it keeps release hardening, pilot, cutover, and closure as distinct stages
- it preserves a disciplined prompt order
- it correctly aims to separate staging, pilot, and production concerns
- it correctly treats release readiness as evidence-driven rather than purely aspirational

Its problems are not foundational. They are **precision and release-governance problems**:

1. it does not force the local code agent to start from the actual current release evidence already present in the repo
2. it does not strongly enough distinguish:
   - repo-complete
   - staging-ready
   - pilot-ready
   - production-ready
3. it still uses some workflow language such as “launch” that is weaker than the current repo-truth model of controller approval to `ReadyToProvision` plus backend auto-start
4. it does not force enough explicit treatment of external approvals and platform prerequisites:
   - SPFx package trust / deployment path
   - SharePoint API access approval
   - tenant/admin permission dependencies
   - staging slot / swap capability versus non-slot rollback
5. it does not require a strong enough distinction between what the repo itself proves and what must be verified in Azure / SharePoint / tenant operations outside the repo

Bottom line:

- **overall phase shape:** keep it
- **prompt order:** keep it
- **release-governance rigor:** strengthen it
- **required source set:** expand it
- **external-prerequisite handling:** strengthen it
- **cutover / rollback assumptions:** make them conditional and evidence-based

This revised package preserves the good structure and makes the release package safer.

---

## Current Repo-Truth Release Posture Summary

The live repo already contains much more release-readiness evidence than the attached Phase 9 package requires explicitly.

### 1. Current-state authority is explicit

`current-state-map.md` is the canonical present-truth source and already includes material release/readiness information, including:

- Wave 0 closeout baseline
- Project Setup host boundary and release-scope references
- current app and test inventories
- current runbook references
- identified active versus deferred operational items

That means Phase 9 should not start from a blank “what is ready?” assumption. It should start from the current-state map and then validate or refine it.

### 2. The Project Setup backend already has a release-scope manifest

`backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md` is highly relevant to Phase 9 and is missing from the attached package’s required review set.

That manifest already defines:

- in-scope route families
- excluded route families
- service-container boundary
- startup-config requirements
- CORS expectation
- auth expectation

It is exactly the kind of document a release-readiness prompt should force a local agent to review first.

### 3. Verification evidence already exists in the repo

The repo already contains a meaningful verification/readiness evidence stack:

- Accounting review queue tests
- Accounting review detail tests
- Admin provisioning oversight tests
- alert polling tests
- provisioning verification matrix
- provisioning operations runbook
- provisioning observability runbook

So the correct Phase 9 behavior is not “invent a release package from scratch.”  
It is “start from this evidence, classify what it proves, and then build the release package around the real proof.”

### 4. Environment and permission prerequisites are already documented

The repo also already carries material environment and tenant-prerequisite docs:

- `docs/reference/configuration/wave-0-config-registry.md`
- `docs/reference/configuration/sites-selected-validation.md`

These documents matter because they already distinguish:

- required production settings
- local/staging/production posture
- manual tenant-admin grant paths
- governed fallback paths
- staging validation requirements

A serious Phase 9 prompt package should force the local agent to consume those sources.

### 5. Release-phase evidence is partly repo-local and partly out-of-repo

The repo can prove many things:

- implemented workflow surfaces
- test coverage
- runbook content
- documented environment requirements
- documented external prerequisites
- role boundaries
- current support/observability expectations

But the repo **cannot alone prove** several production-release facts:

- tenant API approvals are granted
- the target App Catalog path is correctly configured in the live tenant
- the target Azure environment actually has a validated staging slot / swap path
- the chosen rollback method has been rehearsed in the target environment
- the exact pilot audience, schedule, and support staffing are approved
- external prerequisites have actually been completed by tenant/platform owners

That distinction is central to a credible Phase 9 package and needs to be made explicit in every prompt.

---

## Confirmed Phase 9 Prompt-Package Facts

The attached Phase 9 package currently does these things well:

- defines a six-stage release sequence
- uses a logical dependency order
- keeps staging, pilot, cutover, post-cutover, and closure as separate artifacts
- repeatedly says not to overstate readiness
- expects explicit go/no-go language in the final closure report

The current weaknesses are:

- the required review targets are too generic
- the prompts do not force the agent to review the actual current repo evidence set
- the prompts do not force enough classification of “repo-proven vs external/manual”
- the cutover prompt does not explicitly require environment-specific rollback strategy selection
- the staging prompt does not explicitly require reconciliation with current host-boundary, config, and permission docs
- the post-cutover prompt does not explicitly require alignment with the existing runbooks and observability documentation
- the package still carries weaker legacy wording like “launch” in places where the repo’s current contract is better described as controller approval → `ReadyToProvision` → backend auto-start

---

## Prompt-Package ↔ Repo Alignment Analysis

## 1. Package objective vs repo truth

**Assessment:** aligned.

The package correctly defines Phase 9 as release hardening, pilot, cutover, and closure. That is the correct release-phase objective.

## 2. Package staging prompt vs repo truth

**Assessment:** partially aligned, not specific enough.

The staging prompt should explicitly require review of:

- current-state map
- Project Setup host release-scope manifest
- config registry
- Sites.Selected validation doc
- verification matrix
- provisioning runbooks
- Accounting/Admin verification suites that define the actual smoke path

Without that, the agent could produce a generic staging checklist detached from the actual implementation.

## 3. Package pilot prompt vs repo truth

**Assessment:** aligned in intent, under-specified in evidence handling.

The pilot prompt should explicitly force the agent to distinguish:

- pilot-ready because repo and tenant prerequisites are satisfied
- pilot-ready except for named external prerequisites
- not pilot-ready because staging evidence is incomplete

It should also require a bounded pilot audience, owner matrix, rollback/pause thresholds, and evidence capture that is realistic for the current system.

## 4. Package cutover prompt vs repo truth

**Assessment:** weakest prompt in the original package.

The cutover prompt currently assumes a practical release-day checklist but does not force the agent to determine which rollback path is actually valid:

- slot-swap rollback
- artifact rollback
- .sppkg rollback / package removal / prior package restore
- configuration rollback
- combined backend + SPFx rollback

That is a major omission because the repo does not itself prove that staging slots exist in the target hosting environment.

## 5. Package post-cutover prompt vs repo truth

**Assessment:** aligned, but too generic.

The repo already has supportability and observability material. The prompt should require direct reconciliation with:

- provisioning operations runbook
- provisioning observability runbook
- verification matrix
- admin alert polling / dashboard test evidence

Otherwise the resulting hypercare plan may drift into generic operations language rather than repo-truth support behavior.

## 6. Package final closure prompt vs repo truth

**Assessment:** good structure, needs stronger classification rules.

The closure report should be required to classify each release category as one of:

- repo-proven
- manual verification required
- externally blocked
- partially ready / constrained
- intentionally deferred

Without that, a local agent could still produce a closure report that sounds stronger than the evidence actually supports.

---

## Release-Gate Drift Analysis

## 1. Repo-complete vs production-ready is not enforced strongly enough

The original package says to distinguish readiness levels, but it does not define a hard classification model. That makes overstatement too easy.

A safer package should force every major readiness conclusion into a fixed classification vocabulary.

## 2. External prerequisites are acknowledged but not operationalized tightly enough

The original prompts mention tenant and environment work, but they do not require a structured external-dependency register with:

- owner
- system
- evidence required
- blocking impact
- due-before stage

That is too loose for a real release package.

## 3. Rollback assumptions are too implicit

The original cutover prompt asks for rollback steps, but does not force the agent to verify which rollback method is actually supported by:

- the Azure Functions hosting posture
- the SharePoint package deployment path
- the target app catalog model
- the current release artifact model

This is too risky.

## 4. Existing runbook/readiness evidence is underused

The original package does not force the agent to begin from the repo’s current runbooks and verification artifacts. That risks duplicate or contradictory release docs.

## 5. Current workflow semantics should be preserved more explicitly

The release package should not regress to older wording around “launch.” It should remain anchored to the current workflow contract:

- submit
- controller review
- clarify / hold / approve
- approval moves to `ReadyToProvision`
- backend auto-starts provisioning
- status visibility and admin exception handling continue from there

That matters because release smoke checks must reflect the actual system.

---

## Phase Order and Dependency-Flow Analysis

## Overall verdict

The six-stage order is correct and should be preserved.

## Stage order assessment

### Prompt-01 — Repo-Truth Release Readiness Audit  
**Keep first.** Correct.

### Prompt-02 — Staging Deployment and Pre-Cutover Validation  
**Keep second.** Correct.

### Prompt-03 — Pilot Readiness and Controlled User Enablement  
**Keep third.** Correct.

### Prompt-04 — Production Cutover and Rollback Preparation  
**Keep fourth.** Correct, but must depend on the staging and pilot decision outputs.

### Prompt-05 — Post-Cutover Verification and Hypercare Readiness  
**Keep fifth.** Correct.

### Prompt-06 — Final Release Closure and Signoff Report  
**Keep last.** Correct.

## Needed dependency improvements

The order is right, but the prompts should explicitly chain decisions forward:

- Prompt-01 defines readiness classifications and external dependency register
- Prompt-02 validates staging/pre-cutover evidence against those classifications
- Prompt-03 uses the audit + staging output to define whether pilot can even begin
- Prompt-04 uses staging + pilot outputs to define the actual cutover strategy and rollback path
- Prompt-05 uses all prior outputs plus runbooks to define production verification and hypercare
- Prompt-06 consolidates all of the above with precise go/no-go language

---

## Gap Analysis

## Gap 1 — Missing current release-readiness source set

**Severity:** High

The package must explicitly require review of:

- `docs/architecture/blueprint/current-state-map.md`
- `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`
- `docs/reference/configuration/wave-0-config-registry.md`
- `docs/reference/configuration/sites-selected-validation.md`
- current Accounting/Admin verification tests

These are critical Phase 9 sources.

## Gap 2 — No fixed readiness-classification system

**Severity:** High

The package should force a structured readiness classification such as:

- repo-proven
- staging-ready pending manual validation
- pilot-ready pending external approval
- production-ready
- externally blocked
- deferred / not in release scope

Without that, release statements can become vague.

## Gap 3 — Rollback path not explicitly evidence-bound

**Severity:** High

The cutover prompt needs to force the agent to determine whether rollback is:

- slot-based
- artifact-based
- configuration-based
- package-based
- mixed

and which parts are actually evidenced in the target environment versus merely recommended by platform guidance.

## Gap 4 — External dependency register missing

**Severity:** Medium-High

The package acknowledges external blockers, but should require a formal register with:

- dependency
- owner
- evidence required
- stage impacted
- blocking severity
- workaround if any

## Gap 5 — Existing runbooks and support evidence not strongly integrated

**Severity:** Medium

The hypercare and closure prompts should explicitly reconcile the runbooks and observability docs that already exist.

## Gap 6 — Workflow smoke wording too generic

**Severity:** Medium

The release prompts should use current contract wording and current live surface behavior, not ambiguous “launch” language.

---

## Risk Analysis

## Primary risk

A local code agent could execute the original package and produce a release package that is **organized but overconfident**, because it would not be forced to separate:

- what the repo proves
- what must be manually verified
- what is tenant-admin dependent
- what is recommended by platform guidance but not yet evidenced in the target environment

## Secondary risk

The resulting release docs could define a rollback plan that sounds clean but is not actually grounded in the target hosting/deployment posture.

## Tertiary risk

The package could also underuse the repo’s existing evidence and accidentally create parallel release docs that disagree with existing runbooks or the verification matrix.

---

## Package-Quality / Execution-Readiness Assessment

## Current package status

**Assessment:** usable as a draft, but not strict enough for a real release decision package.

### Ratings

- **Objective quality:** Strong
- **Phase structure:** Strong
- **Dependency flow:** Strong
- **Repo-truth orientation:** Moderate
- **Release-governance rigor:** Moderate
- **External-prerequisite discipline:** Moderate
- **Rollback realism:** Moderate-Low
- **Execution safety for a local code agent:** Moderate

## Revised package status

**Assessment:** strong enough to use as the working Phase 9 package.

The revised package strengthens:

- exact source coverage
- evidence classification
- rollback-path selection discipline
- staging/pilot/production distinction
- external dependency tracking
- hypercare/runbook reconciliation
- final go/no-go precision

---

## Prioritized Refinement List

## Priority 1 — Expand the required Phase 9 source set

Add explicit review of the current-state map, release-scope manifest, verification matrix, runbooks, config registry, Sites.Selected validation doc, and current key tests.

## Priority 2 — Add hard readiness classifications

Every prompt should classify evidence as:

- repo-proven
- manual verification required
- externally blocked
- deferred
- not yet evidenced

## Priority 3 — Add rollback-path decision requirements

The cutover prompt must force explicit selection of the rollback strategy that is actually supported.

## Priority 4 — Add external dependency register

Every external prerequisite should have owner, evidence, impact, and stage.

## Priority 5 — Replace generic launch wording

Use current repo-truth workflow language throughout the package.

## Priority 6 — Tie hypercare to existing runbooks and observability evidence

Make the post-cutover prompt start from the existing support docs, not from a blank slate.

---

## Explicit Unresolved Questions

These are not blockers to revising the package, but they should remain visible:

1. Does the target Azure Functions environment for production actually support the preferred slot-based staging/swap model, or will the real rollback path be artifact/package/config based?
2. Will the final SPFx deployment scope use tenant app catalog, site collection app catalog, or a constrained subset model for the release target?
3. Which external approvals are already granted versus only documented as prerequisites?
4. Is the initial production release expected to be pilot-first only, or should the cutover package also support same-window production enablement once pilot criteria are met?

---

## Final Assessment

The original Phase 9 package is worth preserving, but it needed revision before execution.

The revised package keeps the strong structure and makes it safer by forcing the local code agent to:

- start from the repo’s actual release/readiness evidence
- separate repo proof from external/manual proof
- treat rollback as an evidence-bound decision
- preserve current workflow semantics
- produce a release package that is actually auditable
