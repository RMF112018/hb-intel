import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import {
  SafetyFieldExcellenceDynamicProvider,
  type SafetyFieldExcellenceDynamicResolution,
} from '../SafetyFieldExcellenceDynamicProvider.js';
import {
  clearSafetyFieldExcellenceRuntimeProof,
  readSafetyFieldExcellenceRuntimeProof,
} from '../safetyFieldExcellenceRuntimeProof.js';

function buildPublishedResponse(): Response {
  const body = {
    state: 'published',
    highlight: {
      itemId: 9001,
      publishStatus: 'published',
      reportingPeriodId: 'period-1',
      reportingPeriodSpItemId: 1,
      periodLabel: '2026-W17',
      weekStartDate: '2026-04-20',
      weekEndDate: '2026-04-26',
      publishedAt: '2026-04-25T12:00:00.000Z',
      freshUntil: '2026-05-02T12:00:00.000Z',
      isStale: false,
      dataConfidence: 'high',
      homepagePayload: {
        heading: 'Safety',
        topLineSummary: { statusLabel: 'Verified', summaryText: 'Recognition.' },
        primarySpotlight: { id: 'p-1', title: 'Project · Primary', summary: 'Strong week.' },
        secondarySignals: [],
        isPreview: false,
        dataConfidence: 'high',
      },
    },
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function buildNoPublishedResponse(): Response {
  return new Response(JSON.stringify({ state: 'no-published-highlight' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function captureResolution(): {
  current: () => SafetyFieldExcellenceDynamicResolution | undefined;
  child: (r: SafetyFieldExcellenceDynamicResolution) => React.ReactNode;
} {
  let last: SafetyFieldExcellenceDynamicResolution | undefined;
  return {
    current: () => last,
    child: (r) => {
      last = r;
      return <div data-testid="resolution">{r.state}</div>;
    },
  };
}

describe('SafetyFieldExcellenceDynamicProvider', () => {
  beforeEach(() => {
    clearSafetyFieldExcellenceRuntimeProof();
  });

  afterEach(() => {
    clearSafetyFieldExcellenceRuntimeProof();
  });

  it('curated-only mode does not fetch and records dataSource curated', async () => {
    const fetchImpl = vi.fn();
    const cap = captureResolution();
    render(
      <SafetyFieldExcellenceDynamicProvider
        sourceMode="curated-only"
        functionAppBaseUrl="https://x.example"
        getFunctionAppToken={async () => 'token'}
        hasCuratedConfig={true}
        fetchImpl={fetchImpl as unknown as typeof fetch}
      >
        {cap.child}
      </SafetyFieldExcellenceDynamicProvider>,
    );
    await waitFor(() => {
      expect(cap.current()?.state).toBe('idle');
    });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(readSafetyFieldExcellenceRuntimeProof()?.dataSource).toBe('curated');
  });

  it('dynamic-with-curated-fallback returns curated-fallback on no-published', async () => {
    const fetchImpl = vi.fn(async () => buildNoPublishedResponse());
    const cap = captureResolution();
    render(
      <SafetyFieldExcellenceDynamicProvider
        sourceMode="dynamic-with-curated-fallback"
        functionAppBaseUrl="https://x.example"
        getFunctionAppToken={async () => 'token'}
        hasCuratedConfig={true}
        fetchImpl={fetchImpl as unknown as typeof fetch}
      >
        {cap.child}
      </SafetyFieldExcellenceDynamicProvider>,
    );
    await waitFor(() => {
      expect(cap.current()?.dataSource).toBe('curated-fallback');
    });
    expect(cap.current()?.state).toBe('no-published-highlight');
  });

  it('dynamic-only returns preview-fallback on no-published', async () => {
    const fetchImpl = vi.fn(async () => buildNoPublishedResponse());
    const cap = captureResolution();
    render(
      <SafetyFieldExcellenceDynamicProvider
        sourceMode="dynamic-only"
        functionAppBaseUrl="https://x.example"
        getFunctionAppToken={async () => 'token'}
        hasCuratedConfig={false}
        fetchImpl={fetchImpl as unknown as typeof fetch}
      >
        {cap.child}
      </SafetyFieldExcellenceDynamicProvider>,
    );
    await waitFor(() => {
      expect(cap.current()?.dataSource).toBe('preview-fallback');
    });
    expect(cap.current()?.state).toBe('preview');
    expect(cap.current()?.config).toBeDefined();
  });

  it('dynamic-only renders dynamic when valid published', async () => {
    const fetchImpl = vi.fn(async () => buildPublishedResponse());
    const cap = captureResolution();
    render(
      <SafetyFieldExcellenceDynamicProvider
        sourceMode="dynamic-only"
        functionAppBaseUrl="https://x.example"
        getFunctionAppToken={async () => 'token'}
        hasCuratedConfig={false}
        fetchImpl={fetchImpl as unknown as typeof fetch}
      >
        {cap.child}
      </SafetyFieldExcellenceDynamicProvider>,
    );
    await waitFor(() => {
      expect(cap.current()?.dataSource).toBe('dynamic');
    });
    expect(cap.current()?.state).toBe('ready');
    expect(cap.current()?.config?.primarySpotlight?.id).toBe('p-1');
  });

  it('dynamic-with-curated-fallback returns curated-fallback on auth error', async () => {
    const fetchImpl = vi.fn(async () => new Response('forbidden', { status: 401 }));
    const cap = captureResolution();
    render(
      <SafetyFieldExcellenceDynamicProvider
        sourceMode="dynamic-with-curated-fallback"
        functionAppBaseUrl="https://x.example"
        getFunctionAppToken={async () => 'token'}
        hasCuratedConfig={true}
        fetchImpl={fetchImpl as unknown as typeof fetch}
      >
        {cap.child}
      </SafetyFieldExcellenceDynamicProvider>,
    );
    await waitFor(() => {
      expect(cap.current()?.dataSource).toBe('curated-fallback');
    });
    expect(cap.current()?.state).toBe('auth-error');
  });

  it('dynamic-only renders error-fallback (preview) on network error', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('network down');
    });
    const cap = captureResolution();
    render(
      <SafetyFieldExcellenceDynamicProvider
        sourceMode="dynamic-only"
        functionAppBaseUrl="https://x.example"
        getFunctionAppToken={async () => 'token'}
        hasCuratedConfig={false}
        fetchImpl={fetchImpl as unknown as typeof fetch}
      >
        {cap.child}
      </SafetyFieldExcellenceDynamicProvider>,
    );
    await waitFor(() => {
      expect(cap.current()?.dataSource).toBe('error-fallback');
    });
    expect(cap.current()?.state).toBe('network-error');
    expect(cap.current()?.config).toBeDefined();
  });

  it('dynamic-with-curated-fallback degrades gracefully when token/baseUrl missing', async () => {
    const cap = captureResolution();
    render(
      <SafetyFieldExcellenceDynamicProvider
        sourceMode="dynamic-with-curated-fallback"
        hasCuratedConfig={true}
      >
        {cap.child}
      </SafetyFieldExcellenceDynamicProvider>,
    );
    await waitFor(() => {
      expect(cap.current()?.dataSource).toBe('curated-fallback');
    });
    expect(cap.current()?.fallbackReason).toContain('not-configured');
  });

  it('Wave 07.1 diagnostic: when neither prop is passed, runtime proof leaves both fields undefined', async () => {
    const cap = captureResolution();
    render(
      <SafetyFieldExcellenceDynamicProvider
        sourceMode="curated-only"
        hasCuratedConfig={true}
      >
        {cap.child}
      </SafetyFieldExcellenceDynamicProvider>,
    );
    await waitFor(() => {
      expect(cap.current()?.state).toBe('idle');
    });
    const proof = readSafetyFieldExcellenceRuntimeProof();
    expect(proof?.safetyFieldExcellenceDynamicConfigSeen).toBeUndefined();
    expect(proof?.safetyFieldExcellenceDynamicConfigResolved).toBeUndefined();
  });

  it('Wave 07.1 diagnostic: seen=true, resolved=false surfaces the exact values on the proof', async () => {
    const cap = captureResolution();
    render(
      <SafetyFieldExcellenceDynamicProvider
        sourceMode="curated-only"
        hasCuratedConfig={true}
        safetyFieldExcellenceDynamicConfigSeen={true}
        safetyFieldExcellenceDynamicConfigResolved={false}
      >
        {cap.child}
      </SafetyFieldExcellenceDynamicProvider>,
    );
    await waitFor(() => {
      expect(cap.current()?.state).toBe('idle');
    });
    const proof = readSafetyFieldExcellenceRuntimeProof();
    expect(proof?.safetyFieldExcellenceDynamicConfigSeen).toBe(true);
    expect(proof?.safetyFieldExcellenceDynamicConfigResolved).toBe(false);
  });

  it('Wave 07.1 diagnostic: seen=true, resolved=true surfaces both as true on the proof', async () => {
    const fetchImpl = vi.fn(async () => buildNoPublishedResponse());
    const cap = captureResolution();
    render(
      <SafetyFieldExcellenceDynamicProvider
        sourceMode="dynamic-only"
        functionAppBaseUrl="https://x.example"
        getFunctionAppToken={async () => 'token'}
        hasCuratedConfig={false}
        fetchImpl={fetchImpl as unknown as typeof fetch}
        safetyFieldExcellenceDynamicConfigSeen={true}
        safetyFieldExcellenceDynamicConfigResolved={true}
      >
        {cap.child}
      </SafetyFieldExcellenceDynamicProvider>,
    );
    await waitFor(() => {
      expect(cap.current()?.dataSource).toBe('preview-fallback');
    });
    const proof = readSafetyFieldExcellenceRuntimeProof();
    expect(proof?.safetyFieldExcellenceDynamicConfigSeen).toBe(true);
    expect(proof?.safetyFieldExcellenceDynamicConfigResolved).toBe(true);
  });

  it('runtime proof never includes tokens or raw payload content', async () => {
    const fetchImpl = vi.fn(async () => buildPublishedResponse());
    const cap = captureResolution();
    render(
      <SafetyFieldExcellenceDynamicProvider
        sourceMode="dynamic-only"
        functionAppBaseUrl="https://x.example"
        getFunctionAppToken={async () => 'super-secret-token'}
        hasCuratedConfig={false}
        fetchImpl={fetchImpl as unknown as typeof fetch}
      >
        {cap.child}
      </SafetyFieldExcellenceDynamicProvider>,
    );
    await waitFor(() => {
      expect(cap.current()?.dataSource).toBe('dynamic');
    });
    const proof = readSafetyFieldExcellenceRuntimeProof();
    const serialized = JSON.stringify(proof);
    expect(serialized).not.toContain('super-secret-token');
    expect(serialized).not.toMatch(/RawChecklistJson|rawChecklistJson|inspector/i);
  });
});
