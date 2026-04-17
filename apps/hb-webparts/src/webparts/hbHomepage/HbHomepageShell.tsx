import * as React from 'react';
import { createSharePointUserPhotoResolver } from '../../homepage/helpers/peopleCultureProfilePhotoResolver.js';
import type { HbHomepageProps, HbHomepageZoneProps } from './hbHomepageContract.js';
import { parseShellLayout, extractModuleConfigSlices } from './shell/shellValidation.js';
import { getOccupant } from './shell/occupantRegistry.js';
import { useShellContainer } from './shell/useShellContainer.js';
import { resolveBandLayout } from './shell/slotComfortResolver.js';
import type { OccupantId, ShellBand as ShellBandType, ShellLayoutState } from './shell/shellTypes.js';
import type { BandLayoutResult, ResolvedSlot } from './shell/slotComfortResolver.js';
import { ShellFallbackSurface } from './ShellFallbackSurface.js';
import { CompanyPulseZone } from './zones/CompanyPulseZone.js';
import { LeadershipMessageZone } from './zones/LeadershipMessageZone.js';
import { ProjectPortfolioSpotlightZone } from './zones/ProjectPortfolioSpotlightZone.js';
import { PeopleCulturePublicZone } from './zones/PeopleCulturePublicZone.js';
import { HbKudosZone } from './zones/HbKudosZone.js';
import styles from './HbHomepageShell.module.css';

// ---------------------------------------------------------------------------
// Zone component registry — maps occupant IDs to their zone wrappers.
// Zone wrappers own how the child is mounted; the shell owns where.
// ---------------------------------------------------------------------------

const ZONE_COMPONENTS: Readonly<Record<OccupantId, React.ComponentType<HbHomepageZoneProps>>> = {
  'company-pulse': CompanyPulseZone,
  'leadership-message': LeadershipMessageZone,
  'project-portfolio-spotlight': ProjectPortfolioSpotlightZone,
  'people-culture-public': PeopleCulturePublicZone,
  'hb-kudos': HbKudosZone,
};

// ---------------------------------------------------------------------------
// Shell slot renderer
// ---------------------------------------------------------------------------

interface ShellSlotRendererProps {
  resolved: ResolvedSlot;
  zoneProps: HbHomepageZoneProps;
}

function ShellSlotRenderer({ resolved, zoneProps }: ShellSlotRendererProps): React.JSX.Element | null {
  const { slot, comfort } = resolved;
  if (!slot.occupantId) return null;

  const descriptor = getOccupant(slot.occupantId);
  const effectiveSpan = comfort.effectiveColumnSpan;

  const slotClassName = `${styles.slot} ${styles[`slot_${slot.role}`]} ${styles[`span_${effectiveSpan}`]}`;

  if (!descriptor) {
    return (
      <div
        className={slotClassName}
        data-shell-slot={slot.id}
        data-shell-occupant={slot.occupantId}
        data-shell-slot-state="unknown"
      >
        <ShellFallbackSurface zoneName={slot.occupantId} reason="unknown-occupant" />
      </div>
    );
  }

  if (descriptor.status !== 'active') {
    return (
      <div
        className={slotClassName}
        data-shell-slot={slot.id}
        data-shell-occupant={slot.occupantId}
        data-shell-slot-state="inactive"
      >
        <ShellFallbackSurface zoneName={slot.occupantId} reason="inactive-candidate" />
      </div>
    );
  }

  const ZoneComponent = ZONE_COMPONENTS[slot.occupantId];
  if (!ZoneComponent) {
    return (
      <div
        className={slotClassName}
        data-shell-slot={slot.id}
        data-shell-occupant={slot.occupantId}
        data-shell-slot-state="invalid"
      >
        <ShellFallbackSurface zoneName={slot.occupantId} reason="invalid-assignment" />
      </div>
    );
  }

  return (
    <div
      className={slotClassName}
      data-shell-slot={slot.id}
      data-shell-occupant={slot.occupantId}
      data-shell-slot-role={slot.role}
      data-shell-column-span={effectiveSpan}
      data-shell-comfort-reason={comfort.reason}
      data-shell-slot-state="active"
    >
      <ZoneComponent {...zoneProps} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shell band renderer
// ---------------------------------------------------------------------------

interface ShellBandRendererProps {
  band: ShellBandType;
  layout: BandLayoutResult;
  isEntryBand: boolean;
  zoneProps: HbHomepageZoneProps;
}

function ShellBandRenderer({ band, layout, isEntryBand, zoneProps }: ShellBandRendererProps): React.JSX.Element | null {
  if (layout.slots.length === 0) return null;

  const bandClassName = [
    styles.band,
    isEntryBand ? styles.entryBand : '',
    layout.columns === 2 ? styles.bandPaired : styles.bandStacked,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={bandClassName}
      data-shell-band={band.id}
      data-shell-semantic-role={band.semanticRole}
      data-shell-entry-band={isEntryBand || undefined}
      data-shell-columns={layout.columns}
      role="region"
      aria-label={formatBandLabel(band.semanticRole)}
    >
      {layout.slots.map((resolved) => (
        <ShellSlotRenderer key={resolved.slot.id} resolved={resolved} zoneProps={zoneProps} />
      ))}
    </div>
  );
}

function formatBandLabel(semanticRole: string): string {
  return semanticRole
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Shell diagnostics — log validation issues for engineering visibility
// ---------------------------------------------------------------------------

function useShellDiagnostics(layoutState: ShellLayoutState): void {
  React.useEffect(() => {
    for (const d of layoutState.diagnostics) {
      const prefix = `[hb-homepage:shell]`;
      if (d.severity === 'error') {
        console.error(`${prefix} ${d.code}: ${d.message}`);
      } else if (d.severity === 'warning') {
        console.warn(`${prefix} ${d.code}: ${d.message}`);
      }
    }
  }, [layoutState.diagnostics]);
}

// ---------------------------------------------------------------------------
// Shell orchestrator — post-hero operating layer
// ---------------------------------------------------------------------------

export function HbHomepageShell({
  config,
  identity,
  assetBaseUrl,
  siteUrl,
  getGraphToken,
}: HbHomepageProps): React.JSX.Element {
  const shellRef = React.useRef<HTMLDivElement>(null);
  const container = useShellContainer(shellRef);

  const profilePhotoResolver = React.useMemo(
    () => (siteUrl ? createSharePointUserPhotoResolver({ siteUrl }) : undefined),
    [siteUrl],
  );

  const moduleConfig = React.useMemo(
    () => extractModuleConfigSlices(config),
    [config],
  );

  const layoutState = React.useMemo(
    () => parseShellLayout(config?.shellLayout),
    [config],
  );

  useShellDiagnostics(layoutState);

  const zoneProps: HbHomepageZoneProps = {
    moduleConfig,
    identity,
    assetBaseUrl,
    siteUrl,
    getGraphToken,
    profilePhotoResolver,
  };

  const bandLayouts = React.useMemo(
    () =>
      layoutState.preset.bands.map((band, index) =>
        resolveBandLayout(band, container.entryState, index === 0, container.width),
      ),
    [layoutState.preset.bands, container.entryState, container.width],
  );

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      data-shell-preset={layoutState.preset.id}
      data-shell-post-hero="true"
      data-shell-entry-state={container.entryState.id}
      data-shell-width={Math.round(container.width)}
      data-shell-diagnostics-count={layoutState.diagnostics.length}
      data-shell-normalized-from-default={layoutState.normalizedFromDefault}
    >
      {layoutState.preset.bands.map((band, index) => (
        <ShellBandRenderer
          key={band.id}
          band={band}
          layout={bandLayouts[index]}
          isEntryBand={index === 0}
          zoneProps={zoneProps}
        />
      ))}
    </div>
  );
}
