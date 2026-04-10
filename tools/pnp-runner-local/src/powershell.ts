import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CanonicalPnpActionKey, ExtractionResultFileSet, PnpCommandInput, RunnerConfig } from './types.js';

export interface CommandCheckResult {
  readonly available: boolean;
  readonly command: string | null;
  readonly message: string;
}

export interface PnpModuleCheckResult {
  readonly available: boolean;
  readonly version: string | null;
  readonly message: string;
}

const POWERSHELL_CANDIDATES = ['pwsh', 'powershell'];

export function detectPowerShell(): CommandCheckResult {
  for (const candidate of POWERSHELL_CANDIDATES) {
    const probe = spawnSync(candidate, ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()'], {
      encoding: 'utf-8',
      timeout: 8000,
    });
    if (probe.status === 0) {
      return {
        available: true,
        command: candidate,
        message: `${candidate} is available (${probe.stdout.trim() || 'version detected'}).`,
      };
    }
  }
  return {
    available: false,
    command: null,
    message: 'PowerShell was not found. Install pwsh (preferred) or powershell.',
  };
}

export function checkPnpModule(command: string): PnpModuleCheckResult {
  const script = [
    "$m = Get-Module -ListAvailable PnP.PowerShell | Sort-Object Version -Descending | Select-Object -First 1",
    "if ($null -eq $m) { '' } else { $m.Version.ToString() }",
  ].join('; ');
  const probe = spawnSync(command, ['-NoProfile', '-Command', script], {
    encoding: 'utf-8',
    timeout: 12000,
  });
  const version = probe.status === 0 ? probe.stdout.trim() : '';
  if (version) {
    return {
      available: true,
      version,
      message: `PnP.PowerShell is available (v${version}).`,
    };
  }
  return {
    available: false,
    version: null,
    message: 'PnP.PowerShell module was not found. Install-Module PnP.PowerShell -Scope CurrentUser.',
  };
}

export function runPowerShellDryCheck(command: string): { readonly passed: boolean; readonly message: string } {
  const probe = spawnSync(command, ['-NoProfile', '-Command', 'Write-Output "runner-sanity-ok"'], {
    encoding: 'utf-8',
    timeout: 5000,
  });
  if (probe.status === 0 && probe.stdout.includes('runner-sanity-ok')) {
    return { passed: true, message: 'PowerShell dry invocation succeeded.' };
  }
  return {
    passed: false,
    message: probe.stderr.trim() || probe.stdout.trim() || 'PowerShell dry invocation failed.',
  };
}

export async function runExtractionScript(params: {
  readonly runId: string;
  readonly actionKey: CanonicalPnpActionKey;
  readonly commandInput: PnpCommandInput;
  readonly files: ExtractionResultFileSet;
  readonly config: RunnerConfig;
  readonly powerShellCommand: string;
}): Promise<void> {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const scriptPath = path.resolve(moduleDir, '..', 'scripts', 'invoke-pnp-extraction.ps1');

  const listCsv = (params.commandInput.listFilters ?? []).join(',');
  const pageCsv = (params.commandInput.pageFilters ?? []).join(',');

  const args = [
    '-NoProfile',
    '-File', scriptPath,
    '-ActionKey', params.actionKey,
    '-TargetSiteUrl', params.commandInput.targetSiteUrl ?? '',
    '-RunId', params.runId,
    '-OutputRawPath', params.files.rawPath,
    '-OutputNormalizedPath', params.files.normalizedPath,
    '-OutputSummaryPath', params.files.summaryPath,
    '-AuthMode', params.config.authMode,
    '-ClientId', params.config.clientId,
    '-Tenant', params.config.tenant,
    '-ListFiltersCsv', listCsv,
    '-PageFiltersCsv', pageCsv,
  ];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(params.powerShellCommand, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    let stderr = '';
    let stdout = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      const details = stderr.trim() || stdout.trim() || `PowerShell exited with code ${code ?? -1}`;
      reject(new Error(details));
    });
  });
}
