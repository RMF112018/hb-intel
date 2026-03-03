/**
 * HbcCommandBar — Fluent v9 Toolbar wrapper
 * Blueprint §1d — SearchBox + filter toggles + action buttons
 */
import * as React from 'react';
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarToggleButton,
  SearchBox,
  mergeClasses,
} from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { elevationRaised } from '../theme/elevation.js';
import type { HbcCommandBarProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    boxShadow: elevationRaised,
    backgroundColor: 'var(--colorNeutralBackground1)',
    borderRadius: '4px',
    gap: '8px',
  },
  search: {
    minWidth: '200px',
    flexShrink: 0,
  },
  filters: {
    display: 'flex',
    gap: '4px',
    flexShrink: 0,
  },
  spacer: {
    flex: '1 1 auto',
  },
  actions: {
    display: 'flex',
    gap: '4px',
    flexShrink: 0,
  },
});

export const HbcCommandBar: React.FC<HbcCommandBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actions,
  className,
}) => {
  const styles = useStyles();

  return (
    <div data-hbc-ui="command-bar" className={mergeClasses(styles.root, className)}>
      {onSearchChange !== undefined && (
        <SearchBox
          className={styles.search}
          value={searchValue ?? ''}
          onChange={(_e, data) => onSearchChange(data.value)}
          placeholder={searchPlaceholder}
          size="small"
        />
      )}

      {filters && filters.length > 0 && (
        <>
          <ToolbarDivider />
          <Toolbar className={styles.filters} size="small">
            {filters.map((f) => (
              <ToolbarToggleButton
                key={f.key}
                name={f.key}
                value={f.key}
                onClick={f.onToggle}
                size="small"
                appearance={f.active ? 'primary' : 'subtle'}
              >
                {f.label}
              </ToolbarToggleButton>
            ))}
          </Toolbar>
        </>
      )}

      <div className={styles.spacer} />

      {actions && actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((a) => (
            <ToolbarButton
              key={a.key}
              icon={a.icon as React.JSX.Element | undefined}
              onClick={a.onClick}
              disabled={a.disabled}
              appearance={a.primary ? 'primary' : 'subtle'}
            >
              {a.label}
            </ToolbarButton>
          ))}
        </div>
      )}
    </div>
  );
};

export type {
  HbcCommandBarProps,
  CommandBarAction,
  CommandBarFilter,
} from './types.js';
