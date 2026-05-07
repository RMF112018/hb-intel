# 09 — Risks, Decisions, and Deferments

## 1. Purpose

This document identifies major Wave 15A risks, decisions, and allowed/not-allowed deferments under the PCC 100-point scorecard.

## 2. Required Decisions

| Decision ID | Decision | Required Before Phase 4? |
|---|---|---|
| D01 | Confirm canonical scorecard location under `docs/reference/spfx-surfaces/project-control-center/`. | Yes |
| D02 | Confirm the old 56/56 model is superseded for PCC readiness. | Yes |
| D03 | Confirm 95/100 minimum Phase 4 entry threshold. | Yes |
| D04 | Confirm no hard-stop failures may carry into Phase 4. | Yes |
| D05 | Confirm whether narrow/phone views must be fully supported or clearly non-primary but graceful. | Yes |
| D06 | Confirm required tenant-hosted evidence package. | Yes |
| D07 | Confirm whether Wave 15A remediation can modify shared primitives. | Yes |
| D08 | Confirm HBI authority boundaries in user-facing language. | Yes |

## 3. Major Risks

### R01 — Shared Primitive Work Becomes Surface Styling

If agents remediate surfaces locally, PCC may remain inconsistent.

**Mitigation:** Remediate shell, layout, card, and state primitives first.

### R02 — 100-Point Score Claimed Without Evidence

A high score without tenant, breakpoint, state, accessibility, and package evidence is invalid.

**Mitigation:** Use the evidence matrix and use guide.

### R03 — Preview State Still Reads as Unfinished Product

Preview/read-only/deferred states may appear broken or incomplete.

**Mitigation:** Apply state and language standard to every major surface.

### R04 — New Feature Creep Delays Remediation

Agents may try to add live workflows to fix affordance problems.

**Mitigation:** Improve honest UX posture without expanding runtime authority.

### R05 — Accessibility Deferred Too Late

Accessibility issues in shared primitives can create late rework.

**Mitigation:** Validate keyboard/focus/ARIA/touch behavior during primitive remediation.

### R06 — Incumbent Mimicry Persists

PCC may look cleaner but still behave like dense incumbent platforms.

**Mitigation:** Apply Mold Breaker criteria explicitly to shell, navigation, Project Home, Project Readiness, and operational surfaces.

### R07 — Field-Office Divide Persists

Desktop may improve while tablet/high-zoom/constrained host usage remains weak.

**Mitigation:** Collect responsive and field/touch evidence before final scoring.

### R08 — HBI Appears Over-Authoritative

HBI may be perceived as approving, rejecting, certifying, or mutating records.

**Mitigation:** Use HBI authority boundary language and interaction constraints.

## 4. Allowed Deferments

The following may be deferred if documented and non-blocking:

- Minor icon refinements.
- Non-critical motion polish.
- Optional theme variations.
- Future live integration behavior.
- Future write-side workflows.
- Advanced personalization not required for scorecard pass.
- Secondary/tertiary surface refinements that do not affect hard stops.

## 5. Not Allowed to Defer

The following may not be deferred if Phase 4 readiness is claimed:

- Hard-stop failures.
- Project Home command-center hierarchy.
- Project Readiness overload if it creates cognitive-overload failure.
- False affordances in External Platforms or Approvals.
- Preview/read-only/degraded state ambiguity.
- Host-fit evidence.
- Accessibility proof.
- Breakpoint/container proof.
- Source-of-record clarity.
- Package/version evidence.
- Mold Breaker differentiation evidence.

## 6. Decision Log Template

```markdown
## Decision ID

## Date

## Decision

## Rationale

## Alternatives Rejected

## Impact

## Owner

## Status

## Related Scorecard Pillars

## Related Hard Stops
```


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

