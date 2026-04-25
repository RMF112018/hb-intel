import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const provisioningScriptPath = resolve(
  __dirname,
  '../../../../../docs/architecture/plans/MASTER/spfx/foleon/phase-02/tenant-provisioning-2026-04-25/provision-foleon-two-lane-tenant-schema.ps1',
);

describe('Foleon HBCentral tenant provisioning choices', () => {
  const script = readFileSync(provisioningScriptPath, 'utf8');

  it('verifies the Leadership Message lane through append-only choice inputs', () => {
    expect(script).toContain('"leadership-message"');
    expect(script).toContain('"Leadership Message Reader"');
    expect(script).toContain('"Leadership Message Active"');
    expect(script).toContain('"Leadership Message"');
    expect(script).toContain('Ensure-Choices');
    expect(script).not.toMatch(/Set-PnPListItem|Remove-PnPListItem|Add-PnPList\b/);
  });
});
