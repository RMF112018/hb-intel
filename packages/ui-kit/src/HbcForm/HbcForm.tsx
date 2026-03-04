/**
 * HbcForm — Form wrapper with sticky footer
 * PH4.6 §Step 8 | Blueprint §1d
 */
import * as React from 'react';
import { mergeClasses } from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { elevationRaised } from '../theme/elevation.js';
import { HBC_SURFACE_LIGHT } from '../theme/tokens.js';
import type { HbcFormProps } from './types.js';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minHeight: '0',
  },
  stickyFooter: {
    position: 'sticky',
    bottom: '0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    boxShadow: elevationRaised,
    borderTop: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    zIndex: 10,
  },
});

export const HbcForm: React.FC<HbcFormProps> = ({
  onSubmit,
  children,
  stickyFooter,
  className,
}) => {
  const styles = useStyles();

  const handleSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(e);
    },
    [onSubmit],
  );

  return (
    <form
      data-hbc-ui="form"
      className={mergeClasses(styles.form, className)}
      onSubmit={handleSubmit}
    >
      {children}
      {stickyFooter && (
        <div className={styles.stickyFooter}>{stickyFooter}</div>
      )}
    </form>
  );
};
