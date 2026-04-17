import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const scriptPath = path.resolve(__dirname, '..', 'scripts', 'invoke-pnp-extraction.ps1');

function detectPwsh(): string | null {
  for (const cmd of ['pwsh', 'powershell']) {
    const probe = spawnSync(cmd, ['-NoProfile', '-Command', '1'], { encoding: 'utf-8', timeout: 8000 });
    if (probe.status === 0) return cmd;
  }
  return null;
}

describe('invoke-pnp-extraction.ps1 syntax', () => {
  const pwsh = detectPwsh();

  it.skipIf(!pwsh)('parses without PowerShell syntax errors (regression guard for homepage cutover seam)', () => {
    const cmd = `$errors = $null; [void][System.Management.Automation.Language.Parser]::ParseFile('${scriptPath.replace(/\\/g, '\\\\')}', [ref]$null, [ref]$errors); if ($errors -and $errors.Count -gt 0) { $errors | ForEach-Object { Write-Error $_.Message }; exit 1 } else { Write-Output 'ok' }`;
    const result = spawnSync(pwsh!, ['-NoProfile', '-Command', cmd], { encoding: 'utf-8', timeout: 20000 });
    expect(result.status, `stderr: ${result.stderr}\nstdout: ${result.stdout}`).toBe(0);
    expect(result.stdout).toContain('ok');
  });
});
