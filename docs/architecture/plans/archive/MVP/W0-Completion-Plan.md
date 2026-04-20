# HB Intel — Updated Wave 0 Closeout Plan

## Purpose

This document defines the complete **Wave 0 closeout plan** required before broad Wave 1 execution begins. It updates the prior closeout approach to reflect the newly clarified product direction:

- **Personal Work Hub** is the **primary Wave 1 operating layer** after SharePoint provisioning.
- **Leadership** is no longer planned as a standalone major application stream.
- The platform should move into Wave 1 with a clean runway for a **user-centered operating surface** that all major workflows publish back into.

This plan is intentionally focused on **pre–Wave 1 cleanup, stabilization, governance correction, and platform-readiness work**. It is **not** a feature-build plan for Wave 1 itself.

---

## Strategic Update Driving This Closeout Plan

The current roadmap still states that:

- **Wave 1** should focus on **Project Hub**, **Estimating**, and **Business Development**.
- **Wave 2** should focus on **Leadership**, **Operational Excellence**, and **My Dashboard**.
- the PWA’s Wave 1 role is to prove a “personal home layer that feels trustworthy enough to be a real entry point.” fileciteturn8file5 fileciteturn8file1

At the same time, the uploaded blueprint already frames the UX around a **primary personal layer** and requires a user-centered operating model, while PH7 stabilization remains active and must complete before feature expansion. fileciteturn8file2 fileciteturn8file3

This means the current documents are partially misaligned:

- the **blueprint doctrine** already points toward a personal-first operating layer,
- but the **roadmap sequencing** still treats that layer as mostly a later-stage concern,
- and the **Leadership** app remains overstated as a standalone future stream.

Wave 0 closeout must therefore include the corrections needed so Wave 1 can begin from the right operating model.

---

## Updated Wave 0 Closeout Objective

Wave 0 is complete only when the platform leaves Wave 1 with:

1. a trusted and supportable provisioning foundation,
2. a fully closed PH7 stabilization gate,
3. accurate repo-truth and governing documentation,
4. a normalized SPFx/PWA platform baseline,
5. a clear shared-package readiness model,
6. and a defined runway for **Personal Work Hub as the primary Wave 1 layer**.

---

## Closeout Principles

### 1. Do not start broad Wave 1 coding on stale architecture assumptions
The roadmap and blueprint must agree on the primary operating-layer strategy before implementation expands.

### 2. Finish technical and governance gates before new app growth
PH7 stabilization is still active, and the blueprint explicitly states that PH7.12 must complete before expansion begins. fileciteturn8file3

### 3. Personal Work Hub is a Wave 1 dependency, not a later polish item
Wave 0 does not need to implement the full Work Hub, but it **does** need to leave behind the contracts, dependencies, publishing rules, and surface assumptions that Wave 1 will rely on.

### 4. Leadership remains a supported audience, not a standalone app-wave dependency
Leadership value should be provided through role-based visibility in the Personal Work Hub and downstream app surfaces rather than through a separate heavyweight app family.

### 5. Shared features must be hardened where they are intended standards
The roadmap explicitly says shared features are part of delivery, should be used by default where appropriate, and should be hardened rather than casually bypassed with app-local divergence. fileciteturn8file8

---

## Updated Definition of Wave 0 Completion

Wave 0 is complete when all of the following are true:

- present-state governance documents accurately describe the live repo,
- PH7.12 and PH7.13 are closed or formally waived with explicit rationale,
- provisioning is reliable, diagnosable, recoverable, and support-ready,
- the SPFx and PWA baseline is normalized enough to support Wave 1 without mixed assumptions,
- the roadmap and blueprint agree that **Personal Work Hub** is the primary Wave 1 operating layer,
- Leadership is removed as a standalone wave dependency,
- the Work Hub publication model and shared-package dependency rules are defined,
- and CI / testing gates are strong enough that Wave 1-critical streams cannot move forward on soft verification.

---

# Workstream A — Governance, Repo Truth, and Planning Alignment

## Objective
Reconcile the platform’s official present-state and staged-delivery documents so Wave 1 planning starts from one trustworthy baseline.

## Why this is required
The blueprint explicitly says PH7 stabilization remains active and feature expansion is gated by PH7.12 sign-off. The roadmap still places the personal operating layer in Wave 2, which is now stale relative to the clarified product direction. fileciteturn8file3 fileciteturn8file5

## Scope

### A1. Reconcile current-state truth to the live repo
Update the present-state source documents so they accurately reflect:
- app inventory,
- package inventory,
- package versions,
- current maturity labels,
- active streams,
- deferred streams,
- and current gate status.

### A2. Update the staged wave model
Revise the roadmap wave structure to reflect:
- **Foundation / Wave 0** = Project Setup / SharePoint provisioning and platform footing,
- **Wave 1** = **Personal Work Hub + Project Hub + Estimating + Business Development**,
- **Wave 2** = Operational Excellence + selected downstream operating-layer growth,
- remove **Leadership** as a standalone major app-wave stream,
- remove **My Dashboard** as a separate planned app concept.

### A3. Update immediate planning actions
Replace any roadmap next-step language that still assumes:
- a future `My Dashboard` app definition,
- Leadership as a future independent app family,
- or Work Hub as only a later home-layer enhancement.

### A4. Update doctrine language in the blueprint / companion docs
Make the following explicit:
- **Personal Work Hub** is the primary user operating layer after provisioning.
- **Project Hub** remains the primary project operating layer.
- Leadership value is delivered through role-aware visibility, cards, escalation views, and drill-ins rather than a standalone leadership application.
- PH9b or similar “My Work Feed” deferred language must be split between:
  - now-core operating-layer scope, and
  - true future UX enhancements.

## Deliverables
- updated roadmap markdown,
- updated blueprint language where required,
- updated current-state / crosswalk references,
- Wave 0 Closeout Baseline Note,
- Wave 1 Entry Criteria Note.

## Exit criteria
- no material conflict remains between the staged roadmap and the platform doctrine,
- no official planning document treats Leadership as a required standalone future app stream,
- no official planning document treats Personal Work Hub as merely a later-stage enhancement.

After the changes:

Run the full verification suite for the appropriate app (check-types, lint, build, test if present).
Bump the version in apps/admin/package.json to the next patch (UI polish only).
Prepare a conventional commit message in exact G6 style (e.g., "docs(apps/admin): replace ErrorLogPage stub with clear HbcSmartEmptyState (G6-T01)").
Output only the final commit message followed by a one-paragraph summary (files changed, empty-state implementation, verification results). 

---

# Workstream B — PH7 Stabilization Closure

## Objective
Finish the technical and governance gate that must close before any broad feature expansion begins.

## Why this is required
The blueprint states that:
- **PH7.12 Final Verification** must complete before feature expansion,
- **PH7.13 Stub Detection Enforcement** is active,
- PH7 expansion may not begin until PH7.12 acceptance criteria are satisfied and ADR-0091 is on disk. fileciteturn8file3

## Scope

### B1. Finish PH7.12 Final Verification
Complete all verification, sign-off, documentation, and required evidence linked to PH7.12.

### B2. Finish PH7.13 Stub Detection Enforcement
Implement and enforce the stub-detection rules required to prevent unfinished placeholders from surviving into Wave 1-critical paths.

### B3. Resolve or document all findings
Each finding must be either:
- fixed,
- formally waived,
- or deferred with explicit classification and rationale.

### B4. Verify ADR requirements
Confirm that ADR-0091 and any other gating ADR artifacts required by the governing docs are present, correct, and linked.

## Deliverables
- PH7 Final Verification Sign-Off Packet,
- PH7 residual findings log,
- CI enforcement note for stub detection,
- formal waiver register if needed.

## Exit criteria
- PH7.12 is signed off,
- PH7.13 enforcement is live,
- no active PH7 gate is silently carried into Wave 1.

After the changes:

Run the full verification suite for the appropriate app (check-types, lint, build, test if present).
Bump the version in apps/admin/package.json to the next patch (UI polish only).
Prepare a conventional commit message in exact G6 style (e.g., "docs(apps/admin): replace ErrorLogPage stub with clear HbcSmartEmptyState (G6-T01)").
Output only the final commit message followed by a one-paragraph summary (files changed, empty-state implementation, verification results). 

---

# Workstream C — Provisioning Foundation Hardening and Support Readiness

## Objective
Close Wave 0 with the provisioning foundation fully trustworthy, supportable, and ready to publish forward into the Personal Work Hub model.

## Why this is required
The roadmap defines the foundation stream as the platform’s first visible MVP proof and says it must demonstrate reliable setup, understandable status/ownership, recoverable failure handling, and enough user trust to support the next wave. fileciteturn8file5

## Scope

### C1. Re-verify the end-to-end provisioning lifecycle
Confirm and validate:
- request creation,
- controller/save-and-provision action,
- status visibility,
- progress tracking,
- completion handoff,
- failure handling,
- retry,
- rollback / recovery,
- admin intervention,
- and post-completion visibility.

### C2. Verify explainability and user clarity
Every important provisioning state must be understandable to:
- the requesting user,
- the controller / initiating role,
- and the admin support role.

### C3. Verify supportability
Ensure common failure modes can be diagnosed and addressed through:
- the UI,
- the admin surface,
- and runbook guidance,
without requiring hidden developer-only knowledge.

### C4. Remove dead wiring and manual assumptions
Any placeholder handlers, partially wired transitions, or undocumented manual support steps must be:
- finished,
- removed,
- or explicitly documented as non-blocking debt.

### C5. Publish provisioning into the Personal Work Hub model
Define how provisioning states will feed the future Personal Work Hub, including:
- waiting on me,
- waiting on others,
- important state changes,
- failure/escalation states,
- completed setup confirmation,
- and linked project actions.

## Deliverables
- Provisioning Verification Matrix,
- Provisioning Support Runbook,
- Admin Recovery Runbook,
- Provisioning-to-Work-Hub Publication Contract.

## Exit criteria
- happy path, failure path, retry path, and admin recovery path are proven,
- the provisioning foundation is support-ready,
- provisioning can publish cleanly into the future Work Hub model.

After the changes:

Run the full verification suite for the appropriate app (check-types, lint, build, test if present).
Bump the version in apps/admin/package.json to the next patch (UI polish only).
Prepare a conventional commit message in exact G6 style (e.g., "docs(apps/admin): replace ErrorLogPage stub with clear HbcSmartEmptyState (G6-T01)").
Output only the final commit message followed by a one-paragraph summary (files changed, empty-state implementation, verification results). 

---

# Workstream D — Personal Work Hub Runway Definition

## Objective
Leave Wave 1 with the required operating contracts so Personal Work Hub can be built as the primary user layer without inventing its semantics from scratch.

## Why this is required
The roadmap currently understates the personal operating layer by placing it later, while the clarified product direction makes it the next most important capability after provisioning. Wave 0 must therefore define the runway, even if Wave 1 performs the actual build. fileciteturn8file5

## Scope

### D1. Define the Work Hub publication model
Create the minimum publication model for what major workflows will publish back to the user layer.

Minimum publication categories:
- **Waiting on Me**
- **Waiting on Others**
- **Recent Activity / Recently Touched**
- **Important State Changes**
- **Escalations / Attention Needed**
- **Project-Linked Work**
- **Notifications / Reminders / Ownership Changes**

### D2. Define the first wave of publishing sources
At minimum, define publication expectations for:
- provisioning,
- estimating,
- business development,
- project setup status / handoff,
- project-linked workflow state changes,
- admin/support escalations where role-appropriate.

### D3. Define user-entry behavior
Specify the shell and routing assumptions for:
- default PWA landing experience,
- role-specific entry views,
- work-to-project drilldown,
- cross-app navigation from personal work to project surfaces.

### D4. Define data/interaction rules
Specify how Work Hub items should behave, including:
- ownership identity,
- due-state treatment,
- stale-state labeling,
- last-synced requirements,
- source-of-truth links,
- mutation vs navigation actions,
- and audit/history expectations where applicable.

### D5. Recast leadership visibility
Define how leadership-facing visibility will be delivered through:
- role-specific Work Hub views,
- role-aware summary cards,
- portfolio-level attention surfaces,
- and drill-ins to Project Hub or downstream operational views.

## Deliverables
- Personal Work Hub Runway Definition,
- Work Hub Publication Model,
- Work Hub Interaction Contract,
- Leadership-as-View Model Note.

## Exit criteria
- Wave 1 can begin Work Hub design/build from explicit operating rules,
- Leadership is no longer treated as a separate planned app family,
- major workflows have defined publication behavior into the Work Hub.

After the changes:

Run the full verification suite for the appropriate app (check-types, lint, build, test if present).
Bump the version in apps/admin/package.json to the next patch (UI polish only).
Prepare a conventional commit message in exact G6 style (e.g., "docs(apps/admin): replace ErrorLogPage stub with clear HbcSmartEmptyState (G6-T01)").
Output only the final commit message followed by a one-paragraph summary (files changed, empty-state implementation, verification results). 

---

# Workstream E — Shared-Package Readiness Audit for Wave 1 and Work Hub

## Objective
Audit and classify the shared-platform packages that Wave 1 and Personal Work Hub will depend on, and create hard no-go rules for immature dependencies.

## Why this is required
The roadmap states that shared features are part of the delivery roadmap, should be used by default where they fit, and should be hardened rather than casually replaced with app-local divergence. fileciteturn8file8

## Scope

### E1. Build a Wave 1 dependency matrix
Map shared-package dependencies for:
- Personal Work Hub,
- Project Hub,
- Estimating,
- Business Development.

### E2. Classify readiness
For each dependency, classify as:
- **Ready**
- **Ready with Restrictions**
- **Must Be Hardened Before Critical Use**
- **Do Not Use in Critical Path Yet**

### E3. Confirm mandatory standards ownership
At minimum, confirm package ownership/readiness for:
- auth / RBAC,
- project context persistence,
- ownership visibility / ball-in-court,
- notifications,
- session persistence / degraded-state protection,
- workflow handoff / routing,
- related item graphing,
- governed layout / personalization if applicable,
- audit/history where applicable.

### E4. Prohibit app-local substitutes in critical areas
Where a shared package is the intended standard, prohibit building an app-local replacement without an explicit documented exception.

### E5. Work Hub critical-path review
Perform a specific dependency review for the packages most likely to underpin Personal Work Hub, including at minimum:
- `@hbc/bic-next-move`
- `@hbc/notification-intelligence`
- `@hbc/session-state`
- `@hbc/project-canvas`
- `@hbc/workflow-handoff`
- `@hbc/related-items`
- relevant auth / context packages

## Deliverables
- Wave 1 Shared-Package Dependency Matrix,
- Personal Work Hub Dependency Readiness Matrix,
- Shared-Package No-Go Rules,
- Exception log if any temporary restrictions are allowed.

## Exit criteria
- Wave 1 teams know exactly which shared packages are safe to use,
- no critical Work Hub dependency remains ambiguous,
- app-local divergence is controlled rather than accidental.

After the changes:

Run the full verification suite for the appropriate app (check-types, lint, build, test if present).
Bump the version in apps/admin/package.json to the next patch (UI polish only).
Prepare a conventional commit message in exact G6 style (e.g., "docs(apps/admin): replace ErrorLogPage stub with clear HbcSmartEmptyState (G6-T01)").
Output only the final commit message followed by a one-paragraph summary (files changed, empty-state implementation, verification results). 

---

# Workstream F — SPFx / PWA Baseline Normalization

## Objective
Ensure Wave 1 begins from one intentional cross-surface baseline instead of inheriting mixed assumptions about SPFx, PWA behavior, and shell responsibilities.

## Why this is required
The roadmap says Wave 1 must progress both SPFx and PWA, with the PWA proving trusted unified value. It specifically requires a personal home layer trustworthy enough to be a real entry point. fileciteturn8file5

## Scope

### F1. Define a single Wave 1 surface-readiness rubric
Document what “usable enough” means for each Wave 1 stream in:
- SPFx,
- PWA,
- and cross-surface shared flows.

### F2. Normalize SPFx baseline assumptions
Confirm and document:
- supported dependency baseline,
- shared SPFx support approach,
- build/release expectations,
- and any required upgrade or alignment work before Wave 1 accelerates.

### F3. Normalize PWA shell behavior
Define and implement baseline rules for:
- Personal Work Hub landing behavior,
- app launch behavior,
- route protection,
- role-aware entry surfaces,
- notification/ownership surfacing in shell-level experience.

### F4. Normalize offline / degraded-state UX
The blueprint requires that users always know when they are in a degraded state, that unsupported offline actions fail clearly, and that loaded data remains visible with “last synced” clarity. Apply those rules to all user-centric work surfaces that will underpin the Work Hub. fileciteturn8file6

### F5. Normalize update and freshness behavior
Define the minimum user-visible freshness behavior required for trusted PWA use, including:
- last synced display where applicable,
- stale state indicators,
- update handling expectations,
- and safe shell-level refresh behavior.

## Deliverables
- Wave 1 SPFx/PWA Readiness Rubric,
- SPFx baseline note,
- PWA shell baseline note,
- degraded-state UX standard,
- update/freshness behavior note.

## Exit criteria
- both surfaces have one explicit baseline,
- PWA is positioned to become the user’s trusted personal entry point,
- no major Wave 1 stream depends on undocumented surface assumptions.

After the changes:

Run the full verification suite for the appropriate app (check-types, lint, build, test if present).
Bump the version in apps/admin/package.json to the next patch (UI polish only).
Prepare a conventional commit message in exact G6 style (e.g., "docs(apps/admin): replace ErrorLogPage stub with clear HbcSmartEmptyState (G6-T01)").
Output only the final commit message followed by a one-paragraph summary (files changed, empty-state implementation, verification results). 

---

# Workstream G — Testing, CI, and Verification Hardening

## Objective
Make Wave 0 closeout enforceable through CI and repeatable verification rather than relying on manual confidence.

## Scope

### G1. Harden CI gates for Wave 1-critical areas
Require green status for:
- build,
- lint,
- typecheck,
- package tests,
- cross-surface smoke tests,
- and any gating validation scripts tied to PH7 closeout.

### G2. Remove soft test postures
Wave 1-critical packages should not be allowed to pass with absent or purely placeholder test coverage.

### G3. Add compact cross-surface verification coverage
At minimum, add repeatable verification for:
- provisioning state transitions,
- support/admin recovery,
- shell route protection,
- role-based launch behavior,
- publication contract validation where feasible.

### G4. Enforce stub / placeholder controls in CI
PH7.13 should not exist as a paper requirement only. Its enforcement must have practical CI effect.

### G5. Publish release-verification checklist
Create a compact pre-merge / pre-release checklist for foundational flows and closeout-sensitive areas.

## Deliverables
- Wave 1-critical CI Gate Checklist,
- Cross-Surface Smoke Verification Suite,
- Stub Enforcement CI Note,
- Release Verification Checklist.

## Exit criteria
- critical areas cannot silently pass with weak verification,
- foundational Wave 0 flows are reproducibly testable,
- CI meaningfully protects Wave 1 from inheriting unresolved foundation risk.

After the changes:

Run the full verification suite for the appropriate app (check-types, lint, build, test if present).
Bump the version in apps/admin/package.json to the next patch (UI polish only).
Prepare a conventional commit message in exact G6 style (e.g., "docs(apps/admin): replace ErrorLogPage stub with clear HbcSmartEmptyState (G6-T01)").
Output only the final commit message followed by a one-paragraph summary (files changed, empty-state implementation, verification results). 

---

# Workstream H — Closeout Documentation and Wave 1 Entry Gate

## Objective
Finish Wave 0 with an explicit handoff package so Wave 1 begins from approved readiness criteria rather than tribal knowledge.

## Scope

### H1. Publish Wave 0 Closeout Report
Include:
- completed work,
- corrected issues,
- resolved gaps,
- remaining open items,
- and final gate status.

### H2. Publish Residual Debt Register
Split into:
- **Must Fix Before Wave 1**
- **Approved Carry-Forward into Wave 1**

### H3. Publish Wave 1 Entry Gate
The entry gate should explicitly check:
- governance alignment,
- PH7 closure,
- provisioning trust,
- Work Hub runway definition,
- shared-package readiness,
- SPFx/PWA normalization,
- CI/test gate sufficiency.

### H4. Publish sponsor / outside dependency note if needed
The roadmap explicitly recognizes outside dependencies such as sponsor engagement, environment readiness, and support handoff readiness. Capture any unresolved external blockers that may affect sequencing. fileciteturn8file8

## Deliverables
- Wave 0 Closeout Report,
- Residual Debt Register,
- Wave 1 Entry Gate Checklist,
- Outside Dependency Note if needed.

## Exit criteria
- Wave 1 starts from explicit approved criteria,
- there is one authoritative list of non-blocking carry-forward debt,
- no major Wave 0 risk is only known informally.

After the changes:

Run the full verification suite for the appropriate app (check-types, lint, build, test if present).
Bump the version in apps/admin/package.json to the next patch (UI polish only).
Prepare a conventional commit message in exact G6 style (e.g., "docs(apps/admin): replace ErrorLogPage stub with clear HbcSmartEmptyState (G6-T01)").
Output only the final commit message followed by a one-paragraph summary (files changed, empty-state implementation, verification results). 

---

# Hard No-Go Gates Before Broad Wave 1 Execution

The following are true blockers and should prevent broad Wave 1 execution if unresolved:

1. **Planning misalignment remains unresolved**
   - roadmap still treats Personal Work Hub as a later concern,
   - Leadership still persists as a standalone app-wave dependency,
   - or `My Dashboard` remains a parallel future app concept.

2. **PH7 stabilization is not closed**
   - PH7.12 not signed off,
   - PH7.13 not enforced,
   - or ADR/gating artifacts still incomplete. fileciteturn8file3

3. **Provisioning is not fully trustworthy and supportable**
   - unclear status/ownership,
   - incomplete failure recovery,
   - incomplete admin support path,
   - or hidden manual steps remain in the core lifecycle. fileciteturn8file5

4. **Personal Work Hub runway is undefined**
   - no publication model,
   - no dependency matrix,
   - no leadership-as-view model,
   - or no agreed landing/interaction assumptions.

5. **Shared-package critical-path readiness remains ambiguous**
   - Wave 1 teams still have to guess which shared packages are safe to rely on.

6. **SPFx / PWA baseline remains mixed or undocumented**
   - especially if the PWA still behaves only as a launcher shell with no trustworthy personal-entry posture. fileciteturn8file5

7. **CI/test controls remain too soft for Wave 1-critical paths**
   - critical streams can still pass with weak or missing verification.

---

# Items That May Carry Forward Into Wave 1 Without Blocking It

These should not hold up Wave 1 if the closeout gates above are met:

- non-critical UI polish,
- broader PWA experience refinement beyond the minimum trusted personal-entry layer,
- stronger future offline-first behavior beyond the current defensive degraded-state requirement,
- later-stage field-specific mobile/offline expansion,
- future-stage app families not needed for Wave 1 proof,
- deeper leadership analytics beyond role-based Work Hub visibility.

---

# Recommended Execution Order

## Closeout Package 1 — Truth and Gate Closure
- Workstream A: Governance, Repo Truth, and Planning Alignment
- Workstream B: PH7 Stabilization Closure

## Closeout Package 2 — Foundation Trust
- Workstream C: Provisioning Foundation Hardening and Support Readiness
- Workstream G: Testing, CI, and Verification Hardening (foundation-first subset)

## Closeout Package 3 — Wave 1 Runway
- Workstream D: Personal Work Hub Runway Definition
- Workstream E: Shared-Package Readiness Audit for Wave 1 and Work Hub
- Workstream F: SPFx / PWA Baseline Normalization

## Closeout Package 4 — Formal Handoff
- Workstream H: Closeout Documentation and Wave 1 Entry Gate

---

# Suggested Milestone Structure

## Milestone 1 — Closeout Governance Locked
- roadmap updated,
- blueprint companion language updated,
- current-state truth reconciled,
- PH7 closeout package nearing sign-off.

## Milestone 2 — Wave 0 Foundation Proven
- provisioning fully re-verified,
- support/admin runbooks complete,
- CI/test hardening in place,
- stub enforcement live.

## Milestone 3 — Personal Work Hub Runway Ready
- Work Hub publication model approved,
- leadership-as-view model approved,
- shared-package dependency matrix approved,
- SPFx/PWA baseline documented and accepted.

## Milestone 4 — Wave 1 Entry Approved
- closeout report published,
- residual debt formally classified,
- Wave 1 entry gate approved,
- non-blocking carry-forward debt explicitly authorized.

---

# Final Recommendation

Treat this as a **short, high-discipline closeout tranche**, not a shadow Wave 1.

The purpose is not to continue expanding the application surface. The purpose is to remove the specific ambiguities and stability risks that would otherwise contaminate Wave 1 — especially now that **Personal Work Hub** has been clarified as the next major platform layer after provisioning.

Wave 0 should end with:
- trusted provisioning,
- closed PH7 gates,
- aligned planning doctrine,
- a normalized dual-surface baseline,
- a hardened shared-package posture,
- and a fully defined runway for the Personal Work Hub.

That is the cleanest and most defensible handoff into Wave 1.
