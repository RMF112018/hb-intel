import type { FC, ReactNode } from 'react';
import { PCC_MVP_SURFACES, PCC_MVP_SURFACE_IDS, type PccMvpSurfaceId } from '@hbc/models/pcc';
import {
  AlertTriangle,
  BlueprintRoll,
  ExternalLink,
  HardHat,
  Home,
  Inspection,
  Settings,
  Submittal,
} from '@hbc/ui-kit/icons';
import type { PccResponsiveMode } from '../layout/footprints';
import styles from './PccNavigationRail.module.css';

const NAV_NOOP = (): void => undefined;

const SURFACE_ICONS: Record<PccMvpSurfaceId, FC<{ size?: 'sm' | 'md' | 'lg'; 'aria-label'?: string }>> = {
  'project-home': Home,
  'team-and-access': HardHat,
  'documents': BlueprintRoll,
  'project-readiness': Inspection,
  'approvals': Submittal,
  'external-systems': ExternalLink,
  'control-center-settings': Settings,
  'site-health': AlertTriangle,
};

function railVariantForMode(mode: PccResponsiveMode): 'expanded' | 'iconOnly' | 'topStrip' | 'hamburger' {
  switch (mode) {
    case 'wideDesktop':
    case 'standardDesktop':
      return 'expanded';
    case 'tabletLandscape':
      return 'iconOnly';
    case 'tabletPortrait':
      return 'topStrip';
    case 'phone':
      return 'hamburger';
  }
}

export interface PccNavigationRailProps {
  /** Resolved responsive mode supplied by the shell. */
  mode: PccResponsiveMode;
  activeSurfaceId?: PccMvpSurfaceId;
  /** Slot rendered at the bottom of the rail (e.g., user chip). */
  footer?: ReactNode;
}

export const PccNavigationRail: FC<PccNavigationRailProps> = ({
  mode,
  activeSurfaceId,
  footer,
}) => {
  const variant = railVariantForMode(mode);

  return (
    <nav
      className={styles.rail}
      data-pcc-rail=""
      data-pcc-rail-variant={variant}
      data-pcc-mode={mode}
      aria-label="Project Control Center navigation"
    >
      <div className={styles.brandRow}>
        <span className={styles.brandMark} aria-hidden="true">HB</span>
        <span className={styles.brandLabel}>
          <span className={styles.brandLabelMark}>PCC</span>
          <span className={styles.brandLabelSubtitle}>Project Control Center</span>
        </span>
      </div>
      <ul className={styles.surfaceList}>
        {PCC_MVP_SURFACE_IDS.map((id) => {
          const surface = PCC_MVP_SURFACES[id];
          const Icon = SURFACE_ICONS[id];
          const active = activeSurfaceId === id;
          return (
            <li key={id}>
              <button
                type="button"
                className={styles.surfaceButton}
                data-pcc-surface-id={id}
                data-pcc-surface-active={active ? 'true' : 'false'}
                aria-current={active ? 'page' : undefined}
                onClick={NAV_NOOP}
              >
                <span className={styles.surfaceIcon} aria-hidden="true">
                  <Icon size="sm" aria-label="" />
                </span>
                <span className={styles.surfaceLabel}>{surface.displayName}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </nav>
  );
};

export default PccNavigationRail;
