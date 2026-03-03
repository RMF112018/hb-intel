/**
 * HbcPanel — Fluent v9 OverlayDrawer wrapper
 * Blueprint §1d — size (sm/md/lg), header/body/footer, slideInRight animation
 */
import * as React from 'react';
import {
  OverlayDrawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  DrawerFooter,
  Button,
  mergeClasses,
} from '@fluentui/react-components';
import { makeStyles } from '@griffel/react';
import { TRANSITION_NORMAL, keyframes } from '../theme/animations.js';
import type { HbcPanelProps, PanelSize } from './types.js';

const SIZE_MAP: Record<PanelSize, string> = {
  sm: '320px',
  md: '480px',
  lg: '640px',
};

const useStyles = makeStyles({
  body: {
    flex: '1 1 auto',
    overflowY: 'auto',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
  },
});

export const HbcPanel: React.FC<HbcPanelProps> = ({
  open,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  className,
}) => {
  const styles = useStyles();

  return (
    <OverlayDrawer
      data-hbc-ui="panel"
      open={open}
      onOpenChange={(_e, data) => {
        if (!data.open) onClose();
      }}
      position="end"
      size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium'}
      className={className}
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              onClick={onClose}
            >
              ✕
            </Button>
          }
        >
          {title}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody className={styles.body}>
        {children}
      </DrawerBody>
      {footer && (
        <DrawerFooter className={styles.footer}>
          {footer}
        </DrawerFooter>
      )}
    </OverlayDrawer>
  );
};

export type { HbcPanelProps, PanelSize } from './types.js';
