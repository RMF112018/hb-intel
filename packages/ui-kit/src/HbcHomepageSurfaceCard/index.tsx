/**
 * HbcHomepageSurfaceCard — Surface-class-aware card for homepage zones
 * Phase 11A — Shared homepage surface card primitive
 *
 * Wraps HbcCard with surface-class-aware weight mapping and density
 * adjustments. Each surface class (hero, editorial, utility, operational,
 * discovery) maps to an appropriate card weight and optional style override.
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { HbcCard } from '../HbcCard/index.js';
import type { CardWeight } from '../HbcCard/types.js';
import type { HomepageSurfaceClass } from '../homepage.js';
import type { HbcHomepageSurfaceCardProps } from './types.js';

const surfaceWeightMap: Record<HomepageSurfaceClass, CardWeight> = {
  hero: 'primary',
  editorial: 'standard',
  utility: 'supporting',
  operational: 'standard',
  discovery: 'supporting',
};

const useStyles = makeStyles({
  utility: {
    /* Compact density for utility surfaces — tighter body padding */
    '& > [class*="body"]': {
      paddingTop: '12px',
      paddingBottom: '12px',
    },
  },
});

export const HbcHomepageSurfaceCard: React.FC<HbcHomepageSurfaceCardProps> = ({
  children,
  surface = 'editorial',
  header,
  footer,
  className,
}) => {
  const styles = useStyles();
  const weight = surfaceWeightMap[surface];
  const composedClass = mergeClasses(
    surface === 'utility' ? styles.utility : undefined,
    className,
  );

  return (
    <div data-hbc-homepage="surface-card" data-hbc-surface={surface}>
      <HbcCard
        weight={weight}
        header={header}
        footer={footer}
        className={composedClass}
      >
        {children}
      </HbcCard>
    </div>
  );
};

export type { HbcHomepageSurfaceCardProps } from './types.js';
