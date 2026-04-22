/**
 * Governed Safety Checklist Template v1 contract.
 *
 * Source of truth: docs/architecture/plans/MASTER/spfx/safety-records/design-pacakge/03A-Checklist-Template-Contract.md
 * and docs/architecture/plans/MASTER/spfx/safety-records/Safety Checklist Template.xlsx
 */

export const TEMPLATE_VERSION = 'v1' as const;
export const PARSER_VERSION = 'parser-v1' as const;

export const SHEET_SCORECARD = 'ScoreCard' as const;
export const SHEET_SCORING_WEIGHTS = 'ScoringWeights' as const;

export const REQUIRED_SHEETS = [SHEET_SCORECARD, SHEET_SCORING_WEIGHTS] as const;

export const ANCHOR_CELLS = {
  title: 'A1',
  dateLabel: 'A3',
  inspectionNumberLabel: 'D3',
  summaryLabel: 'F3',
  projectSiteLabel: 'A4',
  totalYesLabel: 'F4',
  totalNoLabel: 'F5',
  totalNaLabel: 'F6',
  safetyScoreLabel: 'F7',
} as const;

export const METADATA_ENTRY_CELLS = {
  date: 'B3',
  inspectionNumber: 'E3',
  projectSite: 'B4',
} as const;

export const SUMMARY_VALUE_CELLS = {
  totalYes: 'G4',
  totalNo: 'G5',
  totalNa: 'G6',
  safetyScore: 'G7',
} as const;

export const RESPONSE_HEADER_ROW = 9 as const;
export const RESPONSE_HEADERS = {
  item: 'A9',
  yes: 'B9',
  no: 'C9',
  na: 'D9',
  notes: 'E9',
  score: 'F9',
  flag: 'G9',
} as const;

export const EXPECTED_RESPONSE_HEADER_LABELS: Readonly<Record<keyof typeof RESPONSE_HEADERS, string>> = {
  item: 'Item',
  yes: 'Yes',
  no: 'No',
  na: 'N/A',
  notes: 'Notes',
  score: 'Score',
  flag: 'Inspection Flag',
};

export const RESPONSE_MARK_LITERAL = 'X' as const;

export interface SectionDefinition {
  readonly sectionNumber: number;
  readonly sectionName: string;
  readonly headerRow: number;
  readonly displayedRows: ReadonlyArray<number>;
  readonly compatCountRows: ReadonlyArray<number>;
  readonly weight: number;
  readonly rationale: string;
  readonly itemLabels: Readonly<Record<number, string>>;
}

export const SECTIONS: ReadonlyArray<SectionDefinition> = [
  {
    sectionNumber: 1,
    sectionName: '1. General Site Conditions',
    headerRow: 10,
    displayedRows: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    compatCountRows: [11, 12, 13, 14, 15, 16, 17, 18, 19],
    weight: 0.03,
    rationale: 'Administrative / low-acute risk',
    itemLabels: {
      11: 'Site access controlled (fencing/gates/sign-in)',
      12: 'Safety signage posted (PPE, hazards, traffic)',
      13: 'Subcontractors Signing in',
      14: 'Walkways/egress clear and maintained',
      15: 'Lighting adequate for work areas',
      16: 'Housekeeping acceptable (debris managed)',
      17: 'Stairs/ramps/temporary steps stable and clear',
      18: 'Waste disposal bins available and used',
      19: 'Sharp protrusions/rebar capped or protected',
      20: "OSHA 300A (2/1-4/30) and Worker's Comp Information Posted",
    },
  },
  {
    sectionNumber: 2,
    sectionName: '2. Emergency & Fire Preparedness',
    headerRow: 22,
    displayedRows: [23, 24, 25, 26, 27],
    compatCountRows: [23, 24, 25, 26, 27],
    weight: 0.03,
    rationale: 'Response capability (mitigates severity)',
    itemLabels: {
      23: 'Emergency contact board posted and current',
      24: 'First aid kit available and stocked',
      25: 'Fire extinguishers staged, accessible, inspected',
      26: 'Emergency routes/assembly point communicated',
      27: 'AED available (if required) and location known',
    },
  },
  {
    sectionNumber: 3,
    sectionName: '3. PPE & Worker Compliance',
    headerRow: 29,
    displayedRows: [30, 31, 32, 33, 34, 35, 36, 37],
    compatCountRows: [30, 31, 32, 33, 34, 35, 36],
    weight: 0.08,
    rationale: 'Foundational barrier to multiple hazards',
    itemLabels: {
      30: 'Hard hats worn in required areas',
      31: 'Safety glasses worn (side shields) in required areas',
      32: 'Hi-vis worn where required',
      33: 'Gloves used appropriately for tasks',
      34: 'Hearing protection used where needed',
      35: 'Respiratory protection used where required (dust/fumes)',
      36: 'PPE condition acceptable (no cracks/tears)',
      37: 'Safe guards in place (guards on grinders)',
    },
  },
  {
    sectionNumber: 4,
    sectionName: '4. Fall Protection & Openings',
    headerRow: 39,
    displayedRows: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
    compatCountRows: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
    weight: 0.18,
    rationale: 'Highest fatality cause (falls)',
    itemLabels: {
      40: 'Leading edges protected (guardrail/cable/controlled access)',
      41: 'Floor openings covered, secured, labeled',
      42: 'Shafts/stairwells protected (guardrails/barricades)',
      43: 'Fall Protection: Harness/lanyard inspected and used correctly where required',
      44: 'Tie-off to approved anchor points only',
      45: 'Aerial/Scissor lifts: proper tie-in and gate use',
      46: 'Scaffold platforms fully decked with same material and protected',
      47: 'Scaffold Tags in place and signed off daily',
      48: 'Tools/materials secured at height (dropped object prevention)',
      49: 'Toe boards installed where required',
    },
  },
  {
    sectionNumber: 5,
    sectionName: '5. Ladders & Scaffolds',
    headerRow: 51,
    displayedRows: [52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63],
    compatCountRows: [52, 53, 54, 55, 56, 57, 58, 59, 60, 61],
    weight: 0.14,
    rationale: 'Fall-related (second-highest exposure)',
    itemLabels: {
      52: 'Ladders in good condition; rated for use',
      53: 'Ladders set correctly (4:1), secured, stable footing',
      54: 'Ladders extend 3 ft above landing/tied-off as required',
      55: 'A-frame ladders fully opened before climbing',
      56: 'No standing on top step; 3 points of contact',
      57: 'No Aluminum ladders on site',
      58: 'Scaffold base plates/leveling; no improvised blocks',
      59: 'Scaffold guardrails/toe boards installed',
      60: 'Scaffold access provided (ladder/stairs)',
      61: 'Scaffold tags/inspection current (if used)',
      62: 'Baker scaffolding erected with casters or feet in place',
      63: 'If scaffolding is on casters; wheels locked before employee climbs',
    },
  },
  {
    sectionNumber: 6,
    sectionName: '6. Electrical & Temporary Power',
    headerRow: 65,
    displayedRows: [66, 67, 68, 69, 70, 71, 72, 73],
    compatCountRows: [66, 67, 68, 69, 70, 71, 72, 73],
    weight: 0.10,
    rationale: 'Electrocution risk',
    itemLabels: {
      66: 'GFCI protection used (temp power, wet areas)',
      67: '16 Guage cord or heavier used',
      68: 'Extension cords intact (no cuts/splices)',
      69: 'Cords managed (not through doorways/pinch points)',
      70: 'Temporary panels labeled; covers in place',
      71: 'Open junction boxes covered; no exposed conductors',
      72: 'LOTO used where required; energized work controlled',
      73: 'Wet conditions addressed (cord elevation, equipment rated)',
    },
  },
  {
    sectionNumber: 7,
    sectionName: '7. Hot Work & Fire Risk Controls',
    headerRow: 75,
    displayedRows: [76, 77, 78, 79, 80, 81],
    compatCountRows: [76, 77, 78, 79, 80, 81],
    weight: 0.07,
    rationale: 'Fire / explosion potential',
    itemLabels: {
      76: 'Hot work permit posted (if required)',
      77: 'Fire watch assigned and equipped',
      78: 'Combustibles cleared or protected (blankets/shields)',
      79: 'Fire extinguisher staged at hot work location',
      80: 'Gas cylinders secured upright with caps/valves protected',
      81: 'Post-work fire watch completed (per policy)',
    },
  },
  {
    sectionNumber: 8,
    sectionName: '8. Material Handling & Storage',
    headerRow: 83,
    displayedRows: [84, 85, 86, 87, 88, 89],
    compatCountRows: [84, 85, 86, 87, 88, 89],
    weight: 0.04,
    rationale: 'Struck-by / collapse',
    itemLabels: {
      84: 'Materials stacked stable; no leaning/over stacking',
      85: 'Stored to prevent collapse/roll (chocks, dunnage)',
      86: 'Aisles kept clear; access maintained',
      87: 'Flammables stored in approved containers/cabinets',
      88: 'Cylinders separated/secured (oxygen/acetylene)',
      89: 'Overhead storage hazards controlled/excluded',
    },
  },
  {
    sectionNumber: 9,
    sectionName: '9. Equipment & Mobile Plant',
    headerRow: 91,
    displayedRows: [92, 93, 94, 95, 96, 97, 98, 99, 100],
    compatCountRows: [92, 93, 94, 95, 96, 97, 98],
    weight: 0.12,
    rationale: 'Struck-by / crushing (mobile equipment)',
    itemLabels: {
      92: 'Operators trained/certified where required',
      93: 'Daily equipment inspections completed (forklift, lifts, etc.)',
      94: 'Seatbelts used; guards in place',
      95: 'Back-up alarms/visual warnings functioning',
      96: 'Spotters used where required; blind spots managed',
      97: 'Swing radius/exclusion zones barricaded',
      98: 'No one under suspended loads; rigging inspected',
      99: 'Qualified Rigger/Signal Person Used',
      100: 'Critical Lift Plans Established/Communicated (as required)',
    },
  },
  {
    sectionNumber: 10,
    sectionName: '10. Excavations & Ground Disturbance',
    headerRow: 102,
    displayedRows: [103, 104, 105, 106, 107, 108],
    compatCountRows: [103, 104, 105, 106, 107, 108],
    weight: 0.12,
    rationale: 'Cave-in / burial (caught-in/between)',
    itemLabels: {
      103: 'Utility locate completed; markings visible',
      104: 'Protective system used (sloping/shoring/trench box for >5)',
      105: 'Spoil piles set back (≥2 ft)',
      106: 'Safe access/egress (ladder/ramps) provided',
      107: 'Barricades installed around open excavations',
      108: 'Daily competent person inspection documented',
    },
  },
  {
    sectionNumber: 11,
    sectionName: '11. Environmental & Health',
    headerRow: 110,
    displayedRows: [111, 112, 113, 114, 115, 116, 117],
    compatCountRows: [111, 112, 113, 114, 115, 116, 117],
    weight: 0.02,
    rationale: 'Primarily chronic / lower acute fatality',
    itemLabels: {
      111: 'Dust control implemented (wet methods/vacuum)',
      112: 'Silica controls followed (if applicable)',
      113: 'Noise exposure managed; hearing protection available',
      114: 'Heat/cold stress controls (water, shade, breaks)',
      115: 'Drinking water available and clean',
      116: 'Chemical containers labeled; SDS accessible',
      117: 'Ventilation used for fumes/solvents',
    },
  },
  {
    sectionNumber: 12,
    sectionName: '12. Behavioral / Work Practices',
    headerRow: 119,
    displayedRows: [120, 121, 122, 123, 124],
    compatCountRows: [120, 121, 122, 123, 124],
    weight: 0.07,
    rationale: 'Human-factor prevention across all areas',
    itemLabels: {
      120: 'Pre-task planning / JHA conducted for active tasks (if applicable)',
      121: 'Workers following SOPs; no unsafe shortcuts observed',
      122: 'Communication effective (hand signals, radios as needed)',
      123: 'Supervision present for high-risk work',
      124: 'Near-misses/hazards being reported promptly',
    },
  },
];

/** High-severity sections in the finding severity heuristic (weight >= 0.12). */
export const HIGH_SEVERITY_WEIGHT_FLOOR = 0.12;

export const KEY_FINDINGS_FREE_TEXT_CELL = 'A142' as const;

/** Helper — find a section containing the given checklist row. */
export function findSectionForRow(rowNumber: number): SectionDefinition | undefined {
  return SECTIONS.find((section) => section.displayedRows.includes(rowNumber));
}

/** All displayed rows flattened across sections. */
export const ALL_DISPLAYED_ROWS: ReadonlyArray<number> = SECTIONS.flatMap((s) => s.displayedRows);
