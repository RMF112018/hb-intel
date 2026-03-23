import type { IImportedRelationshipRecord } from '../src/schedule/types/index.js';

export const createMockImportedRelationshipRecord = (
  overrides?: Partial<IImportedRelationshipRecord>,
): IImportedRelationshipRecord => ({
  relationshipId: 'rel-001',
  versionId: 'ver-001',
  predecessorKey: 'src-001::A1000',
  successorKey: 'src-001::A1100',
  relationshipType: 'FS',
  lagHrs: 0,
  logicSource: 'SourceCPM',
  ...overrides,
});
