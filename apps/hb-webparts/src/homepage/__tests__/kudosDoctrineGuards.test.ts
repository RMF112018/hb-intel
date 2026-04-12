/**
 * kudosDoctrineGuards — Phase-21 Wave 4 Prompt 04 proof pass.
 *
 * Executable doctrine guards that enforce the locked Wave 1/2/3/4
 * decisions as mechanical assertions. Any drift becomes a test
 * failure, not a review-time observation.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  HB_KUDOS_WEBPART_ID,
  HB_KUDOS_COMPANION_WEBPART_ID,
  KUDOS_RUNTIME_OWNERSHIP,
} from '../../webparts/hbKudos/kudosRuntimeContract.js';
import { KUDOS_GOV_TOKENS } from '../shared/KudosGovernancePrimitives.js';
import {
  HBC_PRESENTATION_BLUE,
  HBC_PRESENTATION_ORANGE,
} from '@hbc/ui-kit/homepage';
import { SAFE_ZONE_SIZE_PX } from '../../webparts/hbKudos/hooks/useHostSafeLayout.js';

const APP_ROOT = resolve(__dirname, '../..');

const read = (rel: string): string =>
  readFileSync(resolve(APP_ROOT, rel), 'utf8');

/**
 * Homepage-facing HB Kudos source files. Used for grep-style guards
 * that enforce "no pseudo-icons", "no root-barrel imports", etc.
 */
const KUDOS_SOURCE_FILES: readonly string[] = [
  'webparts/hbKudos/HbKudos.tsx',
  'webparts/hbKudos/PublicKudosSurface.tsx',
  'webparts/hbKudos/ArchiveList.tsx',
  'webparts/hbKudos/KudosArticleReader.tsx',
  'webparts/hbKudos/KudosFeedBody.tsx',
  'webparts/hbKudos/KudosFeedPanel.tsx',
  'webparts/hbKudos/KudosComposerPanel.tsx',
  'homepage/shared/kudosShells.tsx',
  'webparts/hbKudos/kudosIcons.ts',
  'webparts/hbKudos/kudosVariants.ts',
  'webparts/hbKudos/kudosSurfaceFamily.ts',
  'webparts/hbKudos/kudosRuntimeContract.ts',
  'webparts/hbKudos/hooks/useCurrentUserId.ts',
  'webparts/hbKudos/hooks/usePublicKudosData.ts',
  'webparts/hbKudos/hooks/useRecipientPhotoHydration.ts',
  'webparts/hbKudos/hooks/useCelebrateAction.ts',
  'webparts/hbKudos/hooks/useHostSafeLayout.ts',
  'webparts/hbKudos/hooks/kudosFeatured.ts',
  'webparts/hbKudosCompanion/HbKudosCompanion.tsx',
  'homepage/shared/KudosGovernancePrimitives.tsx',
  'homepage/shared/KudosDetailPanelContent.tsx',
];

describe('HB Kudos doctrine guards', () => {
  describe('Wave 1: iconography', () => {
    it('no Unicode / pseudo-icon glyphs in homepage-facing Kudos source', () => {
      // Pseudo-icon glyphs explicitly banned by doctrine:
      //   🏆 (trophy), 👍 (thumbs up), 👎 (thumbs down),
      //   ✦ ✧ ✨ ★ ☆ (stars / sparkles),
      //   ▾ ▸ ▴ ▼ ► (triangles used as chevrons).
      // Prose arrows (→ ←) are NOT checked because they appear
      // legitimately in JSDoc comments ("open dialog → confirm").
      const GLYPH_RE = /[\u{1F3C6}\u{1F44D}\u{1F44E}\u2726\u2727\u2728\u2605\u2606\u25BE\u25B8\u25B4\u25BC\u25BA]/u;
      const offenders: string[] = [];
      for (const rel of KUDOS_SOURCE_FILES) {
        const src = read(rel);
        if (GLYPH_RE.test(src)) offenders.push(rel);
      }
      expect(offenders).toEqual([]);
    });
  });

  describe('Wave 1: homepage import discipline', () => {
    it('no raw @hbc/ui-kit root-barrel imports in HB Kudos source', () => {
      // `@hbc/ui-kit/homepage`, `/theme`, `/branding`, `/icons`, `/app-shell`
      // are fine; the naked `@hbc/ui-kit` is not.
      const BAD_RE = /from\s+['"]@hbc\/ui-kit['"]/;
      const offenders: string[] = [];
      for (const rel of KUDOS_SOURCE_FILES) {
        const src = read(rel);
        if (BAD_RE.test(src)) offenders.push(rel);
      }
      expect(offenders).toEqual([]);
    });
  });

  describe('Wave 1: token derivation', () => {
    it('KUDOS_GOV_TOKENS.brandBlue equals HBC_PRESENTATION_BLUE', () => {
      expect(KUDOS_GOV_TOKENS.brandBlue).toBe(HBC_PRESENTATION_BLUE);
    });

    it('KUDOS_GOV_TOKENS.brandOrange equals HBC_PRESENTATION_ORANGE', () => {
      expect(KUDOS_GOV_TOKENS.brandOrange).toBe(HBC_PRESENTATION_ORANGE);
    });
  });

  describe('Wave 2: behavior-seam debug gating', () => {
    it('useSharePointPeopleSearch.ts has no ungated console.warn / console.log', () => {
      const src = read('homepage/data/useSharePointPeopleSearch.ts');
      // Strip line and block comments so mentions in JSDoc do not trip
      // the guard. We only care about real call sites.
      const code = src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|\s)\/\/.*$/gm, '$1');

      // `console.warn(` / `console.info(` are never allowed in the
      // hot people-search path.
      const forbidden = code.match(/console\.(warn|info)\s*\(/g) ?? [];
      expect(
        forbidden,
        'console.warn/info found outside debug gate',
      ).toHaveLength(0);

      // `console.log(` may appear only inside the `debug()` helper.
      const logMatches = [...code.matchAll(/console\.log\s*\(/g)];
      for (const m of logMatches) {
        const start = Math.max(0, (m.index ?? 0) - 250);
        const ctx = code.slice(start, (m.index ?? 0) + 20);
        expect(
          ctx.includes('function debug(') || ctx.includes('if (!isDebug())'),
          'console.log outside debug() gate',
        ).toBe(true);
      }
    });
  });

  describe('Wave 2: hook discipline', () => {
    it('useRecipientPhotoHydration has no react-hooks/exhaustive-deps suppression', () => {
      const src = read('webparts/hbKudos/hooks/useRecipientPhotoHydration.ts');
      expect(src).not.toMatch(/eslint-disable.*react-hooks\/exhaustive-deps/);
    });
  });

  describe('Wave 4: split-runtime contract', () => {
    it('public manifest id matches HB_KUDOS_WEBPART_ID', () => {
      const manifest = JSON.parse(
        read('webparts/hbKudos/HbKudosWebPart.manifest.json'),
      ) as { id: string; alias: string; version: string };
      expect(manifest.id).toBe(HB_KUDOS_WEBPART_ID);
      expect(manifest.alias).toBe(KUDOS_RUNTIME_OWNERSHIP.public.manifestAlias);
    });

    it('companion manifest id matches HB_KUDOS_COMPANION_WEBPART_ID', () => {
      const manifest = JSON.parse(
        read('webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json'),
      ) as { id: string; alias: string; version: string };
      expect(manifest.id).toBe(HB_KUDOS_COMPANION_WEBPART_ID);
      expect(manifest.alias).toBe(
        KUDOS_RUNTIME_OWNERSHIP.companion.manifestAlias,
      );
    });

    it('public manifest version follows the SPFx 4-part schema', () => {
      const manifest = JSON.parse(
        read('webparts/hbKudos/HbKudosWebPart.manifest.json'),
      ) as { version: string };
      expect(manifest.version).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
    });

    it('companion manifest version follows the SPFx 4-part schema', () => {
      const manifest = JSON.parse(
        read('webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json'),
      ) as { version: string };
      expect(manifest.version).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
    });

    it('mount.tsx uses the runtime-contract constants (no inline Kudos GUIDs)', () => {
      const src = read('mount.tsx');
      expect(src).toContain('HB_KUDOS_WEBPART_ID');
      expect(src).toContain('HB_KUDOS_COMPANION_WEBPART_ID');
      // Inline GUID keys must not appear for the two Kudos renderers.
      // Verify the Kudos ids are not literal keys like `'<guid>':`.
      const publicKey = new RegExp(`['"]${HB_KUDOS_WEBPART_ID}['"]\\s*:`);
      const companionKey = new RegExp(
        `['"]${HB_KUDOS_COMPANION_WEBPART_ID}['"]\\s*:`,
      );
      expect(publicKey.test(src)).toBe(false);
      expect(companionKey.test(src)).toBe(false);
    });
  });

  describe('Wave 3: host-safe sentinel contract', () => {
    it('SAFE_ZONE_SIZE_PX is exported and positive', () => {
      expect(SAFE_ZONE_SIZE_PX).toBeGreaterThan(0);
    });

    it('HbKudos.tsx sources sentinel size from SAFE_ZONE_SIZE_PX', () => {
      const src = read('webparts/hbKudos/HbKudos.tsx');
      expect(src).toContain('SAFE_ZONE_SIZE_PX');
      // The sentinel must carry the dev-harness testid contract.
      expect(src).toContain('data-hbc-testid="kudos-assistant-safezone"');
    });
  });

  describe('Wave 4: ownership map shape', () => {
    it('public + companion runtimes each name at least one owned concern', () => {
      expect(KUDOS_RUNTIME_OWNERSHIP.public.owns.length).toBeGreaterThan(0);
      expect(KUDOS_RUNTIME_OWNERSHIP.companion.owns.length).toBeGreaterThan(0);
    });

    it('public + companion runtimes each name at least one doesNotOwn concern', () => {
      expect(KUDOS_RUNTIME_OWNERSHIP.public.doesNotOwn.length).toBeGreaterThan(0);
      expect(KUDOS_RUNTIME_OWNERSHIP.companion.doesNotOwn.length).toBeGreaterThan(0);
    });

    it('webpart ids in the ownership map match the contract constants', () => {
      expect(KUDOS_RUNTIME_OWNERSHIP.public.webpartId).toBe(HB_KUDOS_WEBPART_ID);
      expect(KUDOS_RUNTIME_OWNERSHIP.companion.webpartId).toBe(
        HB_KUDOS_COMPANION_WEBPART_ID,
      );
    });
  });
});
