import type { FC } from 'react';
import { Search } from '@hbc/ui-kit/icons';
import styles from './PccProjectIntelligenceHeader.module.css';

export interface PccCommandSearchProps {
  placeholder?: string;
  /** Display-only: the input is non-functional in the Wave 2 scaffold. */
  ariaLabel?: string;
  variant?: 'expanded' | 'icon';
}

export const PccCommandSearch: FC<PccCommandSearchProps> = ({
  placeholder = 'Search the project control center…',
  ariaLabel = 'Search the project control center',
  variant = 'expanded',
}) => {
  if (variant === 'icon') {
    return (
      <button
        type="button"
        className={styles.searchIcon}
        aria-label={ariaLabel}
        data-pcc-command-search="icon"
        disabled
      >
        <Search size="sm" aria-label="" />
      </button>
    );
  }
  return (
    <label className={styles.searchField} data-pcc-command-search="expanded">
      <Search size="sm" aria-label="" />
      <input
        type="search"
        className={styles.searchInput}
        placeholder={placeholder}
        aria-label={ariaLabel}
        readOnly
      />
    </label>
  );
};

export default PccCommandSearch;
