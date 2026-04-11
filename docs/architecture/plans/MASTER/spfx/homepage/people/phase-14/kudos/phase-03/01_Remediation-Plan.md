# HB Kudos Remediation Plan

## Objective
Close the remaining HB Kudos defects so the implementation is genuinely complete, compliant, premium, production-ready, and defensible against repo-truth audit.

## Phase 1 — Unblock operational authoring
### Priority
Critical

### Scope
- Enable real SharePoint property-pane authoring for HB Kudos Companion and any related Kudos runtime properties.
- Ensure the HR Admin page instance at:
  - `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/SitePages/HR-Admin.aspx`
  can be configured without code edits.

### Required outcomes
- `kudosAdminsGroup` authorable in property pane
- `kudosReviewersGroup` authorable in property pane
- empty/misconfigured state handled explicitly in runtime
- no reliance on `simulatedRole` in live SharePoint-hosted execution

---

## Phase 2 — Fix data freshness and mutation trust
### Priority
Critical

### Scope
- add explicit invalidation or refetch after all Kudos mutations
- remove stale-after-action behavior from employee and companion surfaces

### Required outcomes
- governance actions visibly refresh queue/detail/archive state
- submit and celebrate flows reconcile live data
- cache model remains performant but no longer undermines operator trust

---

## Phase 3 — Close decision-lock behavior gaps
### Priority
Critical / High

### Scope
- workflow lifecycle
- recipient model
- visibility / reduced-history safety
- scheduling / prominence / age-off

### Required outcomes
- runtime-reachable UI for locked employee and moderation actions
- support for any valid non-empty recipient bucket combination
- correct reduced-history rendering for associated non-governance viewers
- configurable age-off and wired scheduled prominence collision handling

---

## Phase 4 — Close UI-kit and doctrine drift
### Priority
High

### Scope
- companion governance workspace
- employee support surfaces
- shared governance primitives
- hardcoded local styling
- shared-surface promotion

### Required outcomes
- tokenized, governed surfaces
- premium host-aware composition
- reduced bespoke local visual logic
- doctrine-compliant promotion of repeated patterns

---

## Phase 5 — Accessibility and interaction closure
### Priority
High

### Scope
- tabs/filter semantics
- focus treatment
- flyout/dialog behavior
- keyboard navigation
- control state contrast

### Required outcomes
- no fake tab semantics
- visible focus on all custom controls
- accessible dialog/flyout interactions
- no local outline suppression without compliant replacement

---

## Phase 6 — Notification, reminder, and operational rigor
### Priority
Medium / High

### Scope
- convert current intent-only / queue-only reminder model into a defensible operational seam
- make threshold and cadence behavior configurable where locked

### Required outcomes
- notification/reminder model no longer over-claimed
- runtime and docs align
- clear distinction between implemented dispatch and deferred delivery channels

---

## Phase 7 — Packaging proof and repo cleanup
### Priority
High

### Scope
- package freshness proof
- manifest/config hygiene
- legacy remnants
- stale comments/docs

### Required outcomes
- rebuilt `hb-webparts.sppkg` proven current
- generated shell artifacts aligned with source
- manifest claims match runtime truth
- legacy Kudos remnants either retired or clearly documented

---

## Exit criteria
The remediation pass is only complete when all of the following are true:

- property-pane authoring works for the companion on the HR Admin page
- decision-lock behavior is runtime-reachable, not just type-level or writer-level
- public, archive, detail, and governance surfaces all refresh correctly after mutations
- non-governance viewers only see reduced-history-safe detail
- recipient validation matches the locked recipient model
- age-off and prominence rules are truly enforced
- companion and employee surfaces meet current `@hbc/ui-kit` and `docs/reference/ui-kit/` doctrine
- accessibility defects identified in the audit are closed
- package freshness is directly proven for current source
- final closure report is written under `docs/architecture/reviews/`
