/**
 * RelationshipRegistry — D-SF14-T01, D-01
 *
 * Central registry for bidirectional relationship definitions.
 * Modules register pairs declaratively; the registry creates symmetric reverse entries.
 */
import type { IRelationshipDefinition } from '../types/index.js';

const definitions: IRelationshipDefinition[] = [];
const aiHooks: Map<string, string> = new Map();

/**
 * RelationshipRegistry — singleton registry for cross-module relationship definitions.
 *
 * TODO: SF14-T03 — Implement full bidirectional pair creation with reverse-entry generation.
 */
export const RelationshipRegistry = {
  /**
   * Register a bidirectional relationship pair between two record types.
   * TODO: SF14-T03 — Implement symmetric reverse-entry creation.
   */
  registerBidirectionalPair(
    _definition: IRelationshipDefinition,
    _reverseOverrides?: Partial<Pick<IRelationshipDefinition, 'label'>>,
  ): void {
    // TODO: SF14-T03
  },

  /**
   * Register an AI suggestion hook for a specific record type.
   * TODO: SF14-T03 — Implement AI hook registration.
   */
  registerAISuggestionHook(_recordType: string, _hookId: string): void {
    // TODO: SF14-T03
  },

  /**
   * Get all relationship definitions for a given source record type.
   * TODO: SF14-T03 — Implement filtering and priority sorting.
   */
  getRelationships(_sourceRecordType: string): IRelationshipDefinition[] {
    return [];
  },

  /** Return all registered relationship definitions. */
  getAll(): IRelationshipDefinition[] {
    return [...definitions];
  },
} as const;

export type IRelationshipRegistry = typeof RelationshipRegistry;

// Suppress unused-variable warnings for scaffold internals
void aiHooks;
