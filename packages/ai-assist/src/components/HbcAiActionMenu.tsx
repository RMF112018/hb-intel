/**
 * HbcAiActionMenu — D-SF15-T01 scaffold
 *
 * Global toolbar action trigger and popover for AI action discovery,
 * filtered by record type, auth role, and complexity tier.
 * Full implementation in SF15-T05.
 */
import type { FC } from 'react';

/** Props for the AI Action Menu component. */
export interface HbcAiActionMenuProps {
  readonly recordType?: string;
}

/** Scaffold placeholder — full implementation in SF15-T05. */
export const HbcAiActionMenu: FC<HbcAiActionMenuProps> = () => null;

HbcAiActionMenu.displayName = 'HbcAiActionMenu';
