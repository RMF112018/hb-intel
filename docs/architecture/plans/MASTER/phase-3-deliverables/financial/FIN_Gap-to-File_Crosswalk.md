# FIN Gap-to-File Crosswalk

> **Note:** For the broader Financial doctrine package entry point — including the full file map, capability crosswalk, and prompt set roadmap — see the [Financial Doctrine Control Index](Financial-Doctrine-Control-Index.md). This crosswalk remains focused on FIN-01 through FIN-04 absorb/reference guidance.

## Purpose

This crosswalk shows which existing Financial planning files should **reference** or **absorb** the new FIN-01 through FIN-04 governance files.

It is designed to prevent duplication while still making the Financial family implementation-ready for:
- operating posture
- action posture and user-owned work
- PWA vs SPFx lane ownership
- canonical routing and project-context durability

## Usage Rules

### Reference
Use **reference** when the existing file should cite the FIN file as governing input, but should **not** duplicate its detailed content.

### Absorb
Use **absorb** when the existing file should incorporate a **file-specific derivative summary** of the FIN file because implementers working in that file need the rule in-place.

### Do not copy whole files
No existing file should reproduce FIN-01 through FIN-04 wholesale. Where this crosswalk says **absorb**, only absorb the **file-specific subset** needed for local implementation clarity.

---

## Crosswalk by Existing Financial File

| Existing file | Primary role in Financial family | FIN-01 | FIN-02 | FIN-03 | FIN-04 | Required action |
|---|---|---:|---:|---:|---:|---|
| `P3-E4-Financial-Module-Field-Specification.md` | Master Financial module specification / top-level contract | **Absorb** | Reference | Reference | Reference | Add a short opening section that locks Financial as an always-on operating module and rejects viewer-first implementation. Add “governed by” references to FIN-02/03/04, but keep detailed action/lane/route rules out of this master spec. |
| `FRM-00-Financial-Runtime-Entity-Model.md` | Runtime entity-model master index | Reference | Reference | Reference | Reference | Add a governing references section or assumptions section that points to FIN-01 through FIN-04. Do **not** absorb behavioral or routing detail into the entity model beyond implementation assumptions. |
| `FRM-04-Financial-Repository-and-Provider-Seam-Plan.md` | Repository / provider seam and data-access execution plan | Reference | **Absorb** | Reference | **Absorb** | Keep FIN-01 as a reference only. Absorb the subset of FIN-02 that affects command seams, mutation ownership, blocked/read-only behavior, and action handlers. Absorb the subset of FIN-04 that affects route-derived context, project scoping, draft safety, and provider assumptions. |
| `FVC-02-Forecast-Versioning-and-Checklist-Contract.md` | Forecast version lifecycle + checklist gating contract | Reference | **Absorb** | Reference | **Absorb** | Keep posture as reference only. Absorb FIN-02 state/action posture for versioning and checklist states so implementers see actionable/view-only/blocked/escalated outcomes directly in this contract. Absorb FIN-04 only for forecast/checklist route and deep-link expectations. |
| `FRC-05-Financial-Workflow-Translation.md` | Workbook-to-runtime workflow translation | Reference | **Absorb** | **Absorb** | **Absorb** | This file should absorb the most from the FIN family. It should be the place where workbook steps are translated into owned actions, escalation paths, lane decisions, and route destinations. Keep FIN-01 as a governing reference, not a duplicate. |
| `BIP-01-Budget-Import-Pipeline.md` | Budget import / reconciliation workflow contract | Reference | **Absorb** | **Absorb** | **Absorb** | Add the budget-specific action posture from FIN-02, lane decisions for preview/reconciliation/escalation from FIN-03, and canonical `/financial/budget` route ownership from FIN-04. FIN-01 should be referenced to keep the importer from degrading into a generic upload utility. |
| `PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md` | Canonical source-of-truth and ownership lock | Reference | Reference | Reference | Reference | Keep this file clean and authoritative. It should reference the FIN family as downstream operating-governance files, but it should **not** absorb their content. |
| `FRC-00-Financial-Replacement-Crosswalk.md` | Workbook/process replacement map | Reference | **Absorb** | **Absorb** | **Absorb** | Add columns or subsections that map old workbook/process steps to new action posture, owning lane, and canonical route destination. Keep FIN-01 as a governing reference only. |
| `FRC-03-Implementation-Implications.md` | Delivery and implementation consequences rollup | **Absorb** | **Absorb** | **Absorb** | **Absorb** | This file should become the main synthesis point for the new FIN family. It should summarize how posture, action ownership, lane ownership, and route doctrine change implementation sequencing and acceptance. |
| `00_Financial_Module_UI_Spec_Index.md` | UI-spec package index / governing reference hub | Reference | Reference | Reference | Reference | Add all four FIN files to the governing references section. Do not absorb detailed rule content here; keep it as an index-level pointing document. |

---

## Crosswalk by New FIN File

## FIN-01 — Operating Posture and Surface Classification

### Files that should **absorb** FIN-01
- `P3-E4-Financial-Module-Field-Specification.md`
- `FRC-03-Implementation-Implications.md`

### Files that should **reference** FIN-01
- `FRM-00-Financial-Runtime-Entity-Model.md`
- `FRM-04-Financial-Repository-and-Provider-Seam-Plan.md`
- `FVC-02-Forecast-Versioning-and-Checklist-Contract.md`
- `FRC-05-Financial-Workflow-Translation.md`
- `BIP-01-Budget-Import-Pipeline.md`
- `PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md`
- `FRC-00-Financial-Replacement-Crosswalk.md`
- `00_Financial_Module_UI_Spec_Index.md`

### Why
FIN-01 is the posture lock. It should be absorbed only where the Financial family needs a short authoritative posture statement to prevent viewer-first implementation drift. Everywhere else, it should remain a governing reference.

---

## FIN-02 — Action Posture and User-Owned Work Matrix

### Files that should **absorb** FIN-02
- `FRM-04-Financial-Repository-and-Provider-Seam-Plan.md`
- `FVC-02-Forecast-Versioning-and-Checklist-Contract.md`
- `FRC-05-Financial-Workflow-Translation.md`
- `BIP-01-Budget-Import-Pipeline.md`
- `FRC-00-Financial-Replacement-Crosswalk.md`
- `FRC-03-Implementation-Implications.md`

### Files that should **reference** FIN-02
- `P3-E4-Financial-Module-Field-Specification.md`
- `FRM-00-Financial-Runtime-Entity-Model.md`
- `PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md`
- `00_Financial_Module_UI_Spec_Index.md`

### Why
FIN-02 is the most implementation-facing of the four new FIN files. It should be absorbed wherever a file translates domain logic into real user work, workflow posture, command handling, or replacement of legacy workbook steps.

---

## FIN-03 — Lane Ownership Matrix

### Files that should **absorb** FIN-03
- `FRC-05-Financial-Workflow-Translation.md`
- `BIP-01-Budget-Import-Pipeline.md`
- `FRC-00-Financial-Replacement-Crosswalk.md`
- `FRC-03-Implementation-Implications.md`

### Files that should **reference** FIN-03
- `P3-E4-Financial-Module-Field-Specification.md`
- `FRM-00-Financial-Runtime-Entity-Model.md`
- `FRM-04-Financial-Repository-and-Provider-Seam-Plan.md`
- `FVC-02-Forecast-Versioning-and-Checklist-Contract.md`
- `PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md`
- `00_Financial_Module_UI_Spec_Index.md`

### Why
FIN-03 should be absorbed only in files that actually translate process steps into lane-specific behavior or implementation sequencing. For core domain/spec files, reference is enough.

---

## FIN-04 — Route and Context Contract

### Files that should **absorb** FIN-04
- `FRM-04-Financial-Repository-and-Provider-Seam-Plan.md`
- `FVC-02-Forecast-Versioning-and-Checklist-Contract.md`
- `FRC-05-Financial-Workflow-Translation.md`
- `BIP-01-Budget-Import-Pipeline.md`
- `FRC-00-Financial-Replacement-Crosswalk.md`
- `FRC-03-Implementation-Implications.md`

### Files that should **reference** FIN-04
- `P3-E4-Financial-Module-Field-Specification.md`
- `FRM-00-Financial-Runtime-Entity-Model.md`
- `PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md`
- `00_Financial_Module_UI_Spec_Index.md`

### Why
FIN-04 is a routing and context doctrine file. It should be absorbed only where route ownership, deep-linking, project switching, or route-derived state changes how a workflow or implementation seam behaves.

---

## Recommended Edit Order

1. `P3-E4-Financial-Module-Field-Specification.md`
   - add posture lock and references first
2. `FRC-03-Implementation-Implications.md`
   - synthesize the FIN family into one delivery-facing implications file
3. `FRC-05-Financial-Workflow-Translation.md`
   - map workflows to actions, lanes, and routes
4. `BIP-01-Budget-Import-Pipeline.md`
   - align the import/reconciliation workflow with action, lane, and route rules
5. `FVC-02-Forecast-Versioning-and-Checklist-Contract.md`
   - align forecast/checklist behavior with FIN-02 and FIN-04
6. `FRM-04-Financial-Repository-and-Provider-Seam-Plan.md`
   - align command seams and route-derived context assumptions
7. `FRC-00-Financial-Replacement-Crosswalk.md`
   - add mapping columns for action/lane/route replacement
8. `FRM-00-Financial-Runtime-Entity-Model.md`
   - add references/assumptions only
9. `PH3-FIN-SOTL-Financial-Source-of-Truth-Lock.md`
   - add references only
10. `00_Financial_Module_UI_Spec_Index.md`
    - add FIN family to governing references

---

## Practical Rule of Thumb

- If the existing file defines **what Financial is** → mostly **reference** the FIN files.
- If the existing file defines **how a user works** → **absorb FIN-02** and likely **FIN-04**.
- If the existing file defines **where work happens** → **absorb FIN-03** and **FIN-04**.
- If the existing file defines **canonical ownership** → keep it clean and mostly **reference only**.

