/**
 * HbcHomepageSurfaceCard — Surface-class-aware card for homepage zones
 * Phase 11A-02 — Production-grade surface card primitive
 * Phase 12B-02 — Added 'welcome' surface class for greeting surfaces
 *
 * Wraps HbcCard with surface-class-aware weight mapping, density
 * adjustments, and intentional visual differentiation per surface class.
 * Each surface class (hero, welcome, editorial, utility, operational, discovery)
 * maps to an appropriate card weight with distinct padding and border.
 */
import * as React from 'react';
import { mergeClasses, tokens } from '@fluentui/react-components';
import { makeStyles, shorthands } from '@griffel/react';
import { HbcCard } from '../HbcCard/index.js';
import type { CardWeight } from '../HbcCard/types.js';
import type { HomepageSurfaceClass } from '../homepage.js';
import { HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_LG } from '../theme/grid.js';
import type { HbcHomepageSurfaceCardProps } from './types.js';

const surfaceWeightMap: Record<HomepageSurfaceClass, CardWeight> = {
  hero: 'primary',
  welcome: 'primary',
  editorial: 'standard',
  utility: 'supporting',
  operational: 'standard',
  discovery: 'supporting',
};

const useStyles = makeStyles({
  hero: {
    ...shorthands.borderBottom('3px', 'solid', tokens.colorBrandBackground),
  },
  welcome: {
    ...shorthands.borderLeft('4px', 'solid', tokens.colorBrandBackground),
  },
  editorial: {
    /* Standard weight — no additional overrides */
  },
  utility: {
    '& > [data-hbc-ui="card"]': {
      paddingTop: `${HBC_SPACE_SM}px`,
      paddingBottom: `${HBC_SPACE_SM}px`,
    },
  },
  operational: {
    ...shorthands.borderLeft('3px', 'solid', tokens.colorBrandStroke1),
  },
  discovery: {
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: '8px',
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
  const surfaceClass = styles[surface] ?? undefined;
  const composedClass = mergeClasses(surfaceClass, className);

  return (
    <div data-hbc-homepage="surface-card" data-hbc-surface={surface} className={composedClass}>
      <HbcCard
        weight={weight}
        header={header}
        footer={footer}
      >
        {children}
      </HbcCard>
    </div>
  );
};

export type { HbcHomepageSurfaceCardProps } from './types.js';
