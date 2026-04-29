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
import { PccNavigationRail } from './PccNavigationRail';
import { PccProjectIntelligenceHeader } from './PccProjectIntelligenceHeader';
import styles from './PccShell.module.css';
import type { PccMvpSurfaceId } from '@hbc/models/pcc';

const PCC_THEME_VARS: CSSProperties = {
  ['--pcc-color-header' as string]: HBC_DARK_HEADER,
  ['--pcc-color-header-text' as string]: HBC_HEADER_TEXT,
  ['--pcc-color-header-icon-muted' as string]: HBC_HEADER_ICON_MUTED,
  ['--pcc-color-rail' as string]: HBC_ACCENT_ORANGE,
  ['--pcc-color-rail-hover' as string]: HBC_ACCENT_ORANGE_HOVER,
  ['--pcc-color-rail-pressed' as string]: HBC_ACCENT_ORANGE_PRESSED,
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
  projectName: string;
  subtitle: string;
  dateScope: string;
  pills: ReadonlyArray<{ label: string; tone: 'info' | 'neutral' | 'warning' }>;
  /**
   * Active surface — supplied by `PccApp` from `usePccShellState`. The shell
   * is stateless about which surface is active.
   */
  activeSurfaceId: PccMvpSurfaceId;
  /** Surface-selection callback wired from `usePccShellState.setActiveSurface`. */
  onSelectSurface?: (id: PccMvpSurfaceId) => void;
  /** Test override for the responsive mode. */
  forceMode?: PccResponsiveMode;
  /** Optional bottom-of-rail slot. */
  railFooter?: ReactNode;
  /** Bento grid content (cards). */
  children: ReactNode;
}

export const PccShell: FC<PccShellProps> = ({
  projectName,
  subtitle,
  dateScope,
  pills,
  activeSurfaceId,
  onSelectSurface,
  forceMode,
  railFooter,
  children,
}) => {
  const { ref: shellRef, mode: measuredShellMode } = useContainerBreakpoint();
  const shellMode = forceMode ?? measuredShellMode;

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      style={PCC_THEME_VARS}
      data-pcc-shell="wave-2"
      data-pcc-shell-mode={shellMode}
    >
      <div className={styles.layout} data-pcc-layout="">
        <PccNavigationRail
          mode={shellMode}
          activeSurfaceId={activeSurfaceId}
          onSelectSurface={onSelectSurface}
          footer={railFooter}
        />
        <div className={styles.workArea}>
          <PccProjectIntelligenceHeader
            projectName={projectName}
            subtitle={subtitle}
            dateScope={dateScope}
            pills={pills}
            mode={shellMode}
          />
          <main className={styles.canvas} data-pcc-canvas="">
            <PccBentoGrid forceMode={forceMode}>{children}</PccBentoGrid>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PccShell;
