import { useRef, type CSSProperties, type FC, type KeyboardEvent, type ReactNode } from 'react';
import { PCC_MVP_SURFACE_IDS, type PccMvpSurfaceId } from '@hbc/models/pcc';
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
import { HBC_ACCENT_ORANGE } from '@hbc/ui-kit/theme';
import type { PccResponsiveMode } from '../layout/footprints';
import styles from './PccHorizontalTabs.module.css';

const TAB_LABELS: Record<PccMvpSurfaceId, string> = {
  'project-home': 'Project Home',
  'team-and-access': 'Team',
  documents: 'Documents',
  'project-readiness': 'Project Readiness',
  approvals: 'Approvals',
  'external-systems': 'Apps',
  'control-center-settings': 'Settings',
  'site-health': 'Site Health',
};

type IconComponent = FC<{ size?: 'sm' | 'md' | 'lg'; 'aria-label'?: string }>;

const TAB_ICONS: Record<PccMvpSurfaceId, IconComponent> = {
  'project-home': Home,
  'team-and-access': HardHat,
  documents: BlueprintRoll,
  'project-readiness': Inspection,
  approvals: Submittal,
  'external-systems': ExternalLink,
  'control-center-settings': Settings,
  'site-health': AlertTriangle,
};

const COMPACT_MODES: ReadonlySet<PccResponsiveMode> = new Set([
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
]);

export interface PccHorizontalTabsProps {
  mode: PccResponsiveMode;
  activeSurfaceId: PccMvpSurfaceId;
  onSelectSurface: (id: PccMvpSurfaceId) => void;
  /** Optional panel id; when supplied, every tab stamps `aria-controls`. */
  panelId?: string;
  /** Accessible label for the tablist. Defaults to "PCC primary navigation". */
  ariaLabel?: string;
}

export const PccHorizontalTabs: FC<PccHorizontalTabsProps> = ({
  mode,
  activeSurfaceId,
  onSelectSurface,
  panelId,
  ariaLabel = 'PCC primary navigation',
}) => {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isCompact = COMPACT_MODES.has(mode);

  const focusAndSelect = (index: number) => {
    const surfaceId = PCC_MVP_SURFACE_IDS[index];
    if (!surfaceId) return;
    onSelectSurface(surfaceId);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const activeIndex = PCC_MVP_SURFACE_IDS.indexOf(activeSurfaceId);
    if (activeIndex === -1) return;

    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault();
        focusAndSelect((activeIndex + 1) % PCC_MVP_SURFACE_IDS.length);
        return;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        focusAndSelect((activeIndex - 1 + PCC_MVP_SURFACE_IDS.length) % PCC_MVP_SURFACE_IDS.length);
        return;
      }
      case 'Home': {
        event.preventDefault();
        focusAndSelect(0);
        return;
      }
      case 'End': {
        event.preventDefault();
        focusAndSelect(PCC_MVP_SURFACE_IDS.length - 1);
        return;
      }
      default:
        return;
    }
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    surfaceId: PccMvpSurfaceId,
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
      return;
    }
    // Prevent native button key synthesis from dispatching an additional click.
    event.preventDefault();
    onSelectSurface(surfaceId);
  };

  const themeVars: CSSProperties = {
    ['--pcc-tabs-accent' as string]: HBC_ACCENT_ORANGE,
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      data-pcc-horizontal-tabs=""
      data-pcc-mode={mode}
      data-pcc-tabs-density={isCompact ? 'compact' : 'comfortable'}
      className={styles.tablist}
      style={themeVars}
      onKeyDown={handleKeyDown}
    >
      {PCC_MVP_SURFACE_IDS.map((surfaceId, index) => {
        const isActive = surfaceId === activeSurfaceId;
        const Icon = TAB_ICONS[surfaceId];
        const label = TAB_LABELS[surfaceId];
        const iconNode: ReactNode = (
          <span aria-hidden="true" className={styles.icon}>
            <Icon size="sm" />
          </span>
        );
        return (
          <button
            key={surfaceId}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            id={`pcc-tab-${surfaceId}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={panelId}
            tabIndex={isActive ? 0 : -1}
            data-pcc-tab-id={surfaceId}
            data-pcc-tab-active={isActive ? 'true' : 'false'}
            data-pcc-tab-mode={mode}
            className={styles.tab}
            onKeyDown={(event) => handleTabKeyDown(event, surfaceId)}
            onClick={() => onSelectSurface(surfaceId)}
          >
            {iconNode}
            <span className={styles.label}>{label}</span>
            <span
              aria-hidden="true"
              data-pcc-tab-active-indicator=""
              data-pcc-tab-active-indicator-state={isActive ? 'active' : 'inactive'}
              className={styles.activeIndicator}
            />
          </button>
        );
      })}
    </div>
  );
};
