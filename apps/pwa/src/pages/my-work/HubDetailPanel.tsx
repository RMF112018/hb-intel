/**
 * HubDetailPanel — UIF-002 inline item detail drawer.
 *
 * Renders selected work item detail in the right panel of the master-detail
 * layout. Eliminates the need to navigate away for basic triage decisions.
 *
 * Lazy-loaded: mounted on first item selection via React.lazy() in MyWorkPage.
 */
import { useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { makeStyles, shorthands, mergeClasses } from '@griffel/react';
import { useRouter } from '@tanstack/react-router';
import { heading3, HbcButton, HbcStatusBadge, HbcCard, useAnimationStyles, elevationLevel3 } from '@hbc/ui-kit';
import type { IMyWorkItem, IMyWorkActionDefinition } from '@hbc/my-work-feed';
import { useMyWorkActions } from '@hbc/my-work-feed';

export interface HubDetailPanelProps {
  item: IMyWorkItem;
  onClose: () => void;
}

// ─── Module display names (shared with HbcMyWorkListItem UIF-006) ───────────
const MODULE_DISPLAY_NAMES: Record<string, string> = {
  'bd-scorecard': 'BD Scorecard',
  'project-hub-pmp': 'Project Hub',
  'project-hub-health-pulse': 'Health Pulse',
  'estimating': 'Estimating',
  'accounting': 'Accounting',
  'admin': 'Admin',
};

function formatModuleLabel(moduleKey: string): string {
  return (
    MODULE_DISPLAY_NAMES[moduleKey] ??
    moduleKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatDaysInState(updatedAtIso: string): string {
  const ms = Date.now() - new Date(updatedAtIso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return 'Updated today';
  if (days === 1) return 'Updated 1 day ago';
  return `Updated ${days} days ago`;
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDueDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `Due ${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
}

const LANE_LABELS: Record<string, string> = {
  'do-now': 'Do Now',
  'waiting-blocked': 'Waiting / Blocked',
  watch: 'Watch',
  'delegated-team': 'Delegated to Team',
  deferred: 'Deferred',
};

const useStyles = makeStyles({
  // UIF-002: elevationLevel3 for detail panel (focused work zone)
  panelWrapper: {
    boxShadow: elevationLevel3,
    ...shorthands.borderRadius('8px'),
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('16px'),
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    ...shorthands.gap('12px'),
  },
  title: {
    ...heading3,
    color: 'var(--colorNeutralForeground1)',
    ...shorthands.margin('0px'),
  },
  badges: {
    display: 'flex',
    ...shorthands.gap('6px'),
    flexWrap: 'wrap',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    flexWrap: 'wrap',
    fontSize: '0.75rem',
    color: 'var(--colorNeutralForeground3)',
  },
  metaLabel: {
    fontWeight: '600',
    color: 'var(--colorNeutralForeground2)',
    fontSize: '0.75rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
  },
  actions: {
    display: 'flex',
    ...shorthands.gap('8px'),
    flexWrap: 'wrap',
    marginTop: '8px',
  },
  summary: {
    fontSize: '0.875rem',
    color: 'var(--colorNeutralForeground2)',
    lineHeight: '1.5',
  },
});

export function HubDetailPanel({ item, onClose }: HubDetailPanelProps): ReactNode {
  const styles = useStyles();
  const animStyles = useAnimationStyles();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const router = useRouter();
  const { executeAction, isPending, lastResult } = useMyWorkActions();

  const laneLabel = LANE_LABELS[item.lane] ?? item.lane;

  // Navigate to deep-link when a non-replayable action completes.
  useEffect(() => {
    if (lastResult?.deepLinkHref) {
      void router.navigate({ to: lastResult.deepLinkHref });
    }
  }, [lastResult, router]);

  // OPM-01 / UX-F1: Full action vocabulary via useMyWorkActions.
  // Replayable actions (mark-read, defer, etc.) execute locally.
  // Non-replayable actions (open, delegate) navigate via SPA router.
  const handleAction = useCallback((action: IMyWorkActionDefinition) => {
    executeAction({ actionKey: action.key, item });
  }, [executeAction, item]);

  // Detail-panel a11y: focus panel on open, restore focus on close.
  useEffect(() => {
    triggerRef.current = document.activeElement;
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  // Detail-panel a11y: Escape to close.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // UIF-002: slideInRight (250ms) entrance + elevationLevel3 box-shadow
  return (
    <div
      ref={panelRef}
      className={mergeClasses(styles.panelWrapper, animStyles.slideInRight)}
      role="region"
      aria-label={`Detail: ${item.title}`}
      tabIndex={-1}
    >
    <HbcCard weight="primary" header={<span>Item Detail</span>}>
      <div className={styles.root}>
        {/* Header: title + close */}
        <div className={styles.header}>
          <h3 className={styles.title}>{item.title}</h3>
          <HbcButton variant="ghost" size="sm" onClick={onClose}>
            Close
          </HbcButton>
        </div>

        {/* Status badges */}
        <div className={styles.badges}>
          {item.isOverdue && <HbcStatusBadge variant="error" label="Overdue" />}
          {item.isBlocked && <HbcStatusBadge variant="warning" label="Blocked" />}
          {item.isUnread && <HbcStatusBadge variant="info" label="Unread" />}
        </div>

        {/* Metadata */}
        <div className={styles.section}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Lane</span>
            <span>{laneLabel}</span>
          </div>
          {item.context.moduleKey && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Module</span>
              <span>{formatModuleLabel(item.context.moduleKey)}</span>
            </div>
          )}
          {item.context.projectName && (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Project</span>
              <span>{item.context.projectName}</span>
            </div>
          )}
          <div className={styles.metaRow}>
            <span>{formatDaysInState(item.timestamps.updatedAtIso)}</span>
            {item.dueDateIso && (
              <span
                style={{
                  color: item.isOverdue ? 'var(--colorPaletteRedForeground1)' : undefined,
                  fontWeight: item.isOverdue ? 600 : undefined,
                }}
              >
                {formatDueDate(item.dueDateIso)}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        {item.summary && <p className={styles.summary}>{item.summary}</p>}

        {/* Blocked reason */}
        {item.blockedReason && (
          <div className={styles.section}>
            <span className={styles.metaLabel}>Blocked reason</span>
            <span className={styles.summary}>{item.blockedReason}</span>
          </div>
        )}

        {/* Available actions */}
        {item.availableActions.length > 0 && (
          <div className={styles.actions}>
            {item.availableActions.map((action) => (
              <HbcButton
                key={action.key}
                variant={action.variant === 'primary' ? 'primary' : 'secondary'}
                size="md"
                disabled={isPending}
                onClick={() => handleAction(action)}
              >
                {action.label}
              </HbcButton>
            ))}
          </div>
        )}
      </div>
    </HbcCard>
    </div>
  );
}
