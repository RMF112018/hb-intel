# 03 — Homepage Webpart Delivery Workflow and Gates

## Required workflow

Every homepage webpart update must follow this sequence.
No steps may be skipped unless a written exception is accepted.

### Phase 1 — Repo-truth benchmark audit
Required output:
- target webpart architecture summary
- live seams and dependencies
- benchmark comparison against Kudos public
- categorized gap register

Questions that must be answered:
- what is the target webpart’s real current architecture?
- what is its intended purpose?
- where does it currently fall short of homepage-grade quality?
- which gaps are UI-only, and which are architectural/runtime gaps?

### Phase 2 — Decision lock
Required output:
- scope lock
- seam lock
- interaction model lock
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

### Phase 4 — Hosted validation
Required output:
- hosted screenshots
- behavior proof at relevant zoom/viewport conditions
- keyboard/focus proof where applicable
- runtime error review
- defect log

### Phase 5 — Closure review
Required output:
- benchmark scorecard
- unresolved defects list
- pass/fail decision
- follow-on backlog only for non-blocking residual items

## Mandatory gates

### Gate A — Audit gate
No implementation work may proceed until the target webpart has been compared to the Kudos benchmark.

### Gate B — Architecture gate
No implementation prompt may proceed if data seams, state seams, or host/runtime dependencies are still guessed rather than confirmed.

### Gate C — UX completeness gate
No webpart may close while critical journeys remain partial, dead, misleading, or non-credible.

### Gate D — Runtime gate
No webpart may close without SharePoint-hosted runtime proof where host behavior matters.

### Gate E — Closure gate
No webpart may close without a scored conformance review and explicit pass/fail finding.

## Required artifacts per homepage effort

Minimum required artifacts:

1. Audit Summary
2. Gap Register
3. Decision Lock
4. Implementation Plan or Prompt Package
5. Validation Report
6. Closure Checklist

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
