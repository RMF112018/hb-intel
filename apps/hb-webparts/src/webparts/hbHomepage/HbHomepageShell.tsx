import * as React from 'react';
import { createSharePointUserPhotoResolver } from '../../homepage/helpers/peopleCultureProfilePhotoResolver.js';
import type { HbHomepageProps, HbHomepageZoneProps } from './hbHomepageContract.js';
import { parseShellLayout, extractModuleConfigSlices } from './shell/shellValidation.js';
import { getOccupant } from './shell/occupantRegistry.js';
import {
  SHELL_WIDTH_ACCOUNTING_RULE,
  SHELL_WIDTH_SOURCE,
} from './shell/useShellContainer.js';
import type { ShellContainerState } from './shell/useShellContainer.js';
import { resolveBandLayout } from './shell/slotComfortResolver.js';
import {
  resolveShellConformance,
  toShellConformanceDataAttributes,
} from './shell/shellConformance.js';
import {
  OccupantContentStateProvider,
  toOccupantContentStateDataAttributes,
  useOccupantContentStateReports,
} from './shell/occupantContentState.js';
import {
  resolveFirstLaneBand,
  toFirstLaneDecisionDataAttributes,
  type FirstLaneDecision,
} from './shell/firstLaneResolver.js';
import type { OccupantId, ShellBand as ShellBandType, ShellLayoutState } from './shell/shellTypes.js';
import type { BandLayoutResult, ResolvedSlot } from './shell/slotComfortResolver.js';
import { ShellFallbackSurface } from './ShellFallbackSurface.js';
import { CompanyPulseZone } from './zones/CompanyPulseZone.js';
import { LeadershipMessageZone } from './zones/LeadershipMessageZone.js';
import { ProjectPortfolioSpotlightZone } from './zones/ProjectPortfolioSpotlightZone.js';
import { PeopleCulturePublicZone } from './zones/PeopleCulturePublicZone.js';
import { HbKudosZone } from './zones/HbKudosZone.js';
import { SafetyFieldExcellenceZone } from './zones/SafetyFieldExcellenceZone.js';
import styles from './HbHomepageShell.module.css';

// ---------------------------------------------------------------------------
// Zone component registry — maps occupant IDs to their zone wrappers.
// Zone wrappers own how the child is mounted; the shell owns where.
// ---------------------------------------------------------------------------

const ZONE_COMPONENTS: Readonly<Partial<Record<OccupantId, React.ComponentType<HbHomepageZoneProps>>>> = {
  'company-pulse': CompanyPulseZone,
  'leadership-message': LeadershipMessageZone,
  'project-portfolio-spotlight': ProjectPortfolioSpotlightZone,
  'people-culture-public': PeopleCulturePublicZone,
  'hb-kudos': HbKudosZone,
  'safety-field-excellence': SafetyFieldExcellenceZone,
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
  const reports = useOccupantContentStateReports();
  if (!slot.occupantId) return null;

  const descriptor = getOccupant(slot.occupantId);
  const effectiveSpan = comfort.effectiveColumnSpan;
  const contentStateAttrs = toOccupantContentStateDataAttributes(reports.get(slot.occupantId));

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
      data-shell-render-mode={comfort.renderMode}
      data-shell-slot-state="active"
      {...contentStateAttrs}
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
  firstLaneDecision?: FirstLaneDecision;
}

const BAND_RECIPE_CLASS: Readonly<Record<ShellBandType['recipe'], string>> = {
  'feature-pair': styles.bandRecipe_feature_pair,
  'balanced-two-up': styles.bandRecipe_balanced_two_up,
  'asymmetric-two-up': styles.bandRecipe_asymmetric_two_up,
  'feature-utility-strip': styles.bandRecipe_feature_utility_strip,
  'stacked-full': styles.bandRecipe_stacked_full,
  'stacked-secondary-strip': styles.bandRecipe_stacked_secondary_strip,
  'single-column-fallback': styles.bandRecipe_single_column_fallback,
};

function ShellBandRenderer({ band, layout, isEntryBand, zoneProps, firstLaneDecision }: ShellBandRendererProps): React.JSX.Element | null {
  if (layout.slots.length === 0) return null;

  const bandClassName = [
    styles.band,
    isEntryBand ? styles.entryBand : '',
    layout.columns === 2 ? styles.bandPaired : styles.bandStacked,
    BAND_RECIPE_CLASS[layout.recipe],
  ]
    .filter(Boolean)
    .join(' ');

  const firstLaneAttrs =
    isEntryBand && firstLaneDecision ? toFirstLaneDecisionDataAttributes(firstLaneDecision) : {};

  return (
    <div
      className={bandClassName}
      data-shell-band={band.id}
      data-shell-semantic-role={band.semanticRole}
      data-shell-entry-band={isEntryBand || undefined}
      data-shell-band-recipe={layout.recipe}
      data-shell-band-fallback-recipe={layout.fallbackRecipe}
      data-shell-columns={layout.columns}
      data-shell-band-pairing-allowed={layout.pairingDecision.allowed}
      data-shell-band-pairing-reason={layout.pairingDecision.reason}
      role="region"
      aria-label={formatBandLabel(band.semanticRole)}
      {...firstLaneAttrs}
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
// This component is the HB Homepage shell. Its job is orchestration, not
// module implementation. See `hbHomepageContract.ts` for the authoritative
// shell-ownership boundary.
//
// This component owns: placement, layout governance, breakpoint governance,
// pairing/stacking decisions, preset governance, normalization and
// diagnostics, and shell-facing entry-stack integration with the hero and
// priority actions.
//
// This component MUST NOT: mutate child-zone internals, redesign child UI
// to solve fit, or reach across the zone boundary to fix a module maturity
// issue. When a zone cannot render comfortably the shell stacks, reflows,
// falls back (`ShellFallbackSurface`), or demotes — it never edits the
// child module to make it fit.
// ---------------------------------------------------------------------------

export function HbHomepageShell({
  config,
  identity,
  assetBaseUrl,
  siteUrl,
  getGraphToken,
  container,
  shellRef,
}: HbHomepageProps & {
  container: ShellContainerState;
  shellRef: React.RefObject<HTMLDivElement | null>;
}): React.JSX.Element {

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

  return (
    <OccupantContentStateProvider>
      <ShellBody
        shellRef={shellRef}
        container={container}
        layoutState={layoutState}
        zoneProps={zoneProps}
      />
    </OccupantContentStateProvider>
  );
}

interface ShellBodyProps {
  shellRef: React.RefObject<HTMLDivElement | null>;
  container: ShellContainerState;
  layoutState: ShellLayoutState;
  zoneProps: HbHomepageZoneProps;
}

function ShellBody({ shellRef, container, layoutState, zoneProps }: ShellBodyProps): React.JSX.Element {
  const reports = useOccupantContentStateReports();

  const firstLaneResolution = React.useMemo(
    () =>
      resolveFirstLaneBand({
        band: layoutState.preset.bands[0],
        reports,
        entryState: container.entryState,
      }),
    [layoutState.preset.bands, reports, container.entryState],
  );

  const resolvedBands = React.useMemo(
    () => [firstLaneResolution.band, ...layoutState.preset.bands.slice(1)],
    [firstLaneResolution.band, layoutState.preset.bands],
  );

  const bandLayouts = React.useMemo(
    () =>
      resolvedBands.map((band, index) =>
        resolveBandLayout(band, container.entryState, index === 0, container.width),
      ),
    [resolvedBands, container.entryState, container.width],
  );

  const conformance = React.useMemo(
    () =>
      resolveShellConformance({
        bands: resolvedBands,
        bandLayouts,
        entryState: container.entryState,
        shortHeightConstrained: container.shortHeightConstrained,
        firstLaneDecision: firstLaneResolution.decision,
      }),
    [
      resolvedBands,
      bandLayouts,
      container.entryState,
      container.shortHeightConstrained,
      firstLaneResolution.decision,
    ],
  );
  const conformanceAttrs = toShellConformanceDataAttributes(conformance);

  return (
    <div
      ref={shellRef as React.RefObject<HTMLDivElement>}
      className={styles.shell}
      data-shell-preset={layoutState.preset.id}
      data-shell-post-hero="true"
      data-hb-homepage-shell-inset-policy="shell-body-inner-inset"
      data-shell-entry-state={container.entryState.id}
      data-shell-entry-state-reason={container.entryStateReason}
      data-shell-width={Math.round(container.width)}
      data-shell-width-authoritative={Math.round(container.authoritativeWidth)}
      data-shell-width-inline-inset-total={Math.round(container.shellInlineInsetTotal)}
      data-shell-width-source={SHELL_WIDTH_SOURCE}
      data-shell-width-accounting={SHELL_WIDTH_ACCOUNTING_RULE}
      data-shell-height={Math.round(container.height)}
      data-shell-short-height-constrained={container.shortHeightConstrained || undefined}
      data-shell-diagnostics-count={layoutState.diagnostics.length}
      data-shell-normalized-from-default={layoutState.normalizedFromDefault}
      data-shell-first-lane-action={firstLaneResolution.decision.action}
      {...conformanceAttrs}
    >
      {resolvedBands.map((band, index) => (
        <ShellBandRenderer
          key={band.id}
          band={band}
          layout={bandLayouts[index]}
          isEntryBand={index === 0}
          zoneProps={zoneProps}
          firstLaneDecision={index === 0 ? firstLaneResolution.decision : undefined}
        />
      ))}
    </div>
  );
}
