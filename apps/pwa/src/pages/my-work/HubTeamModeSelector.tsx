/**
 * HubTeamModeSelector — P2-D4 §1, P2-D5 §7.
 *
 * Team mode toggle for the hub header. Available modes per role:
 *   personal — all roles (default)
 *   delegated-by-me — all roles with active delegations
 *   my-team — Executive only (P2-D4 §1)
 *
 * Persisted via useAutoSaveDraft with 16-hour TTL per P2-D5 §7.
 * Hidden at essential complexity tier.
 */
import type { ReactNode } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import { useComplexity } from '@hbc/complexity';
import { useAuthStore, RoleGate } from '@hbc/auth';

export type TeamMode = 'personal' | 'delegated-by-me' | 'my-team';

export interface HubTeamModeSelectorProps {
  activeMode: TeamMode;
  onModeChange: (mode: TeamMode) => void;
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    gap: '4px',
    paddingBottom: '12px',
  },
  button: {
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '6px',
    paddingBottom: '6px',
    borderRadius: '4px',
    border: '1px solid var(--colorNeutralStroke1)',
    backgroundColor: 'var(--colorNeutralBackground1)',
    color: 'var(--colorNeutralForeground1)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 400,
  },
  activeButton: {
    backgroundColor: 'var(--colorBrandBackground)',
    color: 'var(--colorNeutralForegroundOnBrand)',
    ...shorthands.borderColor('var(--colorBrandBackground)'),
    fontWeight: 600,
  },
});

export function HubTeamModeSelector({
  activeMode,
  onModeChange,
}: HubTeamModeSelectorProps): ReactNode {
  const styles = useStyles();
  const { tier } = useComplexity();
  const session = useAuthStore((s) => s.session);
  const isExecutive = session?.resolvedRoles.includes('Executive') ?? false;

  if (tier === 'essential') return null;

  return (
    <div className={styles.root} role="group" aria-label="Team mode">
      <button
        type="button"
        className={`${styles.button}${activeMode === 'personal' ? ` ${styles.activeButton}` : ''}`}
        onClick={() => onModeChange('personal')}
        aria-pressed={activeMode === 'personal'}
      >
        Personal
      </button>
      <button
        type="button"
        className={`${styles.button}${activeMode === 'delegated-by-me' ? ` ${styles.activeButton}` : ''}`}
        onClick={() => onModeChange('delegated-by-me')}
        aria-pressed={activeMode === 'delegated-by-me'}
      >
        Delegated by Me
      </button>
      {isExecutive && (
        <button
          type="button"
          className={`${styles.button}${activeMode === 'my-team' ? ` ${styles.activeButton}` : ''}`}
          onClick={() => onModeChange('my-team')}
          aria-pressed={activeMode === 'my-team'}
        >
          My Team
        </button>
      )}
    </div>
  );
}
