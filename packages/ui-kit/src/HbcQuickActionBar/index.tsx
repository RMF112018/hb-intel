/**
 * HbcQuickActionBar — generic persistent touch-safe action toolbar.
 *
 * Theme-aware: uses Fluent CSS custom properties that resolve per theme.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';

import { HBC_DENSITY_TOKENS } from '../theme/density.js';
import { HBC_SPACE_SM } from '../theme/grid.js';
import { HbcButton } from '../HbcButton/index.js';
import { Text } from '@fluentui/react-components';
import type { HbcQuickActionBarProps } from '../layouts/multi-column-types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
    padding: `${HBC_SPACE_SM}px`,
    borderTop: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground1)',
    flexWrap: 'wrap',
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin + HBC_SPACE_SM * 2}px`,
  },
  action: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    minWidth: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
  },
  unavailableLabel: {
    color: 'var(--colorNeutralForeground3)',
  },
});

export function HbcQuickActionBar({
  actions,
  onAction,
  testId,
}: HbcQuickActionBarProps): ReactNode {
  const styles = useStyles();

  return (
    <div
      data-testid={testId ?? 'hbc-quick-action-bar'}
      className={styles.root}
      role="toolbar"
      aria-label="Quick actions"
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
          {!action.available && action.unavailableLabel && (
            <Text size={100} className={styles.unavailableLabel}>
              {action.unavailableLabel}
            </Text>
          )}
        </div>
      ))}
    </div>
  );
}

export type { HbcQuickActionBarProps, QuickAction } from '../layouts/multi-column-types.js';
