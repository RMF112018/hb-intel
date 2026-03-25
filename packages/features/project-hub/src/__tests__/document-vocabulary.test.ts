/**
 * P3-J1 E5 document-vocabulary contract and business-rule tests.
 */
import { describe, expect, it } from 'vitest';

import {
  // Enum arrays
  DOCUMENT_TRUST_STATES,
  UI_KIT_DOCUMENT_PATTERNS,
  TERMINOLOGY_GUARDRAIL_VALUES,
  DOCUMENT_BADGE_VARIANTS,
  COPY_TONE_RULES,
  // Label maps
  DOCUMENT_TRUST_STATE_LABELS,
  UI_KIT_DOCUMENT_PATTERN_LABELS,
  TERMINOLOGY_GUARDRAIL_LABELS,
  DOCUMENT_BADGE_VARIANT_LABELS,
  COPY_TONE_RULE_LABELS,
  // Contracts & constants
  DOCUMENT_TRUST_STATE_DEFINITIONS,
  UI_STATE_MATRIX,
  TERMINOLOGY_GUARDRAILS,
  COPY_RULES,
  DOCUMENT_STATE_UI_BINDINGS,
  // Business rules
  isSharePointInternalExposed,
  isPlainLanguageRequired,
  usesConsistentTrustModel,
  canPhase5CarryForwardUnchanged,
  resolveDocumentTrustState,
  getBadgeVariantForTrustState,
  getUiPatternConfig,
  isTerminologyGuardrailViolation,
  getUserFacingDescription,
  shouldShowPreviewAction,
  // Types (compile-time checks)
  type IDocumentTrustStateDef,
  type IUiStateMatrixEntry,
  type ITerminologyGuardrailDef,
  type ICopyRule,
  type IDocumentStateUiBinding,
} from '../index.js';

// -- Contract stability -----------------------------------------------------------

describe('document-vocabulary contract stability', () => {
  it('DOCUMENT_TRUST_STATES has 6 members', () => {
    expect(DOCUMENT_TRUST_STATES).toHaveLength(6);
  });

  it('UI_KIT_DOCUMENT_PATTERNS has 4 members', () => {
    expect(UI_KIT_DOCUMENT_PATTERNS).toHaveLength(4);
  });

  it('TERMINOLOGY_GUARDRAIL_VALUES has 4 members', () => {
    expect(TERMINOLOGY_GUARDRAIL_VALUES).toHaveLength(4);
  });

  it('DOCUMENT_BADGE_VARIANTS has 6 members', () => {
    expect(DOCUMENT_BADGE_VARIANTS).toHaveLength(6);
  });

  it('COPY_TONE_RULES has 3 members', () => {
    expect(COPY_TONE_RULES).toHaveLength(3);
  });

  it('DOCUMENT_TRUST_STATE_LABELS has 6 keys', () => {
    expect(Object.keys(DOCUMENT_TRUST_STATE_LABELS)).toHaveLength(6);
  });

  it('UI_KIT_DOCUMENT_PATTERN_LABELS has 4 keys', () => {
    expect(Object.keys(UI_KIT_DOCUMENT_PATTERN_LABELS)).toHaveLength(4);
  });

  it('TERMINOLOGY_GUARDRAIL_LABELS has 4 keys', () => {
    expect(Object.keys(TERMINOLOGY_GUARDRAIL_LABELS)).toHaveLength(4);
  });

  it('DOCUMENT_BADGE_VARIANT_LABELS has 6 keys', () => {
    expect(Object.keys(DOCUMENT_BADGE_VARIANT_LABELS)).toHaveLength(6);
  });

  it('COPY_TONE_RULE_LABELS has 3 keys', () => {
    expect(Object.keys(COPY_TONE_RULE_LABELS)).toHaveLength(3);
  });

  it('DOCUMENT_TRUST_STATE_DEFINITIONS has 6 entries', () => {
    expect(DOCUMENT_TRUST_STATE_DEFINITIONS).toHaveLength(6);
  });

  it('UI_STATE_MATRIX has 24 rows (6 trust states x 4 UI patterns)', () => {
    expect(UI_STATE_MATRIX).toHaveLength(24);
  });

  it('TERMINOLOGY_GUARDRAILS has 4 entries', () => {
    expect(TERMINOLOGY_GUARDRAILS).toHaveLength(4);
  });

  it('COPY_RULES has 3 entries', () => {
    expect(COPY_RULES).toHaveLength(3);
  });

  it('DOCUMENT_STATE_UI_BINDINGS has 12 entries', () => {
    expect(DOCUMENT_STATE_UI_BINDINGS).toHaveLength(12);
  });

  it('all trust state definitions have a badge variant', () => {
    const allHaveBadge = DOCUMENT_TRUST_STATE_DEFINITIONS.every((d) => d.badgeVariant !== undefined && d.badgeVariant !== '');
    expect(allHaveBadge).toBe(true);
  });

  it('RESTRICTED_ITEM trust state is marked as restricted', () => {
    const def = DOCUMENT_TRUST_STATE_DEFINITIONS.find((d) => d.trustState === 'RESTRICTED_ITEM');
    expect(def?.isRestricted).toBe(true);
  });

  it('CANONICAL_AUTHORITATIVE trust state is marked as authoritative', () => {
    const def = DOCUMENT_TRUST_STATE_DEFINITIONS.find((d) => d.trustState === 'CANONICAL_AUTHORITATIVE');
    expect(def?.isAuthoritative).toBe(true);
  });

  it('RESTRICTED_ITEM UI state matrix never shows preview action', () => {
    const restrictedEntries = UI_STATE_MATRIX.filter((e) => e.trustState === 'RESTRICTED_ITEM');
    const anyShowPreview = restrictedEntries.some((e) => e.showPreviewAction);
    expect(anyShowPreview).toBe(false);
  });

  it('NO_SHAREPOINT_INTERNALS guardrail has violation terms', () => {
    const guardrail = TERMINOLOGY_GUARDRAILS.find((g) => g.guardrail === 'NO_SHAREPOINT_INTERNALS');
    expect(guardrail?.violationTerms.length).toBeGreaterThan(0);
  });

  // Type-level compile checks (no runtime assertion needed)
  it('type contracts compile correctly', () => {
    const _trustStateDef: IDocumentTrustStateDef = DOCUMENT_TRUST_STATE_DEFINITIONS[0]!;
    const _uiStateEntry: IUiStateMatrixEntry = UI_STATE_MATRIX[0]!;
    const _guardrailDef: ITerminologyGuardrailDef = TERMINOLOGY_GUARDRAILS[0]!;
    const _copyRule: ICopyRule = COPY_RULES[0]!;
    const _uiBinding: IDocumentStateUiBinding = DOCUMENT_STATE_UI_BINDINGS[0]!;

    expect(_trustStateDef).toBeDefined();
    expect(_uiStateEntry).toBeDefined();
    expect(_guardrailDef).toBeDefined();
    expect(_copyRule).toBeDefined();
    expect(_uiBinding).toBeDefined();
  });
});

// -- Business rules ---------------------------------------------------------------

describe('document-vocabulary business rules', () => {
  describe('isSharePointInternalExposed', () => {
    it('returns false', () => {
      expect(isSharePointInternalExposed()).toBe(false);
    });
  });

  describe('isPlainLanguageRequired', () => {
    it('returns true', () => {
      expect(isPlainLanguageRequired()).toBe(true);
    });
  });

  describe('usesConsistentTrustModel', () => {
    it('returns true', () => {
      expect(usesConsistentTrustModel()).toBe(true);
    });
  });

  describe('canPhase5CarryForwardUnchanged', () => {
    it('returns true', () => {
      expect(canPhase5CarryForwardUnchanged()).toBe(true);
    });
  });

  describe('resolveDocumentTrustState', () => {
    it('resolves CANONICAL + AVAILABLE to CANONICAL_AUTHORITATIVE', () => {
      expect(resolveDocumentTrustState('CANONICAL', 'AVAILABLE')).toBe('CANONICAL_AUTHORITATIVE');
    });

    it('resolves AUTHORITATIVE + AVAILABLE to GOVERNED_PROJECT_FILE', () => {
      expect(resolveDocumentTrustState('AUTHORITATIVE', 'AVAILABLE')).toBe('GOVERNED_PROJECT_FILE');
    });

    it('resolves CANONICAL + RESTRICTED to RESTRICTED_ITEM', () => {
      expect(resolveDocumentTrustState('CANONICAL', 'RESTRICTED')).toBe('RESTRICTED_ITEM');
    });

    it('resolves UNKNOWN + AVAILABLE to RAW_LIBRARY_LOCATION', () => {
      expect(resolveDocumentTrustState('UNKNOWN', 'AVAILABLE')).toBe('RAW_LIBRARY_LOCATION');
    });

    it('resolves CANONICAL + PREVIEW_ONLY to PREVIEW_AVAILABLE', () => {
      expect(resolveDocumentTrustState('CANONICAL', 'PREVIEW_ONLY')).toBe('PREVIEW_AVAILABLE');
    });

    it('returns null for unknown combination', () => {
      expect(resolveDocumentTrustState('NONEXISTENT', 'NONEXISTENT')).toBeNull();
    });
  });

  describe('getBadgeVariantForTrustState', () => {
    it('returns CANONICAL for GOVERNED_PROJECT_FILE', () => {
      expect(getBadgeVariantForTrustState('GOVERNED_PROJECT_FILE')).toBe('CANONICAL');
    });

    it('returns RESTRICTED for RESTRICTED_ITEM', () => {
      expect(getBadgeVariantForTrustState('RESTRICTED_ITEM')).toBe('RESTRICTED');
    });

    it('returns AUTHORITATIVE for CANONICAL_AUTHORITATIVE', () => {
      expect(getBadgeVariantForTrustState('CANONICAL_AUTHORITATIVE')).toBe('AUTHORITATIVE');
    });

    it('returns null for unknown trust state', () => {
      expect(getBadgeVariantForTrustState('NONEXISTENT' as never)).toBeNull();
    });
  });

  describe('getUiPatternConfig', () => {
    it('returns config for GOVERNED_PROJECT_FILE + BADGE', () => {
      const config = getUiPatternConfig('GOVERNED_PROJECT_FILE', 'BADGE');
      expect(config).not.toBeNull();
      expect(config?.badgeVariant).toBe('CANONICAL');
    });

    it('returns config for RESTRICTED_ITEM + LIST_ROW', () => {
      const config = getUiPatternConfig('RESTRICTED_ITEM', 'LIST_ROW');
      expect(config).not.toBeNull();
      expect(config?.showPreviewAction).toBe(false);
    });

    it('returns null for unknown combination', () => {
      expect(getUiPatternConfig('NONEXISTENT' as never, 'BADGE')).toBeNull();
    });
  });

  describe('isTerminologyGuardrailViolation', () => {
    it('returns true for text containing sharepoint', () => {
      expect(isTerminologyGuardrailViolation('Check the SharePoint site')).toBe(true);
    });

    it('returns true for text containing library-id', () => {
      expect(isTerminologyGuardrailViolation('Use library-id 123')).toBe(true);
    });

    it('returns true for text containing _api/', () => {
      expect(isTerminologyGuardrailViolation('Call _api/web/lists')).toBe(true);
    });

    it('returns false for clean user-facing text', () => {
      expect(isTerminologyGuardrailViolation('View your project documents')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isTerminologyGuardrailViolation('')).toBe(false);
    });
  });

  describe('getUserFacingDescription', () => {
    it('returns description for GOVERNED_PROJECT_FILE', () => {
      const desc = getUserFacingDescription('GOVERNED_PROJECT_FILE');
      expect(desc).not.toBeNull();
      expect(desc).toContain('governed');
    });

    it('returns description for RESTRICTED_ITEM', () => {
      const desc = getUserFacingDescription('RESTRICTED_ITEM');
      expect(desc).not.toBeNull();
      expect(desc).toContain('restriction');
    });

    it('returns null for unknown trust state', () => {
      expect(getUserFacingDescription('NONEXISTENT' as never)).toBeNull();
    });
  });

  describe('shouldShowPreviewAction', () => {
    it('returns true for GOVERNED_PROJECT_FILE + LIST_ROW', () => {
      expect(shouldShowPreviewAction('GOVERNED_PROJECT_FILE', 'LIST_ROW')).toBe(true);
    });

    it('returns false for RESTRICTED_ITEM + LIST_ROW', () => {
      expect(shouldShowPreviewAction('RESTRICTED_ITEM', 'LIST_ROW')).toBe(false);
    });

    it('returns false for any trust state + BADGE', () => {
      expect(shouldShowPreviewAction('GOVERNED_PROJECT_FILE', 'BADGE')).toBe(false);
      expect(shouldShowPreviewAction('CANONICAL_AUTHORITATIVE', 'BADGE')).toBe(false);
    });

    it('returns false for unknown combination', () => {
      expect(shouldShowPreviewAction('NONEXISTENT' as never, 'BADGE')).toBe(false);
    });
  });
});
