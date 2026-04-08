// @hbc/ui-kit/app-shell — lean shell entry for SPFx customizer bundles
// PH4.4 §4.2 bundle-size path

export { HbcConnectivityBar, HbcAppShell } from './HbcAppShell/index.js';

// Shell chrome layout constants — canonical source (W01r-P03)
export {
  HBC_HEADER_HEIGHT,
  HBC_CONNECTIVITY_HEIGHT_ONLINE,
  HBC_CONNECTIVITY_HEIGHT_OFFLINE,
  HBC_SIDEBAR_WIDTH_COLLAPSED,
  HBC_SIDEBAR_WIDTH_EXPANDED,
  HBC_BOTTOM_NAV_HEIGHT,
} from './HbcAppShell/constants.js';

export type {
  ConnectivityStatus,
  HbcConnectivityBarProps,
  HbcAppShellProps,
  SidebarNavGroup,
  ShellUser,
} from './HbcAppShell/index.js';

export { HbcAnchoredPopover as Popover } from './HbcAnchoredPopover/index.js';
export type { HbcAnchoredPopoverProps as PopoverProps } from './HbcAnchoredPopover/index.js';
