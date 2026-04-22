/**
 * Wave 1 — Theme posture tests (plan §6 #4, #5, G-01).
 *
 * #4 Shell-level lock — `App.tsx` passes forceTheme="light" to
 *    HbcThemeProvider. The provider's own unit-test coverage in ui-kit
 *    proves the runtime behavior; this test proves the Safety app has
 *    opted into that lock.
 * #5 Page-level lock — every page under src/pages/ that renders
 *    WorkspacePageShell forwards supportedModes (via the OFFICE_ONLY
 *    constant). This is a shape assertion on the page sources.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Wave 1 — shell-level theme lock (plan §6 #4, G-01)', () => {
  it('App.tsx passes forceTheme="light" to HbcThemeProvider', () => {
    const appTsx = fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf-8');
    expect(appTsx).toMatch(/<HbcThemeProvider\s+forceTheme=['"]light['"]/);
  });

  it('App.tsx wraps the tree in ForceOfficeMode so isFieldMode cannot leak in', () => {
    const appTsx = fs.readFileSync(path.resolve(__dirname, '../App.tsx'), 'utf-8');
    expect(appTsx).toMatch(/<ForceOfficeMode>/);
    expect(appTsx).toMatch(/<\/ForceOfficeMode>/);
  });

  it('ForceOfficeMode re-provides HbcThemeContext with isFieldMode=false', () => {
    const src = fs.readFileSync(path.resolve(__dirname, '../ForceOfficeMode.tsx'), 'utf-8');
    expect(src).toMatch(/HbcThemeContext\.Provider/);
    expect(src).toMatch(/isFieldMode:\s*false/);
    expect(src).toMatch(/mode:\s*['"]office['"]/);
    expect(src).toMatch(/toggleFieldMode:\s*\(\)\s*=>\s*undefined/);
  });
});

describe('Wave 1 — page-level supportedModes lock (plan §6 #5, G-01)', () => {
  const pagesDir = path.resolve(__dirname, '../pages');
  const pageFiles = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.tsx'));

  it.each(pageFiles)('%s forwards supportedModes to WorkspacePageShell', (file) => {
    const source = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
    const rendersShell = /<WorkspacePageShell\b/.test(source);
    if (!rendersShell) return;
    // Accept either the local OFFICE_ONLY constant or an inline literal.
    const hasSupportedModes =
      /supportedModes\s*=\s*\{[^}]*OFFICE_ONLY[^}]*\}/.test(source) ||
      /supportedModes\s*=\s*\{\s*\[\s*['"]office['"]\s*\]\s*\}/.test(source);
    expect(hasSupportedModes).toBe(true);
  });

  it('covers the six Wave-1 pages', () => {
    const expected = [
      'UploadPage.tsx',
      'ReportingPeriodDashboardPage.tsx',
      'ReviewQueuePage.tsx',
      'InspectionsPage.tsx',
      'InspectionDetailPage.tsx',
      'ProjectWeekDetailPage.tsx',
    ];
    for (const name of expected) {
      expect(pageFiles).toContain(name);
    }
  });

  it('IncidentsPage.tsx has been removed (G-11)', () => {
    expect(pageFiles).not.toContain('IncidentsPage.tsx');
  });
});
