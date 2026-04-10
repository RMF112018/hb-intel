/**
 * Config loading and validation for the comprehensive test suite.
 */
import { readFileSync, existsSync } from 'node:fs';
import type { HarnessConfig } from './types.js';

const DEFAULTS: HarnessConfig = {
  siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
  lists: {
    peopleCultureKudos: 'People Culture Kudos',
    kudosAuditEvents: 'Kudos Audit Events',
    peopleCultureAnnouncements: 'People Culture Announcements',
    peopleCultureCelebrations: 'People Culture Celebrations',
  },
  testPrefix: 'TEST-HBI',
  cleanup: true,
  auditParity: true,
  docsDir: 'docs/architecture/plans/MASTER/spfx/homepage/people/phase-14',
};

export function loadConfig(path?: string): HarnessConfig {
  if (path && existsSync(path)) {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Partial<HarnessConfig>;
    return { ...DEFAULTS, ...raw, lists: { ...DEFAULTS.lists, ...raw.lists } };
  }
  return { ...DEFAULTS };
}

export function validateConfig(config: HarnessConfig): string[] {
  const errors: string[] = [];
  if (!config.siteUrl) errors.push('siteUrl is required');
  if (!config.lists.peopleCultureKudos) errors.push('lists.peopleCultureKudos is required');
  if (!config.lists.kudosAuditEvents) errors.push('lists.kudosAuditEvents is required');
  return errors;
}
