# 09 — Editorial Workflow and Lifecycle

## Lifecycle states

- Draft
- In Review
- Approved
- Scheduled
- Published
- Archived
- Withdrawn

## Allowed actions by state

### Draft
- edit post content
- add/remove team members
- add/remove media
- preview against the resolved Project Spotlight shell
- submit for review
- delete/cancel before publish

### In Review
- reviewer comments
- return to draft
- approve
- reject

### Approved
- publish now
- schedule publish
- return to draft if needed

### Scheduled
- edit before cutoff
- unschedule
- publish now
- move back to approved

### Published
- edit
- republish
- regenerate from current shell if policy allows
- archive
- withdraw
- update Project Spotlight rollup flags

### Archived
- restore
- keep page live but suppressed from rollups, or withdraw it, depending on policy

### Withdrawn
- restore to draft or approved
- maintain traceability in bindings/history

## Preview model

Preview should reflect:

- resolved `TemplateKey`
- resolved `PageShellKey`
- shell-compatible banner behavior
- Team Viewer inclusion and mode
- gallery inclusion and mode
- Project Spotlight-specific visual treatment

Preview is critical to keeping authors out of raw page editing.

## Publish model

Publish must:

1. resolve the template profile
2. resolve the shell profile
3. validate shell compatibility
4. create a **new page on the Project Spotlight site** from the shell source if no page exists
5. inject mapped content into the shell controls
6. write/update the page-binding record
7. record workflow and operation history

## Republish model

Republish should normally:

- keep the same bound page
- update mapped controls in place
- preserve page identity and URL
- refresh binding timestamps and versions

Republish should **not** silently create a second live page for the same post unless the regeneration policy explicitly requires it.

## Regeneration / shell-drift model

A full regeneration may be required when:

- the shell version changes materially
- the bound page no longer matches the required shell structure
- the template registry row requires regeneration on shell drift

When full regeneration occurs, the system should:

- preserve the `PostId`
- preserve the intended slug/URL where feasible
- update version lineage in the binding record
- keep auditability of what happened

## Archive model

Archive should support one of two explicit policies:

### Policy A — soft archive
- keep the page live
- suppress it from active Project Spotlight rollups
- mark post and binding as archived

### Policy B — hard withdrawal/archive
- remove or withdraw the page from normal public use
- keep binding and history records intact

The chosen policy should be set intentionally and not left ambiguous.

## Workflow notes

- edits to a published post should not silently bypass governance
- reapproval rules may vary by post family
- workflow history should be recorded for governance and supportability
- shell/template version drift should be visible before publish/republish proceeds
