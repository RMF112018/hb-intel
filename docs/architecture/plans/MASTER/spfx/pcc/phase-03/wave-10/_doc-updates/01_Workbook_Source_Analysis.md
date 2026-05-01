# Workbook Source Analysis

Generated: 2026-05-01

## Scope

This analysis is based on uploaded workbooks:

- `/mnt/data/Permit_Log_Template(1).xlsx`
- `/mnt/data/Inspection-Log-Template.xlsx`

The local agent must verify these findings directly against the repo-resident files:

- `docs/reference/example/Permit_Log_Template.xlsx`
- `docs/reference/example/Inspection-Log-Template.xlsx`

## Important Product Direction

The workbooks are **source references**, not product constraints. Preserve source traceability, but do not limit the module to spreadsheet columns or spreadsheet UX.

---

# Permit Log Workbook

## Workbook Structure

Observed sheet:

| Sheet | Used Range | Notes |
|---|---:|---|
| `PERMITS` | `A1:O148` | Single permit log sheet with 15 visible columns. |

## Visible Columns

| Column | Header | Interpretation |
|---:|---|---|
| A | `#` | Source row / sequence number |
| B | `SUB REF` | Sub-permit/trade shorthand, such as E, P, M, FS, FA, AC, LV, R, EL, B |
| C | `TYPE` | Permit type classification; observed values include `PRIMARY`, `SUB`, `LOGISTICS` |
| D | `LOCATION` | Scope location / building / area |
| E | `PERMIT #` | Permit number or `NA` |
| F | `DESCRIPTION` | Permit description / work scope |
| G | `RESPONSIBLE CONTRACTOR` | Responsible contractor |
| H | `Address` | Address |
| I | `DATE REQUIRED` | Required-by date |
| J | `DATE SUBMITTED` | Permit submitted date |
| K | `DATE RECEIVED` | Permit received/issued date |
| L | `DATE EXPIRES` | Expiration date |
| M | `STATUS` | Status |
| N | `AHJ` | Authority having jurisdiction |
| O | `COMMENTS` | Free-text comments |

## Observed Permit Categories / Patterns

Visible sample records include:

- Site permits: Mass Grading, Engineering, Irrigation, Site Wall, Site Lighting, Landscape, Hardscape
- Logistics: Construction Field Office
- Amenity / exterior: Pool Deck, Swimming Pool, Pool Barrier, Gazebos, Dog Park Fence, Playground Fence, Monument Sign
- Building master permits by area/building:
  - Clubhouse
  - Pool Pavilion
  - Maintenance
  - Garage 1-3
  - Buildings 1-6
- Sub-permits by building:
  - Electrical
  - Plumbing
  - Mechanical
  - Fire Sprinkler
  - Fire Alarm
  - Access Control
  - Low Voltage
  - Roofing
  - Elevator
  - BDA

## Visible Existing Status Values

Visible records include:

- `Application Submitted`
- blank status values

The local agent must inspect workbook data validation, dropdowns, conditional formatting, hidden rows/columns, formulas, and named ranges to determine whether additional statuses exist.

## Required Enhancements Beyond Template

The target model must add these fields even though they are not visible in the current workbook:

- `revision`
- `revisionReason`
- `revisionSubmittedDate`
- `applicationValue`
- `permitFee`
- `feePaidStatus`
- `feeReceiptEvidenceLink`
- `conditionsOpen`
- `conditionsResolvedDate`
- `relatedInspectionIds`
- `relatedReadinessItemId`
- `relatedPriorityActionId`
- `relatedApprovalCheckpointId`
- `sourceWorkbook`
- `sourceSheet`
- `sourceRow`
- `sourceColumnMapping`

---

# Inspection Log Workbook

## Workbook Structure

Observed sheets:

| Sheet | Used Range | Notes |
|---|---:|---|
| `Sheet1` | `A1:F180` | Main inspection list |
| `Sheet2` | `A1:B5` | Visible result/status source list |

## Main Sheet Visible Structure

Rows 1-3:

- `Job:`
- `Main Permit # -`
- `List of Inspections Required`

Header row observed at row 5:

| Column | Header | Interpretation |
|---:|---|---|
| A | `Inspection` | Inspection name / permit section header |
| B | `Code` | Inspection code |
| C | `Date Called In` | Date inspection was requested/called in |
| D | `Result` | Inspection result |
| E | `Comment` | Notes / violations / comments |
| F | `Verified Online` | AHJ portal verification indicator |

## Result List Sheet

Visible status/result values in `Sheet2`:

- `Pass`
- `Fail`
- `N/A`

The local agent must inspect workbook validation objects to confirm whether other values are available but not visible, such as Partial, Cancelled, or Reinspection Required.

## Observed Inspection Sections / Examples

Visible inspection sections and items include:

- Building additions/alterations
- NOC/Recorded
- Fire Preliminary
- Civil Preliminary
- Landscape Preliminary
- Elevation Certification
- Footer / ISO pads
- Slab
- Filled cell / window sills / columns
- Tie beams / columns
- Bar joists
- Column steel
- Waterproofing
- Door/window bucks
- Patio steel
- Storefront
- Truss
- Wall sheathing
- Wire lath
- Drywall walls/ceilings
- Framing walls/ceilings
- Fire penetration
- Insulation
- Fire Final
- Building Final
- Low voltage rough/final
- Fire alarm rough/final
- Fire sprinkler rough/final
- High voltage electrical
- Temporary service
- Mechanical rough/final
- Plumbing rough/final
- Tree removal / landscape
- Irrigation
- Storm drainage
- Site wall/fencing
- Dumpster enclosure
- Gazebo/bar
- Exterior light poles
- Canvas awnings
- Patio pavers
- Asphalt paving
- Roofing

## Required Enhancements Beyond Template

The target model must add these fields even though they are not visible in the current workbook:

- `inspectionId`
- `relatedPermitId`
- `relatedPermitNumber`
- `inspectionRequestId`
- `inspectionNumber`
- `location`
- `readinessCriteria`
- `requestedBy`
- `scheduledDate`
- `scheduledWindow`
- `inspectorOrAgency`
- `failedItemSummary`
- `correctiveActionRequired`
- `correctiveActionOwner`
- `reinspectionRequired`
- `parentInspectionId`
- `childReinspectionId`
- `reInspectionFee`
- `feePaidStatus`
- `resultEvidenceLink`
- `jobCardEvidenceLink`
- `verifiedBy`
- `verifiedDate`
- `relatedObservationOrIssueId`
- `relatedReadinessItemId`
- `relatedPriorityActionId`
- `sourceWorkbook`
- `sourceSheet`
- `sourceRow`
- `sourceColumnMapping`

---

# Traceability Requirement

Every proposed structured field in the planning documentation should be classified as one of:

| Classification | Meaning |
|---|---|
| Workbook-derived | Directly present in source workbook |
| Workbook-enhanced | Implied by workbook purpose but not directly present |
| Chat-required | Explicitly required by user in this chat |
| Research-informed | Added based on industry/software research |
| Repo-alignment | Added to align with PCC framework/read-model/governance |
| Future/deferred | Not Wave 10 MVP, but should be named as a future extension |

## Ambiguous Items Requiring Review

- Whether `PERMIT # = NA` means not applicable, not required, excluded from AHJ, or no permit number yet.
- Whether `DATE RECEIVED` means issued date, received from AHJ, or internally received.
- Whether `STATUS` has hidden dropdowns or only manually typed values.
- Whether `Verified Online` is a required closeout proof, optional manual check, or AHJ portal confirmation field.
- Whether inspection section headers should become inspection package records, permit package records, or both.
- Whether `SUB REF` should remain a permit subtype code or map to formal trade/system taxonomy.
