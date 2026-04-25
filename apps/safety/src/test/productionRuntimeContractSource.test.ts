import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const repoRoot = resolve(__dirname, '../../../..');

function readRepo(relPath: string): string {
  return readFileSync(resolve(repoRoot, relPath), 'utf-8');
}

describe('Safety production runtime contract source-of-truth', () => {
  it('mount resolves runtime contract before rendering App', () => {
    const mountSource = readRepo('apps/safety/src/mount.tsx');
    expect(mountSource).toContain('resolveSafetyRuntimeContract');
    expect(mountSource).toContain('runtimeContract={runtimeContract}');
    expect(mountSource).toContain("? 'shell-webpart'");
    expect(mountSource).toContain('__hbIntel_safetyRuntimeBindingProof');
  });

  it('SafetyWebPart delegates render to mount with fully governed backend config fields', () => {
    const webpartSource = readRepo('apps/safety/src/webparts/safety/SafetyWebPart.tsx');
    expect(webpartSource).toContain('void mount(this.domElement, this.context, {');
    expect(webpartSource).toContain('functionAppUrl: SAFETY_DEFAULT_FUNCTION_APP_URL');
    expect(webpartSource).toContain('apiAudience: SAFETY_DEFAULT_API_AUDIENCE');
    expect(webpartSource).toContain(
      'acceptedBackendOrigin: SAFETY_ACCEPTED_BACKEND_ORIGIN',
    );
    expect(webpartSource).toContain('expectedManifestId: SAFETY_WEBPART_MANIFEST_ID');
    expect(webpartSource).toContain('expectedPackageVersion: SAFETY_PACKAGE_VERSION');
    expect(webpartSource).toContain('expectedApiAudience: SAFETY_EXPECTED_API_AUDIENCE');
    expect(webpartSource).not.toContain('this.properties.functionAppUrl');
    expect(webpartSource).not.toContain('this.properties.apiAudience');
    expect(webpartSource).not.toContain("PropertyPaneTextField('functionAppUrl'");
    expect(webpartSource).not.toContain("PropertyPaneTextField('apiAudience'");
  });

  it('governed binding module is the sole home for manifest/version/origin/audience constants', () => {
    const binding = readRepo('apps/safety/src/runtime/governedRuntimeBinding.ts');
    expect(binding).toContain('export const SAFETY_WEBPART_MANIFEST_ID');
    expect(binding).toContain('export const SAFETY_PACKAGE_VERSION');
    expect(binding).toContain('export const SAFETY_ACCEPTED_BACKEND_ORIGIN');
    expect(binding).toContain('export const SAFETY_EXPECTED_API_AUDIENCE');

    // Runtime contract should import — not redeclare.
    const contract = readRepo('apps/safety/src/runtime/safetyRuntimeContract.ts');
    expect(contract).toContain("from './governedRuntimeBinding.js'");
    expect(contract).not.toMatch(/^const SAFETY_WEBPART_MANIFEST_ID\s*=/m);
    expect(contract).not.toMatch(/^const SAFETY_PACKAGE_VERSION\s*=/m);
  });

  it('App wires delegated SPFx token provider into backend command client seam', () => {
    const appSource = readRepo('apps/safety/src/App.tsx');
    expect(appSource).toContain('backendIngestion: {');
    expect(appSource).toContain('getApiToken: async (): Promise<string> => {');
    expect(appSource).toContain('typed.aadTokenProviderFactory?.getTokenProvider()');
    expect(appSource).toContain('provider.getToken(apiAudience)');
  });
});
