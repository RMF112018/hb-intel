# Plan Summary — People & Culture Full Compliance Closure

## Objective

Close the remaining compliance gaps in the People & Culture application so the implementation is fully aligned with current repo truth, split-boundary requirements, operating-model expectations, accessibility standards, packaging integrity, and premium UI doctrine.

## Current State Summary

The current implementation has a real split architecture, but it is not fully closed. The largest remaining issues are:

- the companion still behaves like a reducer-first operating shell rather than a fully durable operating console
- milestone acceptance and intake promotion do not fully complete the content-creation/linkage workflow
- approval ownership and reassignment logic are still partially encoded through tags instead of first-class modeled fields
- role resolution is too permissive
- the public surface and companion still rely too heavily on local inline presentation instead of fully governed premium shared surfaces
- accessibility and keyboard/focus behavior are below full production standard
- full-width / responsive behavior is not yet at the expected polished SharePoint standard
- packaging, validation, and release proof must be rerun after remediation and updated to match the final state

## Workstreams

### 1. Authority Lock and Repo-Truth Reconciliation

- reconcile the codebase against the current People & Culture governing documents and current repo implementation
- identify any stale comments, stale docs, or conflicting guidance
- make repo truth explicit where prior docs lag the implementation

### 2. Persistence and Contract Closure

- replace simulated or reducer-only operating behavior with durable typed persistence paths
- define or tighten first-class contracts for:
  - people & culture items
  - approvals ownership / assignment
  - milestone candidates
  - intake submissions
  - homepage governance state
  - notifications / transition events as applicable
- eliminate lossy or ad hoc workflow representations where practical

### 3. Workflow Closure

- complete the actual lifecycle transitions end-to-end
- ensure:
  - milestone acceptance can create and link real items
  - intake promotion can create and link real draft items
  - approval, rejection, claim, reassign, suppress, archive, tier changes, and pin/unpin all update the correct durable state consistently

### 4. Premium Surface and Shared UI Closure

- upgrade the public People & Culture surface to a signature-grade premium implementation
- reduce local one-off inline UI logic where governed shared primitives or new shared surface families should exist
- preserve the non-recognition split boundary while improving the visual system

### 5. Accessibility and Responsive Compliance

- make tabs, dialogs, drawers, modals, focus handling, keyboard navigation, and announcement semantics production-grade
- ensure the operating console works comfortably at normal browser zoom without requiring artificial zoom reduction
- remove unnecessary width bottlenecks for full-width SharePoint placements

### 6. Validation, Packaging, and Release Proof

- update tests
- update smoke/packaging validation where needed
- rebuild `hb-webparts`
- verify manifests, shell entries, bundle freshness, and package contents
- produce clear closeout proof

## Non-Negotiable Constraints

- keep HB Kudos separate from People & Culture Public and HR Companion
- preserve the legacy merged seam until migration completion is explicitly proven
- do not introduce new package-boundary violations
- prefer `@hbc/ui-kit/homepage` and shared surface governance over further local drift
- do not leave the companion in a partially simulated operating state once remediation is complete

## Acceptance Criteria

The work is complete only when all of the following are true:

- the split boundary is still clean and enforced
- the companion is no longer materially dependent on reducer-only simulated operations for its primary workflows
- milestone and intake flows are closed end-to-end
- role and approval ownership logic are first-class and not permissive by default
- the public and companion surfaces meet premium UI expectations and SharePoint layout expectations
- tabs/dialogs/drawers/modals meet production-grade accessibility behavior
- tests and smoke coverage reflect the final implementation
- the rebuilt package is fresh, valid, and deployment-ready
- docs/comments are reconciled to the final repo truth
