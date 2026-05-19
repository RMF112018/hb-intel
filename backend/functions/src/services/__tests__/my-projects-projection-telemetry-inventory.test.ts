/**
 * My Projects projection — telemetry-name inventory lint test.
 *
 * Reads each emitting source file in the projection subsystem and extracts
 * every literal string passed to `trackEvent(` / `trackMyProjectLinksRuntimeEvent(`.
 * Asserts:
 *   1. every emitted name is in the canonical
 *      `MY_PROJECTS_PROJECTION_EVENT_NAMES` inventory;
 *   2. every entry in the canonical inventory is emitted by at least one
 *      source file (no orphans).
 *
 * Catches future drift without forcing a refactor of inline `trackEvent('...')`
 * call sites to imported constants.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { MY_PROJECTS_PROJECTION_EVENT_NAMES } from '../my-projects-projection/telemetry/event-names.js';

const FUNCTIONS_SRC = resolve(__dirname, '..', '..');

const EMITTING_SOURCE_FILES = [
  // Backend services.
  'services/my-projects-projection/delta/projection-sync-worker.ts',
  'services/my-projects-projection/subscriptions/projection-subscription-manager.ts',
  'services/my-projects-projection/webhook/projection-webhook-handler.ts',
  'functions/myProjectsProjectionPendingWorkProcessor/index.ts',
  // My Work read model — legacy aggregation provider + projection-backed provider.
  'hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts',
  'hosts/my-work-read-model/read-models/project-links/my-project-links-projection-provider.ts',
] as const;

// `trackEvent('name', ...)` or `trackMyProjectLinksRuntimeEvent('name', ...)`
const EVENT_NAME_PATTERN = /\b(?:trackEvent|trackMyProjectLinksRuntimeEvent)\(\s*['"]([^'"]+)['"]/g;

function extractEmittedNames(): Set<string> {
  const out = new Set<string>();
  for (const relative of EMITTING_SOURCE_FILES) {
    const absolute = resolve(FUNCTIONS_SRC, relative);
    const source = readFileSync(absolute, 'utf-8');
    let match: RegExpExecArray | null;
    EVENT_NAME_PATTERN.lastIndex = 0;
    while ((match = EVENT_NAME_PATTERN.exec(source)) !== null) {
      out.add(match[1]);
    }
  }
  return out;
}

describe('My Projects projection telemetry-name inventory', () => {
  it('every emitted event-name string is in the canonical inventory', () => {
    const emitted = extractEmittedNames();
    const canonical = new Set<string>(MY_PROJECTS_PROJECTION_EVENT_NAMES);
    const orphansInCode: string[] = [];
    for (const name of emitted) {
      if (!canonical.has(name)) orphansInCode.push(name);
    }
    expect(
      orphansInCode,
      `Event-name strings emitted by source files but missing from the canonical inventory: ${orphansInCode.join(', ')}. Add them to backend/functions/src/services/my-projects-projection/telemetry/event-names.ts (and update the KQL pack + telemetry-evidence.md accordingly).`,
    ).toEqual([]);
  });

  it('every canonical event name is emitted by at least one source file (no orphans in the inventory)', () => {
    const emitted = extractEmittedNames();
    const orphansInInventory: string[] = [];
    for (const name of MY_PROJECTS_PROJECTION_EVENT_NAMES) {
      if (!emitted.has(name)) orphansInInventory.push(name);
    }
    expect(
      orphansInInventory,
      `Canonical inventory entries with no emitting call site: ${orphansInInventory.join(', ')}. Remove from the inventory or wire a call site.`,
    ).toEqual([]);
  });

  it('the canonical inventory has the expected total count (41 events)', () => {
    expect(MY_PROJECTS_PROJECTION_EVENT_NAMES.length).toBe(41);
  });
});
