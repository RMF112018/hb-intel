import * as path from 'node:path';
import { describe, it, expect } from 'vitest';
import { TEMPLATE_FILE_MANIFEST } from '../config/template-file-manifest.js';
import { validateManifestAssets } from './template-validation.js';

describe('W0-G2-T08: Template manifest validation', () => {
  const assetsBasePath = path.resolve(__dirname, '../assets/templates');

  it('validates all 18 manifest entries', () => {
    expect(TEMPLATE_FILE_MANIFEST).toHaveLength(18);
  });

  it('all entries have non-empty fileName, targetLibrary, assetPath', () => {
    for (const entry of TEMPLATE_FILE_MANIFEST) {
      expect(entry.fileName.trim(), `empty fileName`).not.toBe('');
      expect(entry.targetLibrary.trim(), `empty targetLibrary for ${entry.fileName}`).not.toBe('');
      expect(entry.assetPath.trim(), `empty assetPath for ${entry.fileName}`).not.toBe('');
    }
  });

  it('reports correct present/missing counts against disk', () => {
    const report = validateManifestAssets(TEMPLATE_FILE_MANIFEST, assetsBasePath);
    expect(report.total).toBe(18);
    expect(report.present.length + report.missing.length).toBe(18);
    expect(report.missingCount).toBe(report.missing.length);
  });

  it('returns structured report shape', () => {
    const report = validateManifestAssets(TEMPLATE_FILE_MANIFEST, assetsBasePath);
    expect(report).toHaveProperty('present');
    expect(report).toHaveProperty('missing');
    expect(report).toHaveProperty('total');
    expect(report).toHaveProperty('missingCount');
    expect(Array.isArray(report.present)).toBe(true);
    expect(Array.isArray(report.missing)).toBe(true);
  });
});
