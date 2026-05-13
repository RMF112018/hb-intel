import {
  useCallback,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import {
  MY_WORK_PRIMARY_NAVIGATION_SURFACES,
  getMyWorkModulesForPrimarySurface,
  isSelectableMyWorkModule,
  type MyWorkModuleId,
  type MyWorkNavigationModule,
  type MyWorkPrimarySurfaceId,
} from '@hbc/models/myWork';
import type { MyWorkResponsiveMode } from '../layout/useMyWorkContainerBreakpoint.js';
import styles from './MyWorkPrimaryNavigation.module.css';

export interface MyWorkPrimaryNavigationProps {
  readonly mode: MyWorkResponsiveMode;
  readonly activePrimarySurfaceId: MyWorkPrimarySurfaceId;
  readonly activeModuleId?: MyWorkModuleId;
  readonly onSelectPrimarySurface: (id: MyWorkPrimarySurfaceId) => void;
  readonly onSelectModule: (id: MyWorkModuleId) => void;
  /** id of the active surface panel, used for `aria-controls`. */
  readonly panelId: string;
  readonly ariaLabel?: string;
}

const COMPACT_MODES: ReadonlySet<MyWorkResponsiveMode> = new Set<MyWorkResponsiveMode>([
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
]);

const DEFAULT_ARIA_LABEL = 'My Work primary navigation';

const PRIMARY_SURFACE_IDS: readonly MyWorkPrimarySurfaceId[] =
  MY_WORK_PRIMARY_NAVIGATION_SURFACES.map((s) => s.id);

export function MyWorkPrimaryNavigation({
  mode,
  activePrimarySurfaceId,
  activeModuleId,
  onSelectPrimarySurface,
  onSelectModule,
  panelId,
  ariaLabel = DEFAULT_ARIA_LABEL,
}: MyWorkPrimaryNavigationProps) {
  const menuBaseId = useId();
  const [openMenuId, setOpenMenuId] = useState<MyWorkPrimarySurfaceId | null>(null);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<MyWorkPrimarySurfaceId, HTMLButtonElement | null>>({
    'my-work-home': null,
  });
  const moduleItemRefs = useRef<Map<MyWorkModuleId, HTMLButtonElement | null>>(new Map());

  const isCompact = COMPACT_MODES.has(mode);

  const menuIdFor = useCallback(
    (id: MyWorkPrimarySurfaceId) => `${menuBaseId}-menu-${id}`,
    [menuBaseId],
  );

  const focusPrimaryTab = useCallback((id: MyWorkPrimarySurfaceId) => {
    tabRefs.current[id]?.focus();
  }, []);

  const focusModuleAtIndex = useCallback(
    (surfaceId: MyWorkPrimarySurfaceId, rawIndex: number) => {
      const modules = getMyWorkModulesForPrimarySurface(surfaceId);
      if (modules.length === 0) return;
      const wrapped = ((rawIndex % modules.length) + modules.length) % modules.length;
      const targetId = modules[wrapped].id;
      moduleItemRefs.current.get(targetId)?.focus();
    },
    [],
  );

  const scheduleFocusFirstModule = useCallback(
    (surfaceId: MyWorkPrimarySurfaceId) => {
      queueMicrotask(() => focusModuleAtIndex(surfaceId, 0));
    },
    [focusModuleAtIndex],
  );

  const indexOfFocusedModule = useCallback((surfaceId: MyWorkPrimarySurfaceId): number => {
    const modules = getMyWorkModulesForPrimarySurface(surfaceId);
    const active = document.activeElement;
    return modules.findIndex((m) => moduleItemRefs.current.get(m.id) === active);
  }, []);

  const handleToggleClick = useCallback((id: MyWorkPrimarySurfaceId) => {
    // Mouse-driven: toggle open state and KEEP focus on the toggle. Only
    // keyboard ArrowDown moves focus into the first module item.
    setOpenMenuId((current) => (current === id ? null : id));
  }, []);

  const handlePrimaryKey = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, id: MyWorkPrimarySurfaceId) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        onSelectPrimarySurface(id);
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpenMenuId(id);
        scheduleFocusFirstModule(id);
        return;
      }
      if (event.key === 'Escape' && openMenuId !== null) {
        event.preventDefault();
        setOpenMenuId(null);
        focusPrimaryTab(id);
      }
    },
    [focusPrimaryTab, onSelectPrimarySurface, openMenuId, scheduleFocusFirstModule],
  );

  const handleToggleKey = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, id: MyWorkPrimarySurfaceId) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpenMenuId(id);
        scheduleFocusFirstModule(id);
        return;
      }
      if (event.key === 'Escape' && openMenuId === id) {
        event.preventDefault();
        setOpenMenuId(null);
        focusPrimaryTab(id);
      }
    },
    [focusPrimaryTab, openMenuId, scheduleFocusFirstModule],
  );

  const handleModuleClick = useCallback(
    (mod: MyWorkNavigationModule) => {
      if (!isSelectableMyWorkModule(mod)) return;
      onSelectModule(mod.id);
      setOpenMenuId(null);
    },
    [onSelectModule],
  );

  const handleModuleKey = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, mod: MyWorkNavigationModule) => {
      const surfaceId = mod.parentSurfaceId;
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          event.stopPropagation();
          const idx = indexOfFocusedModule(surfaceId);
          focusModuleAtIndex(surfaceId, idx + 1);
          return;
        }
        case 'ArrowUp': {
          event.preventDefault();
          event.stopPropagation();
          const idx = indexOfFocusedModule(surfaceId);
          focusModuleAtIndex(surfaceId, idx - 1);
          return;
        }
        case 'Home': {
          event.preventDefault();
          event.stopPropagation();
          focusModuleAtIndex(surfaceId, 0);
          return;
        }
        case 'End': {
          event.preventDefault();
          event.stopPropagation();
          const modules = getMyWorkModulesForPrimarySurface(surfaceId);
          focusModuleAtIndex(surfaceId, modules.length - 1);
          return;
        }
        case 'Escape': {
          event.preventDefault();
          event.stopPropagation();
          setOpenMenuId(null);
          focusPrimaryTab(surfaceId);
          return;
        }
        case 'Enter':
        case ' ':
        case 'Spacebar': {
          event.preventDefault();
          event.stopPropagation();
          if (!isSelectableMyWorkModule(mod)) return;
          onSelectModule(mod.id);
          setOpenMenuId(null);
          return;
        }
        default:
          return;
      }
    },
    [focusModuleAtIndex, focusPrimaryTab, indexOfFocusedModule, onSelectModule],
  );

  const handleTablistKey = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowRight' &&
        event.key !== 'Home' &&
        event.key !== 'End'
      ) {
        return;
      }
      // Single-tab MVP: tab cycling is a no-op but the handler keeps the
      // tablist contract intact for when additional primary surfaces land.
      const count = PRIMARY_SURFACE_IDS.length;
      if (count === 0) return;
      const activeIdx = PRIMARY_SURFACE_IDS.indexOf(activePrimarySurfaceId);
      if (activeIdx < 0) return;
      let nextIdx = activeIdx;
      switch (event.key) {
        case 'ArrowRight':
          nextIdx = (activeIdx + 1) % count;
          break;
        case 'ArrowLeft':
          nextIdx = (activeIdx - 1 + count) % count;
          break;
        case 'Home':
          nextIdx = 0;
          break;
        case 'End':
          nextIdx = count - 1;
          break;
      }
      const targetId = PRIMARY_SURFACE_IDS[nextIdx];
      if (targetId === activePrimarySurfaceId) return;
      event.preventDefault();
      onSelectPrimarySurface(targetId);
      focusPrimaryTab(targetId);
    },
    [activePrimarySurfaceId, focusPrimaryTab, onSelectPrimarySurface],
  );

  const handleRootBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget;
    if (nextFocused instanceof Node && rootRef.current?.contains(nextFocused)) {
      return;
    }
    queueMicrotask(() => {
      if (rootRef.current?.contains(document.activeElement)) return;
      setOpenMenuId(null);
    });
  }, []);

  return (
    <div
      ref={rootRef}
      role="tablist"
      aria-label={ariaLabel}
      className={styles.tablist}
      data-my-work-primary-navigation=""
      data-my-work-mode={mode}
      data-my-work-tabs-density={isCompact ? 'compact' : 'comfortable'}
      onKeyDown={handleTablistKey}
      onBlur={handleRootBlur}
    >
      {MY_WORK_PRIMARY_NAVIGATION_SURFACES.map((surface) => {
        const isSelected = surface.id === activePrimarySurfaceId;
        const isMenuOpen = openMenuId === surface.id;
        const modules = getMyWorkModulesForPrimarySurface(surface.id);
        return (
          <div
            key={surface.id}
            className={styles.primaryGroup}
            data-my-work-surface-nav-parent={surface.id}
            data-my-work-parent-active={isSelected ? 'true' : 'false'}
            data-my-work-module-menu-open={isMenuOpen ? 'true' : 'false'}
          >
            <button
              ref={(el) => {
                tabRefs.current[surface.id] = el;
              }}
              id={`my-work-tab-${surface.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              className={styles.tab}
              data-my-work-tab-id={surface.id}
              data-my-work-tab-active={isSelected ? 'true' : 'false'}
              onClick={() => onSelectPrimarySurface(surface.id)}
              onKeyDown={(event) => handlePrimaryKey(event, surface.id)}
            >
              <span className={styles.label}>{surface.label}</span>
              <span
                aria-hidden="true"
                className={styles.activeIndicator}
                data-my-work-tab-active-indicator=""
                data-my-work-tab-active-indicator-state={isSelected ? 'active' : 'inactive'}
              />
            </button>

            <button
              type="button"
              className={styles.toggle}
              aria-label={`Open ${surface.label} modules`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen ? 'true' : 'false'}
              aria-controls={menuIdFor(surface.id)}
              data-my-work-module-launcher={surface.id}
              onClick={() => handleToggleClick(surface.id)}
              onKeyDown={(event) => handleToggleKey(event, surface.id)}
            >
              <span aria-hidden="true">▾</span>
            </button>

            {isMenuOpen ? (
              <div
                id={menuIdFor(surface.id)}
                role="menu"
                className={styles.moduleMenu}
                data-my-work-module-menu={surface.id}
                data-my-work-module-menu-density={isCompact ? 'compact' : 'comfortable'}
              >
                {modules.map((mod) => {
                  const isActive = mod.id === activeModuleId;
                  return (
                    <button
                      key={mod.id}
                      ref={(el) => {
                        moduleItemRefs.current.set(mod.id, el);
                      }}
                      type="button"
                      role="menuitem"
                      className={styles.moduleItem}
                      aria-disabled={mod.selectable ? undefined : 'true'}
                      data-my-work-module-menu-item={mod.id}
                      data-my-work-module-parent-surface={mod.parentSurfaceId}
                      data-my-work-module-state={mod.state}
                      data-my-work-module-selectable={mod.selectable ? 'true' : 'false'}
                      data-my-work-module-active={isActive ? 'true' : 'false'}
                      onClick={() => handleModuleClick(mod)}
                      onKeyDown={(event) => handleModuleKey(event, mod)}
                    >
                      <span className={styles.moduleLabel}>{mod.label}</span>
                      <span
                        className={styles.moduleState}
                        data-my-work-module-state-label={mod.state}
                      >
                        {mod.stateLabel}
                      </span>
                      <span className={styles.moduleSummary}>{mod.summary}</span>
                      <span className={styles.moduleAuthority}>{mod.authorityCue}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
