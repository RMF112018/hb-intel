/**
 * HbcDescriptionList — Semantic key/value metadata display
 *
 * Renders label/value pairs in a 2-column grid using semantic
 * <dl>/<dt>/<dd> elements. Supports dense mode for card contexts
 * and applies typography tokens for consistent sizing.
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { label as labelType, body as bodyType, bodySmall } from '../theme/typography.js';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import type { HbcDescriptionListProps } from './types.js';

const useStyles = makeStyles({
  dl: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: '12px',
    rowGap: '6px',
    alignItems: 'baseline',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  dense: {
    columnGap: '10px',
    rowGap: '4px',
  },
  dt: {
    fontSize: labelType.fontSize,
    fontWeight: labelType.fontWeight,
    color: HBC_SURFACE_LIGHT['text-muted'],
    whiteSpace: 'nowrap',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  dtDense: {
    fontSize: bodySmall.fontSize,
    fontWeight: labelType.fontWeight,
  },
  dd: {
    fontSize: bodyType.fontSize,
    color: HBC_SURFACE_LIGHT['text-primary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  ddDense: {
    fontSize: bodySmall.fontSize,
  },
});

export const HbcDescriptionList: React.FC<HbcDescriptionListProps> = ({
  items,
  dense = false,
  className,
}) => {
  const classes = useStyles();

  if (items.length === 0) return null;

  return (
    <dl
      className={mergeClasses(classes.dl, dense && classes.dense, className)}
      data-hbc-ui="description-list"
    >
      {items.map((item) => (
        <React.Fragment key={item.label}>
          <dt className={mergeClasses(classes.dt, dense && classes.dtDense)}>
            {item.label}
          </dt>
          <dd className={mergeClasses(classes.dd, dense && classes.ddDense)}>
            {item.value}
          </dd>
        </React.Fragment>
      ))}
    </dl>
  );
};

export type { HbcDescriptionListProps, DescriptionListItem } from './types.js';
