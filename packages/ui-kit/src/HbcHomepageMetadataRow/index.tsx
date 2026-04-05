/**
 * HbcHomepageMetadataRow — Flex row for badges, dates, and signal metadata
 * Phase 11A-02 — Production-grade metadata primitive
 *
 * Renders a horizontal flex row with consistent gap, wrapping, and
 * optional dot-separated layout for metadata items.
 */
import * as React from 'react';
import { mergeClasses, tokens } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { label as labelTypo } from '../theme/typography.js';
import { HBC_SPACE_SM } from '../theme/grid.js';
import type { HbcHomepageMetadataRowProps } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_SM}px`,
    fontSize: labelTypo.fontSize,
    fontWeight: String(labelTypo.fontWeight),
    lineHeight: labelTypo.lineHeight,
    letterSpacing: labelTypo.letterSpacing,
    fontFamily: labelTypo.fontFamily,
    color: tokens.colorNeutralForeground3,
  },
  separated: {
    '& > *:not(:last-child)::after': {
      content: '"\\00B7"',
      marginLeft: `${HBC_SPACE_SM}px`,
      color: tokens.colorNeutralForeground4,
    },
  },
});

export const HbcHomepageMetadataRow: React.FC<HbcHomepageMetadataRowProps> = ({
  children,
  separated = false,
  className,
}) => {
  const styles = useStyles();

  return (
    <div
      role="group"
      className={mergeClasses(styles.root, separated && styles.separated, className)}
      data-hbc-homepage="metadata-row"
    >
      {children}
    </div>
  );
};

export type { HbcHomepageMetadataRowProps } from './types.js';
