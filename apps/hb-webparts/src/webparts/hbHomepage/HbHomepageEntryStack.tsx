import * as React from 'react';
import {
  HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID,
  HB_HOMEPAGE_OUTER_ENVELOPE_MAX_WIDTH_PX,
  type HbHomepageProps,
} from './hbHomepageContract.js';
import { HbSignatureHero } from '../hbSignatureHero/HbSignatureHero.js';
import { HbHomepageShell } from './HbHomepageShell.js';
import { HbHomepageLauncherBand } from './HbHomepageLauncherBand.js';
import { extractHbHomepageWrapperConfig } from './hbHomepageWrapperConfig.js';
import { useShellContainer } from './shell/useShellContainer.js';
import styles from './HbHomepageEntryStack.module.css';

// ---------------------------------------------------------------------------
// HB Homepage entry-stack — wrapper-owned pre-shell composition
// ---------------------------------------------------------------------------
// The flagship homepage runtime is a three-part vertical stack:
//   1. wrapper-owned hero region (this file, first-stage entry surface)
//   2. wrapper-owned priority-actions launcher band (this file, pre-shell)
//   3. HbHomepageShell (post-entry operating layer)
//
// The launcher band is rendered as a React surface via
// `HbHomepageLauncherBand` which internally consumes the shared
// Priority Actions data pipeline and feeds the `@hbc/ui-kit/homepage`
// `HbcHomepageLauncher` surface. This replaces the earlier
// `PriorityActionsRail` flagship path — the rail remains available for
// standalone / admin-preview mounts elsewhere but no longer governs
// the homepage render tree.
//
// Integration inputs come from the wrapper-owned config seam in
// `hbHomepageWrapperConfig.ts` — intentionally separate from
// `ModuleConfigSlices` so launcher concerns do not leak into shell
// preset / occupant / band semantics.
// ---------------------------------------------------------------------------

export function HbHomepageEntryStack(props: HbHomepageProps): React.JSX.Element {
  const entryStackRef = React.useRef<HTMLDivElement>(null);
  const shellRef = React.useRef<HTMLDivElement>(null);
  const wrapperConfig = React.useMemo(
    () => extractHbHomepageWrapperConfig(props.config),
    [props.config],
  );
  const entryContainer = useShellContainer(shellRef, entryStackRef);
  const { rail, hero } = wrapperConfig;
  const rootStyle = {
    '--hb-homepage-outer-envelope-max-width': `${HB_HOMEPAGE_OUTER_ENVELOPE_MAX_WIDTH_PX}px`,
  } as React.CSSProperties;

  return (
    <div
      ref={entryStackRef}
      className={styles.entryStack}
      data-hb-homepage-entry-stack="root"
      data-hb-homepage-entry-stack-owner="hb-homepage-wrapper"
      data-hb-homepage-outer-envelope-owner="hb-homepage-wrapper"
      data-hb-homepage-outer-envelope-max-width={HB_HOMEPAGE_OUTER_ENVELOPE_MAX_WIDTH_PX}
      data-hb-homepage-outer-envelope-contract={HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID}
      data-hb-homepage-entry-stack-rail-enabled={rail.enabled || undefined}
      data-hb-homepage-entry-stack-rail-alignment-mode={rail.alignmentMode}
      data-hb-homepage-entry-stack-hero-enabled={hero.enabled || undefined}
      data-hb-homepage-entry-state={entryContainer.entryState.id}
      data-hb-homepage-entry-state-reason={entryContainer.entryStateReason}
      data-hb-homepage-entry-state-short-height={entryContainer.shortHeightConstrained || undefined}
      style={rootStyle}
    >
      {hero.enabled ? (
        <section
          className={styles.heroRegion}
          data-hb-homepage-entry-stack-region="hero"
          data-hb-homepage-region-inset-policy="hero-surface-owned"
          data-hb-homepage-region-contained-by={HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID}
          data-hb-homepage-entry-stack-order="1"
          aria-label="Homepage hero"
        >
          <HbSignatureHero
            identity={props.identity ?? {}}
            backgroundImage={hero.backgroundImageUrl}
            assetBaseUrl={props.assetBaseUrl}
            siteUrl={props.siteUrl}
          />
        </section>
      ) : null}
      {rail.enabled ? (
        <section
          className={styles.actionsRegion}
          data-hb-homepage-entry-stack-region="priority-actions"
          data-hb-homepage-region-inset-policy="actions-strip-inner-inset"
          data-hb-homepage-region-contained-by={HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID}
          data-hb-homepage-entry-stack-order={hero.enabled ? '2' : '1'}
          data-hb-homepage-entry-stack-rail-band-key={rail.bandKey}
          data-hb-homepage-entry-stack-rail-audience={rail.activeAudience || undefined}
          data-hb-homepage-entry-stack-rail-surface="homepage-launcher"
          aria-label="Priority actions"
        >
          <HbHomepageLauncherBand
            bandKey={rail.bandKey}
            activeAudience={rail.activeAudience}
            alignmentMode={rail.alignmentMode}
            entryContainer={entryContainer}
          />
        </section>
      ) : null}
      <div
        className={styles.shellRegion}
        data-hb-homepage-entry-stack-region="shell"
        data-hb-homepage-region-inset-policy="shell-body-inner-inset"
        data-hb-homepage-region-contained-by={HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID}
        data-hb-homepage-entry-stack-order={
          hero.enabled
            ? (rail.enabled ? '3' : '2')
            : (rail.enabled ? '2' : '1')
        }
      >
        <HbHomepageShell {...props} container={entryContainer} shellRef={shellRef} />
      </div>
    </div>
  );
}
