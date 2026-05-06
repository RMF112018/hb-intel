import type { CSSProperties, FC, ReactNode } from 'react';
import {
  HBC_ACCENT_ORANGE,
  HBC_ACCENT_ORANGE_HOVER,
  HBC_ACCENT_ORANGE_PRESSED,
  HBC_DARK_HEADER,
  HBC_HEADER_ICON_MUTED,
  HBC_HEADER_TEXT,
  HBC_RADIUS_FULL,
  HBC_RADIUS_LG,
  HBC_RADIUS_MD,
  HBC_RADIUS_SM,
  HBC_SPACE_LG,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  HBC_SPACE_XL,
  HBC_SPACE_XS,
  HBC_SPACE_XXL,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_RAMP_GRAY,
  HBC_STATUS_RAMP_GREEN,
  HBC_STATUS_RAMP_INFO,
  HBC_STATUS_RAMP_RED,
  HBC_SURFACE_LIGHT,
  elevationCard,
} from '@hbc/ui-kit/theme';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import type { PccResponsiveMode } from '../layout/footprints';
import { useContainerBreakpoint } from '../layout/useContainerBreakpoint';
import type { IPccShellHeroViewModel } from '../preview/projectShellViewModel';
import { PccHorizontalTabs } from './PccHorizontalTabs';
import { PccProjectHeroBand } from './PccProjectHeroBand';
import styles from './PccShell.module.css';
import type { PccMvpSurfaceId } from '@hbc/models/pcc';

const PCC_THEME_VARS: CSSProperties = {
  ['--pcc-color-header' as string]: HBC_DARK_HEADER,
  ['--pcc-color-header-text' as string]: HBC_HEADER_TEXT,
  ['--pcc-color-header-icon-muted' as string]: HBC_HEADER_ICON_MUTED,
  ['--pcc-color-rail' as string]: HBC_SURFACE_LIGHT['surface-0'],
  ['--pcc-color-rail-hover' as string]: HBC_SURFACE_LIGHT['surface-1'],
  ['--pcc-color-rail-pressed' as string]: HBC_SURFACE_LIGHT['surface-2'],
  ['--pcc-color-rail-accent' as string]: HBC_ACCENT_ORANGE,
  ['--pcc-color-rail-accent-hover' as string]: HBC_ACCENT_ORANGE_HOVER,
  ['--pcc-color-rail-accent-pressed' as string]: HBC_ACCENT_ORANGE_PRESSED,
  ['--pcc-color-rail-text' as string]: HBC_SURFACE_LIGHT['text-primary'],
  ['--pcc-color-rail-muted' as string]: HBC_SURFACE_LIGHT['text-muted'],
  ['--pcc-color-canvas' as string]: HBC_SURFACE_LIGHT['surface-2'],
  ['--pcc-color-card' as string]: HBC_SURFACE_LIGHT['surface-0'],
  ['--pcc-color-border' as string]: HBC_SURFACE_LIGHT['border-default'],
  ['--pcc-color-text-primary' as string]: HBC_SURFACE_LIGHT['text-primary'],
  ['--pcc-color-text-muted' as string]: HBC_SURFACE_LIGHT['text-muted'],
  ['--pcc-color-on-status' as string]: HBC_HEADER_TEXT,
  ['--pcc-status-info' as string]: HBC_STATUS_RAMP_INFO,
  ['--pcc-status-success' as string]: HBC_STATUS_RAMP_GREEN,
  ['--pcc-status-warning' as string]: HBC_STATUS_RAMP_AMBER,
  ['--pcc-status-danger' as string]: HBC_STATUS_RAMP_RED,
  ['--pcc-status-neutral' as string]: HBC_STATUS_RAMP_GRAY,
  ['--pcc-radius-sm' as string]: `${HBC_RADIUS_SM}px`,
  ['--pcc-radius-md' as string]: `${HBC_RADIUS_MD}px`,
  ['--pcc-radius-lg' as string]: `${HBC_RADIUS_LG}px`,
  ['--pcc-radius-full' as string]: `${HBC_RADIUS_FULL}px`,
  ['--pcc-space-xs' as string]: `${HBC_SPACE_XS}px`,
  ['--pcc-space-sm' as string]: `${HBC_SPACE_SM}px`,
  ['--pcc-space-md' as string]: `${HBC_SPACE_MD}px`,
  ['--pcc-space-lg' as string]: `${HBC_SPACE_LG}px`,
  ['--pcc-space-xl' as string]: `${HBC_SPACE_XL}px`,
  ['--pcc-space-xxl' as string]: `${HBC_SPACE_XXL}px`,
  ['--pcc-elevation-card' as string]: elevationCard,
};

export interface PccShellProps {
  /** Hero view-model derived from an `IProjectProfile` plus active surface. */
  heroViewModel: IPccShellHeroViewModel;
  /** Active surface — supplied by `PccApp` from `usePccShellState`. */
  activeSurfaceId: PccMvpSurfaceId;
  /** Surface-selection callback wired from `usePccShellState.setActiveSurface`. */
  onSelectSurface?: (id: PccMvpSurfaceId) => void;
  /** Test override for the responsive mode. */
  forceMode?: PccResponsiveMode;
  /** Bento grid content (cards). */
  children: ReactNode;
}

export const PccShell: FC<PccShellProps> = ({
  heroViewModel,
  activeSurfaceId,
  onSelectSurface,
  forceMode,
  children,
}) => {
  const { ref: shellRef, mode: measuredShellMode } = useContainerBreakpoint();
  const shellMode = forceMode ?? measuredShellMode;

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      style={PCC_THEME_VARS}
      data-pcc-shell="thin"
      data-pcc-shell-mode={shellMode}
    >
      <PccProjectHeroBand mode={shellMode} viewModel={heroViewModel} />
      <PccHorizontalTabs
        mode={shellMode}
        activeSurfaceId={activeSurfaceId}
        onSelectSurface={(id) => onSelectSurface?.(id)}
      />
      <main className={styles.canvas} data-pcc-canvas="">
        <PccBentoGrid forceMode={forceMode}>{children}</PccBentoGrid>
      </main>
    </div>
  );
};

export default PccShell;
