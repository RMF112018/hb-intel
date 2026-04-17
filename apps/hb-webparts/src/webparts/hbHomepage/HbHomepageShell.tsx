import * as React from 'react';
import { createSharePointUserPhotoResolver } from '../../homepage/helpers/peopleCultureProfilePhotoResolver.js';
import type { HbHomepageProps, HbHomepageZoneProps } from './hbHomepageContract.js';
import { parseShellLayout, extractModuleConfigSlices } from './shell/shellValidation.js';
import { getOccupant } from './shell/occupantRegistry.js';
import type { OccupantId, ShellBand as ShellBandType, ShellSlot as ShellSlotType } from './shell/shellTypes.js';
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
  slot: ShellSlotType;
  zoneProps: HbHomepageZoneProps;
}

function ShellSlotRenderer({ slot, zoneProps }: ShellSlotRendererProps): React.JSX.Element | null {
  if (!slot.occupantId) return null;

  const descriptor = getOccupant(slot.occupantId);
  if (!descriptor || descriptor.status !== 'active') return null;

  const ZoneComponent = ZONE_COMPONENTS[slot.occupantId];
  if (!ZoneComponent) return null;

  return (
    <div
      className={`${styles.slot} ${styles[`slot_${slot.role}`]} ${styles[`span_${slot.columnSpan}`]}`}
      data-shell-slot={slot.id}
      data-shell-occupant={slot.occupantId}
      data-shell-slot-role={slot.role}
      data-shell-column-span={slot.columnSpan}
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
  isEntryBand: boolean;
  zoneProps: HbHomepageZoneProps;
}

function ShellBandRenderer({ band, isEntryBand, zoneProps }: ShellBandRendererProps): React.JSX.Element | null {
  const activeSlots = band.slots.filter((s) => s.occupantId !== null);
  if (activeSlots.length === 0) return null;

  const bandClassName = [
    styles.band,
    isEntryBand ? styles.entryBand : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={bandClassName}
      data-shell-band={band.id}
      data-shell-semantic-role={band.semanticRole}
      data-shell-entry-band={isEntryBand || undefined}
      role="region"
      aria-label={formatBandLabel(band.semanticRole)}
    >
      {activeSlots.map((slot) => (
        <ShellSlotRenderer key={slot.id} slot={slot} zoneProps={zoneProps} />
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

  return (
    <div
      className={styles.shell}
      data-shell-preset={layoutState.preset.id}
      data-shell-post-hero="true"
    >
      {layoutState.preset.bands.map((band, index) => (
        <ShellBandRenderer
          key={band.id}
          band={band}
          isEntryBand={index === 0}
          zoneProps={zoneProps}
        />
      ))}
    </div>
  );
}
