# Prompt 05 — Complete or narrow the promotion-rule override behavior contract

## Objective

Make the code and product contract truthful around promotion-rule behavior.

## Governing authority / required reference docs

- `apps/hb-webparts/src/homepage/data/publisherAdapter/promotionRuleSelector.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`

## Files and code paths to inspect

- rule selection
- new-article defaults
- any featured/pinned controls in the editor
- any UI lock/override behavior
- any tests or docs describing rule enforcement

## Exact defect to close

The selector comments describe manual-override gating behavior more strongly than the current editor clearly expresses.

## Required implementation outcome

Choose one and implement it cleanly:
- fully expose and enforce promotion-rule manual override behavior in the editor
- or narrow the code comments and product narrative so they match the behavior that actually exists

## Validation / proof of closure requirements

Prove:
- the final behavior is consistent across selector, editor, and docs/comments
- no false promise remains in the code narrative

## Deliverables / closure docs

Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/05-closure-promotion-rule-behavior.md`

## Constraint

Do not mix this with unrelated lifecycle fixes.
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
