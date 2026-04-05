/**
 * HbcHomepageMetadataRow — Flex row for badges, dates, and signal metadata
 * Phase 11A — Shared homepage metadata primitive
 *
 * Renders a horizontal flex row with consistent gap and wrapping for
 * metadata items such as status badges, timestamps, and category labels.
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
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
  },
});

export const HbcHomepageMetadataRow: React.FC<HbcHomepageMetadataRowProps> = ({
  children,
  className,
}) => {
  const styles = useStyles();

  return (
    <div
      role="group"
      className={mergeClasses(styles.root, className)}
      data-hbc-homepage="metadata-row"
    >
      {children}
    </div>
  );
};

export type { HbcHomepageMetadataRowProps } from './types.js';
