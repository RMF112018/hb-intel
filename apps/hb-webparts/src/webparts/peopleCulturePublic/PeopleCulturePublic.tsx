/**
 * PeopleCulturePublic — dedicated People & Culture public webpart runtime.
 *
 * Phase-14 pc/ Prompt-02 (People & Culture public surface and homepage
 * integration).
 *
 * This is the production public runtime for the non-recognition People
 * & Culture product surface. It owns:
 *
 *   - announcements (person-centric and organization-centric)
 *   - celebrations / milestones
 *   - broader culture programs / events
 *
 * It does NOT own recognition. HB Kudos is a separate public webpart
 * (`hbKudos/`, manifest `f14e59a3-4d6b-43b2-952e-ba02dea11dad`) and this
 * runtime never imports Kudos primitives or Kudos data.
 *
 * Runtime flow:
 *
 *   1. Resolve the effective public config by either taking a split-aware
 *      `PeopleCulturePublicConfig` directly, or bridging a legacy
 *      `PeopleCultureMergedConfig` into the split shape via
 *      `resolvePublicConfig` in `./legacyAdapter.ts`. Kudos entries in
 *      legacy configs are dropped on entry — the bridge is strictly
 *      non-recognition.
 *   2. Normalize with
 *      `normalizePeopleCulturePublicConfig` which applies audience
 *      scoping, drops non-live states, partitions into featured vs
 *      supporting by homepage governance, sorts by
 *      (pinned, order, publishedAt, title), and enforces tier caps.
 *   3. Render the normalized output through
 *      `PeopleCulturePublicSurface` — a self-contained composition
 *      component that renders featured cards + supporting rows and
 *      handles empty state.
 *
 * Media handling is delegated to the split model's `resolveMediaSource`
 * helper inside the surface component. Profile-photo-first is honored
 * when a `profilePhotoResolver` is provided; otherwise `profilePhoto`
 * sources fall through to `none` and supporting rows render an initials
 * placeholder. Legacy media (already-resolved `HomepageMediaSlot`) is
 * surfaced as `hrUpload` and rendered directly.
 *
 * Related files:
 *   - `./legacyAdapter.ts` — legacy config bridge
 *   - `./PeopleCulturePublicSurface.tsx` — self-contained composition
 *   - `../peopleCulture/PeopleCultureMerged.tsx` — preserved backward
 *     compatibility runtime under GUID `27ac10f4-…`
 *   - `../hbKudos/HbKudos.tsx` — sibling recognition webpart
 *     (`f14e59a3-…`), owned separately
 */
import * as React from 'react';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type {
  PeopleCulturePublicConfig,
  PeopleCultureViewerAudience,
} from '../../homepage/webparts/peopleCultureSplitContracts.js';
import {
  normalizePeopleCulturePublicConfig,
  type ProfilePhotoResolver,
} from '../../homepage/helpers/peopleCultureSplitModel.js';
import { resolvePublicConfig } from './legacyAdapter.js';
import { PeopleCulturePublicSurface } from './PeopleCulturePublicSurface.js';

export interface PeopleCulturePublicProps {
  /**
   * Raw config blob from the SPFx manifest / host. Accepts either the
   * new `PeopleCulturePublicConfig` split shape or the legacy
   * `PeopleCultureMergedConfig` shape; `resolvePublicConfig` detects
   * which shape is present and bridges legacy payloads.
   */
  config?: Record<string, unknown>;
  /**
   * Strongly-typed split config. When present, it takes priority over
   * `config` and skips the legacy bridge.
   */
  splitConfig?: Partial<PeopleCulturePublicConfig>;
  identity?: HomepageIdentityInput;
  /**
   * Viewer audience used to scope targeted items. When omitted,
   * `companyWide` items always render and `targeted` items are hidden
   * (the audience matcher fails closed without a viewer).
   */
  viewerAudience?: PeopleCultureViewerAudience;
  /**
   * Optional profile-photo resolver. When supplied, `profilePhoto`
   * media sources resolve via this function; otherwise the supporting
   * tier falls back to an initials placeholder.
   */
  profilePhotoResolver?: ProfilePhotoResolver;
  assetBaseUrl?: string;
}

export function PeopleCulturePublic({
  config,
  splitConfig,
  viewerAudience,
  profilePhotoResolver,
}: PeopleCulturePublicProps): React.JSX.Element {
  const resolvedConfig = React.useMemo<PeopleCulturePublicConfig>(() => {
    if (splitConfig && Array.isArray(splitConfig.items)) {
      return {
        heading: splitConfig.heading,
        items: splitConfig.items,
        maxFeatured: splitConfig.maxFeatured,
        maxSupporting: splitConfig.maxSupporting,
      };
    }
    return resolvePublicConfig(config);
  }, [config, splitConfig]);

  const output = React.useMemo(
    () =>
      normalizePeopleCulturePublicConfig(resolvedConfig, {
        viewer: viewerAudience,
      }),
    [resolvedConfig, viewerAudience],
  );

  return (
    <PeopleCulturePublicSurface
      output={output}
      profilePhotoResolver={profilePhotoResolver}
    />
  );
}
