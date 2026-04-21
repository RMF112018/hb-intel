/**
 * HbHomepageLauncherBand — homepage wrapper's launcher region.
 *
 * Replaces the earlier `<PriorityActionsRail surfaceContext="homepage-flagship">`
 * that rendered a vertical tile grid beneath the hero. Renders the new
 * `@hbc/ui-kit/homepage` launcher surface (horizontal chip band) using
 * the same Priority Actions data pipeline — list-driven items, audience
 * filter, schedule filter, device filter — fed through an adapter that
 * maps to the launcher's chip contract and partitions chips into
 * primary + overflow per the binding visible-count matrix.
 *
 * Data seams preserved: `usePriorityActionsData`, `filterByDevice`,
 * `resolvePriorityRailDeviceForEntryState`. The standalone rail surface
 * remains available for adjacent embeds, but its render layer is bypassed
 * entirely in the hosted homepage path.
 */
import * as React from 'react';
import {
  HbcHomepageLauncher,
  HbcPriorityRailEmptyState,
  HbcPriorityRailErrorState,
  HbcPriorityRailSkeleton,
  type HomepageLauncherDeviceClass,
  type HomepageLauncherOverflowSectionModel,
} from '@hbc/ui-kit/homepage';
import {
  usePriorityActionsData,
  invalidatePriorityActionsCache,
} from '../../homepage/data/usePriorityActionsData.js';
import {
  filterByDevice,
  getLauncherVisibleCap,
} from '../../homepage/data/priorityActionsNormalization.js';
import { resolvePriorityRailDeviceForContainer } from '../../homepage/data/priorityActionsPresentation.js';
import {
  buildLauncherOverflowSections,
  partitionItems,
  resolveLauncherDeviceClass,
} from '../../homepage/data/priorityActionsLauncherAdapter.js';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import {
  SHELL_WIDTH_ACCOUNTING_RULE,
  SHELL_WIDTH_SOURCE,
  type ShellContainerState,
} from './shell/useShellContainer.js';
import styles from './HbHomepageLauncherBand.module.css';

export interface HbHomepageLauncherBandProps {
  bandKey?: string;
  activeAudience?: string;
  alignmentMode: 'shared-entry-governed' | 'legacy';
  entryContainer: ShellContainerState;
}

export function HbHomepageLauncherBand({
  bandKey,
  activeAudience,
  alignmentMode,
  entryContainer,
}: HbHomepageLauncherBandProps): React.JSX.Element {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [hostWidth, setHostWidth] = React.useState<number>(0);
  const measuredHostWidth = hostWidth > 0 ? hostWidth : entryContainer.width;
  const widthFitSource =
    hostWidth > 0 ? 'actions-region-container' : 'entry-container-fallback';
  const resolution = resolvePriorityRailDeviceForContainer({
    width: measuredHostWidth,
    height: entryContainer.height,
  });
  const deviceClass: HomepageLauncherDeviceClass = resolveLauncherDeviceClass(resolution);
  const { config, items, isLoading, error } = usePriorityActionsData({
    bandKey,
    activeAudience,
  });
  const skeletonCount = Math.max(
    1,
    getLauncherVisibleCap(resolution.deviceClass) - (resolution.shortHeightConstrained ? 1 : 0),
  );

  React.useEffect(() => {
    const hostElement = rootRef.current;
    if (!hostElement) return;
    const updateWidth = () => {
      setHostWidth(hostElement.getBoundingClientRect().width);
    };
    updateWidth();
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateWidth());
      observer.observe(hostElement);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  let content: React.JSX.Element;
  let visibleBudget: number | undefined;
  let primaryCount: number | undefined;
  let overflowCount: number | undefined;
  let overflowSections: HomepageLauncherOverflowSectionModel[] | undefined;
  let handheldMode: 'standard' | 'single-entry-all-tools' | undefined;
  let drawerSource: 'all-tools' | undefined;
  let capGovernance: 'binding-visible-cap' | 'all-tools-drawer' | undefined;
  let overflowStrategy: 'sheet' | 'more-tools' | undefined;

  if (isLoading) {
    content = <HbcPriorityRailSkeleton count={skeletonCount} />;
  } else if (error) {
    content = (
      <HbcPriorityRailErrorState
        title="Unable to load actions"
        description="Priority actions could not be loaded from the list."
        onRetry={() => {
          invalidatePriorityActionsCache();
          window.location.reload();
        }}
      />
    );
  } else if (!config) {
    const msg = resolveAuthoringMessage('priorityActionsRail', 'noData');
    content = <HbcPriorityRailEmptyState title={msg.title} description={msg.description} />;
  } else {
    const deviceFiltered = filterByDevice(items, resolution.deviceClass);
    // Runtime truth: homepage launcher partitioning is governed by launcher
    // constants + shell entry-state, not authored per-device layout/cap knobs.
    const partition = partitionItems(deviceFiltered, deviceClass, resolution, {
      strictShellAlignment: alignmentMode !== 'legacy',
    });
    visibleBudget = partition.visibleBudget;
    primaryCount = partition.primary.length;
    overflowCount = partition.overflow.length;
    handheldMode = resolution.launcherHandheldMode;
    drawerSource = resolution.launcherDrawerSource;
    capGovernance = resolution.launcherCapGovernance;
    overflowStrategy = resolution.launcherGovernance.overflowStrategy;
    const drawerItemsForSections =
      handheldMode === 'single-entry-all-tools'
        ? partition.overflow
        : [...partition.primary, ...partition.overflow];
    overflowSections = buildLauncherOverflowSections(drawerItemsForSections);

    if (partition.primary.length === 0 && partition.overflow.length === 0) {
      const msg = resolveAuthoringMessage('priorityActionsRail', 'noData');
      content = <HbcPriorityRailEmptyState title={msg.title} description={msg.description} />;
    } else {
      content = (
        <HbcHomepageLauncher
          title={config.showHeading ? config.headingText || 'Priority Actions' : undefined}
          primary={partition.primary}
          overflow={partition.overflow}
          overflowLabel={config.overflowLabel || 'More tools'}
          deviceClass={deviceClass}
          shortHeight={resolution.shortHeightConstrained}
          overflowMode={overflowStrategy}
          handheldMode={handheldMode}
          drawerSource={drawerSource}
          capGovernance={capGovernance}
          overflowSections={overflowSections}
        />
      );
    }
  }

  return (
    <div
      ref={rootRef}
      data-hb-homepage-launcher-band="root"
      data-hbc-launcher-blackbox-contract="prompt07-blackbox-v1"
      data-hbc-launcher-device-class={deviceClass}
      data-hbc-launcher-shell-state={resolution.shellState}
      data-hbc-launcher-entry-reason={resolution.entryStateReason}
      data-hbc-launcher-short-height={resolution.shortHeightConstrained ? 'true' : 'false'}
      data-hbc-launcher-density-posture={resolution.densityPosture}
      data-hbc-launcher-visible-budget={visibleBudget}
      data-hbc-launcher-primary-count={primaryCount}
      data-hbc-launcher-overflow-count={overflowCount}
      data-hbc-launcher-handheld-mode={handheldMode}
      data-hbc-launcher-drawer-source={drawerSource}
      data-hbc-launcher-cap-governance={capGovernance}
      data-hbc-launcher-overflow-strategy={overflowStrategy}
      data-hbc-launcher-width={Math.round(entryContainer.width)}
      data-hbc-launcher-width-authoritative={Math.round(entryContainer.authoritativeWidth)}
      data-hbc-launcher-width-inline-inset-total={Math.round(entryContainer.shellInlineInsetTotal)}
      data-hbc-launcher-host-width={Math.round(measuredHostWidth)}
      data-hbc-launcher-host-width-source={widthFitSource}
      data-hbc-launcher-width-source={SHELL_WIDTH_SOURCE}
      data-hbc-launcher-width-accounting={SHELL_WIDTH_ACCOUNTING_RULE}
      data-hbc-launcher-entry-authority="shared-entry-state"
      data-hbc-launcher-alignment-mode={alignmentMode}
    >
      <div
        className={styles.bandShell}
        data-hb-homepage-launcher-band-shell="root"
        data-hbc-launcher-device-class={deviceClass}
        data-hbc-launcher-short-height={resolution.shortHeightConstrained ? 'true' : 'false'}
      >
        {content}
      </div>
    </div>
  );
}
