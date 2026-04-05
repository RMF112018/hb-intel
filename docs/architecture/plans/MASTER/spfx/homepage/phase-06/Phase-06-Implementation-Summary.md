# Phase 06 Implementation Summary — Homepage Operating Model and Content Governance

## Objective

Establish the operating model that sits on top of the now-completed three-lane SharePoint architecture.

By the end of Phase 05, the repo truth shows:

- Lane A is implemented as the singular HB Central homepage product.
- Lane B is implemented as the shell-extension product.
- Lane C is established as the navigation / branding / template governance lane.
- The primary unresolved question is no longer structural architecture. It is **operational governance**: who owns homepage content, how often it must be refreshed, what authors can do without review, when approval is required, and when changes must escalate to architecture.

Phase 06 exists to close that gap.

## Why this phase is next

Phase 05 intentionally deferred several operational items that are not new product-lane engineering features but are still necessary for a production-grade homepage program:

- homepage content ownership and freshness
- broader content authoring governance
- operationalization of review cycles
- authoring/admin guidance beyond navigation and page templates
- explicit workflow rules for sustaining the homepage after implementation

That makes Phase 06 the correct next phase.

## Recommended scope

### Prompt 01 — Homepage Ownership and Freshness Policy
Create the canonical policy for:
- zone ownership
- webpart-level ownership
- freshness cadence
- rotation expectations
- stale-content handling
- escalation for neglected or abandoned content
- quarterly governance review cadence

### Prompt 02 — Authoring Workflow and Admin Configuration
Create the practical operating model for:
- self-service authoring vs governed authoring
- who may edit what
- what requires approval
- what is prohibited without architecture review
- how admins configure homepage content safely
- how requests for change move between Communications, Operations, admins, and architecture

## Deliverables expected

Recommended deliverables for this phase:

- `docs/reference/sharepoint-homepage-ownership-and-freshness.md`
- `docs/reference/sharepoint-homepage-authoring-governance.md`
- `docs/how-to/administrator/sharepoint-homepage-operating-guide.md`
- `docs/how-to/administrator/sharepoint-homepage-content-review-guide.md`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-06/Phase-06-01-Completion-Note.md`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-06/Phase-06-02-Completion-Note.md`

The exact filenames may vary if repo-truth placement suggests a better fit, but the semantics should remain the same.

## What this phase must preserve

This phase must preserve all currently locked architectural truths:

1. **Homepage is singular**
   - One HB Central homepage using the Lane A homepage package.
2. **Lane A remains page-canvas only**
   - No shell or nav takeover behavior.
3. **Lane B remains placeholder-only**
   - No expansion into unsupported shell control.
4. **Lane C remains governance-only**
   - No new custom code packages for navigation governance.
5. **Native SharePoint first for non-homepage pages**
   - Homepage custom webparts stay reserved for the homepage unless architecture approves an exception.

## Recommended acceptance criteria

Phase 06 is complete when:

- homepage ownership is explicitly assigned by zone and by webpart
- freshness and rotation rules are documented and enforceable operationally
- stale or abandoned content has an explicit handling path
- self-service vs governed edits are clearly separated
- architecture review gates are explicit and narrow
- all new docs are cross-linked from `docs/README.md`
- `current-state-map.md` receives classification entries for the new docs
- the new guidance does not contradict prior phase boundaries

## Not in scope

- workflow automation
- property-pane implementation
- async data integration
- content management backend
- persistent dismiss-state infrastructure
- packaging/performance hardening
- accessibility audit and QA closure
