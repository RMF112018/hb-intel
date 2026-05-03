# Subcontractor Scorecard System Of Record And Integration Model

Generated: 2026-05-03

## Doctrine

The Subcontractor Scorecard is a PCC-native business record that evaluates subcontractor performance on a specific project/scope. PCC owns the scorecard record and all PCC-derived interpretation. Source systems retain ownership of their native facts.

## Ownership Matrix

| Domain | Primary System of Record | PCC Role | Allowed PCC Write Behavior | Conflict Rule |
|---|---|---|---|---|
| Scorecard project instance | PCC | Create, review, approve, publish, archive | PCC may write governed record fields | PCC wins for scorecard record |
| Score template/category weights | PCC | Version, validate, apply scoring template | Governance-controlled only | PCC template version wins |
| Category/factor scores | PCC | Store reviewer judgment and calculated results | PM/Super/PX per permission matrix | Latest approved revision wins |
| Reviewer comments/narratives | PCC | Store restricted business commentary | Role-gated only | PCC wins for authored commentary |
| Future work recommendation | PCC | Store decision-support recommendation | PX-approved only | PCC wins, but cannot auto-exclude vendor |
| Risk control plan | PCC | Store future-work controls | PX/procurement-authorized | PCC wins for internal control language |
| Procore commitments | Procore | Read/deep-link/source context | No writeback | Procore wins |
| Procore submittals | Procore | Source/evidence context | No writeback | Procore wins |
| Procore RFIs | Procore | Response-time/coordination context | No writeback | Procore wins |
| Procore punch/deficiency items | Procore | Quality/closeout context | No writeback | Procore wins |
| Procore observations/inspections | Procore where generated in Procore | Safety/quality context | No writeback | Procore wins |
| Sage accounting values | Sage | Official accounting reference | No writeback | Sage wins |
| SharePoint/HB Document Control evidence | SharePoint/HB Document Control | Evidence link only | PCC may write link/classification only | Source document owner wins for file content |
| Compass/Bespoke prequalification | Compass/Bespoke Metrics | Read-only risk/prequalification context if integrated | No mutation | Compass/Bespoke wins |
| HBI output | PCC-derived | Draft/summary only after permission checks | Human acceptance required | Cited source wins on facts |

## Integration Rules

- All external integration is backend-mediated.
- No direct SPFx-to-Procore, SPFx-to-Sage, or SPFx-to-Compass calls.
- No full external-system mirror.
- No external writeback.
- PCC stores object links and source-lineage metadata, not source-system records.
- Evidence binaries remain in their owning source systems.
- Source facts and reviewer judgment must be visually distinct in UI.

## Required Source-Lineage Minimum

Every external source reference must capture:

- `sourceSystem`
- `sourceObjectType`
- `sourceObjectId` where available
- `sourceUrl` or deep link where allowed
- `sourceOwner`
- `sourceCapturedAtUtc`
- `sourceLastSyncedAtUtc` where applicable
- `evidenceRole`
- `confidence`
- `visibilityClass`
- `usedByScoreFactorIds`

## Future System-of-Record Matrix Update

Add explicit rows to `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md` for:

- Subcontractor Scorecard;
- Scorecard Template;
- Scorecard Source-Lineage Records;
- Subcontractor Performance Evidence Links;
- Subcontractor Future Work Recommendation;
- Subcontractor Risk Control Plan;
- Subcontractor Portfolio Performance Summary.
