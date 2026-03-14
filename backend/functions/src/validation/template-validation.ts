/**
 * W0-G2-T08: Pure validation functions for template file manifest.
 */

import * as fs from 'node:fs';
import type { ITemplateFileEntry } from '../config/template-file-manifest.js';
import type { IAssetReport } from './types.js';

/**
 * Validates manifest entries against disk presence.
 * Returns a structured report with present/missing arrays.
 */
export function validateManifestAssets(
  manifest: ITemplateFileEntry[],
  assetsBasePath: string
): IAssetReport {
  const present: string[] = [];
  const missing: string[] = [];

  for (const entry of manifest) {
    const fullPath = `${assetsBasePath}/${entry.assetPath}`;
    if (fs.existsSync(fullPath)) {
      present.push(entry.fileName);
    } else {
      missing.push(entry.fileName);
    }
  }

  return {
    present,
    missing,
    total: manifest.length,
    missingCount: missing.length,
  };
}
