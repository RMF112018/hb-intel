# SF21-T05 - ProjectHealthPulseCard and ProjectHealthPulseDetail

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)  
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`  
**Decisions Applied:** D-06 through D-12  
**Estimated Effort:** 1.0 sprint-weeks  
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF21-T05 card/detail UI task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Define compact and detail pulse interfaces for confidence-aware health interpretation, explainability, compound-risk surfacing, and reason-coded actionability.

---

## `ProjectHealthPulseCard`

Behavior:

- no-emoji visual language (Fluent UI primitives only)
- overall health badge as primary focus
- 2x2 dimension grid (Cost/Time/Field/Office)
- confidence indicator at overall and per-dimension level
- amber indicator for excluded/governance-impacted metrics
- top recommended action line with reason-code affordance and deep-link
- compound-risk warning chip when any active risk severity >= moderate

Interactions:

- overall badge click opens detail panel
- dimension click opens/scrolls to corresponding detail tab
- confidence chip click opens explainability drawer at confidence section

Complexity:

- Essential: compact summary + confidence badge + top action summary
- Standard/Expert: full compact card + compound warning + reason-code action affordance

---

## `ProjectHealthPulseDetail`

Behavior:

- tabbed layout: Cost, Time, Field, Office
- each tab shows trend sparkline, leading/lagging sections, metric rows
- 90-day history chart expandable
- amber banner for excluded metrics with inline-edit jump links
- top recommended action shown above tabs with reason code, owner, urgency context

Explainability Drawer (required):

- Why this status
- What changed
- Top contributors
- What matters most

Confidence behavior:

- render confidence tier + reasons per dimension and overall
- low/unreliable confidence states require visible caution language

Compound-risk behavior:

- render compound-risk signals with severity and affected dimensions
- escalation callout visible in detail header

---

## Verification Commands

```bash
pnpm --filter @hbc/features-project-hub test -- ProjectHealthPulseCard
pnpm --filter @hbc/features-project-hub test -- ProjectHealthPulseDetail
pnpm --filter @hbc/features-project-hub test -- ExplainabilityDrawer
```
