/**
 * TeamViewerSurface — primary composed surface for TeamViewer.
 *
 * Premium, people-centric layout with a nameplate header (icon + title
 * + team-size meta), per-group labels when layout is `grouped`, and a
 * density-adaptive tile grid / horizontal rail. Entry animations are
 * opt-in via motion and respect reduced-motion preferences.
 */
import * as React from 'react';
import {
  AnimatePresence,
  Users,
  motion,
  useHomepageReducedMotion,
} from '@hbc/ui-kit/homepage';
import type {
  TeamViewerDensity,
  TeamViewerGroup,
  TeamViewerLayout,
  TeamViewerPerson,
} from '../teamViewerContracts.js';
import styles from '../teamViewerSurface.module.css';
import { TeamViewerPersonCard } from './TeamViewerPersonCard.js';

export interface TeamViewerSurfaceProps {
  heading: string;
  groups: TeamViewerGroup[];
  layout: TeamViewerLayout;
  density: TeamViewerDensity;
  onOpenDetail?: (person: TeamViewerPerson) => void;
}

function gridClass(density: TeamViewerDensity): string {
  switch (density) {
    case 'compact':
      return `${styles.grid} ${styles.gridCompact}`;
    case 'expanded':
      return `${styles.grid} ${styles.gridExpanded}`;
    case 'standard':
    default:
      return `${styles.grid} ${styles.gridStandard}`;
  }
}

export function TeamViewerSurface({
  heading,
  groups,
  layout,
  density,
  onOpenDetail,
}: TeamViewerSurfaceProps): React.JSX.Element {
  const reducedMotion = useHomepageReducedMotion();
  const totalCount = groups.reduce((sum, g) => sum + g.people.length, 0);

  const containerClass = layout === 'rail' || layout === 'strip' ? styles.rail : gridClass(density);

  return (
    <section data-hbc-layout={layout} data-hbc-density={density} className={styles.shellRoot}>
      <header className={styles.header}>
        <div className={styles.headingGroup}>
          <span className={styles.headingIcon} aria-hidden="true">
            <Users size={18} strokeWidth={2.2} />
          </span>
          <h2 className={styles.headingTitle}>{heading}</h2>
        </div>
        <span className={styles.headingMeta} aria-live="polite">
          {totalCount === 1 ? '1 team member' : `${totalCount} team members`}
        </span>
      </header>

      <AnimatePresence initial={false}>
        {groups.map((group, groupIndex) => (
          <div
            key={group.id}
            data-hbc-testid="team-viewer-group"
            style={{ marginTop: groupIndex === 0 ? 0 : 12 }}
          >
            {layout === 'grouped' ? (
              <h3 className={styles.groupLabel}>{group.label}</h3>
            ) : null}
            <div className={containerClass}>
              {group.people.map((person, personIndex) => (
                <motion.div
                  key={person.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={reducedMotion ? undefined : { duration: 0.22, delay: Math.min(personIndex, 10) * 0.02 }}
                  style={layout === 'rail' || layout === 'strip' ? { flex: '0 0 280px' } : undefined}
                >
                  <TeamViewerPersonCard
                    person={person}
                    density={density}
                    featured={personIndex === 0 && groupIndex === 0 && density === 'expanded'}
                    onOpenDetail={onOpenDetail}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </AnimatePresence>
    </section>
  );
}
