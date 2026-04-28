/**
 * PCC fixture — sample project profiles.
 *
 * Deterministic, non-secret. URLs use `example.invalid` (RFC 2606 reserved).
 * Phase 3 / Wave 1 / Prompt 06.
 */

import type { IProjectProfile } from '../IProjectProfile.js';
import type {
  PccProjectId,
  PccProjectNumber,
  PccSiteUrl,
} from '../types.js';

export const SAMPLE_PROJECT_PROFILE: IProjectProfile = {
  projectId: 'fixture-pcc-project-001' as PccProjectId,
  projectNumber: '01-001-00' as PccProjectNumber,
  projectName: 'Sample Active Construction Project',
  projectType: 'commercial',
  projectStage: 'active_construction',
  projectStatus: 'Active',
  clientName: 'Sample Owner LLC',
  projectLocation: 'Sample City, ST',
  startDate: '2026-01-15',
  scheduledCompletionDate: '2027-09-30',
  estimatedValue: 25_000_000,
  siteUrl: 'https://example.invalid/sites/pcc-001' as PccSiteUrl,
  procoreProjectId: '999001',
  sageIntacctProjectId: 'SI-999001',
};

export const SAMPLE_PROJECT_PROFILE_PRECONSTRUCTION: IProjectProfile = {
  projectId: 'fixture-pcc-project-002' as PccProjectId,
  projectNumber: '01-002-00' as PccProjectNumber,
  projectName: 'Sample Preconstruction Project',
  projectType: 'multifamily',
  projectStage: 'preconstruction',
  projectStatus: 'Active',
  clientName: 'Sample Developer LLC',
  projectLocation: 'Sample City, ST',
  startDate: '2026-06-01',
  scheduledCompletionDate: '2028-12-31',
  estimatedValue: 60_000_000,
  siteUrl: 'https://example.invalid/sites/pcc-002' as PccSiteUrl,
};

export const SAMPLE_PROJECT_PROFILES: readonly IProjectProfile[] = [
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_PROJECT_PROFILE_PRECONSTRUCTION,
];
