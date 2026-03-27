import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HBC_DENSITY_TOKENS,
  HBC_SPACE_SM,
  HbcButton,
  Text,
} from '@hbc/ui-kit';

/**
 * Quick action definition — a high-frequency field action.
 *
 * NOTE: Capture, Markup, and photo actions are placeholders.
 * The underlying capture/markup runtime does not exist in repo truth.
 * These render as CTA buttons that surface an honest empty state or
 * escalate to the full PWA module surface.
 */
export interface FieldQuickAction {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly available: boolean;
}

const DEFAULT_QUICK_ACTIONS: readonly FieldQuickAction[] = [
  { id: 'capture', label: 'Capture', description: 'Photo/evidence capture', available: false },
  { id: 'markup', label: 'Markup', description: 'Drawing/sheet markup', available: false },
  { id: 'issue', label: 'Issue', description: 'Log new issue', available: true },
  { id: 'checklist', label: 'Checklist', description: 'Open active checklist', available: true },
  { id: 'review', label: 'Review', description: 'Review pending items', available: true },
  { id: 'full-surface', label: 'Full Surface', description: 'Open full Project Hub', available: true },
];

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
    padding: `${HBC_SPACE_SM}px`,
    borderTop: '1px solid #edebe9',
    backgroundColor: '#ffffff',
    flexWrap: 'wrap',
    // Touch-first: always visible, generous sizing
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin + HBC_SPACE_SM * 2}px`,
  },
  action: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    // Touch-first: minimum 44×44 tap target
    minWidth: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
  },
});

export interface FieldQuickActionBarProps {
  readonly onAction: (actionId: string) => void;
  readonly actions?: readonly FieldQuickAction[];
}

export function FieldQuickActionBar({
  onAction,
  actions = DEFAULT_QUICK_ACTIONS,
}: FieldQuickActionBarProps): ReactNode {
  const styles = useStyles();

  return (
    <div
      data-testid="field-quick-action-bar"
      className={styles.root}
      role="toolbar"
      aria-label="Field quick actions"
    >
      {actions.map((action) => (
        <div key={action.id} className={styles.action}>
          <HbcButton
            variant={action.available ? 'primary' : 'secondary'}
            disabled={!action.available}
            onClick={() => onAction(action.id)}
          >
            {action.label}
          </HbcButton>
          {!action.available && (
            <Text size={100} style={{ color: '#8A8886' }}>Coming soon</Text>
          )}
        </div>
      ))}
    </div>
  );
}
