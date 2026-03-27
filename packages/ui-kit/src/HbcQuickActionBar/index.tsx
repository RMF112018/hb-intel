/**
 * HbcQuickActionBar — generic persistent touch-safe action toolbar.
 *
 * Renders a horizontal bar of large-target action buttons.
 * Always visible, designed for field/touch use. Uses HBC_* tokens.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';

import { HBC_DENSITY_TOKENS } from '../theme/density.js';
import { HBC_SPACE_SM } from '../theme/grid.js';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { HbcButton } from '../HbcButton/index.js';
import { Text } from '@fluentui/react-components';
import type { HbcQuickActionBarProps } from '../layouts/multi-column-types.js';

// ── Styles ──────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
    padding: `${HBC_SPACE_SM}px`,
    borderTop: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
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
});

// ── Component ───────────────────────────────────────────────────────

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
            <Text size={100} style={{ color: HBC_SURFACE_LIGHT['text-muted'] }}>
              {action.unavailableLabel}
            </Text>
          )}
        </div>
      ))}
    </div>
  );
}

export type { HbcQuickActionBarProps, QuickAction } from '../layouts/multi-column-types.js';
