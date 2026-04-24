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
  });

  it('SafetyWebPart delegates render to mount with backend config fields', () => {
    const webpartSource = readRepo('apps/safety/src/webparts/safety/SafetyWebPart.tsx');
    expect(webpartSource).toContain('void mount(this.domElement, this.context, {');
    expect(webpartSource).toContain('functionAppUrl: this.properties.functionAppUrl');
    expect(webpartSource).toContain('apiAudience: this.properties.apiAudience');
    expect(webpartSource).toContain("PropertyPaneTextField('functionAppUrl'");
    expect(webpartSource).toContain("PropertyPaneTextField('apiAudience'");
  });
});
