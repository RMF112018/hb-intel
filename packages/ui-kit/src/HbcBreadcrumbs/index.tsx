/**
 * HbcBreadcrumbs — Standalone breadcrumb navigation
 * PH4.10 §Step 2 | Blueprint §2c
 *
 * - Max 3 levels enforced (truncates with "..." prefix)
 * - Focus Mode: minimal chrome (no sticky/border/bg)
 * - Field Mode: dark surface tokens
 * - ARIA: nav[role=navigation] + aria-current="page" on last item
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_PRIMARY_BLUE,
  HBC_HEADER_ICON_MUTED,
  HBC_SURFACE_LIGHT,
  HBC_SURFACE_FIELD,
} from '../theme/tokens.js';
import type { HbcBreadcrumbsProps } from './types.js';

const MAX_VISIBLE = 3;

const useStyles = makeStyles({
  nav: {
    display: 'flex',
    alignItems: 'center',
    height: '32px',
    fontSize: '0.75rem',
    gap: '4px',
    position: 'sticky',
    top: '0',
    zIndex: 1,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    paddingLeft: '16px',
    paddingRight: '16px',
  },
  focusMode: {
    position: 'static',
    backgroundColor: 'transparent',
    borderBottom: 'none',
    paddingLeft: '0',
    paddingRight: '0',
  },
  fieldMode: {
    backgroundColor: HBC_SURFACE_FIELD['surface-1'],
    borderBottom: `1px solid ${HBC_SURFACE_FIELD['border-default']}`,
  },
  fieldModeFocus: {
    backgroundColor: 'transparent',
    borderBottom: 'none',
  },
  separator: {
    color: HBC_HEADER_ICON_MUTED,
    userSelect: 'none',
  },
  link: {
    background: 'none',
    border: 'none',
    padding: '0',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    color: HBC_PRIMARY_BLUE,
    cursor: 'pointer',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  linkField: {
    color: '#337AAB',
  },
  current: {
    fontWeight: '600',
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  currentField: {
    color: HBC_SURFACE_FIELD['text-primary'],
  },
  ellipsis: {
    color: HBC_HEADER_ICON_MUTED,
  },
});

export const HbcBreadcrumbs: React.FC<HbcBreadcrumbsProps> = ({
  items,
  onNavigate,
  isFocusMode = false,
  isFieldMode = false,
  className,
}) => {
  const styles = useStyles();

  const truncated = items.length > MAX_VISIBLE;
  const visibleItems = truncated ? items.slice(-MAX_VISIBLE) : items;

  return (
    <nav
      role="navigation"
      aria-label="Breadcrumb"
      data-hbc-ui="breadcrumbs"
      className={mergeClasses(
        styles.nav,
        isFocusMode && styles.focusMode,
        isFieldMode && styles.fieldMode,
        isFocusMode && isFieldMode && styles.fieldModeFocus,
        className,
      )}
    >
      {truncated && (
        <>
          <span className={styles.ellipsis} aria-hidden="true">&hellip;</span>
          <span className={styles.separator} aria-hidden="true">/</span>
        </>
      )}
      {visibleItems.map((item, index) => {
        const isLast = index === visibleItems.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <span className={styles.separator} aria-hidden="true">/</span>
            )}
            {isLast ? (
              <span
                className={mergeClasses(
                  styles.current,
                  isFieldMode && styles.currentField,
                )}
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                className={mergeClasses(
                  styles.link,
                  isFieldMode && styles.linkField,
                )}
                onClick={() => item.href && onNavigate?.(item.href)}
                disabled={!item.href}
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export type { HbcBreadcrumbsProps, BreadcrumbItem } from './types.js';
