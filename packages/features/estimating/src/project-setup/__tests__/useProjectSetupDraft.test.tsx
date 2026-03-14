/**
 * W0-G3-T05: useProjectSetupDraft tests
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  PROJECT_SETUP_DRAFT_KEY,
  PROJECT_SETUP_CLARIFICATION_DRAFT_KEY_PREFIX,
  PROJECT_SETUP_CONTROLLER_REVIEW_DRAFT_KEY_PREFIX,
  NEW_REQUEST_DRAFT_TTL_HOURS,
  CLARIFICATION_DRAFT_TTL_HOURS,
  CONTROLLER_REVIEW_DRAFT_TTL_HOURS,
} from '../types/index.js';

// ---------------------------------------------------------------------------
// Mock @hbc/session-state
// ---------------------------------------------------------------------------

const mockAutoSaveReturn = {
  value: null as unknown,
  queueSave: vi.fn(),
  clear: vi.fn(),
  lastSavedAt: null as string | null,
  isSavePending: false,
};

vi.mock('@hbc/session-state', () => ({
  useAutoSaveDraft: vi.fn(() => mockAutoSaveReturn),
}));

import { useAutoSaveDraft } from '@hbc/session-state';
import { useProjectSetupDraft } from '../hooks/useProjectSetupDraft.js';

const mockUseAutoSaveDraft = vi.mocked(useAutoSaveDraft);

beforeEach(() => {
  vi.clearAllMocks();
  mockAutoSaveReturn.value = null;
  mockAutoSaveReturn.queueSave = vi.fn();
  mockAutoSaveReturn.clear = vi.fn();
  mockAutoSaveReturn.lastSavedAt = null;
  mockAutoSaveReturn.isSavePending = false;
  mockUseAutoSaveDraft.mockReturnValue(mockAutoSaveReturn);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useProjectSetupDraft', () => {
  describe('draft key resolution', () => {
    it('uses PROJECT_SETUP_DRAFT_KEY for new-request mode', () => {
      renderHook(() => useProjectSetupDraft('new-request'));
      expect(mockUseAutoSaveDraft).toHaveBeenCalledWith(
        PROJECT_SETUP_DRAFT_KEY,
        NEW_REQUEST_DRAFT_TTL_HOURS,
      );
    });

    it('uses buildClarificationDraftKey for clarification-return mode', () => {
      renderHook(() => useProjectSetupDraft('clarification-return', 'req-123'));
      expect(mockUseAutoSaveDraft).toHaveBeenCalledWith(
        `${PROJECT_SETUP_CLARIFICATION_DRAFT_KEY_PREFIX}req-123`,
        CLARIFICATION_DRAFT_TTL_HOURS,
      );
    });

    it('uses buildControllerReviewDraftKey for controller-review mode', () => {
      renderHook(() => useProjectSetupDraft('controller-review', 'req-456'));
      expect(mockUseAutoSaveDraft).toHaveBeenCalledWith(
        `${PROJECT_SETUP_CONTROLLER_REVIEW_DRAFT_KEY_PREFIX}req-456`,
        CONTROLLER_REVIEW_DRAFT_TTL_HOURS,
      );
    });
  });

  describe('requestId validation', () => {
    it('throws when requestId missing for clarification-return', () => {
      expect(() => {
        renderHook(() => useProjectSetupDraft('clarification-return'));
      }).toThrow('requestId is required for clarification-return mode');
    });

    it('throws when requestId missing for controller-review', () => {
      expect(() => {
        renderHook(() => useProjectSetupDraft('controller-review'));
      }).toThrow('requestId is required for controller-review mode');
    });

    it('does not throw for new-request without requestId', () => {
      expect(() => {
        renderHook(() => useProjectSetupDraft('new-request'));
      }).not.toThrow();
    });
  });

  describe('resume context', () => {
    it('returns fresh-start for new-request with no draft', () => {
      const { result } = renderHook(() => useProjectSetupDraft('new-request'));
      expect(result.current.resumeContext.decision).toBe('fresh-start');
      expect(result.current.resumeContext.draftTimestamp).toBeNull();
    });

    it('returns prompt-user for new-request with existing draft', () => {
      mockAutoSaveReturn.value = {
        fields: {},
        stepStatuses: {},
        lastSavedAt: '2026-03-14T12:00:00Z',
      };
      mockUseAutoSaveDraft.mockReturnValue({ ...mockAutoSaveReturn });

      const { result } = renderHook(() => useProjectSetupDraft('new-request'));
      expect(result.current.resumeContext.decision).toBe('prompt-user');
      expect(result.current.resumeContext.draftTimestamp).toBe('2026-03-14T12:00:00Z');
    });

    it('returns auto-continue for clarification-return', () => {
      const { result } = renderHook(() =>
        useProjectSetupDraft('clarification-return', 'req-1'),
      );
      expect(result.current.resumeContext.decision).toBe('auto-continue');
    });

    it('returns auto-continue for controller-review', () => {
      const { result } = renderHook(() =>
        useProjectSetupDraft('controller-review', 'req-1'),
      );
      expect(result.current.resumeContext.decision).toBe('auto-continue');
    });
  });

  describe('delegation', () => {
    it('saveDraft delegates to auto-save queueSave', () => {
      const { result } = renderHook(() => useProjectSetupDraft('new-request'));
      const draft = { fields: {}, stepStatuses: {}, lastSavedAt: new Date().toISOString() };
      result.current.saveDraft(draft);
      expect(mockAutoSaveReturn.queueSave).toHaveBeenCalledWith(draft);
    });

    it('clearDraft delegates to auto-save clear', () => {
      const { result } = renderHook(() => useProjectSetupDraft('new-request'));
      result.current.clearDraft();
      expect(mockAutoSaveReturn.clear).toHaveBeenCalled();
    });
  });
});
