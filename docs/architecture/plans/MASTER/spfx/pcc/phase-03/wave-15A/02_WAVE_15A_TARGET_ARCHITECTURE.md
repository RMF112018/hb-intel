# 02 — Wave 15A Target Architecture

## 1. Purpose

This document defines the target UI/UX architecture Wave 15A should produce under the 100-point PCC scorecard.

The target is not merely doctrine-compliant UI. The target is a flagship construction project control center that is clearer, more actionable, and less cognitively burdensome than incumbent construction platforms.

## 2. Target Product Definition

PCC should operate as a SharePoint-hosted SPFx project control center that:

- Establishes project identity immediately.
- Surfaces risk, status, urgency, owner, and next action.
- Connects project lifecycle signals across surfaces.
- Distinguishes live, preview, read-only, degraded, deferred, mock, and source-owned conditions.
- Avoids equal-weight dashboard walls.
- Reduces navigation burden through clear hierarchy and command/search/HBI affordances.
- Supports office and field mental models without creating separate experiences.
- Respects SharePoint host constraints.
- Provides evidence-backed Phase 4 readiness.

## 3. Target Information Architecture

### Command Layer

The command layer establishes:

- Project identity.
- Active surface.
- Current operating context.
- Priority actions.
- Search/command/HBI entry point.
- Risk/health posture.
- Source confidence where needed.

### Operational Controls Layer

The operational layer presents work that requires attention:

- Action queues.
- Readiness blockers.
- Approvals/checkpoints.
- Site health risks.
- Missing configurations.
- External system mapping issues.
- Document control review needs.

### Governance and Health Layer

The governance layer presents:

- Source-of-record posture.
- Integration confidence.
- Role/permission scope.
- Configuration gaps.
- Read-only/deferred/missing setup status.
- HBI authority boundaries.

### Connected Systems Layer

The connected systems layer presents:

- Procore, SharePoint, Sage, and other external system references.
- Launch/read-only boundaries.
- Mapping status.
- Source health.
- Registry and audit posture.

## 4. Target Shell Architecture

The shell must:

- Respect SharePoint host boundaries.
- Avoid fake SharePoint chrome.
- Keep PCC canvas productized.
- Keep project identity persistent.
- Make active surface unmistakable.
- Support keyboard navigation.
- Support responsive container behavior.
- Avoid consuming excessive field/tablet canvas space.
- Provide command/search/HBI entry without turning HBI into decorative branding.

## 5. Target Navigation Architecture

Navigation should move beyond module switching.

It must support:

- Active surface clarity.
- Priority work discovery.
- Work-center movement.
- Project lifecycle continuity.
- Reduced reliance on learned module paths.
- Keyboard accessibility.
- Responsive overflow handling.

## 6. Target Project Context Architecture

The project context treatment should include:

- PCC identity.
- Project name.
- Active surface label.
- Current project phase/stage.
- Project status or risk posture where appropriate.
- Schedule/completion or milestone facts where appropriate.
- Location/value facts where useful.
- Command/search entry point.
- Source confidence or degraded data status where relevant.

The project context band should not become an overloaded data table. It must orient, not crowd.

## 7. Target Layout Architecture

The layout system must:

- Use bento/grid behavior deliberately.
- Distinguish primary, operational, supporting, reference, and state content.
- Avoid equal-weight card walls.
- Preserve scanability in compact density.
- Maintain stable row/column behavior across breakpoints.
- Remain usable in SharePoint-hosted constrained widths.
- Support full-scroll evidence without density collapse.

## 8. Target Card Architecture

### Tier 1 — Command Cards

Command cards should:

- Carry primary status, risk, or action.
- Use distinct visual hierarchy.
- Appear early in the surface.
- Avoid competing with reference cards.
- Be few in number.

### Tier 2 — Operational Cards

Operational cards should:

- Present actionable work.
- Clarify owner and next step.
- Use status semantics beyond color alone.
- Preserve responsive behavior.

### Tier 3 — Reference Cards

Reference cards should:

- Provide supporting context.
- Avoid competing visually with command cards.
- Defer advanced detail where possible.
- Use clear, compact language.

### State Cards

State cards should:

- Explain condition.
- Explain impact.
- Identify owner/system where possible.
- Provide next step.
- Avoid looking like errors when they are intentional read-only or preview states.

## 9. Target State Architecture

Every state must align with the state model in:

```text
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md
docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md
```

Required state categories include:

- Live.
- Preview.
- Read-only.
- Deferred.
- Unavailable.
- Setup required.
- Degraded.
- Blocked.
- Error.
- Empty.
- Unauthorized/no access.
- Missing configuration.
- Stale data.
- Mock/demo data.

## 10. Target Mold Breaker Architecture

PCC must explicitly avoid:

- Dense module-first navigation as the primary mental model.
- Incumbent-style overloaded dashboards.
- Large uniform tables as the first user experience.
- Passive status badges without owner/action.
- Overexposed system seams.
- Web/field divergence.
- AI-as-addon behavior.
- Unsupported claims of offline/PWA readiness.

PCC should instead provide:

- Role/context-aware priority.
- Progressive disclosure.
- Clear responsibility attribution.
- Command/search/HBI assistive pathways.
- Accessible semantic status.
- Offline/degraded/read-only clarity.
- Construction-specific lifecycle continuity.

## 11. Target Tenant Architecture

Wave 15A target behavior must be validated in tenant-hosted SPFx conditions, including:

- SharePoint chrome boundary.
- App canvas fit.
- Edit-mode resilience.
- Console/runtime stability.
- Package/version alignment.
- Breakpoint evidence.
- High-zoom / short-height behavior.
- Constrained host width behavior.

## 12. Target User Outcomes

A user should be able to:

- Identify the project and active surface immediately.
- Understand current risk/priority posture quickly.
- Know what work requires attention.
- Understand what is live versus preview/read-only/deferred.
- Move from signal to action without hunting through modules.
- Use PCC on laptop/tablet/field-like contexts without a new mental model.
- Trust the source/status/ownership of information.


## Canonical References

Wave 15A now consumes the PCC 100-point scorecard as a durable reference standard, not as a wave-owned scoring file.

- PCC scorecard: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md`
- PCC scorecard use guide: `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Scorecard_Use_Guide.md`
- Construction-tech UI study: `docs/explanation/design-decisions/con-tech-ui-study.md`
- Construction-tech UX study: `docs/explanation/design-decisions/con-tech-ux-study.md`
- SPFx governing standard: `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- Acceptance and scoring model: `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

