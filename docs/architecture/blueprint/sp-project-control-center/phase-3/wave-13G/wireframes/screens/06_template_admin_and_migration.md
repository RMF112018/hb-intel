# 06 — Template Admin and Workbook Migration Wireframes

## Locked Decisions Applied

| Decision | Locked Direction |
|---|---|
| MVP posture | Estimating Workbench is included in MVP scope. |
| First implementation | SharePoint/SPFx inside PCC. |
| PCC placement | Mount under `Project Readiness > Estimating Workbench`; no new top-level PCC navigation surface in MVP. |
| Cost-code hierarchy | MVP uses internal HB Cost Codes first; Sage mapping follows in a future phase. |
| Day-one templates | Commercial and Multifamily. |
| Workbook import | Template migration only; no active project workbook import in MVP. |
| Data posture | Workbook-like UX over canonical PCC estimating data records. |
| HBI posture | Grounded review/summarization only; no pricing authority, no award authority. |

## Objective

Define admin and migration-review screens for maintaining the two MVP templates and migrating legacy workbook templates into governed Estimating Workbench template records.

## Screens in This Group

1. Template Admin Dashboard.
2. Commercial Template Detail.
3. Multifamily Template Detail.
4. Workbook Template Migration Review.
5. Section Mapping Review.
6. Cost Code Mapping Review.
7. Template Version History.

## Screen: Template Admin Dashboard

### Purpose

Allow authorized template admins to review and maintain Commercial and Multifamily template posture without exposing raw SharePoint administration.

### Layout

```text
Template Admin
├── Template Cards
│   ├── Commercial
│   └── Multifamily
├── Template Health Summary
├── Latest Migration Runs
├── Cost Code Mapping Coverage
├── Section Mapping Coverage
└── Template Version History
```

## Template Detail Screen

Required sections:

- Template identity.
- Current active version.
- Source workbook template.
- Active/inactive status.
- Section list.
- Required sections.
- Optional sections.
- Scratchpad sections.
- Default bid packages.
- Default GC/GR sections.
- Default allowances/alternates sections.
- Cost-code mapping coverage.
- Migration history.

## Commercial Template Required Sections

Minimum MVP seed sections:

- General Info.
- Cost Summary.
- Division 01 / General Requirements.
- Sitework / Existing Conditions.
- Concrete.
- Masonry.
- Metals.
- Openings.
- Finishes.
- Specialties.
- Equipment.
- Furnishings, where applicable.
- Conveying, where applicable.
- Fire Suppression.
- Plumbing.
- HVAC.
- Electrical.
- Allowances.
- Alternates.
- GCs & GRs.
- Assumptions.
- Inclusions / Exclusions / Qualifications.
- Scratchpad.

## Multifamily Template Required Sections

Minimum MVP seed sections:

- General Info.
- Unit / Area Metrics.
- Cost Summary.
- Sitework.
- Building Core / Shell.
- Unit Interiors.
- Common Areas.
- Amenities.
- MEP.
- Life Safety.
- Finishes.
- Allowances.
- Alternates.
- GCs & GRs.
- Assumptions.
- Inclusions / Exclusions / Qualifications.
- Scratchpad.

## Workbook Template Migration Review

### Purpose

Convert approved workbook templates into governed Estimating Workbench template records. This is not active project workbook import.

### Layout

```text
Workbook Template Migration Review
├── Source Workbook Summary
├── Worksheet Classification Table
├── Formula / External Link Findings
├── Section Mapping Results
├── Cost Code Mapping Results
├── Review Queue
└── Approve Template Version
```

## Worksheet Classification Values

- Canonical Section.
- Template Reference Section.
- Scratchpad Seed.
- Proposal Support / Reference Only.
- Retired / Not Migrated.
- Requires Human Review.

## Migration Confidence Bands

| Band | Meaning | Behavior |
|---|---|---|
| 90–100 | High confidence | Eligible for auto-map, still reviewable. |
| 70–89 | Medium confidence | Mapped with review required. |
| 40–69 | Low confidence | Review queue; not automatically canonical. |
| 0–39 | Reference-only / unresolved | Do not promote without explicit human mapping. |

## Admin Actions

- Upload template workbook candidate.
- Run migration analysis.
- Review section mappings.
- Review cost-code mappings.
- Mark section as canonical/reference/scratchpad/retired.
- Approve template version.
- Archive template version.
- View migration history.

## Guardrails

- Active project workbook import is prohibited in MVP.
- Template migration does not create live project estimates.
- External workbook links are flagged and not preserved as live dependencies.
- Unsupported formulas are resolved as review items, static values, or governed calculation rules.

## Acceptance Criteria

- Admin can review Commercial and Multifamily template health.
- Template version cannot be activated without required sections and mapping coverage.
- Migration classifications are auditable.
- Code agent cannot treat template migration as active workbook import.
