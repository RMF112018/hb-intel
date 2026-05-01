# 03 — Checklist Definition File Requirements

## Objective

Use the saved checklist-definition files as the authoritative exact item source when updating Wave 9 documentation.

## Source Directory

```text
/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/
```

## Mandatory Directory Audit

Run:

```bash
find docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files -maxdepth 2 -type f | sort
```

Then inspect the files necessary to confirm:

- startup checklist family exists;
- safety checklist family exists;
- closeout checklist family exists;
- machine-readable library exists if provided;
- exact source item text is preserved;
- source document/page/section/item references are present or can be mapped from the source Markdown/CSV/JSON;
- total counts reconcile with the extracted package.

## Expected Item Families

| Family | Expected Source Checklist | Expected Content |
|---|---|---|
| `startup` | Job Start up Checklist | Review Owner's Contract, Job Start-up, Order services and equipment, Permits posted on Jobsite. |
| `safety` | Jobsite Safety Checklist | Areas of Highest Risk and Other Risks. |
| `closeout` | Project Closeout & Pre Cert of Occupancy checklist | Tasks, Document Tracking, Inspections, Turnover, Post Turnover, Complete Project Closeout Documents for PX, PBC Close-Out Requirements. |

## Required Documentation Treatment

Do not paste every item into every governing roadmap file. Instead:

1. Add the exact item inventory or source table only in the dedicated Wave 9 item-library/crosswalk documentation.
2. Reference the item library from roadmap and blueprint files.
3. Preserve exact source text in source-traceable files.
4. Use normalized classification fields separately from source text.
5. Document any item that should link to another module rather than be directly owned by Wave 9.

## Required Item Classification Fields

Each item should be classified or documentation should require future classification by:

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

## Source Traceability Rule

The exact extracted item text must remain unchanged. Add normalized titles, classifications, and notes in separate fields only.

## Item Ownership Rule

Not every item should be directly “owned” by Wave 9. Use this classification:

| Ownership | Meaning |
|---|---|
| `owned` | Lifecycle Readiness Center directly tracks state. |
| `linked` | Another PCC module owns details, but Wave 9 displays readiness impact. |
| `external-reference` | External system/process remains source reference. |
| `deferred` | Target architecture acknowledges the item, but runtime behavior is later-phase. |

## Examples

| Source Item Type | Recommended Treatment |
|---|---|
| `Verify job is set up in Procore` | External-system reference + readiness blocker if missing; Procore remains external. |
| `Provide Superintendent with Project Safety Plan and SDS Notebook` | Owned startup/safety bridge item with evidence requirement. |
| `Fall Exposures` | Safety readiness recurring item; failed status creates blocker/escalation. |
| `All RFI's closed` | Linked closeout readiness item; Procore/reference source may be external. |
| `Obtain Release of Liens from Subs` | Owned/linked closeout compliance item with evidence requirement and accounting/legal risk tag. |
| `Flag 80 calendar days from last day HB worked on project` | Date-capture/statutory deadline item with priority action trigger. |

## Prohibited Handling

Do not:

- collapse the item library into a single flat checklist with no classification;
- change source item wording;
- delete source traceability;
- treat Procore as the Wave 9 completion source of record;
- treat safety items as one-time startup tasks only;
- hide closeout items until the end of the project;
- use checklist tabs as the only IA model.
