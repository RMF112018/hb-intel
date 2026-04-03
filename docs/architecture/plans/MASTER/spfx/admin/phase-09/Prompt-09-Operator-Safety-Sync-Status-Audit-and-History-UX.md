# Prompt-09 — Operator Safety, Sync Status, Audit, and History UX

## Objective

Finish the operator-facing execution experience for Phase 9 by adding the risk-aware preview, source-of-authority visibility, connection-status visibility, sync-status, result, and audit/history behavior needed to make Hybrid Identity actions usable and defensible.


## Hard gate

Treat the following as mandatory for this prompt and all later prompts:

After the final `.sppkg` is delivered, IT must be able to install the app and complete required operational setup and ongoing maintenance **without editing source code, manifests, environment files, backend configuration files, deployment templates, or package files**.

This prompt must therefore drive the repo toward:

- UI-managed setup, testing, rotation, and maintenance of required backend connections,
- secure backend custody/resolution of secrets and credentials,
- explicit operator-visible preflight checks for any external prerequisite the app cannot create itself,
- and documentation that distinguishes allowed admin-page approvals from prohibited code-edit setup.

Standard Microsoft admin approval pages are allowed where unavoidable. Code interaction is not.


## Important execution rules

- Do not re-read files still in active context unless needed.
- Use the risk taxonomy and source-of-authority matrix from Prompt-03 as the controlling design inputs.
- Add enough safety UX for Phase 9 to be serious and operable, but do not drift into full Phase 11 maturity work.
- Keep the UI backed by real backend evidence/results.

## Scope

Complete the operator-facing experience for the approved Hybrid Identity workflows, including:

- risk display,
- source-of-authority display,
- preview/impact summaries where phase-appropriate,
- explicit destructive confirmations where required,
- result states,
- connection-status / preflight visibility where phase-appropriate,
- setup-blocker visibility that distinguishes UI-fixable connection issues from external admin prerequisites,
- sync-status / downstream-state visibility where phase-appropriate,
- history / audit browsing hooks or views,
- clear failure guidance.

## Required implementation outcomes

### A. Risk-aware execution UX

Each action surface must reflect:

- the action name,
- the target,
- the source of authority,
- any required connector / connection status indicator,
- the risk tier,
- destructive or non-destructive status,
- and any checkpoint/confirmation requirement.

### B. Preview or impact summary behavior

For actions designated as preview-worthy by the action catalog, show a usable pre-execution summary before submission.

### C. Result and failure UX

Operators must receive clear result/failure states, including actionable backend error messages when safe to surface.

Where relevant, distinguish clearly between:

- authoritative action succeeded,
- cloud-side follow-on succeeded,
- cloud-side follow-on pending,
- sync / propagation not yet verified,
- or authoritative action failed.

### D. Audit/history visibility

Expose the phase-appropriate audit/history information now available for Hybrid Identity actions. This can be:

- a dedicated page,
- a pane,
- a section within the Hybrid Identity lane,

depending on the repo’s current admin-shell pattern.

### E. No-go behavior

Do not add fake sync-status UI if the underlying evidence is not real.
Do not add fake history/audit UI if the underlying evidence is not real.
Do not hide risky/destructive identity operations behind casual-looking buttons.

## Documentation requirement

Update phase docs if implementation reveals a material UX or evidence-model clarification.

## Validation

Run focused frontend/backend tests as needed for:

- source-of-authority rendering
- connection-status / preflight rendering
- preview handling
- confirmation handling
- result rendering
- sync-state rendering
- error rendering
- audit/history data flow

## Completion condition

Stop when the Hybrid Identity lane has a risk-aware operator experience backed by real workflow results and phase-appropriate audit/history visibility.


## No-go addendum

Do not hide a code-bound setup dependency behind vague failure messaging. If the feature is not ready because a governed connection has not been configured or verified, say so plainly in operator-safe language.
