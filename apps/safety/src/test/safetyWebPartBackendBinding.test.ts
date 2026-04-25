import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const WEBPART_SOURCE = readFileSync(
  resolve(import.meta.dirname, '../webparts/safety/SafetyWebPart.tsx'),
  'utf-8',
);

describe('SafetyWebPart backend binding source proof', () => {
  it('passes governed functionAppUrl and apiAudience constants into mount config', () => {
    expect(WEBPART_SOURCE).toContain('functionAppUrl: SAFETY_DEFAULT_FUNCTION_APP_URL');
    expect(WEBPART_SOURCE).toContain('apiAudience: SAFETY_DEFAULT_API_AUDIENCE');
  });

  it('does not source backend URL or API audience from page-instance properties', () => {
    expect(WEBPART_SOURCE).not.toContain('this.properties.functionAppUrl');
    expect(WEBPART_SOURCE).not.toContain('this.properties.apiAudience');
  });

  it('does not expose backend URL or API audience as property-pane fields', () => {
    expect(WEBPART_SOURCE).not.toContain("PropertyPaneTextField('functionAppUrl'");
    expect(WEBPART_SOURCE).not.toContain("PropertyPaneTextField('apiAudience'");
  });

  it('reads acceptedBackendOrigin from governed binding, not from property pane', () => {
    expect(WEBPART_SOURCE).toContain('SAFETY_ACCEPTED_BACKEND_ORIGIN');
    expect(WEBPART_SOURCE).toContain('acceptedBackendOrigin: SAFETY_ACCEPTED_BACKEND_ORIGIN');
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
    expect(WEBPART_SOURCE).not.toMatch(/private static readonly SAFETY_MANIFEST_ID/);
    expect(WEBPART_SOURCE).not.toMatch(/private static readonly SAFETY_PACKAGE_VERSION/);
  });
});
