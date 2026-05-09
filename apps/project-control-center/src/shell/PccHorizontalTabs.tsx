import {
  useId,
  useMemo,
  useRef,
  useState,
  type FC,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import type { PccMvpSurfaceId } from '@hbc/models/pcc';
import type { PccResponsiveMode } from '../layout/footprints';
import styles from './PccHorizontalTabs.module.css';

const TAB_LABELS: Record<PccMvpSurfaceId, string> = {
  'project-home': 'Project Home',
  'team-and-access': 'Team',
  documents: 'Documents',
  'project-readiness': 'Project Readiness',
  approvals: 'Approvals',
  'external-systems': 'External Platforms',
  'control-center-settings': 'Settings',
  'site-health': 'Site Health',
};

const COMPACT_MODES: ReadonlySet<PccResponsiveMode> = new Set([
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
]);

const PROJECT_HOME_CHILD_SURFACE_IDS = [
  'team-and-access',
  'external-systems',
  'control-center-settings',
  'site-health',
] as const satisfies readonly PccMvpSurfaceId[];

const TOP_LEVEL_SURFACE_IDS = [
  'project-home',
  'documents',
  'project-readiness',
  'approvals',
] as const satisfies readonly PccMvpSurfaceId[];

const PROJECT_HOME_CHILD_SET = new Set<PccMvpSurfaceId>(PROJECT_HOME_CHILD_SURFACE_IDS);

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
  const tabRefs = useRef<Record<PccMvpSurfaceId, HTMLButtonElement | null>>({
    'project-home': null,
    'team-and-access': null,
    documents: null,
    'project-readiness': null,
    approvals: null,
    'external-systems': null,
    'control-center-settings': null,
    'site-health': null,
  });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isCompact = COMPACT_MODES.has(mode);
  const [isProjectHomeMenuOpen, setProjectHomeMenuOpen] = useState(false);
  const menuId = useId();

  const selectedTopLevelSurfaceId = useMemo<(typeof TOP_LEVEL_SURFACE_IDS)[number]>(
    () =>
      PROJECT_HOME_CHILD_SET.has(activeSurfaceId)
        ? 'project-home'
        : (activeSurfaceId as (typeof TOP_LEVEL_SURFACE_IDS)[number]),
    [activeSurfaceId],
  );

  const closeProjectHomeMenu = () => {
    setProjectHomeMenuOpen(false);
  };

  const openProjectHomeMenu = () => {
    setProjectHomeMenuOpen(true);
  };

  const focusAndSelectTopLevel = (index: number) => {
    const surfaceId = TOP_LEVEL_SURFACE_IDS[index];
    if (!surfaceId) {
      return;
    }
    closeProjectHomeMenu();
    onSelectSurface(surfaceId);
    tabRefs.current[surfaceId]?.focus();
  };

  const focusProjectHomeChild = (index: number) => {
    const childId = PROJECT_HOME_CHILD_SURFACE_IDS[index];
    if (!childId) {
      return;
    }
    tabRefs.current[childId]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const activeIndex = TOP_LEVEL_SURFACE_IDS.indexOf(selectedTopLevelSurfaceId);
    if (activeIndex === -1) {
      return;
    }

    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault();
        focusAndSelectTopLevel((activeIndex + 1) % TOP_LEVEL_SURFACE_IDS.length);
        return;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        focusAndSelectTopLevel(
          (activeIndex - 1 + TOP_LEVEL_SURFACE_IDS.length) % TOP_LEVEL_SURFACE_IDS.length,
        );
        return;
      }
      case 'Home': {
        event.preventDefault();
        focusAndSelectTopLevel(0);
        return;
      }
      case 'End': {
        event.preventDefault();
        focusAndSelectTopLevel(TOP_LEVEL_SURFACE_IDS.length - 1);
        return;
      }
      case 'Escape': {
        if (!isProjectHomeMenuOpen) {
          return;
        }
        event.preventDefault();
        closeProjectHomeMenu();
        tabRefs.current['project-home']?.focus();
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
    if (surfaceId === 'project-home' && event.key === 'ArrowDown') {
      event.preventDefault();
      openProjectHomeMenu();
      focusProjectHomeChild(0);
      return;
    }
    if (PROJECT_HOME_CHILD_SET.has(surfaceId) && event.key === 'ArrowDown') {
      event.preventDefault();
      const currentIndex = PROJECT_HOME_CHILD_SURFACE_IDS.indexOf(
        surfaceId as (typeof PROJECT_HOME_CHILD_SURFACE_IDS)[number],
      );
      focusProjectHomeChild((currentIndex + 1) % PROJECT_HOME_CHILD_SURFACE_IDS.length);
      return;
    }
    if (PROJECT_HOME_CHILD_SET.has(surfaceId) && event.key === 'ArrowUp') {
      event.preventDefault();
      const currentIndex = PROJECT_HOME_CHILD_SURFACE_IDS.indexOf(
        surfaceId as (typeof PROJECT_HOME_CHILD_SURFACE_IDS)[number],
      );
      if (currentIndex === 0) {
        tabRefs.current['project-home']?.focus();
        return;
      }
      focusProjectHomeChild(currentIndex - 1);
      return;
    }
    if (PROJECT_HOME_CHILD_SET.has(surfaceId) && event.key === 'Escape') {
      event.preventDefault();
      closeProjectHomeMenu();
      tabRefs.current['project-home']?.focus();
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') {
      return;
    }
    // Prevent native button key synthesis from dispatching an additional click.
    event.preventDefault();
    if (surfaceId === 'project-home') {
      closeProjectHomeMenu();
    }
    onSelectSurface(surfaceId);
  };

  const setTabRef = (surfaceId: PccMvpSurfaceId, element: HTMLButtonElement | null) => {
    tabRefs.current[surfaceId] = element;
  };

  const handleRootBlur = (event: FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget;
    if (nextFocused instanceof Node && rootRef.current?.contains(nextFocused)) {
      return;
    }
    closeProjectHomeMenu();
  };

  const handleProjectHomePointerLeave = (event: MouseEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }
    closeProjectHomeMenu();
  };

  const renderTopLevelTab = (surfaceId: PccMvpSurfaceId) => {
    const isSelectedTopLevel = surfaceId === activeSurfaceId;
    const label = TAB_LABELS[surfaceId];
    return (
      <button
        key={surfaceId}
        ref={(el) => {
          setTabRef(surfaceId, el);
        }}
        id={`pcc-tab-${surfaceId}`}
        role="tab"
        type="button"
        aria-selected={isSelectedTopLevel}
        aria-controls={panelId}
        tabIndex={isSelectedTopLevel ? 0 : -1}
        data-pcc-tab-id={surfaceId}
        data-pcc-tab-active={isSelectedTopLevel ? 'true' : 'false'}
        data-pcc-tab-mode={mode}
        className={styles.tab}
        onKeyDown={(event) => handleTabKeyDown(event, surfaceId)}
        onClick={() => {
          closeProjectHomeMenu();
          onSelectSurface(surfaceId);
        }}
      >
        <span className={styles.label}>{label}</span>
        <span
          aria-hidden="true"
          data-pcc-tab-active-indicator=""
          data-pcc-tab-active-indicator-state={isSelectedTopLevel ? 'active' : 'inactive'}
          className={styles.activeIndicator}
        />
      </button>
    );
  };

  return (
    <div
      ref={rootRef}
      role="tablist"
      aria-label={ariaLabel}
      data-pcc-horizontal-tabs=""
      data-pcc-mode={mode}
      data-pcc-tabs-density={isCompact ? 'compact' : 'comfortable'}
      className={styles.tablist}
      onKeyDown={handleKeyDown}
      onBlur={handleRootBlur}
    >
      <div
        className={styles.projectHomeNav}
        data-pcc-surface-nav-parent="project-home"
        data-pcc-parent-active={PROJECT_HOME_CHILD_SET.has(activeSurfaceId) ? 'true' : 'false'}
        data-pcc-project-home-menu-open={isProjectHomeMenuOpen ? 'true' : 'false'}
        onMouseEnter={openProjectHomeMenu}
        onMouseLeave={handleProjectHomePointerLeave}
      >
        {renderTopLevelTab('project-home')}
        <button
          type="button"
          className={styles.projectHomeToggle}
          aria-label="Open Project Home related surfaces"
          aria-haspopup="menu"
          aria-expanded={isProjectHomeMenuOpen ? 'true' : 'false'}
          aria-controls={menuId}
          data-pcc-nav-toggle="project-home"
          onClick={() => {
            setProjectHomeMenuOpen((current) => !current);
          }}
        >
          <span aria-hidden="true">▾</span>
        </button>
        {isProjectHomeMenuOpen ? (
          <div className={styles.projectHomeMenu} id={menuId} role="presentation">
            {PROJECT_HOME_CHILD_SURFACE_IDS.map((childSurfaceId) => {
              const isChildActive = activeSurfaceId === childSurfaceId;
              const childLabel = TAB_LABELS[childSurfaceId];
              return (
                <button
                  key={childSurfaceId}
                  ref={(el) => {
                    setTabRef(childSurfaceId, el);
                  }}
                  id={`pcc-tab-${childSurfaceId}`}
                  role="tab"
                  type="button"
                  aria-selected={isChildActive}
                  aria-controls={panelId}
                  tabIndex={isChildActive ? 0 : -1}
                  data-pcc-tab-id={childSurfaceId}
                  data-pcc-surface-nav-child={childSurfaceId}
                  data-pcc-nav-child-active={isChildActive ? 'true' : 'false'}
                  data-pcc-tab-active={isChildActive ? 'true' : 'false'}
                  data-pcc-tab-mode={mode}
                  className={styles.menuTab}
                  onKeyDown={(event) => handleTabKeyDown(event, childSurfaceId)}
                  onClick={() => {
                    onSelectSurface(childSurfaceId);
                    closeProjectHomeMenu();
                  }}
                >
                  <span className={styles.label}>{childLabel}</span>
                </button>
              );
            })}
          </div>
        ) : null}
        {!isProjectHomeMenuOpen && PROJECT_HOME_CHILD_SET.has(activeSurfaceId) ? (
          <button
            type="button"
            id={`pcc-tab-${activeSurfaceId}`}
            role="tab"
            aria-selected="true"
            aria-controls={panelId}
            tabIndex={-1}
            data-pcc-tab-id={activeSurfaceId}
            data-pcc-surface-nav-child={activeSurfaceId}
            data-pcc-nav-child-active="true"
            data-pcc-sr-only-tab-label=""
            className={styles.srOnlyTabLabel}
            onClick={() => undefined}
            onKeyDown={() => undefined}
          >
            <span className={styles.label}>{TAB_LABELS[activeSurfaceId]}</span>
          </button>
        ) : null}
      </div>
      {TOP_LEVEL_SURFACE_IDS.filter((surfaceId) => surfaceId !== 'project-home').map((surfaceId) =>
        renderTopLevelTab(surfaceId),
      )}
    </div>
  );
};
