/**
 * SF18-T07 notification dispatch reference integration adapter.
 *
 * Produces deterministic notification payload references for readiness
 * state transitions and urgency conditions without performing dispatch I/O.
 *
 * @design D-SF18-T07
 */
import type { IBidReadinessViewState } from '../../types/index.js';

export type BidReadinessNotificationUrgency = 'info' | 'warning' | 'critical';
export type BidReadinessNotificationType = 'state-transition' | 'blocker-alert' | 'due-window';

export interface IBidReadinessNotificationReference {
  readonly notificationId: string;
  readonly type: BidReadinessNotificationType;
  readonly urgency: BidReadinessNotificationUrgency;
  readonly title: string;
  readonly body: string;
  readonly traceId: string;
  readonly createdAt: string;
}

function hasNearTermDeadline(viewState: IBidReadinessViewState): boolean {
  if (viewState.isOverdue) {
    return true;
  }
  if (typeof viewState.daysUntilDue !== 'number') {
    return false;
  }
  return viewState.daysUntilDue <= 2;
}

function getIncompleteBlockerCount(viewState: IBidReadinessViewState): number {
  return viewState.criteria.filter(({ criterion, isComplete }) => criterion.isBlocker && !isComplete).length;
}

/**
 * Resolves deterministic notification references for a readiness transition.
 *
 * @design D-SF18-T07
 */
export function resolveBidReadinessNotifications(params: {
  readonly pursuitId: string;
  readonly previousViewState?: IBidReadinessViewState | null;
  readonly nextViewState?: IBidReadinessViewState | null;
  readonly createdAt?: string;
}): readonly IBidReadinessNotificationReference[] {
  const {
    pursuitId,
    previousViewState = null,
    nextViewState = null,
    createdAt = new Date().toISOString(),
  } = params;

  if (!nextViewState) {
    return [];
  }

  const traceId = nextViewState.summary.governance.traceId;
  const notifications: IBidReadinessNotificationReference[] = [];

  if (!previousViewState || previousViewState.status !== nextViewState.status) {
    notifications.push({
      notificationId: `${pursuitId}:transition:${nextViewState.status}`,
      type: 'state-transition',
      urgency: nextViewState.status === 'ready' ? 'info' : 'warning',
      title: 'Bid readiness status changed',
      body: `Pursuit ${pursuitId} is now ${nextViewState.status}.`,
      traceId,
      createdAt,
    });
  }

  const incompleteBlockers = getIncompleteBlockerCount(nextViewState);
  if (incompleteBlockers > 0) {
    notifications.push({
      notificationId: `${pursuitId}:blockers:${incompleteBlockers}`,
      type: 'blocker-alert',
      urgency: hasNearTermDeadline(nextViewState) ? 'critical' : 'warning',
      title: 'Readiness blockers remain',
      body: `${incompleteBlockers} blocker criteria remain incomplete.`,
      traceId,
      createdAt,
    });
  }

  if (hasNearTermDeadline(nextViewState)) {
    notifications.push({
      notificationId: `${pursuitId}:due-window`,
      type: 'due-window',
      urgency: incompleteBlockers > 0 ? 'critical' : 'warning',
      title: nextViewState.isOverdue ? 'Pursuit is overdue' : 'Pursuit deadline is near',
      body: nextViewState.isOverdue
        ? 'Bid readiness requires immediate action.'
        : `Bid due in ${nextViewState.daysUntilDue} day(s).`,
      traceId,
      createdAt,
    });
  }

  return notifications;
}
