/**
 * Shell injection chain validation for the Accounting SPFx surface.
 *
 * Validates that the runtime config injection path from build orchestrator
 * through shell DefinePlugin to mount.tsx acceptance is consistent and
 * complete. These tests read source files directly (no build required)
 * to catch injection chain regressions early.
 *
 * @see tools/build-spfx-package.ts — orchestrator env var construction
 * @see tools/spfx-shell/gulpfile.js — DefinePlugin constant injection
 * @see tools/spfx-shell/src/webparts/shell/ShellWebPart.ts — config construction + mount()
 * @see apps/accounting/src/mount.tsx — config acceptance + setRuntimeConfig()
 * @see docs/architecture/reviews/accounting-runtime-config-injection-and-packaged-shell-hardening.md
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const repoRoot = resolve(__dirname, '../../../..');

function readRepo(relPath: string): string {
  return readFileSync(resolve(repoRoot, relPath), 'utf-8');
}

describe('Shell injection chain', () => {
  describe('Orchestrator env construction (build-spfx-package.ts)', () => {
    const orchestrator = readRepo('tools/build-spfx-package.ts');

    it('passes FUNCTION_APP_URL to shell env', () => {
      expect(orchestrator).toContain('FUNCTION_APP_URL');
    });

    it('passes BACKEND_MODE via resolveDefaultBackendMode', () => {
      expect(orchestrator).toContain('BACKEND_MODE: resolveDefaultBackendMode');
    });

    it('passes ALLOW_BACKEND_MODE_SWITCH to shell env', () => {
      expect(orchestrator).toContain('ALLOW_BACKEND_MODE_SWITCH');
    });

    it('passes API_AUDIENCE to shell env', () => {
      expect(orchestrator).toContain('API_AUDIENCE');
    });

    it('does not default BACKEND_MODE to ui-review', () => {
      // P7-02: resolveDefaultBackendMode returns empty string, not 'ui-review'
      expect(orchestrator).toContain("return '';");
      expect(orchestrator).not.toMatch(/return\s+['"]ui-review['"]/);
    });
  });

  describe('DefinePlugin injection (gulpfile.js)', () => {
    const gulpfile = readRepo('tools/spfx-shell/gulpfile.js');

    it('injects __FUNCTION_APP_URL__ constant', () => {
      expect(gulpfile).toContain('__FUNCTION_APP_URL__');
    });

    it('injects __BACKEND_MODE__ constant', () => {
      expect(gulpfile).toContain('__BACKEND_MODE__');
    });

    it('injects __ALLOW_BACKEND_MODE_SWITCH__ constant', () => {
      expect(gulpfile).toContain('__ALLOW_BACKEND_MODE_SWITCH__');
    });

    it('injects __API_AUDIENCE__ constant', () => {
      expect(gulpfile).toContain('__API_AUDIENCE__');
    });

    it('uses JSON.stringify for all constants', () => {
      // All DefinePlugin values must be JSON.stringify'd to produce valid JS literals
      const defineSection = gulpfile.slice(
        gulpfile.indexOf('DefinePlugin'),
        gulpfile.indexOf('CopyWebpackPlugin') > 0
          ? gulpfile.indexOf('CopyWebpackPlugin')
          : gulpfile.length,
      );
      expect(defineSection).toContain('JSON.stringify');
    });
  });

  describe('Shell webpart config construction (ShellWebPart.ts)', () => {
    const shell = readRepo('tools/spfx-shell/src/webparts/shell/ShellWebPart.ts');

    it('reads __FUNCTION_APP_URL__ and passes as functionAppUrl', () => {
      expect(shell).toContain('__FUNCTION_APP_URL__');
      expect(shell).toContain('functionAppUrl');
    });

    it('reads __BACKEND_MODE__ and passes as backendMode', () => {
      expect(shell).toContain('__BACKEND_MODE__');
      expect(shell).toContain('backendMode');
    });

    it('reads __ALLOW_BACKEND_MODE_SWITCH__ and converts to boolean', () => {
      expect(shell).toContain('__ALLOW_BACKEND_MODE_SWITCH__');
      expect(shell).toContain('allowBackendModeSwitch');
      // String 'true' → boolean true conversion
      expect(shell).toContain("=== 'true'");
    });

    it('reads __API_AUDIENCE__ and passes as apiAudience', () => {
      expect(shell).toContain('__API_AUDIENCE__');
      expect(shell).toContain('apiAudience');
    });

    it('calls mount with runtime config', () => {
      expect(shell).toContain('.mount(this.domElement, this.context, runtimeConfig)');
    });

    it('does not silently inject ui-review when Function App URL is missing', () => {
      // P7-02: Shell must not assign 'ui-review' as a fallback value.
      // Comments mentioning 'ui-review' are expected (documentation); only
      // actual assignment/injection of the value would be a regression.
      expect(shell).not.toMatch(/backendMode\s*=\s*['"]ui-review['"]/);
    });
  });

  describe('Mount acceptance (mount.tsx)', () => {
    const mount = readFileSync(resolve(__dirname, '../mount.tsx'), 'utf-8');

    it('accepts config parameter', () => {
      expect(mount).toContain('config?: IMountConfig');
    });

    it('calls setRuntimeConfig with provided config', () => {
      expect(mount).toContain('setRuntimeConfig(config)');
    });

    it('IMountConfig includes functionAppUrl', () => {
      expect(mount).toContain('functionAppUrl?:');
    });

    it('IMountConfig includes backendMode', () => {
      expect(mount).toContain('backendMode?:');
    });

    it('IMountConfig includes allowBackendModeSwitch', () => {
      expect(mount).toContain('allowBackendModeSwitch?:');
    });

    it('IMountConfig includes apiAudience', () => {
      expect(mount).toContain('apiAudience?:');
    });
  });

  describe('Runtime config consumption (runtimeConfig.ts)', () => {
    const config = readFileSync(
      resolve(__dirname, '../config/runtimeConfig.ts'),
      'utf-8',
    );

    it('exports getBackendMode with production default', () => {
      expect(config).toContain('getBackendMode');
      expect(config).toContain("'production'");
    });

    it('exports getFunctionAppUrl with ConfigError for missing production URL', () => {
      expect(config).toContain('getFunctionAppUrl');
      expect(config).toContain('ConfigError');
    });

    it('exports getApiAudience', () => {
      expect(config).toContain('getApiAudience');
    });

    it('exports checkProductionReadiness', () => {
      expect(config).toContain('checkProductionReadiness');
    });

    it('normalizes allowBackendModeSwitch string to boolean', () => {
      expect(config).toContain("=== 'true'");
    });
  });
});
