/**
 * SF24-T04 — Export composition state hook.
 *
 * Manages local composition state for report exports (Expert tier, L-03).
 * Provides section toggle, reorder, validation, and reset. Pure local
 * state — no adapter or query dependency.
 *
 * Governing: SF24-T04, L-03 (complexity tiers)
 */

import { useState, useCallback, useMemo } from 'react';
import type { IReportExportSection } from '../types/index.js';

// ── Options / Result Types ───────────────────────────────────────────────

export interface UseExportCompositionStateOptions {
  /** Initial sections for the composition (optional). */
  initialSections?: IReportExportSection[];
}

export interface UseExportCompositionStateResult {
  /** Current composition sections. */
  sections: IReportExportSection[];
  /** Replace all sections. */
  setSections: (sections: IReportExportSection[]) => void;
  /** Toggle a section's included state by ID. */
  toggleSection: (sectionId: string) => void;
  /** Move a section to a new order position. */
  reorderSection: (sectionId: string, newOrder: number) => void;
  /** Whether the composition is valid (at least one section included). */
  isValid: boolean;
  /** Count of included sections. */
  includedCount: number;
  /** Reset to initial sections (or empty). */
  resetComposition: () => void;
}

// ── Hook ─────────────────────────────────────────────────────────────────

/**
 * Manage report composition state for Expert-tier exports.
 *
 * @param options - Optional initial sections.
 * @returns Composition state with mutation helpers and validation.
 */
export function useExportCompositionState(
  options?: UseExportCompositionStateOptions,
): UseExportCompositionStateResult {
  const initial = options?.initialSections ?? [];
  const [sections, setSections] = useState<IReportExportSection[]>(initial);

  const toggleSection = useCallback((sectionId: string) => {
    setSections(prev =>
      prev.map(s => (s.sectionId === sectionId ? { ...s, included: !s.included } : s)),
    );
  }, []);

  const reorderSection = useCallback((sectionId: string, newOrder: number) => {
    setSections(prev =>
      prev.map(s => (s.sectionId === sectionId ? { ...s, order: newOrder } : s)),
    );
  }, []);

  const resetComposition = useCallback(() => {
    setSections(initial);
  }, [initial]);

  const includedCount = useMemo(
    () => sections.filter(s => s.included).length,
    [sections],
  );

  const isValid = useMemo(() => includedCount > 0, [includedCount]);

  return {
    sections,
    setSections,
    toggleSection,
    reorderSection,
    isValid,
    includedCount,
    resetComposition,
  };
}
