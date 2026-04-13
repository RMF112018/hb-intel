/**
 * HbSignatureHero.harness — dev-only visual proof harness.
 *
 * Renders every supported hero state stacked vertically so a reviewer
 * (or an integration test) can verify both behavior families without
 * needing Storybook or SharePoint hosting:
 *
 *   1. Homepage mode (HBCentral) — flagship identity surface locked
 *   2. Article mode — full data (title, subheading, labels, photo,
 *      destination, explicit authorPhotoUrl)
 *   3. Article mode — minimal required triad only (graceful
 *      degradation of subheading, image, time, labels, link)
 *   4. Article mode — author-photo fallback: UPN provided but the
 *      Graph adapter returns `undefined`, so initials render
 *
 * This harness is intentionally not wired into the SPFx mount
 * dispatch — it exists to back visual-proof captures and
 * integration-test coverage only. Importing it has no runtime side
 * effects.
 */
import * as React from 'react';
import type { PersonPhotoFn } from '@hbc/ui-kit/homepage';
import { HbSignatureHero } from './HbSignatureHero.js';
import { HBCENTRAL_SITE_URL } from './heroModeResolver.js';

const fallbackPhotoAdapter: PersonPhotoFn = async () => undefined;

/** Static anchor for reduced-motion regression checks. */
const HARNESS_NOW = new Date('2026-04-13T09:15:00Z');

const NON_HBCENTRAL_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/ProjectHorizon';

export interface HbSignatureHeroHarnessProps {
  /** Optional photo adapter override for Graph-resolved avatars. */
  fetchPersonPhoto?: PersonPhotoFn;
}

export function HbSignatureHeroHarness({
  fetchPersonPhoto = fallbackPhotoAdapter,
}: HbSignatureHeroHarnessProps = {}): React.JSX.Element {
  return (
    <div
      data-hbc-hero-harness="phase-01"
      style={{ display: 'grid', gap: 32, padding: 24 }}
    >
      <section data-hbc-harness-case="homepage-locked">
        <h3>Homepage mode — HBCentral locked</h3>
        <HbSignatureHero
          identity={{ preferredName: 'Jordan Miller' }}
          siteUrl={HBCENTRAL_SITE_URL}
          now={HARNESS_NOW}
          // Article content must be ignored on HBCentral.
          article={{
            title: 'IGNORED: HBCentral must render homepage',
            author: 'IGNORED',
            publishedDate: '2026-04-13',
          }}
        />
      </section>

      <section data-hbc-harness-case="article-full">
        <h3>Article mode — full data</h3>
        <HbSignatureHero
          identity={{ preferredName: 'Jordan Miller' }}
          siteUrl={NON_HBCENTRAL_SITE_URL}
          now={HARNESS_NOW}
          fetchPersonPhoto={fetchPersonPhoto}
          article={{
            title: 'A Major Milestone on Project Horizon',
            subheading: 'Field teams close out the structural phase ahead of schedule.',
            labels: ['Project', 'Field'],
            author: 'Avery Stone',
            authorUpn: 'avery.stone@example.invalid',
            authorPhotoUrl: 'https://cdn.example.invalid/avery.jpg',
            publishedDate: '2026-04-13',
            publishedTime: '09:15 AM',
            primaryImage: 'https://cdn.example.invalid/horizon-hero.jpg',
            destinationUrl: 'https://intranet.example.invalid/articles/horizon-milestone',
          }}
        />
      </section>

      <section data-hbc-harness-case="article-minimal">
        <h3>Article mode — minimal (required triad only)</h3>
        <HbSignatureHero
          identity={{ preferredName: 'Jordan Miller' }}
          siteUrl={NON_HBCENTRAL_SITE_URL}
          now={HARNESS_NOW}
          fetchPersonPhoto={fetchPersonPhoto}
          article={{
            title: 'Minimal Article',
            author: 'Pat Field',
            publishedDate: '2026-04-13',
          }}
        />
      </section>

      <section data-hbc-harness-case="article-photo-fallback">
        <h3>Article mode — author-photo fallback to initials</h3>
        <HbSignatureHero
          identity={{ preferredName: 'Jordan Miller' }}
          siteUrl={NON_HBCENTRAL_SITE_URL}
          now={HARNESS_NOW}
          fetchPersonPhoto={fetchPersonPhoto}
          article={{
            title: 'Graph Returned No Photo',
            author: 'Sam River',
            authorUpn: 'sam.river@example.invalid',
            publishedDate: '2026-04-13',
          }}
        />
      </section>
    </div>
  );
}
