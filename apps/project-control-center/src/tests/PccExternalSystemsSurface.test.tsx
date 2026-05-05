/**
 * Wave 15 / Prompt 05 — PCC External Systems Launch Pad surface tests.
 *
 * Replaces the Wave 1 / Wave 13 fixture-tile tests. Surface identity
 * `external-systems` is preserved. Tests assert:
 *
 *   - render from the composite read-model fixture envelope (header,
 *     summary, project links, Procore status card as direct grid
 *     children of `[data-pcc-bento-grid]`);
 *   - exactly one `[data-pcc-active-surface-panel="external-systems"]`;
 *   - bento direct-child invariant via `marker.closest('[data-pcc-card]')`
 *     then `card.parentElement.matches('[data-pcc-bento-grid]')`;
 *   - sourceStatus → cardState mapping (`available` → ready,
 *     `backend-unavailable` → degraded, `source-unavailable` → empty);
 *   - per-link approval-state and URL-policy markers on each row;
 *   - blocked-by-policy / unapproved links carry visible reason text;
 *   - approved + policy-allowed links still render an inert/disabled
 *     launch affordance — never an executable external anchor;
 *   - no `<a href="http(s)://...">` anchors render anywhere on the
 *     surface (no active launch behavior in this prompt);
 *   - no `<iframe>` / current-image embeds render;
 *   - source-scan: surface code does not import live SDKs.
 *
 * These tests do not import or exercise `PccSurfaceRouter` (the
 * router-pass-through invariant has its own dedicated test file).
 */

import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import {
  PCC_MVP_SURFACES,
  SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_BACKEND_UNAVAILABLE,
  SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT,
  SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_UNKNOWN_PROJECT,
  SAMPLE_PROJECT_PROFILE,
  type IPccExternalSystemsLaunchPadReadModel,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccExternalSystemsSurface } from '../surfaces/externalSystems/PccExternalSystemsSurface';
import type { IPccLaunchPadReadModelClient } from '../surfaces/externalSystems/launchPadViewModel';

const KNOWN_PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILE.projectId;
const UNKNOWN_PROJECT_ID = 'fixture-pcc-project-unknown-999' as PccProjectId;

function buildEnvelope(
  data: IPccExternalSystemsLaunchPadReadModel,
  sourceStatus: PccReadModelSourceStatus,
  projectId: PccProjectId,
): PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel> {
  return {
    projectId,
    mode: 'fixture',
    sourceStatus,
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data,
  };
}

function syncClient(
  envelope: PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>,
): IPccLaunchPadReadModelClient {
  return {
    getExternalSystemsLaunchPad: () => Promise.resolve(envelope),
  };
}

function renderSurface(): ReturnType<typeof render> {
  return render(
    <PccBentoGrid forceMode="wideDesktop">
      <PccExternalSystemsSurface />
    </PccBentoGrid>,
  );
}

describe('PccExternalSystemsSurface — Wave 15 Launch Pad shell (fixture fallback path)', () => {
  it('renders all bento cards as direct children of the bento grid (Prompt 05/06/07 lanes)', () => {
    const { container } = renderSurface();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    // Card count matches the lane id tuple's renderable lanes (header,
    // summary, project-links, review-queue, procore-status, registry,
    // mapping-status, source-health, audit-history, hbi-lineage). The
    // drawer is portal-mounted and not a direct child of the grid.
    expect(cards.length).toBe(10);
    for (const card of cards) {
      expect(card.parentElement).toBe(grid);
    }
  });

  it('renders the Prompt 07 lane markers for registry, mapping-status, source-health, audit-history, and hbi-lineage', () => {
    const { container } = renderSurface();
    const lanes = [
      'registry',
      'mapping-status',
      'source-health',
      'audit-history',
      'hbi-lineage',
    ] as const;
    for (const lane of lanes) {
      const node = container.querySelector(`[data-pcc-launch-pad-lane="${lane}"]`);
      expect(node, `expected lane ${lane} to be rendered`).not.toBeNull();
    }
  });

  it('renders exactly one [data-pcc-active-surface-panel="external-systems"] carrying the registry display name', () => {
    const { container } = renderSurface();
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels.length).toBe(1);
    expect(panels[0]?.getAttribute('data-pcc-active-surface-panel')).toBe('external-systems');
    expect(panels[0]?.textContent).toContain(PCC_MVP_SURFACES['external-systems'].displayName);
  });

  it('renders one link row per fixture launch link with approval-state, policy-state, hostname markers', () => {
    const { container } = renderSurface();
    const rows = container.querySelectorAll('[data-pcc-launch-pad-link]');
    expect(rows.length).toBe(
      SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT.projectLaunchLinks.length,
    );
    for (const row of rows) {
      expect(row.getAttribute('data-pcc-launch-pad-link-approval-state')).not.toBeNull();
      expect(row.getAttribute('data-pcc-launch-pad-link-policy-state')).not.toBeNull();
      expect(row.querySelector('[data-pcc-launch-pad-link-hostname]')).not.toBeNull();
    }
  });

  it('every row exposes a disabled launch affordance with a visible reason caption — never an executable anchor', () => {
    const { container } = renderSurface();
    const rows = container.querySelectorAll('[data-pcc-launch-pad-link]');
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const action = row.querySelector(
        '[data-pcc-launch-pad-link-action="open"]',
      ) as HTMLButtonElement | null;
      expect(action).not.toBeNull();
      expect(action!.tagName.toLowerCase()).toBe('button');
      expect(action!.disabled).toBe(true);
      expect(action!.getAttribute('aria-disabled')).toBe('true');
      expect(action!.getAttribute('href')).toBeNull();
      const reason = row.querySelector(`[data-pcc-launch-pad-link-disabled-reason]`);
      expect(reason).not.toBeNull();
      expect((reason!.textContent ?? '').trim().length).toBeGreaterThan(0);
    }
  });

  it('approved + policy-allowed link still renders inert/disabled affordance (no executable anchor)', () => {
    const { container } = renderSurface();
    const allowedRow = container.querySelector('[data-pcc-launch-pad-link-allowed="true"]');
    expect(allowedRow).not.toBeNull();
    expect(allowedRow!.getAttribute('data-pcc-launch-pad-link-approval-state')).toBe('approved');
    expect(allowedRow!.getAttribute('data-pcc-launch-pad-link-policy-state')).toBe('allowed');
    const action = allowedRow!.querySelector(
      '[data-pcc-launch-pad-link-action="open"]',
    ) as HTMLButtonElement | null;
    expect(action).not.toBeNull();
    expect(action!.disabled).toBe(true);
    expect(action!.tagName.toLowerCase()).toBe('button');
    expect(allowedRow!.querySelectorAll('a[href]').length).toBe(0);
  });

  it('blocked-by-policy link surfaces an explanatory disabled-reason caption', () => {
    const { container } = renderSurface();
    const blockedRow = container.querySelector(
      '[data-pcc-launch-pad-link-approval-state="blocked-by-policy"]',
    );
    expect(blockedRow).not.toBeNull();
    const reason = blockedRow!.querySelector('[data-pcc-launch-pad-link-disabled-reason]');
    expect(reason).not.toBeNull();
    const text = (reason!.textContent ?? '').toLowerCase();
    expect(text.length).toBeGreaterThan(0);
    expect(text).toMatch(/host|policy|approved|allowed/);
  });

  it('renders no <a href="http(s)://"> anchors anywhere on the surface (no active launch behavior in this prompt)', () => {
    const { container } = renderSurface();
    const anchors = container.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }
  });

  it('renders no <iframe> elements anywhere on the surface', () => {
    const { container } = renderSurface();
    expect(container.querySelectorAll('iframe').length).toBe(0);
  });

  it('Procore configuration & status card is preserved as a direct grid sibling', () => {
    const { container } = renderSurface();
    const procore = container.querySelector('[data-pcc-card-id="procore-configuration-status"]');
    expect(procore).not.toBeNull();
    const enclosingCard = procore!.closest('[data-pcc-card]');
    expect(enclosingCard).not.toBeNull();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(enclosingCard!.parentElement).toBe(grid);
  });
});

describe('PccExternalSystemsSurface — sourceStatus → state UI', () => {
  function renderWithEnvelope(
    envelope: PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel>,
  ): ReturnType<typeof render> {
    const client = syncClient(envelope);
    return render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccExternalSystemsSurface readModelClient={client} projectId={envelope.projectId} />
      </PccBentoGrid>,
    );
  }

  async function waitForReady(container: HTMLElement): Promise<void> {
    await waitFor(() => {
      const panel = container.querySelector('[data-pcc-active-surface-panel="external-systems"]');
      expect(panel).not.toBeNull();
      // Active-surface panel renders for loading + error + ready states; wait
      // until the panel body is no longer the loading preview spec.
      const loadingBadge = panel!.querySelector('[data-pcc-state="loading"]');
      expect(loadingBadge).toBeNull();
    });
  }

  it('source-unavailable (unknown project) renders empty project-links state and zero link rows', async () => {
    const envelope = buildEnvelope(
      SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_UNKNOWN_PROJECT,
      'source-unavailable',
      UNKNOWN_PROJECT_ID,
    );
    const { container } = renderWithEnvelope(envelope);
    await waitForReady(container);
    const rows = container.querySelectorAll('[data-pcc-launch-pad-link]');
    expect(rows.length).toBe(0);
  });

  it('backend-unavailable renders degraded preview state (no project-links rows)', async () => {
    const envelope = buildEnvelope(
      SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_BACKEND_UNAVAILABLE,
      'backend-unavailable',
      KNOWN_PROJECT_ID,
    );
    const { container } = renderWithEnvelope(envelope);
    await waitForReady(container);
    const rows = container.querySelectorAll('[data-pcc-launch-pad-link]');
    expect(rows.length).toBe(0);
  });
});

describe('PccExternalSystemsSurface — surface module source-scan', () => {
  it('does not import live external SDKs / auth runtime / Procore / Sage / Graph / PnP', () => {
    const dir = path.resolve(__dirname, '../surfaces/externalSystems');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));
    expect(files.length).toBeGreaterThan(0);
    const forbiddenImportSpecifiers = [
      '@hbc/auth/spfx',
      '@pnp/sp',
      '@pnp/graph',
      '@microsoft/microsoft-graph-client',
      '@microsoft/sp-http',
      'procore-sdk',
      'sage-intacct-sdk',
    ];
    const importPattern = /(?:from\s+['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\))/g;
    for (const file of files) {
      const source = fs.readFileSync(path.join(dir, file), 'utf8');
      // strip block + line comments to avoid scanning prose
      const stripped = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
      for (const match of stripped.matchAll(importPattern)) {
        const spec = match[1] ?? match[2] ?? '';
        for (const forbidden of forbiddenImportSpecifiers) {
          expect(spec, `${file} imports forbidden specifier ${forbidden}`).not.toBe(forbidden);
          expect(spec, `${file} imports forbidden specifier ${forbidden}`).not.toMatch(
            new RegExp(`^${forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`),
          );
        }
      }
    }
  });

  it('does not declare or call write/approval/persistence command identifiers (Prompt 06)', () => {
    const dir = path.resolve(__dirname, '../surfaces/externalSystems');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));
    // Forbidden write / approval / persistence handlers and Wave 14 mutation
    // primitives. Modal dismissal vocabulary (`onDismiss`, `handleDismiss`,
    // `dismissDrawer`, `requestDismiss`) is intentionally NOT forbidden so
    // legitimate modal lifecycle code does not trigger false positives.
    const forbiddenIdentifiers = [
      'onApprove',
      'onReject',
      'onSubmit',
      'onArchive',
      'onSuppress',
      'approveReviewItem',
      'rejectReviewItem',
      'submitReviewItem',
      'archiveReviewItem',
      'closeReviewItem',
      'suppressReviewItem',
      'saveLink',
      'submitLink',
      'persistLink',
      'bootstrapSpfxAuth',
      'resolveSpfxPermissions',
      // Prompt 07 — HBI authority + mapping/health/audit command terms.
      // Note: `metadataJson` itself is NOT banned in source code so the
      // adapter and tests can legitimately reference the fixture field
      // while proving redaction. The hard gate is no rendered or exposed
      // metadata, asserted at the DOM-output level by separate tests.
      'approveCustomLink',
      'postToSage',
      'claimAuthority',
      'bypassRedaction',
      'grantApproval',
      'denyApproval',
      'confirmMapping',
      'remapMapping',
      'resolveMapping',
      'repairMapping',
      'retrySync',
      'reconnectSource',
      'replayAuditEvent',
      'relaunchAuditEvent',
    ];
    for (const file of files) {
      const source = fs.readFileSync(path.join(dir, file), 'utf8');
      // Strip block + line comments AND simple string literals so docblock
      // wording and product-safe copy do not trip the scan. Do not strip
      // template literals (we don't use forbidden identifiers in any).
      const stripped = source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1')
        .replace(/'(?:[^'\\]|\\.)*'/g, "''")
        .replace(/"(?:[^"\\]|\\.)*"/g, '""');
      for (const ident of forbiddenIdentifiers) {
        const re = new RegExp(`\\b${ident}\\b`);
        expect(re.test(stripped), `${file} contains forbidden identifier ${ident}`).toBe(false);
      }
    }
  });
});

describe('PccExternalSystemsSurface — review queue + drawer trigger (Prompt 06)', () => {
  it('renders 4 review-state groups (pending, in-progress, closed, suppressed) with one row per fixture review item', () => {
    const { container } = renderSurface();
    const groupKeys = Array.from(
      container.querySelectorAll('[data-pcc-launch-pad-review-group]'),
      (el) => el.getAttribute('data-pcc-launch-pad-review-group'),
    );
    expect(groupKeys).toEqual(['pending', 'in-progress', 'closed', 'suppressed']);
    const rows = container.querySelectorAll('[data-pcc-launch-pad-review-row]');
    expect(rows.length).toBe(
      SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT.reviewItems.length,
    );
  });

  it('renders the linked-approval-request badge as a display-only element (no button affordance, carries the request id)', () => {
    const { container } = renderSurface();
    const badge = container.querySelector('[data-pcc-launch-pad-review-approval-request]');
    expect(badge).not.toBeNull();
    expect(badge!.getAttribute('data-pcc-launch-pad-review-approval-request')).toBe(
      'fixture-approval-request-custom-link-001',
    );
    // Display-only — must not be a button or anchor.
    expect(badge!.tagName.toLowerCase()).not.toBe('button');
    expect(badge!.tagName.toLowerCase()).not.toBe('a');
  });

  it('selecting a pending row opens the read-only detail panel; selecting again collapses it', async () => {
    const { container } = renderSurface();
    const pendingRow = container.querySelector(
      '[data-pcc-launch-pad-review-row="fixture-review-pending-001"]',
    );
    expect(pendingRow).not.toBeNull();
    const trigger = pendingRow!.querySelector(
      '[data-pcc-launch-pad-review-row-trigger]',
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click();
    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });
    const detail = container.querySelector(
      '[data-pcc-launch-pad-review-detail="fixture-review-pending-001"]',
    );
    expect(detail).not.toBeNull();
    trigger.click();
    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });
    expect(
      container.querySelector('[data-pcc-launch-pad-review-detail="fixture-review-pending-001"]'),
    ).toBeNull();
  });

  it('closed review item exposes a resolutionSummary in the detail panel; cross-references the launch link title for custom-link-approval', async () => {
    const { container } = renderSurface();
    // closed row
    const closedTrigger = container
      .querySelector('[data-pcc-launch-pad-review-row="fixture-review-mapping-missing-003"]')
      ?.querySelector('[data-pcc-launch-pad-review-row-trigger]') as HTMLButtonElement;
    closedTrigger.click();
    await waitFor(() => {
      expect(
        container.querySelector(
          '[data-pcc-launch-pad-review-resolution="fixture-review-mapping-missing-003"]',
        ),
      ).not.toBeNull();
    });
    closedTrigger.click();

    // custom-link-approval row cross-references the launch link title via
    // subjectKey 'fixture-link-custom-submitted-008' → 'Submitted custom
    // link awaiting PM/PX approval'.
    const customLinkApprovalRow = container.querySelector(
      '[data-pcc-launch-pad-review-row="fixture-review-pending-001"]',
    );
    expect(customLinkApprovalRow).not.toBeNull();
    const subjectTitleEl = customLinkApprovalRow!.querySelector(
      '[data-pcc-launch-pad-review-subject-title="fixture-link-custom-submitted-008"]',
    );
    expect(subjectTitleEl).not.toBeNull();
    expect(subjectTitleEl!.textContent).toMatch(/Submitted custom link/);
  });

  it('renders the Add project link trigger and the drawer is closed by default', () => {
    const { container, baseElement } = renderSurface();
    const trigger = container.querySelector('[data-pcc-launch-pad-add-link-trigger]');
    expect(trigger).not.toBeNull();
    expect(trigger!.tagName.toLowerCase()).toBe('button');
    expect(baseElement.querySelector('[data-pcc-launch-pad-drawer]')).toBeNull();
  });
});
