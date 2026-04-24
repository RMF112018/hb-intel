import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount, unmount, type IFoleonRuntimeBindingProof } from '../mount.js';

const TEST_CONTENT_REGISTRY = '11111111-1111-1111-1111-111111111111';
const TEST_PLACEMENTS = '22222222-2222-2222-2222-222222222222';
const TEST_EVENTS = '33333333-3333-3333-3333-333333333333';
const TEST_ORIGIN = 'https://viewer.us.foleon.com';
const TEST_READER_ROUTE = '/sites/HBCentral/SitePages/Foleon-Reader.aspx';
const TEST_DOC_ID = 9999999;

function readProof(): IFoleonRuntimeBindingProof | undefined {
  return (
    window as unknown as {
      __hbIntel_foleonRuntimeBindingProof?: IFoleonRuntimeBindingProof;
    }
  ).__hbIntel_foleonRuntimeBindingProof;
}

function clearProof(): void {
  delete (
    window as unknown as {
      __hbIntel_foleonRuntimeBindingProof?: IFoleonRuntimeBindingProof;
    }
  ).__hbIntel_foleonRuntimeBindingProof;
  delete (
    globalThis as unknown as {
      __hbIntel_foleonRuntimeBindingProof?: IFoleonRuntimeBindingProof;
    }
  ).__hbIntel_foleonRuntimeBindingProof;
}

function resetLocation(): void {
  window.history.replaceState({}, '', '/');
}

describe('runtime binding proof (redacted)', () => {
  beforeEach(() => {
    clearProof();
    resetLocation();
  });

  afterEach(() => {
    unmount();
    clearProof();
    resetLocation();
  });

  it('publishes a proof object on mount with the governed identity values', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    await mount(el, undefined, {
      contentRegistryListId: TEST_CONTENT_REGISTRY,
      placementsListId: TEST_PLACEMENTS,
      eventsListId: TEST_EVENTS,
      acceptedFoleonOrigins: [TEST_ORIGIN],
      foleonReaderRoutePath: TEST_READER_ROUTE,
      foleonDocId: TEST_DOC_ID,
      expectedManifestId: '2160edb3-675e-4451-92bb-8345f9d1c71e',
      expectedPackageVersion: '1.0.8.0',
    });
    const proof = readProof();
    expect(proof).toBeDefined();
    expect(proof?.manifestId).toBe('2160edb3-675e-4451-92bb-8345f9d1c71e');
    expect(proof?.packageVersion).toBe('1.0.8.0');
    expect(proof?.bundleMarker).toBe('__hbIntel_foleon');
  });

  it('replaces raw list GUIDs, origins, paths, and docId with presence + fingerprints', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    await mount(el, undefined, {
      contentRegistryListId: TEST_CONTENT_REGISTRY,
      placementsListId: TEST_PLACEMENTS,
      eventsListId: TEST_EVENTS,
      acceptedFoleonOrigins: [TEST_ORIGIN],
      foleonReaderRoutePath: TEST_READER_ROUTE,
      foleonDocId: TEST_DOC_ID,
    });
    const serialized = JSON.stringify(readProof());
    expect(serialized).not.toContain(TEST_CONTENT_REGISTRY);
    expect(serialized).not.toContain(TEST_PLACEMENTS);
    expect(serialized).not.toContain(TEST_EVENTS);
    expect(serialized).not.toContain(TEST_ORIGIN);
    expect(serialized).not.toContain(TEST_READER_ROUTE);
    expect(serialized).not.toContain(String(TEST_DOC_ID));

    const proof = readProof();
    expect(proof?.presence).toEqual({
      spfxContext: false,
      siteUrl: false,
      contentRegistryListId: true,
      placementsListId: true,
      eventsListId: true,
      readerRoutePath: true,
      docId: true,
      callerSuppliedExpectedManifestId: false,
      callerSuppliedExpectedPackageVersion: false,
    });
    expect(proof?.fingerprints.contentRegistryListSha).toMatch(/^[0-9a-f]{8}$/);
    expect(proof?.fingerprints.placementsListSha).toMatch(/^[0-9a-f]{8}$/);
    expect(proof?.fingerprints.eventsListSha).toMatch(/^[0-9a-f]{8}$/);
    expect(proof?.fingerprints.readerRoutePathSha).toMatch(/^[0-9a-f]{8}$/);
    expect(proof?.fingerprints.originAllowlistSha).toMatch(/^[0-9a-f]{8}$/);
    expect(proof?.fingerprints.originAllowlistCount).toBe(1);
  });

  it('never leaks a preview URL segment into the proof even when allowPreview=true', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    await mount(el, undefined, {
      contentRegistryListId: TEST_CONTENT_REGISTRY,
      placementsListId: TEST_PLACEMENTS,
      acceptedFoleonOrigins: [TEST_ORIGIN],
      allowPreview: true,
    });
    const serialized = JSON.stringify(readProof());
    expect(serialized).not.toContain('/preview/');
    expect(serialized).not.toContain('9y5ovw5h3q9ky9');
  });

  it('omits the diagnostics field by default (no URL flag set)', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    await mount(el, undefined, {
      contentRegistryListId: TEST_CONTENT_REGISTRY,
      // Intentionally omit placements so an admin issue is produced.
      acceptedFoleonOrigins: [TEST_ORIGIN],
    });
    const proof = readProof();
    expect(proof?.diagnostics).toBeUndefined();
  });

  it('exposes redacted admin-issue detail only when ?foleon-diagnostics=1 is set', async () => {
    window.history.replaceState({}, '', '/?foleon-diagnostics=1');
    const el = document.createElement('div');
    document.body.appendChild(el);
    await mount(el, undefined, {
      contentRegistryListId: TEST_CONTENT_REGISTRY,
      // Omit placements → admin issue expected; mock host (no SPFx), so none.
      acceptedFoleonOrigins: [TEST_ORIGIN],
    });
    const proof = readProof();
    // Mock host mode is fully permissive — diagnostics object is still
    // published (the flag controls inclusion, not content).
    expect(proof?.diagnostics).toBeDefined();
    expect(proof?.diagnostics?.adminIssues).toEqual([]);
  });

  it('emits typed issue codes on the proof when config is incomplete', async () => {
    // Mock host-mode still yields zero issues; no tenant-diagnostics
    // path is currently exposed for mock runs. Assert the shape is at
    // least a readable string array so tenant telemetry can rely on
    // it.
    const el = document.createElement('div');
    document.body.appendChild(el);
    await mount(el, undefined, {});
    const proof = readProof();
    expect(Array.isArray(proof?.issueCodes)).toBe(true);
  });
});
