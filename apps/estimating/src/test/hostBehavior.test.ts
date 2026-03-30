/**
 * Host behavior validation tests for Project Setup Requests SPFx surface.
 * Validates permanent light-mode posture and TeamsPersonalApp support.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Host behavior', () => {
  describe('Light-mode enforcement', () => {
    it('App.tsx forces light theme when spfxContext is provided', () => {
      const appSource = readFileSync(
        resolve(__dirname, '../App.tsx'),
        'utf-8',
      );
      // The forceTheme logic must be present and conditional on spfxContext
      expect(appSource).toContain("forceTheme={forceTheme}");
      expect(appSource).toContain("spfxContext ? 'light' as const : undefined");
    });

    it('manifest declares supportsThemeVariants=false', () => {
      const manifest = JSON.parse(
        readFileSync(
          resolve(__dirname, '../webparts/estimating/EstimatingWebPart.manifest.json'),
          'utf-8',
        ),
      );
      expect(manifest.supportsThemeVariants).toBe(false);
    });
  });

  describe('TeamsPersonalApp support', () => {
    it('manifest includes TeamsPersonalApp in supportedHosts', () => {
      const manifest = JSON.parse(
        readFileSync(
          resolve(__dirname, '../webparts/estimating/EstimatingWebPart.manifest.json'),
          'utf-8',
        ),
      );
      expect(manifest.supportedHosts).toContain('TeamsPersonalApp');
      expect(manifest.supportedHosts).toContain('SharePointWebPart');
    });
  });

  describe('PWA migration compatibility', () => {
    it('mount.tsx does not hardcode SPFx-only patterns in the global API', () => {
      const mountSource = readFileSync(
        resolve(__dirname, '../mount.tsx'),
        'utf-8',
      );
      // The mount function accepts optional spfxContext — PWA can call mount(el) without it
      expect(mountSource).toContain('spfxContext?: WebPartContext');
    });

    it('App component accepts optional spfxContext', () => {
      const appSource = readFileSync(
        resolve(__dirname, '../App.tsx'),
        'utf-8',
      );
      // spfxContext is optional in the AppProps interface
      expect(appSource).toContain('spfxContext?:');
    });
  });
});
