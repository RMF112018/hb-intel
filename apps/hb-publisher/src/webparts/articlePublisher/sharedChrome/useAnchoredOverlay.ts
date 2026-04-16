/**
 * useAnchoredOverlay — Publisher-local helper that wraps the
 * `@floating-ui/react` building blocks into the single positioning +
 * dismissal contract that later overlay seams (dropdowns, popovers,
 * anchored flyouts) will consume.
 *
 * This is the primitive contract referenced by phase-17 Prompt 02; its
 * first consumer is the project search dropdown on `ProjectPicker`.
 *
 * Returns the `useFloating` result merged with the interaction props
 * produced by `useInteractions`. Callers wire refs and prop spreaders
 * onto the reference + floating elements themselves.
 */

import type * as React from 'react';
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  type ElementProps,
  type FloatingContext,
  type Placement,
  type UseFloatingReturn,
  type UseRoleProps,
} from '@floating-ui/react';

export interface AnchoredOverlayOptions {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly placement?: Placement;
  readonly offsetPx?: number;
  readonly matchReferenceWidth?: boolean;
  readonly role?: UseRoleProps['role'];
}

export interface AnchoredOverlay {
  readonly context: FloatingContext;
  readonly refs: UseFloatingReturn['refs'];
  readonly floatingStyles: UseFloatingReturn['floatingStyles'];
  readonly getReferenceProps: (
    userProps?: React.HTMLProps<Element>,
  ) => Record<string, unknown>;
  readonly getFloatingProps: (
    userProps?: React.HTMLProps<HTMLElement>,
  ) => Record<string, unknown>;
}

export function useAnchoredOverlay(
  options: AnchoredOverlayOptions,
): AnchoredOverlay {
  const {
    open,
    onOpenChange,
    placement = 'bottom-start',
    offsetPx = 4,
    matchReferenceWidth = false,
    role,
  } = options;

  const floating = useFloating({
    open,
    onOpenChange,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetPx),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      ...(matchReferenceWidth
        ? [
            size({
              apply({ rects, elements }) {
                Object.assign(elements.floating.style, {
                  width: `${rects.reference.width}px`,
                });
              },
            }),
          ]
        : []),
    ],
  });

  const dismiss = useDismiss(floating.context, { outsidePressEvent: 'mousedown' });
  const interactionHooks: ElementProps[] = [dismiss];
  if (role) {
    interactionHooks.push(useRole(floating.context, { role }));
  }
  const { getReferenceProps, getFloatingProps } = useInteractions(interactionHooks);

  return {
    context: floating.context,
    refs: floating.refs,
    floatingStyles: floating.floatingStyles,
    getReferenceProps,
    getFloatingProps,
  };
}
