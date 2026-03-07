import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { resolveShellStatusSnapshot } from '../shellStatus.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load source files as plain text for static accessibility contract checks.
 *
 * Phase 5.16 accessibility scope focuses on deterministic shell/navigation
 * semantics (landmark elements + status surface behavior) without requiring
 * browser-rendered integration in this package-level validation layer.
 */
function readSource(relativePath: string): string {
  return readFileSync(resolve(__dirname, '..', relativePath), 'utf8');
}

describe('Phase 5.16 accessibility + boundary checks', () => {
  it('enforces semantic shell-navigation landmarks in header and sidebar surfaces', () => {
    const headerBarSource = readSource('HeaderBar/index.tsx');
    const sidebarSource = readSource('ContextualSidebar/index.tsx');

    expect(headerBarSource).toContain('<header');
    expect(headerBarSource).toContain('<nav data-hbc-shell="header-center">');
    expect(sidebarSource).toContain('<aside');
    expect(sidebarSource).toContain('<nav data-hbc-shell="sidebar-nav">');
  });

  it('enforces accessible status-surface messaging and action affordances', () => {
    const connected = resolveShellStatusSnapshot({
      lifecyclePhase: 'authenticated',
      experienceState: 'ready',
      hasAccessValidationIssue: false,
      hasFatalError: false,
      connectivitySignal: 'connected',
      degradedSections: [],
      hasRecoveredFromDegraded: false,
    });
    expect(connected.message).toBe('Connected.');
    expect(connected.actions).toEqual([]);

    const reconnecting = resolveShellStatusSnapshot({
      lifecyclePhase: 'authenticated',
      experienceState: 'ready',
      hasAccessValidationIssue: false,
      hasFatalError: false,
      connectivitySignal: 'reconnecting',
      degradedSections: [],
      hasRecoveredFromDegraded: false,
    });
    expect(reconnecting.message).toContain('reconnect');
    expect(reconnecting.actions).toContain('retry');

    const accessDeniedSource = readSource('../../auth/src/guards/AccessDenied.tsx');
    expect(accessDeniedSource).toContain('aria-live="polite"');
    expect(accessDeniedSource).toContain('aria-label="Access denied"');
  });
});
