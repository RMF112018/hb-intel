/**
 * HbcProjectSelector — Project name + searchable dropdown
 * PH4.4 §Step 3 | Blueprint §2c
 */
import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { useProjectStore } from '@hbc/shell';
import { heading4 } from '../theme/typography.js';
import { HBC_HEADER_TEXT, HBC_HEADER_ICON_MUTED, HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import { elevationOverlay } from '../theme/elevation.js';
import { ChevronDown } from '../icons/index.js';
import type { HbcProjectSelectorProps } from './types.js';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    ...heading4,
    color: HBC_HEADER_TEXT,
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingTop: '4px',
    paddingBottom: '4px',
    ...shorthands.borderRadius('4px'),
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  chevron: {
    marginLeft: '4px',
    transitionProperty: 'transform',
    transitionDuration: '150ms',
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: '0px',
    marginTop: '4px',
    minWidth: '240px',
    backgroundColor: '#FFFFFF',
    ...shorthands.borderRadius('4px'),
    boxShadow: elevationOverlay,
    zIndex: 10002,
    overflowY: 'auto',
    maxHeight: '300px',
  },
  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    ...shorthands.borderStyle('none'),
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    fontSize: '0.875rem',
    outlineStyle: 'none',
  },
  projectItem: {
    display: 'block',
    width: '100%',
    paddingLeft: '12px',
    paddingRight: '12px',
    paddingTop: '8px',
    paddingBottom: '8px',
    backgroundColor: 'transparent',
    ...shorthands.borderStyle('none'),
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  activeItem: {
    fontWeight: '600',
  },
});

export const HbcProjectSelector: React.FC<HbcProjectSelectorProps> = ({ onProjectSelect }) => {
  const { activeProject, availableProjects } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const styles = useStyles();

  const filtered = availableProjects.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.number.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = useCallback(
    (projectId: string) => {
      onProjectSelect?.(projectId);
      setIsOpen(false);
      setSearch('');
    },
    [onProjectSelect],
  );

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        ref={triggerRef}
        className={styles.root}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select project"
        type="button"
      >
        <span>{activeProject?.name ?? 'Select Project'}</span>
        <span className={mergeClasses(styles.chevron, isOpen && styles.chevronOpen)}>
          <ChevronDown size="sm" color={HBC_HEADER_ICON_MUTED} />
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox" aria-label="Projects">
          <input
            className={styles.searchInput}
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {filtered.map((project) => (
            <button
              key={project.id}
              className={mergeClasses(styles.projectItem, project.id === activeProject?.id && styles.activeItem)}
              role="option"
              aria-selected={project.id === activeProject?.id}
              onClick={() => handleSelect(project.id)}
              type="button"
            >
              {project.number} — {project.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
