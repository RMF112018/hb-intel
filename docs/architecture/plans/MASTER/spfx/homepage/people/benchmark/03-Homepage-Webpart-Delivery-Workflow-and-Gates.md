# 03 — Homepage Webpart Delivery Workflow and Gates

## Governing prerequisite

Every homepage webpart update must begin by reviewing:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

No homepage benchmark audit is valid if those two doctrine files were not treated as governing authority.

## Required workflow

Every homepage webpart update must follow this sequence.
No steps may be skipped unless a written exception is accepted.

### Phase 0 — Doctrine review
Required output:
- doctrine obligations summary
- homepage overlay implications for the target webpart
- import / host / manifest / page-canvas constraints
- doctrine risks to watch during implementation

### Phase 1 — Repo-truth benchmark audit
Required output:
- target webpart architecture summary
- live seams and dependencies
- benchmark comparison against Kudos public
- categorized gap register
- persona-fit assessment

Questions that must be answered:
- what is the target webpart’s real current architecture?
- what is its intended purpose?
- what persona should this webpart express?
- where does it currently fall short of homepage-grade quality?
- which gaps are UI-only, and which are architectural/runtime gaps?
- where is it too weak?
- where is it drifting toward a cloned or genericized surface?

### Phase 2 — Decision lock
Required output:
- scope lock
- seam lock
- interaction model lock
- persona lock
- validation lock
- exception list if any

No implementation should begin before decisions are explicit.

### Phase 3 — Implementation package
Required output:
- implementation prompts or tasks
- shared primitive usage plan
- data seam updates
- validation plan
- proof expectations
- explicit anti-homogenization rule for the target webpart

### Phase 4 — Hosted validation
Required output:
- hosted screenshots
- behavior proof at relevant zoom/viewport conditions
- keyboard/focus proof where applicable
- runtime error review
- defect log
- visual/persona-fit proof showing the webpart is benchmark-grade without becoming a clone

### Phase 5 — Closure review
Required output:
- benchmark scorecard
- unresolved defects list
- doctrine compliance check
- pass/fail decision
- follow-on backlog only for non-blocking residual items

## Mandatory gates

### Gate A — Doctrine gate
No implementation work may proceed until the two doctrine files have been reviewed and translated into explicit rules for the target webpart.

### Gate B — Audit gate
No implementation work may proceed until the target webpart has been compared to the Kudos benchmark.

### Gate C — Architecture gate
No implementation prompt may proceed if data seams, state seams, or host/runtime dependencies are still guessed rather than confirmed.

### Gate D — Persona gate
No implementation prompt may proceed if the target webpart’s intended persona and acceptable differences from Kudos are still undefined.

### Gate E — UX completeness gate
No webpart may close while critical journeys remain partial, dead, misleading, or non-credible.

### Gate F — Runtime gate
No webpart may close without SharePoint-hosted runtime proof where host behavior matters.

### Gate G — Closure gate
No webpart may close without a scored conformance review and explicit pass/fail finding.

### Gate H — Anti-homogenization gate
No webpart may close if it has achieved quality by becoming visually or behaviorally interchangeable with another homepage webpart without purpose-based justification.

## Required artifacts per homepage effort

Minimum required artifacts:

1. Doctrine Summary
2. Audit Summary
3. Gap Register
4. Decision Lock
5. Implementation Plan or Prompt Package
6. Validation Report
7. Closure Checklist

## Exception policy

Exceptions are allowed only when all of the following are true:

- the exception is explicit
- the rationale is written
- the risk is understood
- the exception is approved
- the exception does not create hidden drift

## Common failure modes this workflow is designed to prevent

- over-focusing on visuals while leaving weak seams intact
- inconsistent runtime quality across homepage webparts
- shallow prompting without architectural grounding
- false closure after render-level improvements
- repeated reinvention instead of shared maturity
- cloned webparts with different names but no true content-fit persona
