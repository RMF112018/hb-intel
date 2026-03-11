/**
 * RelationshipRegistry — D-SF14-T03, D-01, D-03, D-04
 *
 * Central registry for bidirectional relationship definitions.
 * Modules register pairs declaratively; the registry creates symmetric reverse entries
 * and stores AI suggestion resolvers for Expert-mode suggestion groups.
 *
 * Depends on:
 * - SF14-T01 package scaffold
 * - SF14-T02 shared contracts
 */
import {
  DEFAULT_RELATIONSHIP_PRIORITY,
} from '../constants/index.js';
import type {
  IRelatedItem,
  IRelationshipDefinition,
  RelationshipDirection,
} from '../types/index.js';

/**
 * SF14-T03 reverse-override contract.
 * Allows forward label override plus optional reverse visibility/governance overrides.
 */
type ReverseOverrides = Partial<
  Pick<IRelationshipDefinition, 'label' | 'visibleToRoles' | 'governanceMetadata'>
>;

/**
 * SF14-T03 AI suggestion resolver contract.
 */
export type AISuggestionResolver = (params: {
  sourceRecordType: string;
  sourceRecordId: string;
  sourceRecord: unknown;
  role?: string;
}) => IRelatedItem[] | Promise<IRelatedItem[]>;

const definitionsByKey = new Map<string, IRelationshipDefinition>();
const aiHooksById = new Map<string, AISuggestionResolver>();

const REVERSE_DIRECTION_MAP: Record<RelationshipDirection, RelationshipDirection> = {
  originated: 'converted-to',
  'converted-to': 'originated',
  has: 'references',
  references: 'has',
  blocks: 'is-blocked-by',
  'is-blocked-by': 'blocks',
};

function normalizeString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `[related-items] ${fieldName} must be a non-empty string.`,
    );
  }
  return value.trim();
}

function buildCompositeKey(definition: IRelationshipDefinition): string {
  return `${definition.sourceRecordType}::${definition.targetRecordType}::${definition.direction}`;
}

function compareRelationshipDefinitions(
  left: IRelationshipDefinition,
  right: IRelationshipDefinition,
): number {
  const leftPriority = left.governanceMetadata?.relationshipPriority ?? DEFAULT_RELATIONSHIP_PRIORITY;
  const rightPriority = right.governanceMetadata?.relationshipPriority ?? DEFAULT_RELATIONSHIP_PRIORITY;

  if (leftPriority !== rightPriority) {
    return rightPriority - leftPriority;
  }

  if (left.label !== right.label) {
    return left.label.localeCompare(right.label);
  }

  if (left.targetRecordType !== right.targetRecordType) {
    return left.targetRecordType.localeCompare(right.targetRecordType);
  }

  return left.direction.localeCompare(right.direction);
}

function validateGovernanceMetadata(definition: IRelationshipDefinition): void {
  const governance = definition.governanceMetadata;

  if (!governance) {
    return;
  }

  if (typeof governance.relationshipPriority !== 'number' || Number.isNaN(governance.relationshipPriority)) {
    throw new Error(
      `[related-items] governanceMetadata.relationshipPriority must be a valid number for "${definition.sourceRecordType}" -> "${definition.targetRecordType}".`,
    );
  }

  if (governance.roleRelevanceMap) {
    for (const [roleName, directions] of Object.entries(governance.roleRelevanceMap)) {
      if (!Array.isArray(directions)) {
        throw new Error(
          `[related-items] governanceMetadata.roleRelevanceMap["${roleName}"] must be an array of relationship directions.`,
        );
      }

      for (const direction of directions) {
        if (!(direction in REVERSE_DIRECTION_MAP)) {
          throw new Error(
            `[related-items] governanceMetadata.roleRelevanceMap["${roleName}"] contains invalid direction "${String(direction)}".`,
          );
        }
      }
    }
  }
}

function validateDefinition(definition: IRelationshipDefinition): IRelationshipDefinition {
  const normalizedSourceType = normalizeString(definition.sourceRecordType, 'sourceRecordType');
  const normalizedTargetType = normalizeString(definition.targetRecordType, 'targetRecordType');

  if (normalizedSourceType === normalizedTargetType) {
    throw new Error(
      `[related-items] sourceRecordType and targetRecordType must differ for relationship "${normalizedSourceType}".`,
    );
  }

  const normalizedLabel = normalizeString(definition.label, 'label');
  const normalizedTargetModule = normalizeString(definition.targetModule, 'targetModule');

  if (typeof definition.resolveRelatedIds !== 'function') {
    throw new Error('[related-items] resolveRelatedIds must be a function.');
  }

  if (typeof definition.buildTargetUrl !== 'function') {
    throw new Error('[related-items] buildTargetUrl must be a function.');
  }

  if (definition.visibleToRoles && !Array.isArray(definition.visibleToRoles)) {
    throw new Error('[related-items] visibleToRoles must be an array when provided.');
  }

  const normalizedDefinition: IRelationshipDefinition = {
    ...definition,
    sourceRecordType: normalizedSourceType,
    targetRecordType: normalizedTargetType,
    label: normalizedLabel,
    targetModule: normalizedTargetModule,
  };

  validateGovernanceMetadata(normalizedDefinition);
  return normalizedDefinition;
}

function createReverseDefinition(
  forwardDefinition: IRelationshipDefinition,
  reverseOverrides?: ReverseOverrides,
): IRelationshipDefinition {
  const reverseDirection = REVERSE_DIRECTION_MAP[forwardDefinition.direction];

  return validateDefinition({
    ...forwardDefinition,
    sourceRecordType: forwardDefinition.targetRecordType,
    targetRecordType: forwardDefinition.sourceRecordType,
    direction: reverseDirection,
    label: reverseOverrides?.label?.trim() || `Related ${forwardDefinition.sourceRecordType}`,
    visibleToRoles: reverseOverrides?.visibleToRoles ?? forwardDefinition.visibleToRoles,
    governanceMetadata: reverseOverrides?.governanceMetadata ?? forwardDefinition.governanceMetadata,
  });
}

/**
 * RelationshipRegistry singleton for cross-module relationship definitions.
 *
 * Canonical API for SF14-T03 registration and deterministic retrieval.
 */
export const RelationshipRegistry = {
  /**
   * Register a bidirectional pair and persist both forward+reverse entries atomically.
   */
  registerBidirectionalPair(
    definition: IRelationshipDefinition,
    reverseOverrides?: ReverseOverrides,
  ): void {
    const forwardDefinition = validateDefinition(definition);
    const reverseDefinition = createReverseDefinition(forwardDefinition, reverseOverrides);

    const forwardKey = buildCompositeKey(forwardDefinition);
    const reverseKey = buildCompositeKey(reverseDefinition);

    if (definitionsByKey.has(forwardKey) || definitionsByKey.has(reverseKey)) {
      throw new Error(
        `[related-items] Duplicate relationship registration is not allowed for keys "${forwardKey}" or "${reverseKey}".`,
      );
    }

    definitionsByKey.set(forwardKey, forwardDefinition);
    definitionsByKey.set(reverseKey, reverseDefinition);
  },

  /**
   * Register an AI suggestion resolver by hook ID.
   */
  registerAISuggestionHook(hookId: string, resolver: AISuggestionResolver): void {
    const normalizedHookId = normalizeString(hookId, 'hookId');

    if (typeof resolver !== 'function') {
      throw new Error('[related-items] resolver must be a function for registerAISuggestionHook.');
    }

    if (aiHooksById.has(normalizedHookId)) {
      throw new Error(
        `[related-items] AI suggestion hook "${normalizedHookId}" is already registered.`,
      );
    }

    aiHooksById.set(normalizedHookId, resolver);
  },

  /**
   * Resolve a registered AI suggestion hook by ID.
   */
  getAISuggestionHook(hookId: string): AISuggestionResolver | undefined {
    return aiHooksById.get(hookId);
  },

  /**
   * Canonical retrieval API for source record type.
   */
  getBySourceRecordType(sourceRecordType: string): IRelationshipDefinition[] {
    const normalizedSourceType = normalizeString(sourceRecordType, 'sourceRecordType');
    const matches = Array.from(definitionsByKey.values()).filter(
      (definition) => definition.sourceRecordType === normalizedSourceType,
    );

    return [...matches].sort(compareRelationshipDefinitions);
  },

  /**
   * Backward-compatible alias for source-based retrieval.
   */
  getRelationships(sourceRecordType: string): IRelationshipDefinition[] {
    return this.getBySourceRecordType(sourceRecordType);
  },

  /** Return all registered relationship definitions. */
  getAll(): IRelationshipDefinition[] {
    return Array.from(definitionsByKey.values()).sort(compareRelationshipDefinitions);
  },

  /** @internal test helper for isolated registry tests. */
  _clearForTests(): void {
    definitionsByKey.clear();
    aiHooksById.clear();
  },
} as const;

export type IRelationshipRegistry = typeof RelationshipRegistry;
