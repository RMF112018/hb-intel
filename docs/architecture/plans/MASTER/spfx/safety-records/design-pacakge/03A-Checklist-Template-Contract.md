# 03A — Checklist Template Contract

## Objective

Define the exact governed workbook contract for the uploaded field checklist.

This is the workbook structure that Release 1 ingestion must support.

## Workbook identity

- Workbook filename in current reference set: `Safety Checklist Template.xlsx`
- Required worksheet names:
  - `ScoreCard`
  - `ScoringWeights`

Uploads that do not contain these sheets in the expected structure should be rejected or routed to manual review.

## Sheet 1 — `ScoreCard`

### Worksheet range
- Observed occupied range: `A1:G142`

### Top metadata / summary band

| Range | Purpose | Observed content |
|---|---|---|
| A1 | Workbook title | Construction Site Safety Walk Checklist (Field Form) |
| A3 | Metadata label | Date |
| D3 | Metadata label | Insp #. |
| F3 | Summary label | Summary (auto) |
| A4 | Metadata label | Project/Site |
| F4:G4 | Summary pair | Total Yes |
| F5:G5 | Summary pair | Total No |
| F6:G6 | Summary pair | Total N/A |
| F7:G7 | Summary pair | Safety Score % |

### Required editable user-entry cells / bands

The workbook contract should reserve these as user-entered or field-entered content:

- date entry adjacent to `A3`
- project/site entry adjacent to `A4`
- inspection number entry adjacent to `D3`
- checklist response cells in columns `B:D`
- notes cells in column `E`
- free-text findings area at the bottom after row `142` if expanded in future template versions

### Response matrix

The main inspection matrix begins at row `9`.

| Cell | Column heading |
|---|---|
| A9 | Item |
| B9 | Yes |
| C9 | No |
| D9 | N/A |
| E9 | Notes |
| F9 | Score |
| G9 | Inspection Flag |

### Response semantics

For each checklist item row:

- `B` = Yes
- `C` = No
- `D` = N/A
- expected mark literal = `X`
- exactly one of `B:C:D` should be selected for a clean row
- current template formulas treat:
  - no mark = `INCOMPLETE`
  - multiple marks = `MULTI`
  - exactly one mark = `COMPLETE`

### Current top summary formulas

| Cell | Formula | Meaning |
|---|---|---|
| G4 | `=COUNTIF(B11:B124,"X")` | Total Yes |
| G5 | `=COUNTIF(C11:C124,"X")` | Total No |
| G6 | `=COUNTIF(D11:D124,"X")` | Total N/A |
| G7 | `=SUMPRODUCT(E129:E140, INDEX(ScoringWeights!C:C, MATCH(A129:A140, ScoringWeights!B:B, 0)))` | Weighted final score |

### Checklist section map

| # | Section | Displayed item rows | Displayed items | Current count-range rows | Displayed rows excluded by current score formulas | Weight |
|---|---|---|---|---|---|---|
| 1 | 1. General Site Conditions | 11-20 | 10 | 11-19 | 20 | 0.03 |
| 2 | 2. Emergency & Fire Preparedness | 23-27 | 5 | 23-27 | — | 0.03 |
| 3 | 3. PPE & Worker Compliance | 30-37 | 8 | 30-36 | 37 | 0.08 |
| 4 | 4. Fall Protection & Openings | 40-49 | 10 | 40-49 | — | 0.18 |
| 5 | 5. Ladders & Scaffolds | 52-63 | 12 | 52-61 | 62, 63 | 0.14 |
| 6 | 6. Electrical & Temporary Power | 66-73 | 8 | 66-73 | — | 0.10 |
| 7 | 7. Hot Work & Fire Risk Controls | 76-81 | 6 | 76-81 | — | 0.07 |
| 8 | 8. Material Handling & Storage | 84-89 | 6 | 84-89 | — | 0.04 |
| 9 | 9. Equipment & Mobile Plant | 92-100 | 9 | 92-98 | 99, 100 | 0.12 |
| 10 | 10. Excavations & Ground Disturbance | 103-108 | 6 | 103-108 | — | 0.12 |
| 11 | 11. Environmental & Health | 111-117 | 7 | 111-117 | — | 0.02 |
| 12 | 12. Behavioral / Work Practices | 120-124 | 5 | 120-124 | — | 0.07 |

## Detailed section inventory

### Section 1 — 1. General Site Conditions

- Header row: `10`
- Displayed checklist item rows: `11-20`
- Displayed item count: `10`
- Current summary count-range formulas reference rows: `11-19`
- Incomplete-flag summary formula references rows: `11-20`
- Weight from `ScoringWeights`: `0.03` (Administrative / low-acute risk)

Checklist rows:
- Row 11: Site access controlled (fencing/gates/sign-in)
- Row 12: Safety signage posted (PPE, hazards, traffic)
- Row 13: Subcontractors Signing in
- Row 14: Walkways/egress clear and maintained
- Row 15: Lighting adequate for work areas
- Row 16: Housekeeping acceptable (debris managed)
- Row 17: Stairs/ramps/temporary steps stable and clear
- Row 18: Waste disposal bins available and used
- Row 19: Sharp protrusions/rebar capped or protected
- Row 20: OSHA 300A (2/1-4/30) and Worker's Comp Information Posted  *(displayed in template, excluded from current count-range formulas)*

### Section 2 — 2. Emergency & Fire Preparedness

- Header row: `22`
- Displayed checklist item rows: `23-27`
- Displayed item count: `5`
- Current summary count-range formulas reference rows: `23-27`
- Incomplete-flag summary formula references rows: `23-27`
- Weight from `ScoringWeights`: `0.03` (Response capability (mitigates severity))

Checklist rows:
- Row 23: Emergency contact board posted and current
- Row 24: First aid kit available and stocked
- Row 25: Fire extinguishers staged, accessible, inspected
- Row 26: Emergency routes/assembly point communicated
- Row 27: AED available (if required) and location known

### Section 3 — 3. PPE & Worker Compliance

- Header row: `29`
- Displayed checklist item rows: `30-37`
- Displayed item count: `8`
- Current summary count-range formulas reference rows: `30-36`
- Incomplete-flag summary formula references rows: `30-37`
- Weight from `ScoringWeights`: `0.08` (Foundational barrier to multiple hazards)

Checklist rows:
- Row 30: Hard hats worn in required areas
- Row 31: Safety glasses worn (side shields) in required areas
- Row 32: Hi-vis worn where required
- Row 33: Gloves used appropriately for tasks
- Row 34: Hearing protection used where needed
- Row 35: Respiratory protection used where required (dust/fumes)
- Row 36: PPE condition acceptable (no cracks/tears)
- Row 37: Safe guards in place (guards on grinders) *(displayed in template, excluded from current count-range formulas)*

### Section 4 — 4. Fall Protection & Openings

- Header row: `39`
- Displayed checklist item rows: `40-49`
- Displayed item count: `10`
- Current summary count-range formulas reference rows: `40-49`
- Incomplete-flag summary formula references rows: `40-49`
- Weight from `ScoringWeights`: `0.18` (Highest fatality cause (falls))

Checklist rows:
- Row 40: Leading edges protected (guardrail/cable/controlled access)
- Row 41: Floor openings covered, secured, labeled
- Row 42: Shafts/stairwells protected (guardrails/barricades)
- Row 43: Fall Protection: Harness/lanyard inspected and used correctly where required
- Row 44: Tie-off to approved anchor points only
- Row 45: Aerial/Scissor lifts: proper tie-in and gate use
- Row 46: Scaffold platforms fully decked with same material and protected
- Row 47: Scaffold Tags in place and signed off daily
- Row 48: Tools/materials secured at height (dropped object prevention)
- Row 49: Toe boards installed where required

### Section 5 — 5. Ladders & Scaffolds

- Header row: `51`
- Displayed checklist item rows: `52-63`
- Displayed item count: `12`
- Current summary count-range formulas reference rows: `52-61`
- Incomplete-flag summary formula references rows: `52-63`
- Weight from `ScoringWeights`: `0.14` (Fall-related (second-highest exposure))

Checklist rows:
- Row 52: Ladders in good condition; rated for use
- Row 53: Ladders set correctly (4:1), secured, stable footing
- Row 54: Ladders extend 3 ft above landing/tied-off as required
- Row 55: A-frame ladders fully opened before climbing
- Row 56: No standing on top step; 3 points of contact
- Row 57: No Aluminum ladders on site
- Row 58: Scaffold base plates/leveling; no improvised blocks
- Row 59: Scaffold guardrails/toe boards installed
- Row 60: Scaffold access provided (ladder/stairs)
- Row 61: Scaffold tags/inspection current (if used)
- Row 62: Baker scaffolding erected with casters or feet in place  *(displayed in template, excluded from current count-range formulas)*
- Row 63: If scaffolding is on casters; wheels locked before employee climbs  *(displayed in template, excluded from current count-range formulas)*

### Section 6 — 6. Electrical & Temporary Power

- Header row: `65`
- Displayed checklist item rows: `66-73`
- Displayed item count: `8`
- Current summary count-range formulas reference rows: `66-73`
- Incomplete-flag summary formula references rows: `66-73`
- Weight from `ScoringWeights`: `0.10` (Electrocution risk)

Checklist rows:
- Row 66: GFCI protection used (temp power, wet areas)
- Row 67: 16 Guage cord or heavier used 
- Row 68: Extension cords intact (no cuts/splices)
- Row 69: Cords managed (not through doorways/pinch points)
- Row 70: Temporary panels labeled; covers in place
- Row 71: Open junction boxes covered; no exposed conductors
- Row 72: LOTO used where required; energized work controlled
- Row 73: Wet conditions addressed (cord elevation, equipment rated)

### Section 7 — 7. Hot Work & Fire Risk Controls

- Header row: `75`
- Displayed checklist item rows: `76-81`
- Displayed item count: `6`
- Current summary count-range formulas reference rows: `76-81`
- Incomplete-flag summary formula references rows: `76-81`
- Weight from `ScoringWeights`: `0.07` (Fire / explosion potential)

Checklist rows:
- Row 76: Hot work permit posted (if required)
- Row 77: Fire watch assigned and equipped
- Row 78: Combustibles cleared or protected (blankets/shields)
- Row 79: Fire extinguisher staged at hot work location
- Row 80: Gas cylinders secured upright with caps/valves protected
- Row 81: Post-work fire watch completed (per policy)

### Section 8 — 8. Material Handling & Storage

- Header row: `83`
- Displayed checklist item rows: `84-89`
- Displayed item count: `6`
- Current summary count-range formulas reference rows: `84-89`
- Incomplete-flag summary formula references rows: `84-89`
- Weight from `ScoringWeights`: `0.04` (Struck-by / collapse)

Checklist rows:
- Row 84: Materials stacked stable; no leaning/over stacking
- Row 85: Stored to prevent collapse/roll (chocks, dunnage)
- Row 86: Aisles kept clear; access maintained
- Row 87: Flammables stored in approved containers/cabinets
- Row 88: Cylinders separated/secured (oxygen/acetylene)
- Row 89: Overhead storage hazards controlled/excluded

### Section 9 — 9. Equipment & Mobile Plant

- Header row: `91`
- Displayed checklist item rows: `92-100`
- Displayed item count: `9`
- Current summary count-range formulas reference rows: `92-98`
- Incomplete-flag summary formula references rows: `92-100`
- Weight from `ScoringWeights`: `0.12` (Struck-by / crushing (mobile equipment))

Checklist rows:
- Row 92: Operators trained/certified where required
- Row 93: Daily equipment inspections completed (forklift, lifts, etc.)
- Row 94: Seatbelts used; guards in place
- Row 95: Back-up alarms/visual warnings functioning
- Row 96: Spotters used where required; blind spots managed
- Row 97: Swing radius/exclusion zones barricaded
- Row 98: No one under suspended loads; rigging inspected
- Row 99: Qualified Rigger/Signal Person Used *(displayed in template, excluded from current count-range formulas)*
- Row 100: Critical Lift Plans Established/Communicated (as required) *(displayed in template, excluded from current count-range formulas)*

### Section 10 — 10. Excavations & Ground Disturbance

- Header row: `102`
- Displayed checklist item rows: `103-108`
- Displayed item count: `6`
- Current summary count-range formulas reference rows: `103-108`
- Incomplete-flag summary formula references rows: `103-108`
- Weight from `ScoringWeights`: `0.12` (Cave-in / burial (caught-in/between))

Checklist rows:
- Row 103: Utility locate completed; markings visible
- Row 104: Protective system used (sloping/shoring/trench box for >5)
- Row 105: Spoil piles set back (≥2 ft)
- Row 106: Safe access/egress (ladder/ramps) provided
- Row 107: Barricades installed around open excavations
- Row 108: Daily competent person inspection documented

### Section 11 — 11. Environmental & Health

- Header row: `110`
- Displayed checklist item rows: `111-117`
- Displayed item count: `7`
- Current summary count-range formulas reference rows: `111-117`
- Incomplete-flag summary formula references rows: `111-117`
- Weight from `ScoringWeights`: `0.02` (Primarily chronic / lower acute fatality)

Checklist rows:
- Row 111: Dust control implemented (wet methods/vacuum)
- Row 112: Silica controls followed (if applicable)
- Row 113: Noise exposure managed; hearing protection available
- Row 114: Heat/cold stress controls (water, shade, breaks)
- Row 115: Drinking water available and clean
- Row 116: Chemical containers labeled; SDS accessible
- Row 117: Ventilation used for fumes/solvents

### Section 12 — 12. Behavioral / Work Practices

- Header row: `119`
- Displayed checklist item rows: `120-124`
- Displayed item count: `5`
- Current summary count-range formulas reference rows: `120-124`
- Incomplete-flag summary formula references rows: `120-124`
- Weight from `ScoringWeights`: `0.07` (Human-factor prevention across all areas)

Checklist rows:
- Row 120: Pre-task planning / JHA conducted for active tasks (if applicable)
- Row 121: Workers following SOPs; no unsafe shortcuts observed
- Row 122: Communication effective (hand signals, radios as needed)
- Row 123: Supervision present for high-risk work
- Row 124: Near-misses/hazards being reported promptly


## Summary table block

The section-summary block begins near the bottom of the sheet.

| Range | Observed content |
|---|---|
| A127 | Section Scores (auto) — copy into Inspection_Log |
| A128:F128 | Summary header row |
| A129:F140 | Section summary rows 1-12 |
| A142 | Key Findings / Corrective Actions (free text) |

### Summary table columns

- `A` = Section
- `B` = Yes
- `C` = No
- `D` = N/A
- `E` = Score %
- `F` = Incomplete Inspection Items

### Important workbook behavior

The current workbook contains **row-band mismatches** where some displayed checklist rows are **not included** in the section-count formulas used for the summary score.

Observed mismatches:

| Section | Displayed rows | Current formula count-range | Displayed rows excluded from count-range |
|---|---|---|---|
| 1. General Site Conditions | 11:20 | 11:19 | 20 |
| 3. PPE & Worker Compliance | 30:37 | 30:36 | 37 |
| 5. Ladders & Scaffolds | 52:63 | 52:61 | 62, 63 |
| 9. Equipment & Mobile Plant | 92:100 | 92:98 | 99, 100 |

### Design decision for Release 1

The parser should **not blindly trust** these current formula exclusions.

The backend should:

1. parse all displayed checklist item rows in the governed contract
2. version the template explicitly
3. choose one of two modes per template version:
   - `compatibility mode` = preserve existing workbook math exactly
   - `normalized mode` = count all displayed rows intended for the section
4. log which scoring mode was used

Recommended default for initial rollout:
- support **compatibility mode** first
- expose the known exclusions in governance documentation
- optionally introduce a corrected template version later and migrate to normalized scoring under a new template version

## Sheet 2 — `ScoringWeights`

### Worksheet range
- Observed occupied range: `A1:D14`

| Num | Section | Weight | Rationale |
|---|---|---|---|
| 1 | 1. General Site Conditions | 0.03 | Administrative / low-acute risk |
| 2 | 2. Emergency & Fire Preparedness | 0.03 | Response capability (mitigates severity) |
| 3 | 3. PPE & Worker Compliance | 0.08 | Foundational barrier to multiple hazards |
| 4 | 4. Fall Protection & Openings | 0.18 | Highest fatality cause (falls) |
| 5 | 5. Ladders & Scaffolds | 0.14 | Fall-related (second-highest exposure) |
| 6 | 6. Electrical & Temporary Power | 0.10 | Electrocution risk |
| 7 | 7. Hot Work & Fire Risk Controls | 0.07 | Fire / explosion potential |
| 8 | 8. Material Handling & Storage | 0.04 | Struck-by / collapse |
| 9 | 9. Equipment & Mobile Plant | 0.12 | Struck-by / crushing (mobile equipment) |
| 10 | 10. Excavations & Ground Disturbance | 0.12 | Cave-in / burial (caught-in/between) |
| 11 | 11. Environmental & Health | 0.02 | Primarily chronic / lower acute fatality |
| 12 | 12. Behavioral / Work Practices | 0.07 | Human-factor prevention across all areas |

### Weighting contract

The final workbook score uses weighted section percentages whose total allocation sums to approximately `1.00`.

## Parser-required validations

Uploads should be rejected or routed to review if any of the following occur:

- missing required sheet names
- shifted or renamed columns in `ScoreCard`
- missing section headers
- unexpected row offsets for governed template version
- multiple marks in a row where policy does not permit it
- missing project/site or date
- missing inspection number if required by operating policy
- formula-corrupted workbook that no longer fits the template contract

## Raw-capture recommendation

Even though the parser will create structured findings and rollups, the ingestion layer should also preserve a raw machine-readable representation such as:

- section number
- checklist row number
- checklist item label
- selected response
- notes
- workbook score cell values
- workbook flags
- parser-derived flags

This allows future reprocessing without rereading the binary workbook.
