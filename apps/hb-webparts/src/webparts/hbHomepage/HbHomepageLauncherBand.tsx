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
 * `resolvePriorityRailDeviceForContainer`. The rail's render layer is
 * bypassed entirely in the homepage path.
 */
import * as React from 'react';
import {
  HbcHomepageLauncher,
  HbcPriorityRailEmptyState,
  HbcPriorityRailErrorState,
  HbcPriorityRailSkeleton,
  type HomepageLauncherDeviceClass,
} from '@hbc/ui-kit/homepage';
import {
  usePriorityActionsData,
  invalidatePriorityActionsCache,
} from '../../homepage/data/usePriorityActionsData.js';
import { filterByDevice } from '../../homepage/data/priorityActionsNormalization.js';
import { resolvePriorityRailDeviceForEntryState } from '../../homepage/data/priorityActionsPresentation.js';
import {
  partitionItems,
  resolveLauncherDeviceClass,
} from '../../homepage/data/priorityActionsLauncherAdapter.js';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import type { ShellContainerState } from './shell/useShellContainer.js';

export interface HbHomepageLauncherBandProps {
  bandKey?: string;
  activeAudience?: string;
  entryContainer: ShellContainerState;
}

export function HbHomepageLauncherBand({
  bandKey,
  activeAudience,
  entryContainer,
}: HbHomepageLauncherBandProps): React.JSX.Element {
  const resolution = resolvePriorityRailDeviceForEntryState(entryContainer);
  const deviceClass: HomepageLauncherDeviceClass = resolveLauncherDeviceClass(resolution);
  const { config, items, isLoading, error } = usePriorityActionsData({
    bandKey,
    activeAudience,
  });

  let content: React.JSX.Element;

  if (isLoading) {
    content = <HbcPriorityRailSkeleton count={4} />;
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
    const partition = partitionItems(
      deviceFiltered,
      deviceClass,
      resolution.shortHeightConstrained,
    );

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
        />
      );
    }
  }

  return (
    <div
      data-hb-homepage-launcher-band="root"
      data-hbc-launcher-device-class={deviceClass}
      data-hbc-launcher-shell-state={resolution.shellState}
      data-hbc-launcher-entry-reason={resolution.entryStateReason}
      data-hbc-launcher-short-height={resolution.shortHeightConstrained ? 'true' : 'false'}
      data-hbc-launcher-width={Math.round(entryContainer.width)}
      data-hbc-launcher-width-authoritative={Math.round(entryContainer.authoritativeWidth)}
      data-hbc-launcher-width-inline-inset-total={Math.round(entryContainer.shellInlineInsetTotal)}
    >
      {content}
    </div>
  );
}
