/**
 * P3-E10-T03 Closeout Execution Checklist constants.
 * 70-item governed baseline, sections, gates, overlay rules, instantiation.
 */

import type {
  CloseoutChecklistSectionKey,
  CloseoutMilestoneKey,
  CloseoutSpineEventKey,
  CloseoutTemplateAuthority,
} from './enums.js';
import type {
  ICalculatedItemRule,
  IChecklistInstantiationStep,
  IChecklistSectionDefinition,
  IChecklistTemplateAuthority,
  IGovernedChecklistItem,
  IIntegrationDrivenItem,
  IJurisdictionVariant,
  IOverlayRule,
  ISectionGateRule,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const CLOSEOUT_CHECKLIST_SECTION_KEYS = [
  'Tasks', 'DocumentTracking', 'Inspections', 'Turnover',
  'PostTurnover', 'CompleteProjectCloseoutDocuments', 'PBCJurisdiction',
] as const satisfies ReadonlyArray<CloseoutChecklistSectionKey>;

export const CLOSEOUT_MILESTONE_KEYS = [
  'TASKS_COMPLETE', 'DOCUMENTS_COMPLETE', 'CO_OBTAINED', 'TURNOVER_COMPLETE',
  'LIENS_RELEASED', 'SCORECARDS_COMPLETE', 'LESSONS_APPROVED', 'FILES_RETURNED',
  'ARCHIVE_READY',
] as const satisfies ReadonlyArray<CloseoutMilestoneKey>;

export const CLOSEOUT_SPINE_EVENT_KEYS = [
  'subst-compl', 'co-obtained', 'last-work-date', 'liens-released',
  'lessons-approved', 'files-returned', 'closeout.checklist-created',
] as const satisfies ReadonlyArray<CloseoutSpineEventKey>;

export const CLOSEOUT_TEMPLATE_AUTHORITY_ROLES = [
  'MOEAdmin', 'PE', 'PM', 'SUPT',
] as const satisfies ReadonlyArray<CloseoutTemplateAuthority>;

// -- Section Definitions (§3) -----------------------------------------------

export const CLOSEOUT_CHECKLIST_SECTIONS: ReadonlyArray<IChecklistSectionDefinition> = [
  { sectionNumber: 1, sectionKey: 'Tasks', name: 'Tasks', governedItemCount: 5, gateRule: 'All items = Yes (or required items with NA+justification) → TASKS_COMPLETE milestone' },
  { sectionNumber: 2, sectionKey: 'DocumentTracking', name: 'Document Tracking', governedItemCount: 13, gateRule: 'Items 2.6 and 2.10 both = Yes → DOCUMENTS_COMPLETE milestone (informational)' },
  { sectionNumber: 3, sectionKey: 'Inspections', name: 'Inspections', governedItemCount: 11, gateRule: 'Item 3.11 = Yes with date → CO_OBTAINED milestone → lifecycle state INSPECTIONS_CLEARED' },
  { sectionNumber: 4, sectionKey: 'Turnover', name: 'Turnover', governedItemCount: 15, gateRule: 'All required items = Yes → TURNOVER_COMPLETE milestone → PE approval required for OWNER_ACCEPTANCE' },
  { sectionNumber: 5, sectionKey: 'PostTurnover', name: 'Post Turnover', governedItemCount: 5, gateRule: null },
  { sectionNumber: 6, sectionKey: 'CompleteProjectCloseoutDocuments', name: 'Complete Project Closeout Documents', governedItemCount: 5, gateRule: 'Integration-driven; sub-gates for SCORECARDS_COMPLETE and LESSONS_APPROVED' },
  { sectionNumber: 7, sectionKey: 'PBCJurisdiction', name: 'PBC Jurisdiction-Specific', governedItemCount: 16, gateRule: null },
];

// -- Section Labels ---------------------------------------------------------

export const CLOSEOUT_CHECKLIST_SECTION_LABELS: Readonly<Record<CloseoutChecklistSectionKey, string>> = {
  Tasks: 'Section 1 — Tasks',
  DocumentTracking: 'Section 2 — Document Tracking',
  Inspections: 'Section 3 — Inspections',
  Turnover: 'Section 4 — Turnover',
  PostTurnover: 'Section 5 — Post Turnover',
  CompleteProjectCloseoutDocuments: 'Section 6 — Complete Project Closeout Documents',
  PBCJurisdiction: 'Section 7 — PBC Jurisdiction-Specific',
};

// -- Milestone Key Labels ---------------------------------------------------

export const CLOSEOUT_MILESTONE_KEY_LABELS: Readonly<Record<CloseoutMilestoneKey, string>> = {
  TASKS_COMPLETE: 'Tasks Complete',
  DOCUMENTS_COMPLETE: 'Documents Complete',
  CO_OBTAINED: 'Certificate of Occupancy Obtained',
  TURNOVER_COMPLETE: 'Turnover Complete',
  LIENS_RELEASED: 'Liens Released',
  SCORECARDS_COMPLETE: 'Scorecards Complete',
  LESSONS_APPROVED: 'Lessons Approved',
  FILES_RETURNED: 'Files Returned',
  ARCHIVE_READY: 'Archive Ready',
};

// -- Template Authority (§1.1) ----------------------------------------------

export const CLOSEOUT_TEMPLATE_AUTHORITIES: ReadonlyArray<IChecklistTemplateAuthority> = [
  { role: 'MOEAdmin', authority: 'Create, version, retire templates; define governed items' },
  { role: 'PE', authority: 'May request template revision via MOE; may not edit templates directly' },
  { role: 'PM', authority: 'No template authority; receives instantiated checklist' },
  { role: 'SUPT', authority: 'No template authority' },
];

// -- Jurisdiction Variants (§1.3) -------------------------------------------

export const CLOSEOUT_JURISDICTION_VARIANTS: ReadonlyArray<IJurisdictionVariant> = [
  { jurisdiction: 'PBC', section7Behavior: 'Instantiates all 16 PBC-specific items', section7ItemCount: 16 },
  { jurisdiction: 'Other', section7Behavior: 'Section 7 instantiated as empty scaffold; PM may add overlay items', section7ItemCount: 0 },
];

// -- Overlay Rules (§4.1) ---------------------------------------------------

export const CLOSEOUT_OVERLAY_RULES: IOverlayRule = {
  maxPerSection: 5,
  numberFormat: '{sectionNumber}.OL-{sequence}',
  deletable: false,
  maxDescriptionLength: 500,
  requiresPEApproval: false,
  auditLogged: true,
  includedInCompletionPct: true,
};

// -- Instantiation Sequence (§5) --------------------------------------------

export const CLOSEOUT_INSTANTIATION_SEQUENCE: ReadonlyArray<IChecklistInstantiationStep> = [
  { stepNumber: 1, description: 'Read current ChecklistTemplate (latest isCurrent = true version)' },
  { stepNumber: 2, description: 'Create CloseoutChecklist record; capture templateVersion (immutable)' },
  { stepNumber: 3, description: 'Create 7 CloseoutChecklistSection records from template sections' },
  { stepNumber: 4, description: 'Create CloseoutChecklistItem records for all governed items' },
  { stepNumber: 5, description: 'If jurisdiction = PBC, instantiate all 16 Section 7 items; if Other, Section 7 scaffold only' },
  { stepNumber: 6, description: 'All items start with result = Pending' },
  { stepNumber: 7, description: 'Create 13 CloseoutMilestone records in Pending status' },
  { stepNumber: 8, description: 'Emit closeout.checklist-created Activity Spine event' },
  { stepNumber: 9, description: 'Create LessonsLearningReport container for the project (if not already existing from earlier rolling capture)' },
];

// -- Section Gate Rules (§3 section gate rules) -----------------------------

export const CLOSEOUT_SECTION_GATE_RULES: ReadonlyArray<ISectionGateRule> = [
  { sectionKey: 'Tasks', milestoneKey: 'TASKS_COMPLETE', triggerCondition: 'All items = Yes (or required items with NA+justification)' },
  { sectionKey: 'DocumentTracking', milestoneKey: 'DOCUMENTS_COMPLETE', triggerCondition: 'Items 2.6 and 2.10 both = Yes' },
  { sectionKey: 'Inspections', milestoneKey: 'CO_OBTAINED', triggerCondition: 'Item 3.11 = Yes with date' },
  { sectionKey: 'Turnover', milestoneKey: 'TURNOVER_COMPLETE', triggerCondition: 'All required items = Yes' },
  { sectionKey: 'Turnover', milestoneKey: 'LIENS_RELEASED', triggerCondition: 'Item 4.15 = Yes' },
  { sectionKey: 'CompleteProjectCloseoutDocuments', milestoneKey: 'SCORECARDS_COMPLETE', triggerCondition: 'Item 6.3 = Yes (all registered subs have FinalCloseout PE_APPROVED)' },
  { sectionKey: 'CompleteProjectCloseoutDocuments', milestoneKey: 'LESSONS_APPROVED', triggerCondition: 'Item 6.5 = Yes (LessonsLearningReport publicationStatus = PE_APPROVED)' },
  { sectionKey: 'PostTurnover', milestoneKey: 'FILES_RETURNED', triggerCondition: 'Item 5.5 = Yes' },
];

// -- Calculated Item Rules (§3 Section 4, §3 Section 6) --------------------

export const CLOSEOUT_CALCULATED_ITEM_RULES: ReadonlyArray<ICalculatedItemRule> = [
  { itemNumber: '4.14', description: 'Flag 80 calendar days from last day HB worked on project (lien deadline)', calculationSource: 'item4.13.itemDate + 80 calendar days', integrationModule: null },
  { itemNumber: '6.1', description: 'Project Closeout Checklist completion percentage', calculationSource: 'Auto-populated from completionPercentage; read-only display', integrationModule: null },
  { itemNumber: '6.3', description: 'Subcontractor Evaluation Forms', calculationSource: 'Auto-Yes when all registered subs have FinalCloseout scorecard with publicationStatus = PE_APPROVED', integrationModule: 'scorecard' },
  { itemNumber: '6.4', description: 'Cost Variance Report', calculationSource: 'Auto-populated from Financial module final project variance; read-only', integrationModule: 'financial' },
  { itemNumber: '6.5', description: 'Lessons Learned / Send to Knowledge System', calculationSource: 'Auto-Yes when LessonsLearningReport.publicationStatus = PE_APPROVED', integrationModule: 'lessons' },
];

// -- Integration-Driven Items (§3 Section 6) --------------------------------

export const CLOSEOUT_INTEGRATION_DRIVEN_ITEMS: ReadonlyArray<IIntegrationDrivenItem> = [
  { itemNumber: '6.1', description: 'Project Closeout Checklist completion percentage', integrationLogic: 'Auto-populated from completionPercentage; read-only display', isSystemDriven: true },
  { itemNumber: '6.2', description: 'Project Recap Form', integrationLogic: 'Manual entry; no system integration', isSystemDriven: false },
  { itemNumber: '6.3', description: 'Subcontractor Evaluation Forms', integrationLogic: 'Auto-Yes when all registered subs have FinalCloseout scorecard with publicationStatus = PE_APPROVED', isSystemDriven: true },
  { itemNumber: '6.4', description: 'Cost Variance Report', integrationLogic: 'Auto-populated from Financial module final project variance; read-only; PM cannot manually mark Yes', isSystemDriven: true },
  { itemNumber: '6.5', description: 'Lessons Learned / Send to Knowledge System', integrationLogic: 'Auto-Yes when LessonsLearningReport.publicationStatus = PE_APPROVED', isSystemDriven: true },
];

// ============================================================================
// GOVERNED BASELINE CATALOG — 70 Items (§3)
// ============================================================================

// -- Section 1 — Tasks (5 items) --------------------------------------------

export const CLOSEOUT_SECTION_1_ITEMS: ReadonlyArray<IGovernedChecklistItem> = [
  { itemNumber: '1.1', description: 'Installation of phone lines for Fire Alarm & Elevator — by owner to set up account', sectionKey: 'Tasks', isGoverned: true, isRequired: false, responsibleRole: 'OWNER', lifecycleStageTrigger: 'ALWAYS', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '1.2', description: 'All RFIs closed', sectionKey: 'Tasks', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: 'TASKS_COMPLETE' },
  { itemNumber: '1.3', description: 'All Submittals approved', sectionKey: 'Tasks', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: 'TASKS_COMPLETE' },
  { itemNumber: '1.4', description: 'All Change Orders approved', sectionKey: 'Tasks', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: 'financial', linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: 'TASKS_COMPLETE' },
  { itemNumber: '1.5', description: 'Request all as-builts from Subs', sectionKey: 'Tasks', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
];

// -- Section 2 — Document Tracking (13 items) -------------------------------

export const CLOSEOUT_SECTION_2_ITEMS: ReadonlyArray<IGovernedChecklistItem> = [
  { itemNumber: '2.1', description: 'Soil investigation and certification of building pad if required', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: false, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'ALWAYS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '2.2', description: 'Soil Poison/Termite letter from Shell contractor prior to pours', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: false, responsibleRole: 'SUPT', lifecycleStageTrigger: 'ALWAYS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '2.3', description: 'Insulation certificate from insulation contractor', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: false, responsibleRole: 'SUPT', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '2.4', description: 'Form board survey', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: false, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'ALWAYS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '2.5', description: 'Tie-in survey showing setbacks and finish floor elevation', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: false, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'ALWAYS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '2.6', description: 'Final Survey & Elevation Certificate', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: true, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: 'DOCUMENTS_COMPLETE' },
  { itemNumber: '2.7', description: 'Letter on fire-treated lumber if applicable', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: false, responsibleRole: 'SUPT', lifecycleStageTrigger: 'ALWAYS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '2.8', description: 'Fire Alarm Monitoring letter received from Owner', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: false, responsibleRole: 'OWNER', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '2.9', description: 'Letter from Structural Engineer certifying building as-builts if necessary', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: false, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '2.10', description: 'Architect to issue Certificate of Substantial Completion Affidavit', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: true, responsibleRole: 'ARCHITECT', lifecycleStageTrigger: 'TURNOVER', hasDateField: true, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: 'subst-compl', milestoneGateKey: 'DOCUMENTS_COMPLETE' },
  { itemNumber: '2.11', description: 'Engineer Cert for all sitework — Paving & Utilities', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: false, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '2.12', description: 'Threshold Inspection reports for Bldg Dept', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: false, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '2.13', description: 'Final Landscape acceptance letter from LA of record submitted if required', sectionKey: 'DocumentTracking', isGoverned: true, isRequired: false, responsibleRole: 'ARCHITECT', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
];

// -- Section 3 — Inspections (11 items) -------------------------------------

export const CLOSEOUT_SECTION_3_ITEMS: ReadonlyArray<IGovernedChecklistItem> = [
  { itemNumber: '3.1', description: 'All plan changes submitted and approved by Building Department', sectionKey: 'Inspections', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: 'permits', linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '3.2', description: 'Health Department approval of water and sewer lines', sectionKey: 'Inspections', isGoverned: true, isRequired: false, responsibleRole: 'PM', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '3.3', description: "Utility company's approval of water and sewer lines", sectionKey: 'Inspections', isGoverned: true, isRequired: false, responsibleRole: 'PM', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '3.4', description: 'Demo Final', sectionKey: 'Inspections', isGoverned: true, isRequired: false, responsibleRole: 'SUPT', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: 'permits', linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '3.5', description: 'Plumbing Final', sectionKey: 'Inspections', isGoverned: true, isRequired: true, responsibleRole: 'SUPT', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: 'permits', linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '3.6', description: 'HVAC Final', sectionKey: 'Inspections', isGoverned: true, isRequired: true, responsibleRole: 'SUPT', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: 'permits', linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '3.7', description: 'Electrical Final', sectionKey: 'Inspections', isGoverned: true, isRequired: true, responsibleRole: 'SUPT', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: 'permits', linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '3.8', description: 'Fire Alarm & Fire Sprinkler Final', sectionKey: 'Inspections', isGoverned: true, isRequired: true, responsibleRole: 'SUPT', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: 'permits', linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '3.9', description: 'Building Final', sectionKey: 'Inspections', isGoverned: true, isRequired: true, responsibleRole: 'SUPT', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: 'permits', linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '3.10', description: 'Complete Pre-Certificate of Occupancy checklist', sectionKey: 'Inspections', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '3.11', description: 'Obtain Certificate of Occupancy or Certificate of Completion (shell buildings)', sectionKey: 'Inspections', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: true, hasEvidenceRequirement: true, evidenceHint: 'Attach C.O. or C.C. document; record issue date.', isCalculated: false, calculationSource: null, linkedModuleHint: 'permits', linkedRelationshipKey: null, spineEventOnCompletion: 'co-obtained', milestoneGateKey: 'CO_OBTAINED' },
];

// -- Section 4 — Turnover (15 items) ----------------------------------------

export const CLOSEOUT_SECTION_4_ITEMS: ReadonlyArray<IGovernedChecklistItem> = [
  { itemNumber: '4.1', description: "Send copy of C.O. to Owner or Owner's Representative", sectionKey: 'Turnover', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.2', description: 'Schedule meeting with Architect & Owner for punch list', sectionKey: 'Turnover', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'TURNOVER', hasDateField: true, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.3', description: 'Complete punch list', sectionKey: 'Turnover', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'TURNOVER', hasDateField: true, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.4', description: 'Complete as-built drawings', sectionKey: 'Turnover', isGoverned: true, isRequired: true, responsibleRole: 'SUPT', lifecycleStageTrigger: 'TURNOVER', hasDateField: true, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.5', description: "Schedule turn-over meeting with Owner & Owner's Representative", sectionKey: 'Turnover', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.6', description: 'Give Owner list of subs and all warranty letters', sectionKey: 'Turnover', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.7', description: 'Give Owner all Maintenance Manuals (O&Ms)', sectionKey: 'Turnover', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.8', description: 'Convey any Attic Stock', sectionKey: 'Turnover', isGoverned: true, isRequired: false, responsibleRole: 'SUPT', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.9', description: 'Forward letter of appreciation to Owner', sectionKey: 'Turnover', isGoverned: true, isRequired: false, responsibleRole: 'PM', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.10', description: 'Order plant for delivery (best wishes)', sectionKey: 'Turnover', isGoverned: true, isRequired: false, responsibleRole: 'PM', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.11', description: 'Prepare Public Relations Announcement', sectionKey: 'Turnover', isGoverned: true, isRequired: false, responsibleRole: 'MOE', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.12', description: 'Complete final payment forms for each subcontractor', sectionKey: 'Turnover', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'FINAL_COMPLETION', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: 'financial', linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.13', description: 'Date last contractual work on project was performed', sectionKey: 'Turnover', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'FINAL_COMPLETION', hasDateField: true, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: 'last-work-date', milestoneGateKey: null },
  { itemNumber: '4.14', description: 'Flag 80 calendar days from last day HB worked on project (lien deadline)', sectionKey: 'Turnover', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'FINAL_COMPLETION', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: 'Ensure all lien waivers received before this date.', isCalculated: true, calculationSource: 'item4.13.itemDate + 80 calendar days', linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '4.15', description: 'Obtain Release of Liens from all Subs', sectionKey: 'Turnover', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'FINAL_COMPLETION', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: 'financial', linkedRelationshipKey: null, spineEventOnCompletion: 'liens-released', milestoneGateKey: 'LIENS_RELEASED' },
];

// -- Section 5 — Post Turnover (5 items) ------------------------------------

export const CLOSEOUT_SECTION_5_ITEMS: ReadonlyArray<IGovernedChecklistItem> = [
  { itemNumber: '5.1', description: 'If final payment not received, send letter to Owner of intent to lien property', sectionKey: 'PostTurnover', isGoverned: true, isRequired: false, responsibleRole: 'PM', lifecycleStageTrigger: 'POST_TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '5.2', description: 'If final payment not received within 88 days, file lien', sectionKey: 'PostTurnover', isGoverned: true, isRequired: false, responsibleRole: 'PM', lifecycleStageTrigger: 'POST_TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '5.3', description: 'Six months after completion: give photographs taken during construction to Owner', sectionKey: 'PostTurnover', isGoverned: true, isRequired: false, responsibleRole: 'PM', lifecycleStageTrigger: 'POST_TURNOVER', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '5.4', description: 'Request from Owner a recommendation letter / testimonial', sectionKey: 'PostTurnover', isGoverned: true, isRequired: false, responsibleRole: 'PM', lifecycleStageTrigger: 'POST_TURNOVER', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '5.5', description: 'PM return all files, permit plans, and permit card to Estimator', sectionKey: 'PostTurnover', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'ARCHIVE_READY', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: 'files-returned', milestoneGateKey: 'FILES_RETURNED' },
];

// -- Section 6 — Complete Project Closeout Documents (5 items) ---------------

export const CLOSEOUT_SECTION_6_ITEMS: ReadonlyArray<IGovernedChecklistItem> = [
  { itemNumber: '6.1', description: 'Project Closeout Checklist completion percentage', sectionKey: 'CompleteProjectCloseoutDocuments', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'ARCHIVE_READY', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: true, calculationSource: 'Auto-populated from completionPercentage; read-only display', linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '6.2', description: 'Project Recap Form', sectionKey: 'CompleteProjectCloseoutDocuments', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'ARCHIVE_READY', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '6.3', description: 'Subcontractor Evaluation Forms', sectionKey: 'CompleteProjectCloseoutDocuments', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'ARCHIVE_READY', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: true, calculationSource: 'Auto-Yes when all registered subs have FinalCloseout scorecard with publicationStatus = PE_APPROVED', linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: 'SCORECARDS_COMPLETE' },
  { itemNumber: '6.4', description: 'Cost Variance Report', sectionKey: 'CompleteProjectCloseoutDocuments', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'ARCHIVE_READY', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: true, calculationSource: 'Auto-populated from Financial module final project variance; read-only', linkedModuleHint: 'financial', linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '6.5', description: 'Lessons Learned / Send to Knowledge System', sectionKey: 'CompleteProjectCloseoutDocuments', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'ARCHIVE_READY', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: true, calculationSource: 'Auto-Yes when LessonsLearningReport.publicationStatus = PE_APPROVED', linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: 'lessons-approved', milestoneGateKey: 'LESSONS_APPROVED' },
];

// -- Section 7 — PBC Jurisdiction-Specific (16 items) -----------------------

export const CLOSEOUT_SECTION_7_PBC_ITEMS: ReadonlyArray<IGovernedChecklistItem> = [
  { itemNumber: '7.1', description: 'Soil Bearing Capacity Certification Letter', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: false, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'ALWAYS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.2', description: 'Foundation Soil Density Test Results', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: false, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'ALWAYS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.3', description: 'Form Board Survey — Signed & Sealed by Surveyor', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: false, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'ALWAYS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.4', description: 'Termite Pre-Treatment Certificate', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: false, responsibleRole: 'SUPT', lifecycleStageTrigger: 'ALWAYS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.5', description: 'Shoring Reports', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: false, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'ALWAYS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.6', description: 'Final Certification Letter — Structural (signed & sealed by Structural EOR)', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: true, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.7', description: 'Fire Main Underground Pressure Test Passed (PBCFD includes DDCV & Plumbing)', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: true, responsibleRole: 'SUPT', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.8', description: 'Final Survey — Signed & Sealed', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: true, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.9', description: 'Insulation Certificates', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: false, responsibleRole: 'SUPT', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.10', description: 'Intumescent Fire Coating Certificate (if applicable)', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: false, responsibleRole: 'SUPT', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.11', description: 'Plenum Door Certificate (if applicable)', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: false, responsibleRole: 'SUPT', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.12', description: 'Termite Post-Treatment Certificate', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: true, responsibleRole: 'SUPT', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.13', description: 'All Inspections Recorded as "Approved" / "Passed" in PBCBD system', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: true, responsibleRole: 'PM', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.14', description: 'Partial Final Inspections Passed (as required by Master Building Permit)', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: false, responsibleRole: 'PM', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.15', description: 'Certification of Completion Letter — Private Provider', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: false, responsibleRole: 'ENGINEER', lifecycleStageTrigger: 'TURNOVER', hasDateField: false, hasEvidenceRequirement: true, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
  { itemNumber: '7.16', description: 'Final Building Inspections by PBC (discretionary)', sectionKey: 'PBCJurisdiction', isGoverned: true, isRequired: false, responsibleRole: 'PM', lifecycleStageTrigger: 'INSPECTIONS', hasDateField: false, hasEvidenceRequirement: false, evidenceHint: null, isCalculated: false, calculationSource: null, linkedModuleHint: null, linkedRelationshipKey: null, spineEventOnCompletion: null, milestoneGateKey: null },
];

// -- Combined Governed Baseline (all 70 items) ------------------------------

export const CLOSEOUT_ALL_GOVERNED_ITEMS: ReadonlyArray<IGovernedChecklistItem> = [
  ...CLOSEOUT_SECTION_1_ITEMS,
  ...CLOSEOUT_SECTION_2_ITEMS,
  ...CLOSEOUT_SECTION_3_ITEMS,
  ...CLOSEOUT_SECTION_4_ITEMS,
  ...CLOSEOUT_SECTION_5_ITEMS,
  ...CLOSEOUT_SECTION_6_ITEMS,
  ...CLOSEOUT_SECTION_7_PBC_ITEMS,
];
