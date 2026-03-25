/**
 * P3-E9-T01 reports foundation TypeScript contracts.
 * Family definitions, authority, configuration version, ownership boundaries.
 */

import type {
  IntegrationSourceModule,
  PerReleaseAuthority,
  ReportConfigurationState,
  ReportFamilyKey,
  ReportFamilyType,
  ReportModuleAuthority,
  ReportNonOwnershipConcern,
  ReportOwnershipConcern,
} from './enums.js';

// -- Family Definition --------------------------------------------------------

export interface IReportFamilyDefinition {
  readonly familyKey: ReportFamilyKey;
  readonly familyType: ReportFamilyType;
  readonly displayName: string;
  readonly approvalGated: boolean;
  readonly perReleaseAuthority: PerReleaseAuthority;
  readonly stalenessThresholdDays: number;
  readonly sectionDefinitions: readonly string[];
  readonly owningSource: string;
  readonly isStructureLocked: boolean;
  readonly audienceClass: string;
  readonly distributionClass: string;
  readonly isPhase3Required: boolean;
}

// -- Authority Entry ----------------------------------------------------------

export interface IReportAuthorityEntry {
  readonly role: ReportModuleAuthority;
  readonly authority: string;
  readonly scope: string;
  readonly constraints: string;
}

// -- Configuration Version ----------------------------------------------------

export interface IReportConfigurationVersion {
  readonly configVersionId: string;
  readonly projectId: string;
  readonly familyKey: ReportFamilyKey;
  readonly state: ReportConfigurationState;
  readonly structuralChangesPending: boolean;
  readonly requiresPeReApproval: boolean;
  readonly createdAt: string;
  readonly activatedAt: string | null;
}

// -- Ownership Boundaries -----------------------------------------------------

export interface IReportOwnershipBoundary {
  readonly concern: ReportOwnershipConcern;
  readonly description: string;
  readonly governingOwner: string;
  readonly isReportsOwned: boolean;
}

export interface IReportNonOwnershipBoundary {
  readonly concern: ReportNonOwnershipConcern;
  readonly description: string;
  readonly actualOwner: string;
  readonly reportsRelationship: string;
}

// -- Operating Principles -----------------------------------------------------

export interface IReportOperatingPrinciple {
  readonly principleId: string;
  readonly title: string;
  readonly description: string;
}

// -- Integration-Driven Artifact Rules ----------------------------------------

export interface IIntegrationDrivenArtifactRule {
  readonly familyKey: ReportFamilyKey;
  readonly sourceModule: IntegrationSourceModule;
  readonly ownsSourceData: boolean;
  readonly triggeredBy: string;
  readonly scoringAuthority: string;
}
