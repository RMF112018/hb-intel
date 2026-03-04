/**
 * HbcTypography — Intent-based typography wrapper
 * PH4.6 §Step 3 | Blueprint §1d
 * Maps intent prop to V2.1 type scale tokens from theme/typography.ts
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { hbcTypeScale } from '../theme/typography.js';
import type { HbcTypographyProps, TypographyIntent } from './types.js';

/** Default HTML element per intent */
const DEFAULT_ELEMENT_MAP: Record<TypographyIntent, React.ElementType> = {
  display: 'h1',
  heading1: 'h2',
  heading2: 'h3',
  heading3: 'h4',
  heading4: 'h5',
  body: 'p',
  bodySmall: 'p',
  label: 'span',
  code: 'code',
};

const useStyles = makeStyles({
  display: {
    fontFamily: hbcTypeScale.display.fontFamily,
    fontSize: hbcTypeScale.display.fontSize,
    fontWeight: hbcTypeScale.display.fontWeight,
    lineHeight: hbcTypeScale.display.lineHeight,
    letterSpacing: hbcTypeScale.display.letterSpacing,
  },
  heading1: {
    fontFamily: hbcTypeScale.heading1.fontFamily,
    fontSize: hbcTypeScale.heading1.fontSize,
    fontWeight: hbcTypeScale.heading1.fontWeight,
    lineHeight: hbcTypeScale.heading1.lineHeight,
    letterSpacing: hbcTypeScale.heading1.letterSpacing,
  },
  heading2: {
    fontFamily: hbcTypeScale.heading2.fontFamily,
    fontSize: hbcTypeScale.heading2.fontSize,
    fontWeight: hbcTypeScale.heading2.fontWeight,
    lineHeight: hbcTypeScale.heading2.lineHeight,
    letterSpacing: hbcTypeScale.heading2.letterSpacing,
  },
  heading3: {
    fontFamily: hbcTypeScale.heading3.fontFamily,
    fontSize: hbcTypeScale.heading3.fontSize,
    fontWeight: hbcTypeScale.heading3.fontWeight,
    lineHeight: hbcTypeScale.heading3.lineHeight,
    letterSpacing: hbcTypeScale.heading3.letterSpacing,
  },
  heading4: {
    fontFamily: hbcTypeScale.heading4.fontFamily,
    fontSize: hbcTypeScale.heading4.fontSize,
    fontWeight: hbcTypeScale.heading4.fontWeight,
    lineHeight: hbcTypeScale.heading4.lineHeight,
    letterSpacing: hbcTypeScale.heading4.letterSpacing,
  },
  body: {
    fontFamily: hbcTypeScale.body.fontFamily,
    fontSize: hbcTypeScale.body.fontSize,
    fontWeight: hbcTypeScale.body.fontWeight,
    lineHeight: hbcTypeScale.body.lineHeight,
    letterSpacing: hbcTypeScale.body.letterSpacing,
  },
  bodySmall: {
    fontFamily: hbcTypeScale.bodySmall.fontFamily,
    fontSize: hbcTypeScale.bodySmall.fontSize,
    fontWeight: hbcTypeScale.bodySmall.fontWeight,
    lineHeight: hbcTypeScale.bodySmall.lineHeight,
    letterSpacing: hbcTypeScale.bodySmall.letterSpacing,
  },
  label: {
    fontFamily: hbcTypeScale.label.fontFamily,
    fontSize: hbcTypeScale.label.fontSize,
    fontWeight: hbcTypeScale.label.fontWeight,
    lineHeight: hbcTypeScale.label.lineHeight,
    letterSpacing: hbcTypeScale.label.letterSpacing,
  },
  code: {
    fontFamily: hbcTypeScale.code.fontFamily,
    fontSize: hbcTypeScale.code.fontSize,
    fontWeight: hbcTypeScale.code.fontWeight,
    lineHeight: hbcTypeScale.code.lineHeight,
    letterSpacing: hbcTypeScale.code.letterSpacing,
  },
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
});

export const HbcTypography: React.FC<HbcTypographyProps> = ({
  intent,
  as,
  children,
  className,
  color,
  truncate,
}) => {
  const styles = useStyles();
  const Component = as ?? DEFAULT_ELEMENT_MAP[intent];

  return (
    <Component
      data-hbc-ui="typography"
      className={mergeClasses(
        styles[intent],
        truncate && styles.truncate,
        className,
      )}
      style={color ? { color } : undefined}
    >
      {children}
    </Component>
  );
};

export type { HbcTypographyProps, TypographyIntent } from './types.js';
