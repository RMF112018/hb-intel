// @hbc/ui-kit/app-shell — lean shell entry for SPFx customizer bundles
// PH4.4 §4.2 bundle-size path
//
// W01r-P11 (Project Sites compliance closure): `HbcThemeProvider` and
// `HbcThemeContext` are now re-exported here so productive-lane SPFx
// consumers (e.g. Project Sites) have a narrow sanctioned path for the
// theme-context wrapper without reaching into the full `@hbc/ui-kit` root
// barrel. Theme context is a shell-adjacent concern — it lives in
// `HbcAppShell/HbcThemeContext.tsx`, is consumed internally by `HbcAppShell`
// itself, and is the correct entry point for SPFx webparts that need
// light-mode enforcement at the mount boundary.

export {
  HbcConnectivityBar,
  HbcAppShell,
  HbcThemeProvider,
  HbcThemeContext,
} from './HbcAppShell/index.js';

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
export type { HbcThemeProviderProps } from './HbcAppShell/HbcThemeContext.js';

export { HbcAnchoredPopover as Popover } from './HbcAnchoredPopover/index.js';
export type { HbcAnchoredPopoverProps as PopoverProps } from './HbcAnchoredPopover/index.js';
