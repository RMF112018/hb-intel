import type { AdobeSignActiveView } from './AdobeSignViewSwitch.js';

type QueueState =
  | 'loading'
  | 'authorization-required'
  | 'configuration-required'
  | 'principal-unresolved'
  | 'source-unavailable'
  | 'backend-unavailable'
  | 'partial'
  | 'available-empty'
  | 'available-items';

type CompletedPanelState =
  | 'idle'
  | 'loading'
  | 'available-empty'
  | 'available-items'
  | 'partial'
  | 'source-unavailable'
  | 'backend-unavailable'
  | 'authorization-required'
  | 'configuration-required'
  | 'principal-unresolved';

interface AdobeSignStatusRailProps {
  readonly activeView: AdobeSignActiveView;
  readonly queueState: QueueState;
  readonly completedState: CompletedPanelState;
  readonly queueGeneratedAtUtc?: string;
  readonly completedGeneratedAtUtc?: string;
  readonly formatTimestamp: (iso: string) => string;
  readonly className?: string;
  readonly chipClassName?: string;
  readonly freshnessClassName?: string;
}

function completedChipLabel(state: CompletedPanelState): string {
  switch (state) {
    case 'loading':
      return 'Loading history';
    case 'partial':
      return 'Partial data';
    case 'authorization-required':
      return 'Authorization required';
    case 'configuration-required':
      return 'Configuration required';
    case 'principal-unresolved':
      return 'Account needs attention';
    case 'source-unavailable':
    case 'backend-unavailable':
      return 'Temporarily unavailable';
    case 'idle':
    case 'available-empty':
    case 'available-items':
      return 'Ready';
    default:
      return 'Ready';
  }
}

function queueChipLabel(state: QueueState): string {
  switch (state) {
    case 'loading':
      return 'Loading';
    case 'partial':
      return 'Partial data';
    case 'authorization-required':
      return 'Connect required';
    case 'configuration-required':
      return 'Configuration required';
    case 'principal-unresolved':
      return 'Account needs attention';
    case 'source-unavailable':
    case 'backend-unavailable':
      return 'Temporarily unavailable';
    case 'available-empty':
    case 'available-items':
      return 'Ready';
    default:
      return 'Ready';
  }
}

function isValidTimestamp(iso: string | undefined): iso is string {
  if (!iso) return false;
  return !Number.isNaN(new Date(iso).getTime());
}

export function AdobeSignStatusRail({
  activeView,
  queueState,
  completedState,
  queueGeneratedAtUtc,
  completedGeneratedAtUtc,
  formatTimestamp,
  className,
  chipClassName,
  freshnessClassName,
}: AdobeSignStatusRailProps) {
  const chip = activeView === 'action-queue' ? queueChipLabel(queueState) : completedChipLabel(completedState);
  const sourceTimestamp = activeView === 'action-queue' ? queueGeneratedAtUtc : completedGeneratedAtUtc;
  const freshness = isValidTimestamp(sourceTimestamp)
    ? `Last refreshed ${formatTimestamp(sourceTimestamp)}`
    : null;

  return (
    <div className={className}>
      <span className={chipClassName} data-adobe-sign-status-chip="">
        {chip}
      </span>
      {freshness ? (
        <p className={freshnessClassName} data-adobe-sign-freshness="">
          {freshness}
        </p>
      ) : null}
    </div>
  );
}

export default AdobeSignStatusRail;
