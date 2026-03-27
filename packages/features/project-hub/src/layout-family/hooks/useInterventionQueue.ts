import { useMemo } from 'react';

/**
 * Intervention item — an actionable signal requiring leadership response.
 */
export interface InterventionItem {
  readonly id: string;
  readonly title: string;
  readonly affectedProject: string;
  readonly signalSource: string;
  readonly owner: string;
  readonly urgency: 'critical' | 'high' | 'standard';
  readonly recommendedAction: string;
  readonly sourceModule: string;
}

export interface InterventionQueue {
  readonly items: readonly InterventionItem[];
  readonly criticalCount: number;
}

/**
 * Returns a mock intervention queue for the executive cockpit.
 * Will be replaced by real work-queue/escalation aggregation.
 */
export function useInterventionQueue(): InterventionQueue {
  return useMemo(() => {
    const items: InterventionItem[] = [
      { id: 'int-1', title: 'Forecast confirmation overdue — March cycle', affectedProject: 'Palm Beach Luxury Estate', signalSource: 'Financial forecast checklist', owner: 'PM — Wanda', urgency: 'critical', recommendedAction: 'Escalate to PM or confirm on behalf', sourceModule: 'financial' },
      { id: 'int-2', title: 'Foundation Complete milestone at risk', affectedProject: 'Tropical World Nursery', signalSource: 'Schedule milestone tracker', owner: 'Superintendent — Carlos', urgency: 'critical', recommendedAction: 'Review recovery plan with Superintendent', sourceModule: 'schedule' },
      { id: 'int-3', title: 'Subcontract gate blocked — Electrical', affectedProject: 'Palm Beach Luxury Estate', signalSource: 'Subcontract readiness gate', owner: 'PM — Wanda', urgency: 'high', recommendedAction: 'Review compliance checklist status', sourceModule: 'subcontract-readiness' },
      { id: 'int-4', title: 'Safety corrective action aging — 21 days', affectedProject: 'Tropical World Nursery', signalSource: 'Safety corrective log', owner: 'Safety Lead — James', urgency: 'high', recommendedAction: 'Assign or escalate corrective closure', sourceModule: 'safety' },
      { id: 'int-5', title: 'Closeout checklist stalled — Palm Olympus', affectedProject: 'Palm Olympus', signalSource: 'Closeout checklist', owner: 'PM — Monica', urgency: 'standard', recommendedAction: 'Review remaining items and assign owners', sourceModule: 'closeout' },
    ];
    return {
      items,
      criticalCount: items.filter((i) => i.urgency === 'critical').length,
    };
  }, []);
}
