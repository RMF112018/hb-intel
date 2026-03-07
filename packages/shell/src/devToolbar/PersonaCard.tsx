// packages/shell/src/devToolbar/PersonaCard.tsx
// D-PH5C-06: Sub-component for displaying persona information in card format

import type { IPersona } from '@hbc/auth/dev';
import styles from './DevToolbar.module.css';

export interface PersonaCardProps {
  persona: IPersona;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * PersonaCard
 * ===========
 * D-PH5C-06: Compact persona display with selection state for DevToolbar personas tab.
 * Styling is intentionally shared with DevToolbar.module.css per PH5C.4 locked resolution.
 */
export const PersonaCard = ({ persona, isSelected, onSelect }: PersonaCardProps): JSX.Element => {
  return (
    <button
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onSelect}
      title={persona.description}
      type="button"
    >
      <div className={styles.name}>{persona.name}</div>
      <div className={styles.email}>{persona.email}</div>
      <div className={styles.roles}>
        {persona.roles.slice(0, 3).map((role) => (
          <span key={role} className={styles.role}>
            {role}
          </span>
        ))}
      </div>
    </button>
  );
};
