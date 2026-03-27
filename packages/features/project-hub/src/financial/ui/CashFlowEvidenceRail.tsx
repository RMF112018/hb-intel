/**
 * CashFlowEvidenceRail — R5: AR aging, retainage, evidence, manual corrections.
 */
import type { ReactNode } from 'react';
import { HbcContextRail } from '@hbc/ui-kit';
import type { ContextRailSection } from '@hbc/ui-kit';
import type { CashFlowARSummary, CashFlowManualCorrection } from '../hooks/useCashFlowSurface.js';

function formatCurrency(val: number): string {
  return val < 0 ? `-$${Math.abs(val).toLocaleString()}` : `$${val.toLocaleString()}`;
}

function buildSections(ar: CashFlowARSummary, corrections: readonly CashFlowManualCorrection[]): ContextRailSection[] {
  const sections: ContextRailSection[] = [
    {
      id: 'ar-aging',
      title: 'A/R Aging',
      items: [
        { id: 'ar-total', title: `Total A/R: ${formatCurrency(ar.totalAR)}`, subtitle: `Retainage: ${formatCurrency(ar.retainage)}` },
        ...ar.buckets.map((b, i) => ({ id: `ar-bucket-${i}`, title: `${b.label}: ${formatCurrency(b.amount)}`, subtitle: b.isOverdue ? 'Overdue' : undefined })),
      ],
    },
    {
      id: 'evidence',
      title: 'Evidence Status',
      items: [{ id: 'evidence-status', title: `Evidence: ${ar.evidenceStatus}`, subtitle: `Last refreshed: ${new Date(ar.refreshedAt).toLocaleDateString()}` }],
    },
  ];
  if (corrections.length > 0) {
    sections.push({
      id: 'corrections',
      title: 'Manual Corrections',
      items: corrections.map((c) => ({ id: c.id, title: `${c.month}: ${c.field} ${formatCurrency(c.originalValue)} → ${formatCurrency(c.correctedValue)}`, subtitle: `${c.actor} · ${c.reason}` })),
    });
  }
  return sections;
}

export interface CashFlowEvidenceRailProps {
  readonly arSummary: CashFlowARSummary;
  readonly manualCorrections: readonly CashFlowManualCorrection[];
}

export function CashFlowEvidenceRail({ arSummary, manualCorrections }: CashFlowEvidenceRailProps): ReactNode {
  return <HbcContextRail sections={buildSections(arSummary, manualCorrections)} testId="cash-flow-evidence-rail" />;
}
