import { spawnSync } from 'node:child_process';
import path from 'node:path';

type EnvironmentName = 'staging' | 'prod';

interface ProvisionOptions {
  readonly environment: EnvironmentName;
  readonly resourceGroup: string;
  readonly deploymentName: string;
  readonly runApply: boolean;
  readonly runSmoke: boolean;
  readonly locationOverride: string | null;
  readonly existingPlanName: string | null;
  readonly hostingPlanSkuName: string | null;
  readonly hostingPlanSkuTier: string | null;
}

function parseArgs(argv: readonly string[]): ProvisionOptions {
  const args = new Map<string, string>();
  let runApply = false;
  let runSmoke = true;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--apply') {
      runApply = true;
      continue;
    }
    if (token === '--skip-smoke') {
      runSmoke = false;
      continue;
    }
    if (token.startsWith('--')) {
      const key = token.replace(/^--/, '');
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for argument --${key}`);
      }
      args.set(key, value);
      i += 1;
    }
  }

  const environment = (args.get('environment') ?? 'staging') as EnvironmentName;
  if (environment !== 'staging' && environment !== 'prod') {
    throw new Error('Invalid --environment value. Use "staging" or "prod".');
  }

  const resourceGroup = args.get('resource-group') ?? process.env.AZURE_RESOURCE_GROUP ?? '';
  if (resourceGroup.trim().length === 0) {
    throw new Error('Missing Azure resource group. Provide --resource-group or AZURE_RESOURCE_GROUP.');
  }

  const deploymentName = args.get('deployment-name') ?? `legacy-fallback-hosting-${environment}`;
  return {
    environment,
    resourceGroup,
    deploymentName,
    runApply,
    runSmoke,
    locationOverride: args.get('location') ?? null,
    existingPlanName: args.get('existing-plan-name') ?? null,
    hostingPlanSkuName: args.get('hosting-plan-sku-name') ?? null,
    hostingPlanSkuTier: args.get('hosting-plan-sku-tier') ?? null,
  };
}

function run(command: string, args: readonly string[]): string {
  const rendered = `${command} ${args.join(' ')}`;
  console.log(`[legacy-fallback-hosting] ${rendered}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(
      [
        `Command failed: ${rendered}`,
        result.stdout?.trim() ?? '',
        result.stderr?.trim() ?? '',
      ].filter(Boolean).join('\n'),
    );
  }
  const stdout = result.stdout ?? '';
  if (stdout.trim().length > 0) {
    console.log(stdout.trim());
  }
  return stdout;
}

function getParamFile(environment: EnvironmentName): string {
  const root = process.cwd();
  return path.join(root, 'infra', `legacy-fallback-hosting.${environment}.bicepparam`);
}

function runSmokeChecks(options: ProvisionOptions, functionAppName: string): void {
  if (!options.runSmoke) {
    console.log('[legacy-fallback-hosting] smoke checks skipped (--skip-smoke).');
    return;
  }

  run('az', ['functionapp', 'show', '--name', functionAppName, '--resource-group', options.resourceGroup, '--output', 'json']);

  const appSettingsRaw = run('az', [
    'functionapp',
    'config',
    'appsettings',
    'list',
    '--name',
    functionAppName,
    '--resource-group',
    options.resourceGroup,
    '--output',
    'json',
  ]);
  const appSettings = JSON.parse(appSettingsRaw) as Array<{ name: string }>;
  const requiredNames = [
    'HBC_LEGACY_FALLBACK_ENABLED',
    'HBC_LEGACY_FALLBACK_DISCOVERY_ENABLED',
    'HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_ENABLED',
    'HBC_LEGACY_FALLBACK_HOSTING_ENV',
    'HBC_LEGACY_FALLBACK_AUTH_POSTURE',
    'HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID',
    'HBC_LEGACY_FALLBACK_DISCOVERY_TIMER_SCHEDULE',
    'HBC_LEGACY_FALLBACK_MANUAL_RERUN_ENABLED',
    'HBC_LEGACY_FALLBACK_RERUN_MIN_INTERVAL_MINUTES',
    'HBC_LEGACY_FALLBACK_MATCH_ANOMALY_THRESHOLD',
    'AZURE_TENANT_ID',
    'AZURE_CLIENT_ID',
    'SHAREPOINT_TENANT_URL',
  ];
  const names = new Set(appSettings.map((item) => item.name));
  const missing = requiredNames.filter((name) => !names.has(name));
  if (missing.length > 0) {
    throw new Error(`Smoke check failed: missing required app settings: ${missing.join(', ')}`);
  }

  console.log('[legacy-fallback-hosting] smoke checks passed.');
}

function main(): void {
  console.log('[legacy-fallback-hosting] provisioning script started');
  const options = parseArgs(process.argv.slice(2));
  const paramFile = getParamFile(options.environment);
  const bicepFile = path.join(process.cwd(), 'infra', 'legacy-fallback-hosting.bicep');
  const parameterOverrides: string[] = [];
  if (options.locationOverride) {
    parameterOverrides.push(`location=${options.locationOverride}`);
  }
  if (options.existingPlanName) {
    parameterOverrides.push(`existingHostingPlanName=${options.existingPlanName}`);
  }
  if (options.hostingPlanSkuName) {
    parameterOverrides.push(`hostingPlanSkuName=${options.hostingPlanSkuName}`);
  }
  if (options.hostingPlanSkuTier) {
    parameterOverrides.push(`hostingPlanSkuTier=${options.hostingPlanSkuTier}`);
  }

  run('az', ['bicep', 'build', '--file', bicepFile]);
  run('az', [
    'deployment',
    'group',
    'what-if',
    '--resource-group',
    options.resourceGroup,
    '--name',
    `${options.deploymentName}-whatif`,
    '--parameters',
    paramFile,
    ...parameterOverrides,
    '--no-pretty-print',
  ]);

  if (!options.runApply) {
    console.log('[legacy-fallback-hosting] what-if completed. Re-run with --apply to deploy.');
    return;
  }

  run('az', [
    'deployment',
    'group',
    'create',
    '--resource-group',
    options.resourceGroup,
    '--name',
    options.deploymentName,
    '--parameters',
    paramFile,
    ...parameterOverrides,
    '--output',
    'json',
  ]);

  const outputsRaw = run('az', [
    'deployment',
    'group',
    'show',
    '--resource-group',
    options.resourceGroup,
    '--name',
    options.deploymentName,
    '--query',
    'properties.outputs',
    '--output',
    'json',
  ]);
  const outputs = JSON.parse(outputsRaw) as Record<string, { type: string; value: string }>;
  const functionAppName = outputs.legacyFallbackFunctionAppName?.value;
  if (!functionAppName) {
    throw new Error('Deployment outputs did not include legacyFallbackFunctionAppName.');
  }

  runSmokeChecks(options, functionAppName);
  console.log('[legacy-fallback-hosting] deployment complete.');
}

try {
  main();
} catch (error) {
  console.error('[legacy-fallback-hosting] failed');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
  process.exitCode = 1;
}
