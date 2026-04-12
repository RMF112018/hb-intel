# 01 — Homepage Webpart Conformance Standard

## Standard statement

All homepage webparts must achieve **homepage-grade implementation maturity** equal to the HB Kudos public-facing webpart, adjusted for the intended purpose of the target webpart.

This standard governs:

- UI sophistication
- architectural discipline
- component composition
- state management
- data handling
- backend interactions
- accessibility
- host behavior
- validation and closure

## What this standard does not require

This standard does **not** require:

- identical layouts
- identical visual treatment
- identical interaction models
- unnecessary write paths on read-only webparts
- decorative complexity without value

## What it does require

This standard **does** require:

- equivalent implementation rigor
- equivalent UX intentionality
- equivalent attention to host/runtime realities
- equivalent backend/data discipline
- equivalent closure proof

## Conformance categories

### A. Purpose-fit surface sophistication
Each webpart must present a refined, deliberate, premium surface appropriate to its content family.

Required qualities:
- clear hierarchy
- purpose-fit density
- visible interaction affordances
- polished transitions where appropriate
- coherent detail model
- no unfinished or generic placeholder behavior

### B. Shared primitive discipline
Homepage webparts must preferentially compose from governed shared primitives and the constrained homepage entrypoint.

Required qualities:
- use `@hbc/ui-kit/homepage` where appropriate
- no unnecessary ad hoc reimplementation of existing primitives
- local-only composition permitted only when shared promotion would be premature or harmful
- no primitive bypass that causes governance drift

### C. Contract and data-shape rigor
Every webpart must use explicit, typed, repo-truth contracts.

Required qualities:
- explicit field mapping
- no silent stringly-typed drift where strong contracts are warranted
- no hidden coupling between view logic and transport data
- predicates and adapters must be testable and explicit

### D. Backend seam quality
Every read/write seam must be deliberate and robust.

Required qualities:
- canonical source binding
- correct host URL resolution
- no sloppy fallback behavior that risks wrong-target reads or writes
- clear success/failure handling
- cache invalidation where state changes must refresh the UI
- no avoidable stale-after-action behavior

### E. State orchestration quality
Webpart state must be intentional, decomposed, and aligned with UX.

Required qualities:
- clear view-state modeling
- deterministic action paths
- no brittle implicit transitions
- dialog-driven flows where confirmation or structured input is required
- no lazy `prompt/confirm`-style UX for premium flows

### F. Identity, people, and media handling
Where a webpart involves people, identity, recognition, authorship, or media, that logic must be credible.

Required qualities:
- correct identity attribution
- correct fallback behavior
- deliberate photo/media resolution logic
- no accidental public leakage of internal-only identity metadata

### G. UX completeness
Every webpart must fully address the user journey it exposes.

Required qualities:
- loading state
- error state
- empty state
- success state where applicable
- secondary/detail views where appropriate
- no dead buttons, dead links, or dead CTAs

### H. Accessibility and keyboard behavior
Every homepage webpart must provide credible keyboard and focus behavior.

Required qualities:
- visible focus states
- keyboard reachability
- no hover-only critical information
- semantic controls where feasible
- reduced-motion respect where appropriate

### I. SharePoint host-runtime resilience
Every homepage webpart must behave correctly inside the actual SharePoint host.

Required qualities:
- no hidden headers or obstructed critical controls
- no dependence on unrealistic sandbox conditions only
- proper accommodation of persistent host controls
- acceptable behavior at common viewport and zoom conditions

### J. Validation and proof
Every homepage webpart must prove its quality.

Required qualities:
- audit traceability
- screenshot proof
- defect logging
- explicit pass/fail closure
- test coverage appropriate to the webpart’s interaction and data complexity

## Prohibited patterns

The following are prohibited unless explicitly justified and accepted:

- generic “just make it look nicer” implementations without benchmark mapping
- shallow UI-only upgrades that do not improve backend/data rigor
- ad hoc direct field usage without contract normalization where normalization is warranted
- dead controls left for “future implementation” without visible suppression
- inconsistent host/runtime handling across homepage webparts
- inconsistent state semantics across similar interaction families
- closure based on visual improvement alone
