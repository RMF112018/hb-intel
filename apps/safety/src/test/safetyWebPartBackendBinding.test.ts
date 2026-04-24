import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const WEBPART_SOURCE = readFileSync(
  resolve(import.meta.dirname, '../webparts/safety/SafetyWebPart.tsx'),
  'utf-8',
);

describe('SafetyWebPart backend binding source proof', () => {
  it('passes functionAppUrl and apiAudience into mount config', () => {
    expect(WEBPART_SOURCE).toContain('functionAppUrl,');
    expect(WEBPART_SOURCE).toContain('apiAudience,');
    expect(WEBPART_SOURCE).toContain('this.properties.functionAppUrl');
    expect(WEBPART_SOURCE).toContain('this.properties.apiAudience');
  });

  it('exposes functionAppUrl and apiAudience in property pane', () => {
    expect(WEBPART_SOURCE).toContain("PropertyPaneTextField('functionAppUrl'");
    expect(WEBPART_SOURCE).toContain("PropertyPaneTextField('apiAudience'");
  });

  it('reads acceptedBackendOrigin from governed binding, not from property pane', () => {
    // Governance: the allowlist is NOT derived from any this.properties value.
    // The origin comes from SAFETY_ACCEPTED_BACKEND_ORIGIN.
    expect(WEBPART_SOURCE).toContain('SAFETY_ACCEPTED_BACKEND_ORIGIN');
    expect(WEBPART_SOURCE).toContain('acceptedBackendOrigin: SAFETY_ACCEPTED_BACKEND_ORIGIN');
    // Old derivation helper must not return — the property-pane typo path is closed.
    expect(WEBPART_SOURCE).not.toMatch(/tryResolveOrigin\s*\(/);
    expect(WEBPART_SOURCE).not.toMatch(
      /acceptedBackendOrigin\s*=\s*this\.tryResolveOrigin\(/,
    );
  });

  it('reads expectedApiAudience from governed binding, not from property pane', () => {
    expect(WEBPART_SOURCE).toContain('SAFETY_EXPECTED_API_AUDIENCE');
    expect(WEBPART_SOURCE).toContain('expectedApiAudience: SAFETY_EXPECTED_API_AUDIENCE');
  });

  it('reads manifest id and package version from governed binding module', () => {
    expect(WEBPART_SOURCE).toContain('SAFETY_WEBPART_MANIFEST_ID');
    expect(WEBPART_SOURCE).toContain('SAFETY_PACKAGE_VERSION');
    // No class-scoped redeclaration.
    expect(WEBPART_SOURCE).not.toMatch(/private static readonly SAFETY_MANIFEST_ID/);
    expect(WEBPART_SOURCE).not.toMatch(/private static readonly SAFETY_PACKAGE_VERSION/);
  });
});
