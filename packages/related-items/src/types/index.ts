/**
 * Related Items type contracts — D-SF14-T01, D-01
 *
 * Core type definitions for the Unified Work Graph relationship model.
 */

/** Direction of a relationship between two records. */
export type RelationshipDirection =
  | 'originated'
  | 'converted-to'
  | 'has'
  | 'references'
  | 'blocks'
  | 'is-blocked-by';

/** Governance metadata controlling priority, resolution, and role visibility. */
export interface IGovernanceMetadata {
  relationshipPriority: number;
  resolverStrategy?: 'sharepoint' | 'graph' | 'ai-suggested' | 'hybrid';
  roleRelevanceMap?: Record<string, RelationshipDirection[]>;
  aiSuggestionHook?: string;
  dataSource?: 'sharepoint' | 'graph';
}

/** Declarative definition of a relationship between two record types. */
export interface IRelationshipDefinition {
  sourceRecordType: string;
  targetRecordType: string;
  label: string;
  direction: RelationshipDirection;
  targetModule: string;
  resolveRelatedIds: (sourceRecord: unknown) => string[];
  buildTargetUrl: (targetRecordId: string) => string;
  visibleToRoles?: string[];
  governanceMetadata?: IGovernanceMetadata;
}

/** A resolved related item ready for display in the panel or tile. */
export interface IRelatedItem {
  recordType: string;
  recordId: string;
  label: string;
  status?: string;
  href: string;
  bicState?: IBicNextMoveState;
  moduleIcon: string;
  relationship: RelationshipDirection;
  relationshipLabel: string;
  versionChip?: { lastChanged: string; author: string };
  aiConfidence?: number;
}

/**
 * Placeholder for BIC Next Move state integration.
 * TODO: SF14-T02 — Replace with import from @hbc/bic-next-move when available.
 */
export interface IBicNextMoveState {
  currentState: string;
  nextMove?: string;
}
