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
import { resolvePriorityRailDeviceForContainer } from '../../homepage/data/priorityActionsPresentation.js';
import {
  partitionItems,
  resolveLauncherDeviceClass,
} from '../../homepage/data/priorityActionsLauncherAdapter.js';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';

export interface HbHomepageLauncherBandProps {
  bandKey?: string;
  activeAudience?: string;
}

interface ContainerDimensions {
  width: number;
  height: number;
}

const DEFAULT_DIMENSIONS: ContainerDimensions = { width: 1200, height: 800 };

function extractDimensions(
  entry: ResizeObserverEntry,
  el: HTMLElement,
): ContainerDimensions {
  const contentBox = Array.isArray(entry.contentBoxSize)
    ? entry.contentBoxSize[0]
    : entry.contentBoxSize;
  if (
    contentBox &&
    typeof contentBox.inlineSize === 'number' &&
    typeof contentBox.blockSize === 'number'
  ) {
    return { width: contentBox.inlineSize, height: contentBox.blockSize };
  }
  if (entry.contentRect) {
    return { width: entry.contentRect.width, height: entry.contentRect.height };
  }
  return {
    width: el.clientWidth || DEFAULT_DIMENSIONS.width,
    height: el.clientHeight || DEFAULT_DIMENSIONS.height,
  };
}

function useContainerDimensions(
  ref: React.RefObject<HTMLElement | null>,
): ContainerDimensions {
  const [dimensions, setDimensions] = React.useState<ContainerDimensions>(DEFAULT_DIMENSIONS);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const sync = (): void => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    sync();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        const entry = entries.find((c) => c.target === el) ?? entries[0];
        if (!entry) return;
        setDimensions(extractDimensions(entry, el));
      });
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [ref]);

  return dimensions;
}

export function HbHomepageLauncherBand({
  bandKey,
  activeAudience,
}: HbHomepageLauncherBandProps): React.JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const dimensions = useContainerDimensions(containerRef);
  const resolution = resolvePriorityRailDeviceForContainer(dimensions);
  const deviceClass: HomepageLauncherDeviceClass = resolveLauncherDeviceClass(
    resolution,
    dimensions.width,
  );
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
      ref={containerRef}
      data-hb-homepage-launcher-band="root"
      data-hbc-launcher-device-class={deviceClass}
      data-hbc-launcher-shell-state={resolution.shellState}
      data-hbc-launcher-entry-reason={resolution.entryStateReason}
      data-hbc-launcher-short-height={resolution.shortHeightConstrained ? 'true' : 'false'}
    >
      {content}
    </div>
  );
}
