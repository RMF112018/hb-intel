/**
 * HbcSearch — Two-variant search component
 * PH4.10 §Step 5 | Blueprint §2c
 *
 * - Global variant: thin wrapper around HbcGlobalSearch (avoids duplicate Cmd+K)
 * - Local variant: native input with 200ms debounce, Search icon, Cancel clear button
 * - Field Mode: dark surface tokens (local variant only)
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { HBC_SURFACE_LIGHT, HBC_SURFACE_FIELD, HBC_PRIMARY_BLUE } from '../theme/tokens.js';
import { TRANSITION_FAST } from '../theme/animations.js';
import { HBC_RADIUS_MD } from '../theme/radii.js';
import { Search as SearchIcon, Cancel } from '../icons/index.js';
import { HbcGlobalSearch } from '../HbcAppShell/index.js';
import type { HbcSearchProps } from './types.js';

const useStyles = makeStyles({
  localRoot: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '36px',
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    borderRadius: HBC_RADIUS_MD,
    paddingLeft: '8px',
    paddingRight: '8px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    transitionProperty: 'border-color',
    transitionDuration: TRANSITION_FAST,
    ':focus-within': {
      ...shorthands.borderColor(HBC_PRIMARY_BLUE),
    },
  },
  localRootField: {
    border: `1px solid ${HBC_SURFACE_FIELD['border-default']}`,
    backgroundColor: HBC_SURFACE_FIELD['surface-1'],
    ':focus-within': {
      ...shorthands.borderColor(HBC_SURFACE_FIELD['border-focus']),
    },
  },
  icon: {
    flexShrink: 0,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  iconField: {
    color: HBC_SURFACE_FIELD['text-muted'],
  },
  input: {
    flex: '1 1 auto',
    border: 'none',
    outline: 'none',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    backgroundColor: 'transparent',
    color: HBC_SURFACE_LIGHT['text-primary'],
    '::placeholder': {
      color: HBC_SURFACE_LIGHT['text-muted'],
    },
  },
  inputField: {
    color: HBC_SURFACE_FIELD['text-primary'],
    '::placeholder': {
      color: HBC_SURFACE_FIELD['text-muted'],
    },
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    color: HBC_SURFACE_LIGHT['text-muted'],
    ':hover': {
      color: HBC_SURFACE_LIGHT['text-primary'],
    },
  },
  clearButtonField: {
    color: HBC_SURFACE_FIELD['text-muted'],
    ':hover': {
      color: HBC_SURFACE_FIELD['text-primary'],
    },
  },
});

const LocalSearch: React.FC<Extract<HbcSearchProps, { variant: 'local' }>> = ({
  value,
  onSearch,
  placeholder = 'Search...',
  isFieldMode = false,
  className,
}) => {
  const styles = useStyles();
  const [localValue, setLocalValue] = React.useState(value);
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>();

  // Sync external value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = e.target.value;
      setLocalValue(newVal);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onSearch(newVal), 200);
    },
    [onSearch],
  );

  const handleClear = React.useCallback(() => {
    setLocalValue('');
    clearTimeout(timerRef.current);
    onSearch('');
  }, [onSearch]);

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      data-hbc-ui="search"
      data-hbc-variant="local"
      className={mergeClasses(
        styles.localRoot,
        isFieldMode && styles.localRootField,
        className,
      )}
    >
      <span className={mergeClasses(styles.icon, isFieldMode && styles.iconField)}>
        <SearchIcon size="sm" />
      </span>
      <input
        type="text"
        className={mergeClasses(styles.input, isFieldMode && styles.inputField)}
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {localValue && (
        <button
          type="button"
          className={mergeClasses(styles.clearButton, isFieldMode && styles.clearButtonField)}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <Cancel size="sm" />
        </button>
      )}
    </div>
  );
};

export const HbcSearch: React.FC<HbcSearchProps> = (props) => {
  if (props.variant === 'global') {
    return (
      <div data-hbc-ui="search" data-hbc-variant="global" className={props.className}>
        <HbcGlobalSearch onSearchOpen={props.onSearchOpen} />
      </div>
    );
  }
  return <LocalSearch {...props} />;
};

export type {
  HbcSearchProps,
  HbcSearchVariant,
  HbcSearchGlobalProps,
  HbcSearchLocalProps,
} from './types.js';
