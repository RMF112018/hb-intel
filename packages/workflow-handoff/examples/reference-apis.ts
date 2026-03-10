// ─────────────────────────────────────────────────────────────────────────────
// Reference stub APIs for SF08-T07 canonical handoff config examples.
//
// These stubs return minimal valid responses so the reference configs
// can be fully type-checked without depending on packages that don't
// exist yet (Phase 4/5 scope).
// ─────────────────────────────────────────────────────────────────────────────

import type { IEstimatingPursuitRef, IProjectRecordRef } from './reference-types';

/**
 * Stub for `@hbc/sharepoint-docs` DocumentApi.
 * Production API exports `SharePointDocsApi`; this stub mirrors the
 * `list()` shape used by `resolveDocuments`.
 */
export const DocumentApiRef = {
  list: async (_params: {
    contextId: string;
    contextType: string;
  }): Promise<
    Array<{
      id: string;
      fileName: string;
      sharepointUrl: string;
      category?: string;
      fileSizeBytes?: number;
    }>
  > => [],
};

/**
 * Stub for the Estimating module's API surface.
 */
export const EstimatingApiRef = {
  createPursuit: async (
    _seedData: Partial<IEstimatingPursuitRef>,
    _handoffId: string,
  ): Promise<{ id: string }> => ({
    id: `pursuit-${Date.now()}`,
  }),

  returnToRevision: async (
    _id: string,
    _reason: string,
  ): Promise<void> => {},
};

/**
 * Stub for the BD Scorecard module's API surface.
 */
export const ScorecardApiRef = {
  returnToRevision: async (
    _id: string,
    _reason: string,
  ): Promise<void> => {},
};

/**
 * Stub for the Project Hub module's API surface.
 */
export const ProjectHubApiRef = {
  createProject: async (
    _seedData: Partial<IProjectRecordRef>,
    _handoffId: string,
  ): Promise<{ id: string }> => ({
    id: `project-${Date.now()}`,
  }),
};
