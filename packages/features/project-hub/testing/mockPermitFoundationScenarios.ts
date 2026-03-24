import { createMockPermitThreadNode } from './createMockPermitThreadNode.js';

/** Pre-built scenarios for Permits module foundation. */
export const mockPermitFoundationScenarios = {
  /** Thread root — master building permit. */
  threadRoot: createMockPermitThreadNode(),

  /** Subpermit under a master. */
  subpermit: createMockPermitThreadNode({
    threadRootPermitId: 'permit-001',
    parentPermitId: 'permit-001',
    threadRelationshipType: 'SUBPERMIT',
  }),

  /** Phased release tied to master. */
  phasedRelease: createMockPermitThreadNode({
    threadRootPermitId: 'permit-001',
    parentPermitId: 'permit-001',
    threadRelationshipType: 'PHASED_RELEASE',
  }),

  /** Revision of a subpermit. */
  revision: createMockPermitThreadNode({
    threadRootPermitId: 'permit-001',
    parentPermitId: 'permit-002',
    threadRelationshipType: 'REVISION',
  }),

  /** Temporary approval (TCO). */
  temporaryApproval: createMockPermitThreadNode({
    threadRootPermitId: 'permit-001',
    parentPermitId: 'permit-001',
    threadRelationshipType: 'TEMPORARY_APPROVAL',
  }),

  /** Closeout path. */
  closeoutPath: createMockPermitThreadNode({
    threadRootPermitId: 'permit-001',
    parentPermitId: 'permit-001',
    threadRelationshipType: 'CLOSEOUT_PATH',
  }),

  /** Standalone permit. */
  standalone: createMockPermitThreadNode({
    threadRootPermitId: null,
    parentPermitId: null,
    threadRelationshipType: 'STANDALONE',
  }),
} as const;
