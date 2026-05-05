# 09 — Risks, Decisions, and Deferments

## 1. Purpose

This file tracks decisions and risks that must be controlled during Wave 15A.

## 2. Required Decisions

| ID  | Decision                                                                | Recommended Position                                                     | Owner                          | Required Before              |
| --- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------ | ---------------------------- |
| D01 | Should Wave/build/fixture metadata remain visible to business users?    | Move to diagnostics/status area; keep business language primary.         | Product / UX                   | State model implementation   |
| D02 | Should orange nav remain full-height and high-saturation?               | Reduce visual dominance; preserve brand cue but not content competition. | Product / UI doctrine reviewer | Shell remediation            |
| D03 | What surfaces must be tenant-validated before Phase 3 closeout?         | All eight primary surfaces.                                              | Product / QA                   | Final closeout               |
| D04 | Should approvals show sample queue content if execution is disabled?    | Yes, show preview-safe decision context.                                 | Product / workflow owner       | Approvals remediation        |
| D05 | Should External Systems show unavailable cards or workflow value cards? | Workflow value/status cards.                                             | Product / integration owner    | External Systems remediation |
| D06 | What is the minimum supported SharePoint viewport width?                | Determine through tenant evidence; validate common laptop widths.        | UX / SPFx dev                  | Host-fit remediation         |
| D07 | Should surface headers be mandatory on every PCC surface?               | Yes.                                                                     | Product / UI doctrine reviewer | Surface remediation          |

## 3. Major Risks

### R01 — Shared Primitive Work Becomes Surface Styling

Risk: Agents remediate screenshots one page at a time and create inconsistent local styling.

Mitigation:

- Force shared primitive work first.
- Reject surface-only fixes for shared defects.
- Require card tier and state model standards.

### R02 — 56/56 Claimed Without Tenant Evidence

Risk: Final score is claimed using local dev server only.

Mitigation:

- Require SharePoint published/edit-mode screenshot evidence.
- Treat missing tenant evidence as hard stop.

### R03 — Preview State Still Reads as Unfinished Product

Risk: State messages remain technically accurate but product-hostile.

Mitigation:

- Apply state language standard.
- Hide diagnostics from primary content.
- Make each unavailable state explain consequence and next step.

### R04 — New Feature Creep Delays Remediation

Risk: Agents add backend/integration functionality instead of fixing UX foundations.

Mitigation:

- Keep Wave 15A scope locked.
- Use preview-safe content instead of building new live actions.

### R05 — Accessibility Deferred Too Late

Risk: Accessibility issues appear after visual remediation.

Mitigation:

- Include focus, keyboard, semantic controls, and contrast in every prompt.

### R06 — Existing Phase 15 Architecture Conflicts with Wave 15A UI Targets

Risk: External Systems or other Wave 15 scope introduces surface-specific patterns that conflict with shared doctrine.

Mitigation:

- Treat Wave 15A as a remediation overlay.
- Preserve business architecture but adjust presentation patterns.

## 4. Allowed Deferments

The following may be deferred beyond Wave 15A if clearly documented:

- Live approval execution.
- Live external system API calls.
- Full Graph/Procore/Sage integration execution.
- Advanced personalization.
- Advanced analytics/visualizations not needed for 56/56.
- Final production rollout hardening beyond UI doctrine conformance.

## 5. Not Allowed to Defer

The following may not be deferred if claiming 56/56:

- Shell/host fit.
- Team & Access layout correction.
- Project context across all surfaces.
- Preview/read-only state model.
- Disabled action explanation.
- Tenant screenshot evidence.
- Accessibility/keyboard validation.
- Responsive/container validation.
- Scorecard closeout.

## 6. Decision Log Template

```markdown
## Decision ID

D##

## Date

YYYY-MM-DD

## Decision

[decision]

## Rationale

[why]

## Alternatives Rejected

- [alternative]

## Impact

[impact]

## Owner

[name/role]

## Status

Accepted / Deferred / Superseded
```
