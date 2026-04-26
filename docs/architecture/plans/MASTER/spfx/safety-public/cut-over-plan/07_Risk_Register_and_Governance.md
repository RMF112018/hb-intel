# 07 — Risk Register and Governance

## Risk: Low-Activity Perfect Score Highlight

A project scores 100 at mobilization, closeout, or a low-activity period and is incorrectly celebrated.

### Mitigation

- Require active project gate.
- Require activity/exposure evidence.
- Suppress single 100% score without exposure proof.
- Require multi-signal reason.
- Require Safety leadership approval.

## Risk: Incentive Distortion

Homepage recognition could discourage teams from reporting findings.

### Mitigation

- Reward corrective-action behavior.
- Reward hazard identification and closure.
- Do not reward "no findings" alone.
- Do not punish projects for transparent reporting.
- Include Safety leadership review.

## Risk: SharePoint Threshold / Performance

Homepage client could become fragile if it queries raw Safety lists.

### Mitigation

- Backend computes rollup.
- Homepage reads only published artifact.
- Use indexed fields.
- Use bounded Graph queries.
- Treat query truncation as failure.

## Risk: Stale Homepage Recognition

A weekly highlight could remain visible too long.

### Mitigation

- `FreshUntil`
- stale UI state
- weekly timer
- Safety Department ownership
- runtime proof
- governance escalation

## Risk: Over-Automation

Automated rollup selects a technically high candidate that Safety leadership would not publicly highlight.

### Mitigation

- candidates are draft until approved
- override and suppress flows
- audit fields
- published payload frozen after approval

## Risk: Generic UI Outcome

Surface becomes a thin white card with safety copy.

### Mitigation

- use doctrine
- use checklist and scorecard
- require 48+/56
- validate hosted visual result
- preserve serious safety persona

## Risk: Backend Auth Drift

New routes accidentally bypass current Function App auth posture.

### Mitigation

- reuse existing auth middleware
- route-level tests
- no independent backend
- no unapproved permission changes

## Governance

### Owner

Safety Department owns content publication and weekly approval.

### Technical Owner

HB Intel / SPFx maintainers own implementation, package truth, backend integration, and runtime proof.

### Approval Required For

- scoring model changes
- new public homepage metric
- override of hard-excluded candidate
- dynamic-only cutover
- removal of curated fallback

## Hard Stop Conditions

Do not deploy or cut over if:

- no published artifact exists
- homepage endpoint exposes raw findings/workbook JSON
- one score can select a winner alone
- preview fallback looks like production data without clear labeling
- scorecard is below flagship target without accepted exception
- hosted runtime does not match package/source truth
