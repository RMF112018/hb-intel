// packages/shell/src/devToolbar/PersonaCard.tsx
// D-PH4C-13: PH4C.10 UI Kit application for shell dev tooling persona cards.

import type { IPersona } from '@hbc/auth/dev';
import { mergeClasses, makeStyles } from '@griffel/react';
import { HbcStatusBadge } from '../../../ui-kit/dist/index.js';

export interface PersonaCardProps {
  persona: IPersona;
  isSelected: boolean;
  onSelect: () => void;
}

const usePersonaCardStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
    textAlign: 'left',
    padding: '8px',
    backgroundColor: 'var(--hbc-dev-surface-raised)',
    border: '1px solid var(--hbc-dev-border)',
    borderRadius: '4px',
    color: 'var(--hbc-dev-text-primary)',
    cursor: 'pointer',
  },
  cardHover: {
    ':hover': {
      border: '1px solid var(--hbc-dev-accent)',
      backgroundColor: 'var(--hbc-dev-hover-bg)',
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: 'var(--hbc-dev-accent)',
      outlineOffset: '1px',
    },
  },
  cardSelected: {
    border: '1px solid var(--hbc-dev-selected-border)',
    boxShadow: '0 0 0 1px var(--hbc-dev-selected-border) inset',
    backgroundColor: 'var(--hbc-dev-selected-bg)',
  },
  name: {
    fontWeight: 600,
    color: 'var(--hbc-dev-text-primary)',
  },
  email: {
    color: 'var(--hbc-dev-text-secondary)',
    fontSize: '11px',
    overflowWrap: 'anywhere',
  },
  roles: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
});

/**
 * D-PH4C-13 traceability: map auth roles to existing HbcStatusBadge variants
 * so this phase can consume ui-kit without changing the badge public API.
 */
function resolveRoleVariant(role: string): React.ComponentProps<typeof HbcStatusBadge>['variant'] {
  const normalized = role.toLowerCase();
  if (normalized.includes('admin')) return 'critical';
  if (normalized.includes('manager') || normalized.includes('approver')) return 'atRisk';
  if (normalized.includes('member') || normalized.includes('viewer')) return 'info';
  return 'neutral';
}

/**
 * PersonaCard
 * ===========
 * D-PH4C-13: Dev toolbar role tags are migrated to `HbcStatusBadge` and styling
 * is now implemented exclusively with makeStyles under `[data-hbc-dev-toolbar]` vars.
 */
export const PersonaCard = ({ persona, isSelected, onSelect }: PersonaCardProps): JSX.Element => {
  const styles = usePersonaCardStyles();

  return (
    <button
      className={mergeClasses(styles.card, styles.cardHover, isSelected && styles.cardSelected)}
      onClick={onSelect}
      title={persona.description}
      type="button"
      aria-pressed={isSelected}
      aria-label={`Select persona: ${persona.name}`}
    >
      <div className={styles.name}>{persona.name}</div>
      <div className={styles.email}>{persona.email}</div>
      <div className={styles.roles}>
        {persona.roles.slice(0, 3).map((role) => (
          <HbcStatusBadge key={role} variant={resolveRoleVariant(role)} label={role} size="small" />
        ))}
      </div>
    </button>
  );
};
