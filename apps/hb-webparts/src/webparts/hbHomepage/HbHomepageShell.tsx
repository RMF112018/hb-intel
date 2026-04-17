import * as React from 'react';
import { createSharePointUserPhotoResolver } from '../../homepage/helpers/peopleCultureProfilePhotoResolver.js';
import type { HbHomepageProps, HbHomepageZoneProps } from './hbHomepageContract.js';
import { parseShellLayout, extractModuleConfigSlices } from './shell/shellValidation.js';
import { getOccupant } from './shell/occupantRegistry.js';
import { useShellContainer } from './shell/useShellContainer.js';
import { resolveBandLayout } from './shell/slotComfortResolver.js';
import type { OccupantId, ShellBand as ShellBandType, ShellEntryState } from './shell/shellTypes.js';
import type { BandLayoutResult, ResolvedSlot } from './shell/slotComfortResolver.js';
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
  if (!descriptor || descriptor.status !== 'active') return null;

  const ZoneComponent = ZONE_COMPONENTS[slot.occupantId];
  if (!ZoneComponent) return null;

  const effectiveSpan = comfort.effectiveColumnSpan;

  return (
    <div
      className={`${styles.slot} ${styles[`slot_${slot.role}`]} ${styles[`span_${effectiveSpan}`]}`}
      data-shell-slot={slot.id}
      data-shell-occupant={slot.occupantId}
      data-shell-slot-role={slot.role}
      data-shell-column-span={effectiveSpan}
      data-shell-comfort-reason={comfort.reason}
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
