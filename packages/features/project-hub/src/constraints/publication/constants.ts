/**
 * P3-E6-T06 Publication, Review, and Governance constants.
 */

import type {
  GovernedTaxonomyArea,
  ConstraintsPublicationAction,
  ConstraintsPublicationRole,
  ReviewPackageStatus,
  StateConsumptionMode,
} from './enums.js';
import type {
  IBicTeamEntry,
  IGovernedTaxonomyDescriptor,
  ILockedStructuralElement,
  IPublicationAuthorityRule,
  IStateConsumptionRule,
} from './types.js';

// ── Module Scope ────────────────────────────────────────────────────

export const PUBLICATION_SCOPE = 'constraints/publication' as const;

// ── Enum Arrays ─────────────────────────────────────────────────────

export const REVIEW_PACKAGE_STATUSES = [
  'Active',
  'Superseded',
  'Archived',
] as const satisfies ReadonlyArray<ReviewPackageStatus>;

export const CONSTRAINTS_PUBLICATION_ROLES = [
  'PM',
  'ProjectControls',
  'DesignatedApprover',
  'PER',
  'ManagerOfOpEx',
  'Admin',
] as const satisfies ReadonlyArray<ConstraintsPublicationRole>;

export const CONSTRAINTS_PUBLICATION_ACTIONS = [
  'CreateEditLive',
  'PublishSnapshot',
  'PublishReviewPackage',
  'ApproveGovernedAction',
  'AnnotatePublished',
  'ConfigureGovernance',
  'AccessLive',
  'AccessPublished',
] as const satisfies ReadonlyArray<ConstraintsPublicationAction>;

export const STATE_CONSUMPTION_MODES = [
  'Live',
  'Published',
  'Configurable',
] as const satisfies ReadonlyArray<StateConsumptionMode>;

export const GOVERNED_TAXONOMY_AREAS = [
  'RiskCategory',
  'RiskProbabilityImpact',
  'BicTeamRegistry',
  'ConstraintCategory',
  'ConstraintPriority',
  'DelayEventType',
  'DelayResponsibleParty',
  'DelayCriticalPathImpact',
  'DelayAnalysisMethod',
  'DelayEvidenceType',
  'ChangeEventOrigin',
  'ChangeLineItemType',
  'ProcoreStatusMapping',
] as const satisfies ReadonlyArray<GovernedTaxonomyArea>;

// ── Publication Authority Matrix (§6.4) ─────────────────────────────

export const PUBLICATION_AUTHORITY_MATRIX: ReadonlyArray<IPublicationAuthorityRule> = [
  { action: 'CreateEditLive', allowedRoles: ['PM', 'ProjectControls'] },
  { action: 'PublishSnapshot', allowedRoles: ['PM'] },
  { action: 'PublishReviewPackage', allowedRoles: ['PM', 'DesignatedApprover'] },
  { action: 'ApproveGovernedAction', allowedRoles: ['DesignatedApprover'] },
  { action: 'AnnotatePublished', allowedRoles: ['PER'] },
  { action: 'ConfigureGovernance', allowedRoles: ['ManagerOfOpEx', 'Admin'] },
  { action: 'AccessLive', allowedRoles: ['PM', 'ProjectControls'] },
  { action: 'AccessPublished', allowedRoles: ['PM', 'DesignatedApprover', 'PER'] },
];

// ── State Consumption Map (§6.1) ────────────────────────────────────

export const STATE_CONSUMPTION_MAP: ReadonlyArray<IStateConsumptionRule> = [
  { consumer: 'PM daily operations', stateMode: 'Live', rationale: 'PMs must see current status without waiting for publish' },
  { consumer: 'Project controls dashboards', stateMode: 'Live', rationale: 'Operational accuracy' },
  { consumer: 'Escalation and overdue detection', stateMode: 'Live', rationale: 'Escalation must act on current state' },
  { consumer: 'Work Queue (action items)', stateMode: 'Live', rationale: 'Actions must reflect current ledger state' },
  { consumer: 'Executive review (PER)', stateMode: 'Published', rationale: 'PER reviews confirmed snapshots; not draft live edits' },
  { consumer: 'Health spine (review-facing metrics)', stateMode: 'Published', rationale: 'Review-cycle metrics derive from published packages' },
  { consumer: 'Health spine (operational metrics)', stateMode: 'Live', rationale: 'Day-to-day operational counts use live state' },
  { consumer: 'Reports for review packages', stateMode: 'Published', rationale: 'Reports generated from published state for cadence review' },
  { consumer: 'Operational reports', stateMode: 'Configurable', rationale: 'May use live or published per report type' },
];

// ── BIC Team Registry (§6.7) ────────────────────────────────────────

export const BIC_TEAM_REGISTRY: ReadonlyArray<IBicTeamEntry> = [
  { teamCode: 'CHANGE_MANAGEMENT', displayName: 'Change Management', responsibilityArea: 'Change control and scope management' },
  { teamCode: 'COMMISSIONING', displayName: 'Commissioning Team', responsibilityArea: 'System commissioning and startup' },
  { teamCode: 'DEMOLITION', displayName: 'Demolition Team', responsibilityArea: 'Demolition and site clearance' },
  { teamCode: 'DESIGN', displayName: 'Design Team', responsibilityArea: 'Design and engineering coordination' },
  { teamCode: 'DOCUMENT_CONTROL', displayName: 'Document Control', responsibilityArea: 'Documentation and records management' },
  { teamCode: 'ENVIRONMENTAL', displayName: 'Environmental Team', responsibilityArea: 'Environmental compliance and remediation' },
  { teamCode: 'EQUIPMENT', displayName: 'Equipment Team', responsibilityArea: 'Equipment management and deployment' },
  { teamCode: 'FIELD', displayName: 'Field Team', responsibilityArea: 'Field operations and daily execution' },
  { teamCode: 'FINANCE', displayName: 'Finance Team', responsibilityArea: 'Financial management and budget controls' },
  { teamCode: 'GEOTECHNICAL', displayName: 'Geotechnical Team', responsibilityArea: 'Soil, foundation, and geotechnical engineering' },
  { teamCode: 'HR', displayName: 'HR Team', responsibilityArea: 'Human resources and staffing' },
  { teamCode: 'IT', displayName: 'IT Team', responsibilityArea: 'Information technology and systems' },
  { teamCode: 'INSPECTION', displayName: 'Inspection Team', responsibilityArea: 'Quality inspection and testing' },
  { teamCode: 'LEGAL', displayName: 'Legal Team', responsibilityArea: 'Legal, contractual, and claims matters' },
  { teamCode: 'LOGISTICS', displayName: 'Logistics Team', responsibilityArea: 'Material delivery and logistics' },
  { teamCode: 'OWNER_RELATIONS', displayName: 'Owner Relations', responsibilityArea: 'Owner coordination and interface' },
  { teamCode: 'PERMITS', displayName: 'Permits Team', responsibilityArea: 'Permitting, regulatory approvals' },
  { teamCode: 'PROCUREMENT', displayName: 'Procurement Team', responsibilityArea: 'Material sourcing and purchasing' },
  { teamCode: 'PROJECT_MANAGEMENT', displayName: 'Project Management', responsibilityArea: 'Project controls and integrated oversight' },
  { teamCode: 'PUBLIC_WORKS', displayName: 'Public Works Team', responsibilityArea: 'Public infrastructure coordination' },
  { teamCode: 'QA_QC', displayName: 'QA/QC Team', responsibilityArea: 'Quality assurance and control' },
  { teamCode: 'REGULATORY', displayName: 'Regulatory Team', responsibilityArea: 'Regulatory compliance and code enforcement' },
  { teamCode: 'RISK', displayName: 'Risk Team', responsibilityArea: 'Risk management, mitigation, and contingency' },
  { teamCode: 'SAFETY', displayName: 'Safety Team', responsibilityArea: 'Safety management and incident response' },
  { teamCode: 'SCHEDULING', displayName: 'Scheduling Team', responsibilityArea: 'Schedule development and critical path control' },
  { teamCode: 'SECURITY', displayName: 'Security Team', responsibilityArea: 'Site security and access control' },
  { teamCode: 'STAKEHOLDER_RELATIONS', displayName: 'Stakeholder Relations', responsibilityArea: 'Stakeholder communication and alignment' },
  { teamCode: 'SUBCONTRACTOR_MGMT', displayName: 'Subcontractor Management', responsibilityArea: 'Subcontractor oversight and performance' },
  { teamCode: 'SUSTAINABILITY', displayName: 'Sustainability Team', responsibilityArea: 'Sustainability, LEED, and green building goals' },
  { teamCode: 'TESTING', displayName: 'Testing Team', responsibilityArea: 'Testing and commissioning protocols' },
  { teamCode: 'TRAINING', displayName: 'Training Team', responsibilityArea: 'Training programs and qualifications' },
  { teamCode: 'UTILITIES', displayName: 'Utilities Team', responsibilityArea: 'Utility conflicts, locates, and relocations' },
];

// ── Governed Taxonomy Descriptors (§6.6) ────────────────────────────

export const GOVERNED_TAXONOMY_DESCRIPTORS: ReadonlyArray<IGovernedTaxonomyDescriptor> = [
  { area: 'RiskCategory', description: 'Risk category enumeration', sourceReference: 'T01 §1.4' },
  { area: 'RiskProbabilityImpact', description: 'Risk probability and impact scales and scoring weights', sourceReference: 'T01 §1.5' },
  { area: 'BicTeamRegistry', description: 'BIC team registry (shared across all four ledgers)', sourceReference: 'T06 §6.7' },
  { area: 'ConstraintCategory', description: 'Constraint category enumeration', sourceReference: 'T02 §2.4' },
  { area: 'ConstraintPriority', description: 'Constraint priority scale and thresholds', sourceReference: 'T02 §2.5' },
  { area: 'DelayEventType', description: 'Delay event type enumeration', sourceReference: 'T03 §3.5' },
  { area: 'DelayResponsibleParty', description: 'Delay responsible party enumeration', sourceReference: 'T03 §3.6' },
  { area: 'DelayCriticalPathImpact', description: 'Delay critical path impact classification and float thresholds', sourceReference: 'T03 §3.7' },
  { area: 'DelayAnalysisMethod', description: 'Delay analysis method enumeration', sourceReference: 'T03 §3.8' },
  { area: 'DelayEvidenceType', description: 'Delay evidence type enumeration', sourceReference: 'T03 §3.9' },
  { area: 'ChangeEventOrigin', description: 'Change event origin enumeration', sourceReference: 'T04 §4.5' },
  { area: 'ChangeLineItemType', description: 'Change event line item type enumeration', sourceReference: 'T04 §4.3' },
  { area: 'ProcoreStatusMapping', description: 'Procore status mapping table', sourceReference: 'T04 §4.7' },
];

// ── Locked Structural Elements (§6.6) ───────────────────────────────

export const LOCKED_STRUCTURAL_ELEMENTS: ReadonlyArray<ILockedStructuralElement> = [
  { element: 'RecordSchemas', description: 'Field names, types, immutability rules' },
  { element: 'LifecycleStateMachines', description: 'Lifecycle state machines and valid transition rules' },
  { element: 'LineageModel', description: 'Lineage model and spawn paths' },
  { element: 'NoHardDelete', description: 'No-hard-delete enforcement' },
  { element: 'AnnotationIsolation', description: 'Annotations never stored in ledger records' },
  { element: 'CanonicalIdentity', description: 'Canonical identity model for Change Ledger' },
  { element: 'LivePublishedSplit', description: 'Live vs published state split' },
];
