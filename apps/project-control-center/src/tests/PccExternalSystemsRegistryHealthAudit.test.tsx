/**
 * Wave 15 / Prompt 07 — Registry, Mapping, Health, Audit, HBI Lineage tests.
 *
 * Asserts the five new read-only / metadata-only cards render correctly
 * from the composite read-model fixture and preserve all guardrails:
 *   - registry grouped by posture; active/launch-only-inactive markers;
 *   - mapping status grouped by canonical mappingState; conflict /
 *     stale / missing rows render their distinguishing data attributes;
 *   - mapping detail toggle (read-only inline panel); cross-references
 *     reviewItemId and conflictingMappingId; no Wave 14 mutation paths;
 *   - source health grouped by severity (critical → warning → info);
 *     degraded / throttled show recommendedAction; unavailable does NOT
 *     render lastSuccessfulRead;
 *   - audit history newest-first; metadata redaction asserted by
 *     scanning rendered DOM text + data-* + title + aria-label for
 *     fixture metadataJson substrings (host-not-approved,
 *     approve-custom-link);
 *   - HBI lineage citation-ready / refusal / unauthorized branches;
 *     boundary copy always rendered; no authority-action buttons.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT } from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccExternalSystemsSurface } from '../surfaces/externalSystems/PccExternalSystemsSurface';

function renderSurface(): ReturnType<typeof render> {
  return render(
    <PccBentoGrid forceMode="wideDesktop">
      <PccExternalSystemsSurface />
    </PccBentoGrid>,
  );
}

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Registry card
// ---------------------------------------------------------------------------

describe('PccExternalSystemsRegistryCard — Prompt 07', () => {
  it('renders one row per system def in the fixture, grouped by posture in canonical order', () => {
    const { container } = renderSurface();
    const rows = container.querySelectorAll('[data-pcc-launch-pad-registry-row]');
    expect(rows.length).toBe(
      SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT.systemDefinitions.length,
    );
    const groupKeys = Array.from(
      container.querySelectorAll('[data-pcc-launch-pad-registry-group]'),
      (el) => el.getAttribute('data-pcc-launch-pad-registry-group'),
    );
    expect(groupKeys).toEqual([
      'mvp-required',
      'mvp-optional',
      'conditional',
      'project-configurable',
      'project-configurable-approval-gated',
    ]);
  });

  it('flags `liveReadPosture: not-authorized` rows as `launch-only-inactive`; others as `active`', () => {
    const { container } = renderSurface();
    const inactiveRows = container.querySelectorAll(
      '[data-pcc-launch-pad-registry-active="launch-only-inactive"]',
    );
    expect(inactiveRows.length).toBeGreaterThan(0);
    for (const row of inactiveRows) {
      expect(row.getAttribute('data-pcc-launch-pad-registry-live-read')).toBe('not-authorized');
    }
    const activeRows = container.querySelectorAll('[data-pcc-launch-pad-registry-active="active"]');
    expect(activeRows.length).toBeGreaterThan(0);
    for (const row of activeRows) {
      expect(row.getAttribute('data-pcc-launch-pad-registry-live-read')).not.toBe('not-authorized');
    }
  });
});

// ---------------------------------------------------------------------------
// Mapping status + detail
// ---------------------------------------------------------------------------

describe('PccExternalSystemsMappingStatusCard — Prompt 07', () => {
  it('renders one row per fixture mapping, grouped by canonical mapping state', () => {
    const { container } = renderSurface();
    const rows = container.querySelectorAll('[data-pcc-launch-pad-mapping-row]');
    expect(rows.length).toBe(
      SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT.projectMappings.length,
    );
    const groupKeys = Array.from(
      container.querySelectorAll('[data-pcc-launch-pad-mapping-group]'),
      (el) => el.getAttribute('data-pcc-launch-pad-mapping-group'),
    );
    expect(groupKeys).toEqual([
      'not-mapped',
      'mapped',
      'stale',
      'conflict',
      'missing',
      'review-required',
      'blocked',
      'confirmed',
    ]);
  });

  it('conflict row carries conflictingMappingId; stale row carries state marker; missing/not-mapped rows have no external-object marker', () => {
    const { container } = renderSurface();
    const conflict = container.querySelector(
      '[data-pcc-launch-pad-mapping-row="fixture-mapping-procore-conflict-004"]',
    );
    expect(conflict).not.toBeNull();
    expect(conflict!.getAttribute('data-pcc-launch-pad-mapping-conflicting-id')).toBe(
      'fixture-mapping-procore-confirmed-001',
    );

    const stale = container.querySelector(
      '[data-pcc-launch-pad-mapping-row="fixture-mapping-procore-stale-003"]',
    );
    expect(stale).not.toBeNull();
    expect(stale!.getAttribute('data-pcc-launch-pad-mapping-state')).toBe('stale');

    const missing = container.querySelector(
      '[data-pcc-launch-pad-mapping-row="fixture-mapping-sage-missing-006"]',
    );
    expect(missing).not.toBeNull();
    expect(missing!.getAttribute('data-pcc-launch-pad-mapping-has-external-object')).toBeNull();

    const notMapped = container.querySelector(
      '[data-pcc-launch-pad-mapping-row="fixture-mapping-procore-not-mapped-005"]',
    );
    expect(notMapped).not.toBeNull();
    expect(notMapped!.getAttribute('data-pcc-launch-pad-mapping-has-external-object')).toBeNull();
  });

  it('clicking a mapping row toggles a read-only detail panel (no buttons inside that act as commands)', async () => {
    const { container } = renderSurface();
    const mappingRow = container.querySelector(
      '[data-pcc-launch-pad-mapping-row="fixture-mapping-procore-conflict-004"]',
    )!;
    const trigger = mappingRow.querySelector(
      '[data-pcc-launch-pad-mapping-row-trigger]',
    ) as HTMLButtonElement;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });
    const detail = container.querySelector(
      '[data-pcc-launch-pad-mapping-detail="fixture-mapping-procore-conflict-004"]',
    );
    expect(detail).not.toBeNull();
    // Detail panel must not contain any button (read-only).
    expect(detail!.querySelectorAll('button').length).toBe(0);
    // Cross-reference badge must be a span (display-only), not button/anchor.
    const reviewBadge = detail!.querySelector('[data-pcc-launch-pad-mapping-review-item]');
    expect(reviewBadge).not.toBeNull();
    expect(reviewBadge!.tagName.toLowerCase()).toBe('span');
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });
    expect(
      container.querySelector(
        '[data-pcc-launch-pad-mapping-detail="fixture-mapping-procore-conflict-004"]',
      ),
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Source health
// ---------------------------------------------------------------------------

describe('PccExternalSystemsSourceHealthCard — Prompt 07', () => {
  it('renders one row per fixture snapshot, grouped by severity (critical → warning → info)', () => {
    const { container } = renderSurface();
    const rows = container.querySelectorAll('[data-pcc-launch-pad-health-row]');
    expect(rows.length).toBe(
      SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT.healthSnapshots.length,
    );
    const groupKeys = Array.from(
      container.querySelectorAll('[data-pcc-launch-pad-health-group]'),
      (el) => el.getAttribute('data-pcc-launch-pad-health-group'),
    );
    expect(groupKeys).toEqual(['critical', 'warning', 'info']);
  });

  it('degraded and throttled rows render recommendedAction; unavailable row does NOT render lastSuccessfulRead', () => {
    const { container } = renderSurface();
    const degraded = container.querySelector(
      '[data-pcc-launch-pad-health-row="fixture-health-procore-degraded-003"]',
    )!;
    expect(degraded.getAttribute('data-pcc-launch-pad-health-state')).toBe('degraded');
    expect(
      degraded.querySelector(
        '[data-pcc-launch-pad-health-recommended-action="fixture-health-procore-degraded-003"]',
      ),
    ).not.toBeNull();

    const throttled = container.querySelector(
      '[data-pcc-launch-pad-health-row="fixture-health-procore-throttled-007"]',
    )!;
    expect(throttled.getAttribute('data-pcc-launch-pad-health-state')).toBe('throttled');
    expect(
      throttled.querySelector(
        '[data-pcc-launch-pad-health-recommended-action="fixture-health-procore-throttled-007"]',
      ),
    ).not.toBeNull();

    const unavailable = container.querySelector(
      '[data-pcc-launch-pad-health-row="fixture-health-sage-unavailable-004"]',
    )!;
    expect(unavailable.getAttribute('data-pcc-launch-pad-health-state')).toBe('unavailable');
    expect((unavailable.textContent ?? '').toLowerCase()).not.toContain('last successful read');
  });
});

// ---------------------------------------------------------------------------
// Audit history (metadata redaction is the hard gate)
// ---------------------------------------------------------------------------

describe('PccExternalSystemsAuditHistoryCard — Prompt 07', () => {
  it('renders one row per fixture event newest-first; system actor null → "system"', () => {
    const { container } = renderSurface();
    const rows = Array.from(container.querySelectorAll('[data-pcc-launch-pad-audit-row]'));
    expect(rows.length).toBe(
      SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT.auditEvents.length,
    );
    // Newest first: occurredAtUtc descending.
    const dates = rows.map((r) => r.querySelector('time')!.getAttribute('datetime')!);
    const sorted = [...dates].slice().sort((a, b) => (a < b ? 1 : -1));
    expect(dates).toEqual(sorted);
    // Events with actorUpn=null render `actor: system`.
    const systemActorRow = container.querySelector(
      '[data-pcc-launch-pad-audit-row="fixture-audit-mapping-conflict-detected-006"]',
    )!;
    expect(systemActorRow.getAttribute('data-pcc-launch-pad-audit-event-type')).toBe(
      'mapping-conflict-detected',
    );
    expect(
      systemActorRow.querySelector('[data-pcc-launch-pad-audit-actor="system"]'),
    ).not.toBeNull();
  });

  it('redacts metadataJson — fixture metadata substrings never appear in rendered text or attributes (data-* / title / aria-label)', () => {
    const { container } = renderSurface();
    const auditCard = container.querySelector('[data-pcc-launch-pad-lane="audit-history"]')!;
    const text = (auditCard.textContent ?? '').toLowerCase();
    // launch-blocked event metadataJson: {"reason":"host-not-approved"}
    expect(text).not.toContain('host-not-approved');
    // hbi-refusal-issued event metadataJson: {"refusalCode":"approve-custom-link"}
    // (HBI lineage card may legitimately surface a different refusalCode for
    // its OWN entries; we constrain the assertion to the audit-history card.)
    expect(text).not.toContain('approve-custom-link');
    // Also sweep all data-* / title / aria-label attribute values within the
    // audit card to catch any back-channel exposure.
    const allAttributedNodes = auditCard.querySelectorAll('*');
    for (const node of allAttributedNodes) {
      for (const attr of node.attributes) {
        if (attr.name === 'title' || attr.name === 'aria-label' || attr.name.startsWith('data-')) {
          const val = (attr.value ?? '').toLowerCase();
          expect(val, `${attr.name}=${val} should not contain redacted metadata`).not.toContain(
            'host-not-approved',
          );
          expect(val, `${attr.name}=${val} should not contain redacted metadata`).not.toContain(
            'approve-custom-link',
          );
        }
      }
    }
  });

  it('renders no buttons inside the audit card (display-only, no replay/relaunch/repair)', () => {
    const { container } = renderSurface();
    const auditCard = container.querySelector('[data-pcc-launch-pad-lane="audit-history"]')!;
    expect(auditCard.querySelectorAll('button').length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// HBI source lineage (no authority)
// ---------------------------------------------------------------------------

describe('PccExternalSystemsHbiLineageCard — Prompt 07', () => {
  it('always renders the boundary copy "HBI is not an authority…"', () => {
    const { container } = renderSurface();
    const boundary = container.querySelector('[data-pcc-launch-pad-hbi-boundary-copy]');
    expect(boundary).not.toBeNull();
    expect((boundary!.textContent ?? '').toLowerCase()).toContain('hbi is not an authority');
  });

  it('citation-ready entry renders source attribution + citation label', () => {
    const { container } = renderSurface();
    const entry = container.querySelector(
      '[data-pcc-launch-pad-hbi-lineage-entry="project.procoreProjectId"]',
    )!;
    expect(entry.getAttribute('data-pcc-launch-pad-hbi-lineage-state')).toBe('citation-ready');
    const citation = entry.querySelector(
      '[data-pcc-launch-pad-hbi-citation="project.procoreProjectId"]',
    );
    expect(citation).not.toBeNull();
    expect(entry.textContent).toContain('Procore Projects');
    expect(entry.textContent).toContain('Procore › Projects › 999001');
  });

  it('refusal entry renders refusal copy mapped from canonical HBI_REFUSED_CAPABILITIES', () => {
    const { container } = renderSurface();
    const refusalNode = container.querySelector(
      '[data-pcc-launch-pad-hbi-refusal-code="approve-custom-link"]',
    );
    expect(refusalNode).not.toBeNull();
    expect((refusalNode!.textContent ?? '').toLowerCase()).toContain('hbi cannot');
    expect((refusalNode!.textContent ?? '').toLowerCase()).toContain('approve a custom link');
  });

  it('unauthorized entry renders only the redacted caption — no source list / object id / citation label leak', () => {
    const { container } = renderSurface();
    const entry = container.querySelector(
      '[data-pcc-launch-pad-hbi-lineage-entry="project.sageIntacctProjectId"]',
    )!;
    expect(entry.getAttribute('data-pcc-launch-pad-hbi-lineage-state')).toBe('unauthorized');
    expect(
      entry.querySelector('[data-pcc-launch-pad-hbi-redacted="project.sageIntacctProjectId"]'),
    ).not.toBeNull();
    const text = (entry.textContent ?? '').toLowerCase();
    // The fixture's unauthorized branch never carries source details, but
    // assert the card text doesn't somehow surface Sage Intacct source
    // identifiers either.
    expect(text).not.toContain('si-999001');
    expect(text).not.toContain('sage intacct projects');
  });

  it('HBI lineage card has no buttons whose accessible name implies authority (approve/reject/post/claim/submit/archive/override)', () => {
    const { container } = renderSurface();
    const card = container.querySelector('[data-pcc-launch-pad-lane="hbi-lineage"]')!;
    const buttons = card.querySelectorAll('button');
    for (const b of buttons) {
      const name = (b.getAttribute('aria-label') ?? b.textContent ?? '').toLowerCase();
      expect(name).not.toMatch(/approve|reject|post|claim|submit|archive|override/);
    }
  });
});

// ---------------------------------------------------------------------------
// Cross-card guardrails
// ---------------------------------------------------------------------------

describe('External Systems surface — Prompt 07 cross-card guardrails', () => {
  it('renders no <a href="http(s)://"> anchors and no <iframe> across the surface', () => {
    const { container } = renderSurface();
    const anchors = container.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }
    expect(container.querySelectorAll('iframe').length).toBe(0);
  });

  it('preserves bento direct-child invariant after Prompt 07 cards land', () => {
    const { container } = renderSurface();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    const cards = container.querySelectorAll('[data-pcc-card]');
    for (const card of cards) {
      expect(card.parentElement).toBe(grid);
    }
  });

  it('preserves the active-surface-panel singleton', () => {
    const { container } = renderSurface();
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels.length).toBe(1);
    expect(panels[0]?.getAttribute('data-pcc-active-surface-panel')).toBe('external-systems');
  });
});
