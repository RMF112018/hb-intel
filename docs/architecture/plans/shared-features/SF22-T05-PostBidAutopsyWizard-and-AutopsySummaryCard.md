# SF22-T05 - PostBidAutopsyWizard and AutopsySummaryCard

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop_UPDATED.md` (required canonical target; currently missing) and `docs/explanation/feature-decisions/PH7-SF-22-Module-Feature-Post-Bid-Learning-Loop.md` (interim baseline)
**Decisions Applied:** L-02, L-03, L-05, L-06, L-08, L-10, L-11, L-12
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF22-T05 wizard/summary UI task; sub-plan of `SF22-Post-Bid-Learning-Loop.md`.

---

## Objective

Define wizard and summary-card contracts including guided authoring, trust indicators, explainability, disagreement capture, downstream impact preview, and deep-link behavior.

---

## `PostBidAutopsyWizard`

Behavior:
- 5-step sequential wizard using `@hbc/step-wizard`
- section validation and draft persistence on change
- guided prefill from pursuit snapshot and linked records
- section-level avatar ownership markers from BIC projection
- inline AI actions for summarize/suggest/compare workflows

Trust/explainability requirements:
- confidence tier + reasons visible at section and aggregate level
- evidence completeness indicator per section
- explainability panels include `why this recommendation` and `what changed`
- disagreement capture flow with escalation affordance
- downstream publication impact preview before submit
- similar-pursuit references and related examples shown where available

Complexity:
- Essential: collapsed autopsy badge + guided resume flow
- Standard: full wizard experience
- Expert: full wizard + retrospective diagnostics + comparator callouts

AI constraints:
- inline only (no sidecar)
- source citation required
- explicit approval required before publication persistence

---

## `AutopsySummaryCard`

Behavior:
- outcome badge + primary factor + key retrospective finding
- confidence badge and publication state badge
- top reusable finding with evidence marker
- deep-links into related findings and seeded intelligence entries
- benchmark-impact and downstream impact hint chips

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- PostBidAutopsyWizard
pnpm --filter @hbc/features-estimating test -- PostBidAutopsyWizard
pnpm --filter @hbc/features-business-development test -- AutopsySummaryCard
pnpm --filter @hbc/post-bid-autopsy test -- components
```
