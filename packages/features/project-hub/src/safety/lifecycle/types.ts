/**
 * P3-E8-T03 SSSP Base Plan, Addenda, and Approval Governance types.
 * Approval model, governed/instance section shapes, transition results.
 */

// ============================================================================
// Approval Enums (§3)
// ============================================================================

export type SSSPApproverRole = 'SAFETY_MANAGER' | 'PM' | 'SUPERINTENDENT';

export type SSSPSignatureMethod = 'DIGITAL' | 'ACKNOWLEDGED_IN_APP';

// ============================================================================
// Approval Interfaces (§3.1–3.2)
// ============================================================================

/** Individual approval signature for SSSP or addendum. */
export interface ISSSPApprovalSignature {
  readonly userId: string;
  readonly userName: string;
  readonly role: SSSPApproverRole;
  readonly signedAt: string;
  readonly signatureMethod: SSSPSignatureMethod;
  readonly comments: string | null;
}

/** Individual rejection record for SSSP or addendum. */
export interface ISSSPApprovalRejection {
  readonly userId: string;
  readonly userName: string;
  readonly role: SSSPApproverRole;
  readonly rejectedAt: string;
  readonly rejectionNotes: string;
}

/** Joint approval record for SSSP base plan (Decision 20 — all 3 must sign). */
export interface ISSSPApproval {
  readonly safetyManagerApproval: ISSSPApprovalSignature | null;
  readonly pmApproval: ISSSPApprovalSignature | null;
  readonly superintendentApproval: ISSSPApprovalSignature | null;
  readonly allApprovedAt: string | null;
  readonly rejections: readonly ISSSPApprovalRejection[];
}

/** Addendum approval record (Decision 21 — Safety Manager always; PM/Super when operationallyAffected). */
export interface ISSSPAddendumApproval {
  readonly safetyManagerApproval: ISSSPApprovalSignature | null;
  readonly pmApproval: ISSSPApprovalSignature | null;
  readonly superintendentApproval: ISSSPApprovalSignature | null;
  readonly allRequiredApprovedAt: string | null;
  readonly rejections: readonly ISSSPApprovalRejection[];
}

// ============================================================================
// Contact Sub-Interface
// ============================================================================

export interface ISSSPContactEntry {
  readonly name: string;
  readonly title: string;
  readonly phone: string;
  readonly email: string | null;
}

// ============================================================================
// Governed Section Interfaces (§2.1 — Safety Manager only)
// ============================================================================

/** §2.1.1 Hazard identification and control. */
export interface ISSSPGoverned_HazardSection {
  readonly hazards: readonly ISSSPHazardEntry[];
  readonly controlHierarchyNotes: string | null;
}

export interface ISSSPHazardEntry {
  readonly hazardDescription: string;
  readonly riskLevel: string;
  readonly controlMeasures: readonly string[];
}

/** §2.1.2 Emergency response procedures. */
export interface ISSSPGoverned_EmergencySection {
  readonly emergencyContacts: readonly ISSSPContactEntry[];
  readonly evacuationRoutes: string;
  readonly rallyPoints: readonly string[];
  readonly actionSequence: string;
  readonly firstAidAndHospitalRouting: string;
}

/** §2.1.3 Safety program standards. */
export interface ISSSPGoverned_ProgramSection {
  readonly companyPolicy: string;
  readonly disciplinePolicy: string;
  readonly substanceAbusePolicy: string;
  readonly meetingCadence: string;
  readonly competentPersonRequirements: string;
}

/** §2.1.4 Regulatory and code citations. */
export interface ISSSPGoverned_RegulatorySection {
  readonly oshaStandards: readonly string[];
  readonly stateAmendments: readonly string[];
  readonly codeComplianceNotes: readonly string[];
}

/** §2.1.5 Competent person requirements. */
export interface ISSSPGoverned_CompetentPersonSection {
  readonly requiredActivities: readonly string[];
  readonly qualificationCriteria: string;
  readonly supervisionRequirements: string;
}

/** §2.1.6 Subcontractor compliance standards. */
export interface ISSSPGoverned_SubcontractorSection {
  readonly prequalificationRequirements: string;
  readonly submissionRequirements: string;
  readonly orientationRequirements: string;
  readonly monitoringApproach: string;
}

/** §2.1.7 Incident reporting protocol. */
export interface ISSSPGoverned_IncidentSection {
  readonly reportingChain: string;
  readonly reportingTimeframes: string;
  readonly escalationRules: string;
  readonly regulatoryThresholds: string;
}

// ============================================================================
// Instance Section Interfaces (§2.2 — project team editable)
// ============================================================================

/** §2.2.1 Project contacts. */
export interface ISSSPInstance_Contacts {
  readonly ownerContact: ISSSPContactEntry | null;
  readonly gcSafetyContact: ISSSPContactEntry | null;
  readonly safetyOfficerContact: ISSSPContactEntry | null;
  readonly pmContact: ISSSPContactEntry | null;
  readonly superintendentContact: ISSSPContactEntry | null;
  readonly emergencyContacts: readonly ISSSPContactEntry[];
}

/** §2.2.2 Subcontractor list entry. */
export interface ISSSPSubcontractorEntry {
  readonly companyName: string;
  readonly trade: string;
  readonly contactName: string;
  readonly contactPhone: string;
}

/** §2.2.2 Subcontractor list. */
export interface ISSSPInstance_SubcontractorList {
  readonly entries: readonly ISSSPSubcontractorEntry[];
}

/** §2.2.3 Project location. */
export interface ISSSPInstance_Location {
  readonly address: string;
  readonly boundaries: string;
  readonly description: string;
  readonly accessInstructions: string | null;
}

/** §2.2.4 Emergency assembly and site layout. */
export interface ISSSPInstance_SiteLayout {
  readonly assemblyPoint: string;
  readonly siteMapRef: string | null;
  readonly emergencyRouting: string;
}

/** §2.2.5 Orientation schedule entry. */
export interface ISSSPOrientationScheduleEntry {
  readonly date: string;
  readonly parties: string;
  readonly frequency: string;
}

/** §2.2.5 Orientation schedule. */
export interface ISSSPInstance_OrientationSchedule {
  readonly entries: readonly ISSSPOrientationScheduleEntry[];
}

// ============================================================================
// Transition Result Types
// ============================================================================

/** Result of SSSP base plan state transition validation. */
export interface ISSSPTransitionResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/** Result of SSSP addendum state transition validation. */
export interface ISSSPAddendumTransitionResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

// ============================================================================
// Rendered Document Config (§5.3)
// ============================================================================

/** Configuration for rendered SSSP PDF storage as evidence record. */
export interface ISSSPRenderedDocumentConfig {
  readonly sourceRecordType: 'GENERAL';
  readonly sensitivityTier: 'STANDARD';
  readonly retentionCategory: 'EXTENDED_REGULATORY';
}

// ============================================================================
// Work Queue Trigger (§6)
// ============================================================================

export interface ISSSPWorkQueueTrigger {
  readonly trigger: string;
  readonly workQueueItem: string;
  readonly priority: string;
  readonly assignee: string;
}
