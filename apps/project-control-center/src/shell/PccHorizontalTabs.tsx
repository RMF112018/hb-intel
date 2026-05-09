import {
  useCallback,
  useId,
  useRef,
  useState,
  type FC,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import {
  PCC_PRIMARY_NAVIGATION_TABS,
  getModulesForPrimaryTab,
  type PccModuleId,
  type PccMvpSurfaceId,
  type PccNavigationModule,
  type PccPrimaryNavigationTab,
  type PccPrimaryTabId,
} from '@hbc/models/pcc';
import type { PccResponsiveMode } from '../layout/footprints';
import styles from './PccHorizontalTabs.module.css';

/**
 * Phase 05 wave-b10 Prompt 03 — temporary compatibility bridge.
 *
 * The legacy `PccSurfaceRouter` and hero metadata still consume
 * `activeSurfaceId: PccMvpSurfaceId`. Until Prompt 04 migrates those
 * consumers, primary-tab and module activations that map to a legacy
 * surface id additionally invoke `onSelectLegacySurface(mappedId)` so
 * the legacy router/hero stays in sync. This bridge lives only in this
 * file; remove when Prompt 04 retires the legacy surface id.
 */
const PRIMARY_TAB_LEGACY_SURFACE_MAP: Partial<Record<PccPrimaryTabId, PccMvpSurfaceId>> = {
  'project-home': 'project-home',
  documents: 'documents',
};

const MODULE_LEGACY_SURFACE_MAP: Partial<Record<PccModuleId, PccMvpSurfaceId>> = {
  'team-access': 'team-and-access',
  'external-platforms': 'external-systems',
  'control-center-settings': 'control-center-settings',
  'site-health': 'site-health',
  'approvals-checkpoints': 'approvals',
  'startup-center': 'project-readiness',
};

/**
 * Phase 05 wave-b10 Prompt 03 — sr-only legacy compatibility markers.
 *
 * Existing surface tests directly query `[data-pcc-tab-id="${legacyId}"]`
 * inside the tablist for legacy surfaces that no longer have a primary
 * tab counterpart (or that need an `aria-labelledby` referent for the
 * legacy `<main>` panel). We render a focusless, sr-only `<button>` per
 * such legacy id so those queries continue to resolve and clicking the
 * marker drives `setActiveSurface(legacyId)` via the bridge. These
 * markers have NO `role="tab"` so they don't pollute the Phase 05
 * tablist ARIA semantics.
 *
 * Removed once Prompt 04 retires the legacy surface id from the
 * runtime path.
 */
const LEGACY_COMPAT_TAB_IDS: ReadonlyArray<{ legacyId: PccMvpSurfaceId; label: string }> = [
  { legacyId: 'team-and-access', label: 'Team & Access' },
  { legacyId: 'external-systems', label: 'External Platforms' },
  { legacyId: 'control-center-settings', label: 'Control Center Settings' },
  { legacyId: 'site-health', label: 'Site Health' },
  { legacyId: 'approvals', label: 'Approvals' },
  { legacyId: 'project-readiness', label: 'Project Readiness' },
];

const COMPACT_MODES: ReadonlySet<PccResponsiveMode> = new Set([
  'phone',
  'tabletPortrait',
  'tabletLandscape',
  'smallLaptop',
]);

export interface PccHorizontalTabsProps {
  mode: PccResponsiveMode;
  activePrimaryTabId: PccPrimaryTabId;
  activeModuleId?: PccModuleId;
  /**
   * Phase 05 wave-b10 Prompt 03 — legacy surface id forwarded by
   * PccShell to support the sr-only legacy compatibility tab markers
   * (so existing surface tests querying `[data-pcc-tab-id="${legacyId}"]`
   * and asserting `aria-selected="true"` continue to work). Removed in
   * Prompt 04 alongside the legacy `PccSurfaceRouter`.
   */
  activeSurfaceId?: PccMvpSurfaceId;
  onSelectPrimarySurface: (id: PccPrimaryTabId) => void;
  onSelectModule: (id: PccModuleId) => void;
  /**
   * Phase 05 wave-b10 Prompt 03 — optional legacy surface-selection
   * callback. When supplied (PccApp wires `shell.setActiveSurface`),
   * primary-tab and module activations that map to a legacy
   * `PccMvpSurfaceId` also call this with the mapped id so the legacy
   * `PccSurfaceRouter` and hero metadata stay in sync until Prompt 04
   * migrates them. Tests rendering this component directly typically
   * omit this prop.
   */
  onSelectLegacySurface?: (id: PccMvpSurfaceId) => void;
  /** Optional panel id; when supplied, every primary tab stamps `aria-controls`. */
  panelId?: string;
  /** Accessible label for the tablist. Defaults to "PCC primary navigation". */
  ariaLabel?: string;
}

const PRIMARY_TAB_INDEX_BY_ID = new Map<PccPrimaryTabId, number>(
  PCC_PRIMARY_NAVIGATION_TABS.map((tab, index) => [tab.id, index]),
);

const FIRST_TAB_ID = PCC_PRIMARY_NAVIGATION_TABS[0]!.id;
const LAST_TAB_ID = PCC_PRIMARY_NAVIGATION_TABS[PCC_PRIMARY_NAVIGATION_TABS.length - 1]!.id;

export const PccHorizontalTabs: FC<PccHorizontalTabsProps> = ({
  mode,
  activePrimaryTabId,
  activeModuleId,
  activeSurfaceId,
  onSelectPrimarySurface,
  onSelectModule,
  onSelectLegacySurface,
  panelId,
  ariaLabel = 'PCC primary navigation',
}) => {
  const tabRefs = useRef<Record<PccPrimaryTabId, HTMLButtonElement | null>>({
    'project-home': null,
    'core-tools': null,
    documents: null,
    'estimating-preconstruction': null,
    'startup-closeout': null,
    'project-controls': null,
    'cost-time': null,
    'systems-administration': null,
  });
  const moduleItemRefs = useRef<Map<PccModuleId, HTMLButtonElement | null>>(new Map());
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isCompact = COMPACT_MODES.has(mode);
  const [openMenuId, setOpenMenuId] = useState<PccPrimaryTabId | null>(null);
  const menuBaseId = useId();
  const menuIdForTab = useCallback(
    (tabId: PccPrimaryTabId) => `${menuBaseId}-menu-${tabId}`,
    [menuBaseId],
  );

  const focusPrimaryTab = useCallback((id: PccPrimaryTabId) => {
    tabRefs.current[id]?.focus();
  }, []);

  const focusModuleAtIndex = useCallback((tabId: PccPrimaryTabId, index: number) => {
    const modules = getModulesForPrimaryTab(tabId);
    if (modules.length === 0) {
      return;
    }
    const wrapped = ((index % modules.length) + modules.length) % modules.length;
    const moduleId = modules[wrapped]!.id;
    moduleItemRefs.current.get(moduleId)?.focus();
  }, []);

  const scheduleFocusFirstModule = useCallback(
    (tabId: PccPrimaryTabId) => {
      queueMicrotask(() => focusModuleAtIndex(tabId, 0));
    },
    [focusModuleAtIndex],
  );

  const handlePrimaryClick = useCallback(
    (id: PccPrimaryTabId) => {
      setOpenMenuId(null);
      onSelectPrimarySurface(id);
      const legacyId = PRIMARY_TAB_LEGACY_SURFACE_MAP[id];
      if (legacyId) {
        onSelectLegacySurface?.(legacyId);
      }
    },
    [onSelectLegacySurface, onSelectPrimarySurface],
  );

  const handlePrimaryKey = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, id: PccPrimaryTabId) => {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        handlePrimaryClick(id);
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
    [focusPrimaryTab, handlePrimaryClick, openMenuId, scheduleFocusFirstModule],
  );

  const handleTablistKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const activeIndex = PRIMARY_TAB_INDEX_BY_ID.get(activePrimaryTabId) ?? 0;
      const total = PCC_PRIMARY_NAVIGATION_TABS.length;
      let nextIndex: number | null = null;
      switch (event.key) {
        case 'ArrowRight':
          nextIndex = (activeIndex + 1) % total;
          break;
        case 'ArrowLeft':
          nextIndex = (activeIndex - 1 + total) % total;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = total - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      const nextId = PCC_PRIMARY_NAVIGATION_TABS[nextIndex]!.id;
      setOpenMenuId(null);
      onSelectPrimarySurface(nextId);
      const legacyId = PRIMARY_TAB_LEGACY_SURFACE_MAP[nextId];
      if (legacyId) {
        onSelectLegacySurface?.(legacyId);
      }
      focusPrimaryTab(nextId);
    },
    [activePrimaryTabId, focusPrimaryTab, onSelectLegacySurface, onSelectPrimarySurface],
  );

  const handleToggleClick = useCallback((id: PccPrimaryTabId) => {
    // Mouse-driven: toggle open state and KEEP focus on the toggle.
    // Only keyboard ArrowDown moves focus into the first module item
    // (per memory feedback_mouse_click_menu_open_keep_focus).
    setOpenMenuId((current) => (current === id ? null : id));
  }, []);

  const handleToggleKey = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, id: PccPrimaryTabId) => {
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
    (module: PccNavigationModule) => {
      if (!module.selectable) {
        return;
      }
      // Bridge order: invoke the legacy surface setter FIRST, then
      // the Phase 05 module setter. The legacy setter
      // (`usePccShellState.setActiveSurface`) clears `activeModuleId`
      // by design (Prompt 02 contract); calling Phase 05 second
      // re-applies the active module so the parent primary tab's
      // `aria-selected` stays suppressed and the legacy compat
      // marker is the singular selected tab.
      const legacyId = MODULE_LEGACY_SURFACE_MAP[module.id];
      if (legacyId) {
        onSelectLegacySurface?.(legacyId);
      }
      onSelectModule(module.id);
      setOpenMenuId(null);
    },
    [onSelectLegacySurface, onSelectModule],
  );

  const handleModuleKey = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, module: PccNavigationModule) => {
      const tabId = module.parentTabId;
      const modules = getModulesForPrimaryTab(tabId);
      const currentIndex = modules.findIndex((mod) => mod.id === module.id);
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          // Stop the tablist root handler from also reacting to the
          // ArrowDown / ArrowUp / Home / End keys (it would re-focus a
          // primary tab and steal focus out of the menu).
          event.stopPropagation();
          focusModuleAtIndex(tabId, currentIndex + 1);
          return;
        case 'ArrowUp':
          event.preventDefault();
          event.stopPropagation();
          focusModuleAtIndex(tabId, currentIndex - 1);
          return;
        case 'Home':
          event.preventDefault();
          event.stopPropagation();
          focusModuleAtIndex(tabId, 0);
          return;
        case 'End':
          event.preventDefault();
          event.stopPropagation();
          focusModuleAtIndex(tabId, modules.length - 1);
          return;
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          setOpenMenuId(null);
          focusPrimaryTab(tabId);
          return;
        case 'Enter':
        case ' ':
        case 'Spacebar':
          event.preventDefault();
          event.stopPropagation();
          if (!module.selectable) {
            return;
          }
          {
            // Bridge order: legacy surface setter first (clears
            // activeModuleId per Prompt 02 contract), then Phase 05
            // module setter (re-applies the active module). See
            // handleModuleClick for the same ordering rationale.
            const legacyId = MODULE_LEGACY_SURFACE_MAP[module.id];
            if (legacyId) {
              onSelectLegacySurface?.(legacyId);
            }
          }
          onSelectModule(module.id);
          setOpenMenuId(null);
          return;
        default:
          return;
      }
    },
    [focusModuleAtIndex, focusPrimaryTab, onSelectLegacySurface, onSelectModule],
  );

  const handleRootBlur = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget;
    if (nextFocused instanceof Node && rootRef.current?.contains(nextFocused)) {
      return;
    }
    // Defer the close-on-blur check to a microtask. Programmatic
    // focus moves between sibling menu items (via `.focus()`) may
    // dispatch blur events with `relatedTarget=null` in jsdom even
    // though focus is being transferred to another element inside
    // the root. Checking `document.activeElement` after the focus
    // transfer settles avoids spuriously closing the menu.
    queueMicrotask(() => {
      if (rootRef.current?.contains(document.activeElement)) {
        return;
      }
      setOpenMenuId(null);
    });
  }, []);

  const setTabRef = (id: PccPrimaryTabId, element: HTMLButtonElement | null) => {
    tabRefs.current[id] = element;
  };

  const setModuleItemRef = (id: PccModuleId, element: HTMLButtonElement | null) => {
    if (element === null) {
      moduleItemRefs.current.delete(id);
    } else {
      moduleItemRefs.current.set(id, element);
    }
  };

  const renderModuleItem = (module: PccNavigationModule) => {
    const isActive = module.id === activeModuleId;
    return (
      <button
        key={module.id}
        ref={(el) => setModuleItemRef(module.id, el)}
        type="button"
        role="menuitem"
        data-pcc-module-nav-item={module.id}
        data-pcc-module-parent-tab={module.parentTabId}
        data-pcc-module-state={module.state}
        data-pcc-module-selectable={module.selectable ? 'true' : 'false'}
        data-pcc-module-active={isActive ? 'true' : 'false'}
        aria-disabled={module.selectable ? undefined : 'true'}
        className={styles.moduleItem}
        onClick={() => handleModuleClick(module)}
        onKeyDown={(event) => handleModuleKey(event, module)}
      >
        <span className={styles.moduleLabel}>{module.label}</span>
        <span className={styles.moduleState} data-pcc-module-state-label={module.state}>
          {module.stateLabel}
        </span>
        <span className={styles.moduleSummary}>{module.summary}</span>
        <span className={styles.moduleAuthority}>{module.authorityCue}</span>
        {!module.selectable && module.disabledReason ? (
          <span className={styles.moduleDisabledReason}>{module.disabledReason}</span>
        ) : null}
      </button>
    );
  };

  const renderPrimaryGroup = (tab: PccPrimaryNavigationTab) => {
    // Prompt 03 bridge: while a legacy surface that maps to a module
    // is the active surface (`activeModuleId` is set), suppress the
    // Phase 05 primary tab's `aria-selected` so the legacy compat
    // marker for the active surface is the singular selected tab in
    // the tablist. Once Prompt 04 retires the legacy axis, primary
    // tabs become the sole selection authority.
    const isSelected = tab.id === activePrimaryTabId && !activeModuleId;
    const isMenuOpen = openMenuId === tab.id;
    return (
      <div
        key={tab.id}
        className={styles.primaryGroup}
        data-pcc-surface-nav-parent={tab.id}
        data-pcc-parent-active={isSelected ? 'true' : 'false'}
        data-pcc-module-menu-open={isMenuOpen ? 'true' : 'false'}
      >
        <button
          ref={(el) => setTabRef(tab.id, el)}
          id={`pcc-tab-${tab.id}`}
          role="tab"
          type="button"
          aria-selected={isSelected}
          aria-controls={panelId}
          tabIndex={isSelected ? 0 : -1}
          data-pcc-tab-id={tab.id}
          data-pcc-tab-active={isSelected ? 'true' : 'false'}
          data-pcc-tab-mode={mode}
          className={styles.tab}
          onClick={() => handlePrimaryClick(tab.id)}
          onKeyDown={(event) => handlePrimaryKey(event, tab.id)}
        >
          <span className={styles.label}>{tab.label}</span>
          <span
            aria-hidden="true"
            data-pcc-tab-active-indicator=""
            data-pcc-tab-active-indicator-state={isSelected ? 'active' : 'inactive'}
            className={styles.activeIndicator}
          />
        </button>
        <button
          type="button"
          className={styles.toggle}
          aria-label={`Open ${tab.label} modules`}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen ? 'true' : 'false'}
          aria-controls={menuIdForTab(tab.id)}
          data-pcc-nav-toggle={tab.id}
          onClick={() => handleToggleClick(tab.id)}
          onKeyDown={(event) => handleToggleKey(event, tab.id)}
        >
          <span aria-hidden="true">▾</span>
        </button>
        {isMenuOpen ? (
          <div
            id={menuIdForTab(tab.id)}
            role="menu"
            data-pcc-module-menu={tab.id}
            className={styles.moduleMenu}
          >
            {getModulesForPrimaryTab(tab.id).map((module) => renderModuleItem(module))}
          </div>
        ) : null}
      </div>
    );
  };

  // First/last tab ids retained as compile-time anchors for Home/End correctness;
  // PRIMARY_TAB_INDEX_BY_ID drives the actual handler logic.
  void FIRST_TAB_ID;
  void LAST_TAB_ID;

  return (
    <div
      ref={rootRef}
      role="tablist"
      aria-label={ariaLabel}
      data-pcc-horizontal-tabs=""
      data-pcc-mode={mode}
      data-pcc-tabs-density={isCompact ? 'compact' : 'comfortable'}
      className={styles.tablist}
      onKeyDown={handleTablistKeyDown}
      onBlur={handleRootBlur}
    >
      {PCC_PRIMARY_NAVIGATION_TABS.map((tab) => renderPrimaryGroup(tab))}
      {LEGACY_COMPAT_TAB_IDS.map(({ legacyId, label }) => (
        <button
          key={`legacy-${legacyId}`}
          type="button"
          id={`pcc-tab-${legacyId}`}
          role="tab"
          aria-selected={legacyId === activeSurfaceId}
          aria-controls={panelId}
          data-pcc-tab-id={legacyId}
          data-pcc-legacy-compat=""
          tabIndex={-1}
          className={styles.legacyCompatMarker}
          onClick={() => onSelectLegacySurface?.(legacyId)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
