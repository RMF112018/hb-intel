# 07 — Prompt 04: Add Item Library Crosswalk Documentation

## Role

You are a local code agent in `/Users/bobbyfetting/hb-intel`. You have current repo truth, governing doc updates, and the target architecture file in context.

## Objective

Add or update Wave 9 documentation that maps the saved checklist-definition files into the Project Lifecycle Readiness Center item-library architecture.

## Source Directory

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/
```

Do not assume exact file names. Use `find` output from Prompt 01.

## Recommended Target File

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Item_Library_Crosswalk.md
```

If repo convention suggests another path, follow repo truth and document the path decision.

## Required Content

The crosswalk documentation must include:

1. Source file inventory.
2. Item family count summary.
3. Startup family sections.
4. Safety family sections.
5. Closeout family sections.
6. Required classification schema.
7. Source traceability schema.
8. Ownership classification: owned / linked / external-reference / deferred.
9. Evidence requirement model.
10. Priority Action trigger model.
11. Approval/checkpoint trigger model.
12. External-system reference model.
13. Exact item text preservation rule.
14. Ambiguous item handling process.

## Exact Item Handling

If the checklist-definition files include Markdown item tables or CSV/JSON item libraries, include an appropriate item inventory or representative crosswalk table in the Wave 9 documentation.

Do not paste every item into multiple governing docs. The item inventory belongs in the dedicated Wave 9 item-library/crosswalk doc.

## Classification Requirements

At minimum, document that each item must be classified by:

```text
family
sourceDocument
sourcePage
sourceSection
sourceItemNumber
sourceItemText
sourceResponseOptions
normalizedTitle
lifecyclePhase
readinessDomain
itemType
criticality
riskTags
defaultOwnerRole
defaultReviewerRole
evidenceRequirement
downstreamIntegration
priorityActionTrigger
approvalCheckpointTrigger
externalSystemReference
notes
```

## Validation

Run:

```bash
git diff --check
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/*.md
```

Do not commit yet unless the user/local workflow explicitly says to commit after each prompt.
