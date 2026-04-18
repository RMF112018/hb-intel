import * as React from 'react';
import {
  HB_HOMEPAGE_OUTER_ENVELOPE_CONTRACT_ID,
  HB_HOMEPAGE_OUTER_ENVELOPE_MAX_WIDTH_PX,
  type HbHomepageProps,
} from './hbHomepageContract.js';
import { HbHomepageShell } from './HbHomepageShell.js';
import { PriorityActionsRail } from '../priorityActionsRail/PriorityActionsRail.js';
import { extractHbHomepageWrapperConfig } from './hbHomepageWrapperConfig.js';
import styles from './HbHomepageEntryStack.module.css';

// ---------------------------------------------------------------------------
// HB Homepage entry-stack — wrapper-owned pre-shell composition
// ---------------------------------------------------------------------------
// The flagship homepage runtime is a three-part vertical stack:
//   1. standalone hero webpart (authored separately on the page)
//   2. wrapper-owned priority-actions region (this file, pre-shell)
//   3. HbHomepageShell (post-hero operating layer)
//
// The embedded PriorityActionsRail is rendered as a React surface here —
// it is NOT a shell occupant, preset slot, or band member. The standalone
// PriorityActionsRail webpart remains independently mountable for non-
// homepage contexts. See prior art: `zones/HbKudosZone.tsx` for the
// "embed the React surface, not the SPFx webpart" pattern.
//
// Integration inputs for the embedded rail come from the wrapper-owned
// config seam in `hbHomepageWrapperConfig.ts` — intentionally separate
// from `ModuleConfigSlices` so rail concerns do not leak into shell
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
          data-hb-homepage-entry-stack-rail-context="homepage-flagship"
          aria-label="Priority actions"
        >
          <PriorityActionsRail
            bandKey={rail.bandKey}
            activeAudience={rail.activeAudience}
            config={rail.fallbackConfig}
            surfaceContext="homepage-flagship"
            featuredActionKeys={rail.featuredActionKeys}
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
