/**
 * HbcFormSection — Collapsible form section
 * PH4.6 §Step 8 | Blueprint §1d
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { TRANSITION_NORMAL } from '../theme/animations.js';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { HBC_SPACE_SM, HBC_SPACE_MD } from '../theme/grid.js';
import { ChevronDown, ChevronUp } from '../icons/index.js';
import type { HbcFormSectionProps } from './types.js';

const useStyles = makeStyles({
  root: {
    borderBottom: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${HBC_SPACE_SM}px`,
    marginBottom: '12px',
  },
  headerClickable: {
    cursor: 'pointer',
    ':hover': {
      opacity: '0.8',
    },
  },
  titleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    color: HBC_SURFACE_LIGHT['text-primary'],
    margin: '0',
  },
  description: {
    fontSize: '0.75rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    margin: '0',
  },
  toggleButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: HBC_SURFACE_LIGHT['text-muted'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  content: {
    overflow: 'hidden',
    transitionProperty: 'max-height, opacity',
    transitionDuration: TRANSITION_NORMAL,
    transitionTimingFunction: 'ease-in-out',
  },
  expanded: {
    maxHeight: '2000px',
    opacity: '1',
  },
  collapsed: {
    maxHeight: '0px',
    opacity: '0',
  },
});

export const HbcFormSection: React.FC<HbcFormSectionProps> = ({
  title,
  description,
  collapsible = false,
  defaultExpanded = true,
  children,
  className,
}) => {
  const styles = useStyles();
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const toggle = React.useCallback(() => {
    if (collapsible) setExpanded((prev) => !prev);
  }, [collapsible]);

  return (
    <div data-hbc-ui="form-section" className={mergeClasses(styles.root, className)}>
      <div
        className={mergeClasses(styles.header, collapsible && styles.headerClickable)}
        onClick={toggle}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? expanded : undefined}
        onKeyDown={collapsible ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } } : undefined}
      >
        <div className={styles.titleGroup}>
          <h4 className={styles.title}>{title}</h4>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        {collapsible && (
          <span className={styles.toggleButton} aria-hidden="true">
            {expanded ? <ChevronUp size="sm" /> : <ChevronDown size="sm" />}
          </span>
        )}
      </div>
      <div
        className={mergeClasses(
          styles.content,
          expanded ? styles.expanded : styles.collapsed,
        )}
      >
        {children}
      </div>
    </div>
  );
};
