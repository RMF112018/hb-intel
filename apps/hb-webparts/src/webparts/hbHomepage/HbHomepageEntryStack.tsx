import * as React from 'react';
import {
  HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID,
  HB_HOMEPAGE_OUTER_ENVELOPE_MAX_WIDTH_PX,
  type HbHomepageProps,
} from './hbHomepageContract.js';
import { HbHomepageShell } from './HbHomepageShell.js';
import { HbHomepageLauncherBand } from './HbHomepageLauncherBand.js';
import { extractHbHomepageWrapperConfig } from './hbHomepageWrapperConfig.js';
import styles from './HbHomepageEntryStack.module.css';

// ---------------------------------------------------------------------------
// HB Homepage entry-stack — wrapper-owned pre-shell composition
// ---------------------------------------------------------------------------
// The flagship homepage runtime is a three-part vertical stack:
//   1. standalone hero webpart (authored separately on the page)
//   2. wrapper-owned priority-actions launcher band (this file, pre-shell)
//   3. HbHomepageShell (post-hero operating layer)
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
  const wrapperConfig = React.useMemo(
    () => extractHbHomepageWrapperConfig(props.config),
    [props.config],
  );
  const { rail } = wrapperConfig;
  const rootStyle = {
    '--hb-homepage-outer-envelope-max-width': `${HB_HOMEPAGE_OUTER_ENVELOPE_MAX_WIDTH_PX}px`,
  } as React.CSSProperties;

  return (
    <div
      className={styles.entryStack}
      data-hb-homepage-entry-stack="root"
      data-hb-homepage-entry-stack-owner="hb-homepage-wrapper"
      data-hb-homepage-outer-envelope-owner="hb-homepage-wrapper"
      data-hb-homepage-outer-envelope-max-width={HB_HOMEPAGE_OUTER_ENVELOPE_MAX_WIDTH_PX}
      data-hb-homepage-outer-envelope-contract={HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID}
      data-hb-homepage-entry-stack-rail-enabled={rail.enabled || undefined}
      style={rootStyle}
    >
      {rail.enabled ? (
        <section
          className={styles.actionsRegion}
          data-hb-homepage-entry-stack-region="priority-actions"
          data-hb-homepage-region-inset-policy="actions-strip-inner-inset"
          data-hb-homepage-region-contained-by={HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID}
          data-hb-homepage-entry-stack-order="1"
          data-hb-homepage-entry-stack-rail-band-key={rail.bandKey}
          data-hb-homepage-entry-stack-rail-audience={rail.activeAudience || undefined}
          data-hb-homepage-entry-stack-rail-surface="homepage-launcher"
          aria-label="Priority actions"
        >
          <HbHomepageLauncherBand
            bandKey={rail.bandKey}
            activeAudience={rail.activeAudience}
          />
        </section>
      ) : null}
      <div
        className={styles.shellRegion}
        data-hb-homepage-entry-stack-region="shell"
        data-hb-homepage-region-inset-policy="shell-body-inner-inset"
        data-hb-homepage-region-contained-by={HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID}
        data-hb-homepage-entry-stack-order={rail.enabled ? '2' : '1'}
      >
        <HbHomepageShell {...props} />
      </div>
    </div>
  );
}
