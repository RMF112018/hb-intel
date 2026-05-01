# PCC Phase 3 Wave 9 - Documentation Update Package With Exact Checklist Items

## Purpose

This package updates the prior Wave 9 planning direction from a narrow startup checklist into a **Project Lifecycle Readiness Center** documentation package seeded directly from the three uploaded PDFs.

The package preserves the exact item text from each source checklist and provides a machine-readable default item library for future model, fixture, and documentation updates.

## Source PDFs

| Source file | Checklist family | Pages | Extracted items |
|---|---|---:|---:|
| `Project_Startup_Checklist(2).pdf` | Startup | 3 | 55 |
| `Project_Safety_Checklist(1).pdf` | Safety | 2 | 32 |
| `Project_Closeout_Checklist(2).pdf` | Closeout | 4 | 70 |
| **Total** |  |  | **157** |

## Recommended Documentation Update

Replace Wave 9 language that limits the module to `Job Startup Checklist` with:

```text
Phase 3 / Wave 9 - Project Lifecycle Readiness Center
```

Use this framing:

- Wave 8 remains the shared Project Readiness Module Framework.
- Wave 9 becomes the first flagship module built on that framework.
- Wave 9 incorporates startup, safety, and closeout checklist families.
- The module is not a Procore form clone, PDF replacement, or three-tab checklist screen.
- The module provides lifecycle readiness scoring, role-based action queues, evidence tracking, source traceability, blocker escalation, approval/checkpoint hooks, and Priority Actions integration.

## Exact Item Library Rules

The local code agent should seed the default item library from `02_Default_Item_Library.csv` or `03_Default_Item_Library.json` and preserve:

- `family`
- `source_file`
- `page`
- `section`
- `source_id`
- `exact_item_text`
- `details`
- `response_options`
- source traceability back to the PDF

Do not silently normalize spelling, punctuation, capitalization, or terminology in `exact_item_text`. If business-friendly labels are needed, add a separate `display_label` later while retaining the exact source text.

## Recommended Target Architecture Language

The Project Lifecycle Readiness Center should provide:

- lifecycle readiness command-center view;
- startup, safety, and closeout readiness families;
- phase/domain scoring;
- role-based work queues;
- evidence-backed checklist items;
- HB Document Control Center document/evidence links;
- Priority Actions surfacing for blockers, overdue items, missing evidence, and approval gates;
- Approvals / Checkpoints integration for readiness gates;
- audit trail and source traceability;
- Procore as an external reference only unless a later phase authorizes deeper integration.

## Files in This Package

| File | Purpose |
|---|---|
| `00_Documentation_Update_Package.md` | Consolidated package with source summary, update language, and all extracted items. |
| `01_Project_Startup_Checklist_Items.md` | Startup checklist exact item table. |
| `01_Project_Safety_Checklist_Items.md` | Safety checklist exact item table. |
| `01_Project_Closeout_Checklist_Items.md` | Closeout checklist exact item table. |
| `02_Default_Item_Library.csv` | Machine-readable flat item library. |
| `03_Default_Item_Library.json` | Machine-readable item library with counts and item objects. |
| `04_Local_Agent_Documentation_Update_Prompt.md` | Prompt for the local code agent to update planning/blueprint docs using this package. |

---

# Project Startup Checklist - Exact PDF Item Extraction

Source file: `Project_Startup_Checklist(2).pdf`

Total extracted items: **55**

## Review Owner's Contract

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 1.1 | 1 | Split savings clause if any & Contingency usage parameters |  |  |
| 1.2 | 1 | Liquidated damages are? |  |  |
| 1.3 | 1 | Any other special terms to be aware of? |  | N/A / Yes / No |
| 1.4 | 1 | Allowances to track- Set up change event to track |  | N/A / Yes / No |

## Job Start-up

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 2.1 | 1 | Review Bonding / SDI Requirements (HB and Subcontractor) |  | N/A / Yes / No |
| 2.2 | 2 | Complete Bond Application(s) and Submit to CFO to obtain (If Applicable) |  | N/A / Yes / No |
| 2.3 | 2 | Verify project is set up job in Accounting |  | N/A / Yes / No |
| 2.4 | 3 | Verify job is set up in Procore (see Job Set Up Procedures) |  | N/A / Yes / No |
| 2.5 | 3 | Job Turnover Meeting from Estimating to Project Team |  | N/A / Yes / No |
| 2.6 | 3 | Have Budget rolled from Sage Estimating to Accounting (if Applicable) |  | N/A / Yes / No |
| 2.7 | 3 | Have Budget rolled from Sage Accounting to Procore |  | N/A / Yes / No |
| 2.8 | 3 | Order Project Signs through HB Marketing Detartment |  | N/A / Yes / No |
| 2.9 | 3 | Enter Drawings and Specifications in Procore |  | N/A / Yes / No |
| 2.10 | 1 | Contract to Owner with Schedule of Values/ Pay app |  | N/A / Yes / No |
| 2.11 | 2 | Obtain all Subcontractor COI prior to MOB |  | N/A / Yes / No |
| 2.12 | 2 | Provide owner Certificate of Insurance |  | N/A / Yes / No |
| 2.13 | 2 | Complete and Record Notice of Commencement |  | N/A / Yes / No |
| 2.14 | 2 | Set up Job Files |  | N/A / Yes / No |
| 2.15 | 2 | Set up Management Plan & Logistics plan (Pre-Planning/Staging Meeting) |  | N/A / Yes / No |
| 2.16 | 2 | Prepare Project Schedule |  | N/A / Yes / No |
| 2.17 | 2 | Complete Submittal Register in Procore |  | N/A / Yes / No |
| 2.18 | 2 | Enter items in Job Close-out |  | N/A / Yes / No |
| 2.19 | 2 | Pre-Construction meeting with City/County/Fire/Building (Verify their checklist) |  | N/A / Yes / No |
| 2.20 | 2 | Pre-Construction Meeting with Owner |  | N/A / Yes / No |
| 2.21 | 2 | Verify owner has provided Threshold & Testing company/under contract |  | N/A / Yes / No |
| 2.22 | 2 | Verify need for Photo/Video Surveys of any adjacent property/Structures |  | N/A / Yes / No |
| 2.23 | 2 | Verify need for any vibration monitoring |  | N/A / Yes / No |
| 2.24 | 2 | Write Subcontracts in Procore (Identify longest lead items & award first) |  | N/A / Yes / No |
| 2.25 | 2 | Confirm review of estimate, qualifications & Sub proposals after plan scope reviews |  | N/A / Yes / No |
| 2.26 | 2 | Create buyout tracking log (verify any owner provided items and track) |  | N/A / Yes / No |
| 2.27 | 2 | Prepare public relations announcements (when applicable) |  | N/A / Yes / No |
| 2.28 | 2 | Create, record and track the NTO. Insert date reminder in Outlook |  | N/A / Yes / No |
| 2.29 | 2 | Mail Notice to Owner (Certified Mail/Return Receipt) |  | N/A / Yes / No |
| 2.30 | 2 | Verify Owner’s purchase of Builder’s Risk Insurance |  | N/A / Yes / No |
| 2.31 | 2 | Provide Superintendent with Project Safety Plan and SDS Notebook |  | N/A / Yes / No |
| 2.32 | 3 | Contact local Utilities and notify them of your project and services required |  | N/A / Yes / No |
| 2.33 | 3 | Consider a community awareness program if warranted. |  | N/A / Yes / No |

## Order services and equipment

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 3.1 | 3 | Telephone and/ or Internet (ordered/set up by the IT Department) |  | N/A / Yes / No |
| 3.2 | 3 | Sanitary |  | N/A / Yes / No |
| 3.3 | 3 | Field Office (ordered through the Main Office) |  | N/A / Yes / No |
| 3.4 | 3 | Job Office Trailer (Permit is required) |  | N/A / Yes / No |
| 3.5 | 3 | Order/Re-stock First Aid Kit & Purchase/Recharge fire extinguishers |  | N/A / Yes / No |
| 3.6 | 3 | Other |  | N/A / Yes / No |

## Permits posted on Jobsite

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 4.1 | 3 | Master permit |  | N/A / Yes / No |
| 4.2 | 3 | Roofing permit |  | N/A / Yes / No |
| 4.3 | 3 | Plumbing permit |  | N/A / Yes / No |
| 4.4 | 3 | HVAC permit |  | N/A / Yes / No |
| 4.5 | 3 | Electric permit |  | N/A / Yes / No |
| 4.6 | 3 | Fire Alarm permit |  | N/A / Yes / No |
| 4.7 | 3 | Fire Sprinklers permit |  | N/A / Yes / No |
| 4.8 | 3 | Elevator permit |  | N/A / Yes / No |
| 4.9 | 3 | Irrigation permit |  | N/A / Yes / No |
| 4.10 | 3 | Low Voltage permit |  | N/A / Yes / No |
| 4.11 | 3 | Site-Utilities- Drainage, Water & Sewer permits |  | N/A / Yes / No |
| 4.12 | 3 | Any Right of way, FDOT, MOT plans, etc. |  | N/A / Yes / No |


# Project Safety Checklist - Exact PDF Item Extraction

Source file: `Project_Safety_Checklist(1).pdf`

Total extracted items: **32**

## Areas of Highest Risk

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 1.1 | 1 | Fall Exposures |  | Pass / Fail / N/A |
| 1.2 | 1 | Electrical Shocks |  | Pass / Fail / N/A |
| 1.3 | 1 | Struck by Risks |  | Pass / Fail / N/A |
| 1.4 | 1 | Crushed by Risks |  | Pass / Fail / N/A |

## Other Risks (These caused most injuries)

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 2.1 | 1 | Blasting/Explosives |  | Pass / Fail / N/A |
| 2.2 | 2 | Concrete Construction |  | Pass / Fail / N/A |
| 2.3 | 2 | Cranes & Elevators |  | Pass / Fail / N/A |
| 2.4 | 2 | Demolition |  | Pass / Fail / N/A |
| 2.5 | 2 | Electrical |  | Pass / Fail / N/A |
| 2.6 | 2 | Excavation |  | Pass / Fail / N/A |
| 2.7 | 2 | Fire Protection |  | Pass / Fail / N/A |
| 2.8 | 2 | First Aid |  | Pass / Fail / N/A |
| 2.9 | 2 | Flammables |  | Pass / Fail / N/A |
| 2.10 | 1 | Floor & Wall Openings |  | Pass / Fail / N/A |
| 2.11 | 2 | Gases, Fumes, Dusts |  | Pass / Fail / N/A |
| 2.12 | 2 | General Safety |  | Pass / Fail / N/A |
| 2.13 | 2 | Hazard Communication |  | Pass / Fail / N/A |
| 2.14 | 2 | Housekeeping |  | Pass / Fail / N/A |
| 2.15 | 2 | Illumination |  | Pass / Fail / N/A |
| 2.16 | 2 | Lockout/tagout |  | Pass / Fail / N/A |
| 2.17 | 2 | Maintenance |  | Pass / Fail / N/A |
| 2.18 | 2 | Motor Vehicles |  | Pass / Fail / N/A |
| 2.19 | 2 | Noise Exposure |  | Pass / Fail / N/A |
| 2.20 | 2 | Personal Protection |  | Pass / Fail / N/A |
| 2.21 | 2 | Safety Training |  | Pass / Fail / N/A |
| 2.22 | 2 | Sanitation |  | Pass / Fail / N/A |
| 2.23 | 2 | Scaffolding |  | Pass / Fail / N/A |
| 2.24 | 2 | Signs, Signals, Barricades |  | Pass / Fail / N/A |
| 2.25 | 2 | Stairways & Ladders |  | Pass / Fail / N/A |
| 2.26 | 2 | Steel Erection |  | Pass / Fail / N/A |
| 2.27 | 2 | Tools |  | Pass / Fail / N/A |
| 2.28 | 2 | Welding & Cutting |  | Pass / Fail / N/A |


# Project Closeout Checklist - Exact PDF Item Extraction

Source file: `Project_Closeout_Checklist(2).pdf`

Total extracted items: **70**

## Tasks

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 1.1 | 1 | Installation of phone lines for Fire Alarm & Elevator-by owner to set up account |  | N/A / Yes / No |
| 1.2 | 1 | All RFI's closed |  | N/A / Yes / No |
| 1.3 | 1 | All Submittals approved |  | N/A / Yes / No |
| 1.4 | 1 | All Change Orders approved |  | N/A / Yes / No |
| 1.5 | 1 | Request all as-builts from Subs |  | N/A / Yes / No |

## Document Tracking

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 2.1 | 1 | Soil investigation and certification of building pad if required |  | N/A / Yes / No |
| 2.2 | 1 | Soil Poison/Termite letter (usually from Shell contractor) prior to pours |  | N/A / Yes / No |
| 2.3 | 1 | Insulation certificate from insulation contractor |  | N/A / Yes / No |
| 2.4 | 1 | Form board survey |  | N/A / Yes / No |
| 2.5 | 1 | Tie-in survey showing setbacks and finish floor elevation |  | N/A / Yes / No |
| 2.6 | 1 | Final Survey & Elevation Certficate |  | N/A / Yes / No |
| 2.7 | 1 | Letter on fire-treated lumber if applicable |  | N/A / Yes / No |
| 2.8 | 1 | Fire Alarm Monitoring letter received from Owner |  | N/A / Yes / No |
| 2.9 | 1 | Letter from Structural Engineer certifying building as-builts, if necessary |  | N/A / Yes / No |
| 2.10 | 1 | Architect to issue Certificate of Substantial Completion Affidavit (date of S.C.) |  | N/A / Yes / No |
| 2.11 | 1 | Engineer Cert for all sitework-Paving & Utilities |  | N/A / Yes / No |
| 2.12 | 1 | Threshold Inpsection reports for Bldg Dept |  | N/A / Yes / No |
| 2.13 | 1 | Final Landscape acceptance letter for the LA of record submitted if required |  | N/A / Yes / No |

## Inspections

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 3.1 | 2 | All plan changes submitted and approved by Building Department |  | N/A / Yes / No |
| 3.2 | 2 | Health Department approval of water and sewer lines |  | N/A / Yes / No |
| 3.3 | 2 | Utility company's approval of water and sewer lines |  | N/A / Yes / No |
| 3.4 | 2 | Demo Final |  | N/A / Yes / No |
| 3.5 | 2 | Plumbing Final |  | N/A / Yes / No |
| 3.6 | 2 | HVAC Final |  | N/A / Yes / No |
| 3.7 | 2 | Electrical Final |  | N/A / Yes / No |
| 3.8 | 2 | Fire alarm & Fire sprinkler Final |  | N/A / Yes / No |
| 3.9 | 2 | Building Final |  | N/A / Yes / No |
| 3.10 | 2 | Complete Pre-Certificate of Occupancy checklist |  | N/A / Yes / No |
| 3.11 | 2 | Obtain Certificate of Occupancy (C.O.) . or Certificate of Completion, if shell building |  | N/A / Yes / No |

## Turnover

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 4.1 | 2 | Send copy of C.O. to Owner or Owner's Representative |  | N/A / Yes / No |
| 4.2 | 2 | Schedule meeting with Architect & Owner for punch list (date) |  | N/A / Yes / No |
| 4.3 | 2 | Complete punch list (date completed) |  | N/A / Yes / No |
| 4.4 | 2 | Complete as-built drawings (date) |  | N/A / Yes / No |
| 4.5 | 2 | Schedule "turn-over" meeting with Owner & Owner's Representative |  | N/A / Yes / No |
| 4.6 | 3 | Give Owner list of subs and all warranty letters |  | N/A / Yes / No |
| 4.7 | 3 | Give Owner all Maintenance Manuals |  | N/A / Yes / No |
| 4.8 | 3 | Convey any Attic Stock |  | N/A / Yes / No |
| 4.9 | 3 | Forward letter of appreciation to Owner |  | N/A / Yes / No |
| 4.10 | 2 | Order plant for delivery (best wishes...) |  | N/A / Yes / No |
| 4.11 | 2 | Prepare Public Relations Announcement |  | N/A / Yes / No |
| 4.12 | 2 | Complete final payment forms for each subcontractor |  | N/A / Yes / No |
| 4.13 | 2 | Date last contractual work on project was performed (date) |  | date field |
| 4.14 | 2 | Flag 80 calendar days from last day HB worked on project (date) |  | date field |
| 4.15 | 2 | Obtain Release of Liens from Subs |  | N/A / Yes / No |

## Post Turnover

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 5.1 | 3 | If final payment is not received, send letter to Owner that we intend to lien property |  | N/A / Yes / No |
| 5.2 | 3 | If final payment is not received within 88 days, file lien |  | N/A / Yes / No |
| 5.3 | 3 | Six months after completion of project, give photographs taken |  | N/A / Yes / No |
| 5.4 | 3 | Request from Owner a recommendation letter |  | N/A / Yes / No |
| 5.5 | 3 | Project Manager return all files, permit plans, and permit card to Estimator |  | N/A / Yes / No |

## Complete Project Closeout Documents for PX

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 6.1 | 3 | Project Closeout Checklist |  | N/A / Yes / No |
| 6.2 | 3 | Project Recap Form |  | N/A / Yes / No |
| 6.3 | 3 | Subcontractor Evaluation Form |  | N/A / Yes / No |
| 6.4 | 3 | Cost Variance Report |  | N/A / Yes / No |
| 6.5 | 3 | Send Lessons learned to Victoria Miel |  | N/A / Yes / No |

## PBC Close-Out Requirements

| Source ID | Page | Exact item text | Details | Response options |
|---|---:|---|---|---|
| 7.1 | 4 | Soil Bearing Capacity Certification Letter |  | Yes / No / N/A |
| 7.2 | 4 | Foundation Soil Density Test Results |  | Yes / No / N/A |
| 7.3 | 4 | Form Board Survey - Signed & Sealed by Surveyor |  | Yes / No / N/A |
| 7.4 | 4 | Termite Pre-Treatment Certificate |  | Yes / No / N/A |
| 7.5 | 4 | Shoring Reports |  | Yes / No / N/A |
| 7.6 | 4 | Final Certification Letter - Structural | To be issued by Structural EOR, signed and sealed | Yes / No / N/A |
| 7.7 | 4 | Fire Main Underground Pressure Test Passed | PBCFD (will include DDCV) & Plumbing | Yes / No / N/A |
| 7.8 | 4 | Final Survey - Signed & Sealed |  | Yes / No / N/A |
| 7.9 | 4 | Insulation Certificates |  | Yes / No / N/A |
| 7.10 | 4 | Intumescent Fire Coating Certificate (if applicable) |  | Yes / No / N/A |
| 7.11 | 4 | Plenum Door Certificate (if applicable) |  | Yes / No / N/A |
| 7.12 | 4 | Termite Post-Treatment Certificate |  | Yes / No / N/A |
| 7.13 | 4 | All Inspections Recorded as "Approved" / "Passed" | PBC will not issue TCO for phase if any inspections are recorded as incomplete / partial / failed | Yes / No / N/A |
| 7.14 | 4 | Partial Final Inspections Passed | As Required by Master Building Permit and All Associated Sub-Permits | Yes / No / N/A |
| 7.15 | 4 | Certification of Completion Letter - Private Provider |  | Yes / No / N/A |
| 7.16 | 4 | Final Building Inspections by PBC (discretionary) | May be required by PBC in addition to UES Final Inspection | Yes / No / N/A |

