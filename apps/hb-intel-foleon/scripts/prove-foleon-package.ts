import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

const REPO_ROOT = resolve(import.meta.dirname, '..', '..', '..');
const PACKAGE_PATH = resolve(REPO_ROOT, 'dist', 'sppkg', 'hb-intel-foleon.sppkg');
const OUTPUT_PATH = resolve(REPO_ROOT, 'dist', 'sppkg', 'hb-intel-foleon-package-proof.json');

const EXPECTED_PRODUCT_ID = 'c23635f5-ab4d-44c2-96b5-2a2c90f4afc0';
const EXPECTED_VERSION = '1.0.12.0';
const EXPECTED_FEATURE_ID = 'ae66c036-8036-4f10-bb63-0d75107e7ce9';
const EXPECTED_COMPONENT_ID = '2160edb3-675e-4451-92bb-8345f9d1c71e';
const EXPECTED_SCHEMA_FILES = [
  'schema-content-registry.xml',
  'schema-homepage-placements.xml',
  'schema-interaction-events.xml',
  'schema-sync-runs.xml',
] as const;

interface ToolboxEntryProof {
  readonly title: string;
  readonly description: string;
  readonly hiddenFromToolbox: boolean | null;
  readonly foleonRoute: string | null;
}

interface PackageProof {
  readonly generatedAt: string;
  readonly packagePath: string;
  readonly sha256: string;
  readonly productId: string;
  readonly solutionVersion: string;
  readonly feature: {
    readonly id: string;
    readonly version: string;
    readonly path: string;
  };
  readonly components: ReadonlyArray<{
    readonly id: string;
    readonly alias: string;
    readonly supportedHosts: ReadonlyArray<string>;
    readonly manifestXmlPath: string;
    readonly loaderAssetPaths: ReadonlyArray<string>;
    readonly preconfiguredEntries: ReadonlyArray<ToolboxEntryProof>;
  }>;
  readonly packagedListSchemaFiles: ReadonlyArray<string>;
  readonly checks: ReadonlyArray<{ readonly name: string; readonly pass: boolean }>;
}

function unzipList(packagePath: string): string[] {
  return execFileSync('unzip', ['-Z1', packagePath], { encoding: 'utf8' })
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function unzipText(packagePath: string, archivePath: string): string {
  return execFileSync('unzip', ['-p', packagePath, archivePath], { encoding: 'utf8' });
}

function xmlAttr(xml: string, attr: string): string {
  const match = xml.match(new RegExp(`\\b${attr}="([^"]*)"`));
  if (!match) throw new Error(`Missing XML attribute: ${attr}`);
  return match[1]!;
}

function decodeXmlAttr(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function collectLoaderAssetPaths(manifest: any): string[] {
  const resources = manifest.loaderConfig?.scriptResources;
  if (!resources || typeof resources !== 'object') return [];
  return Object.values(resources)
    .flatMap((resource: any) => {
      if (typeof resource?.path === 'string') return [resource.path];
      if (Array.isArray(resource?.paths)) return resource.paths.filter((path) => typeof path === 'string');
      return [];
    })
    .sort();
}

function collectToolboxEntries(manifest: any): ToolboxEntryProof[] {
  const entries = Array.isArray(manifest.preconfiguredEntries)
    ? manifest.preconfiguredEntries
    : [];
  return entries.map((entry: any) => ({
    title: String(entry?.title?.default ?? ''),
    description: String(entry?.description?.default ?? ''),
    hiddenFromToolbox:
      typeof entry?.hiddenFromToolbox === 'boolean' ? entry.hiddenFromToolbox : null,
    foleonRoute:
      typeof entry?.properties?.foleonRoute === 'string'
        ? entry.properties.foleonRoute
        : null,
  }));
}

function main(): void {
  const packagePath = resolve(process.argv[2] ?? PACKAGE_PATH);
  const outputPath = resolve(process.argv[3] ?? OUTPUT_PATH);
  if (!existsSync(packagePath)) {
    throw new Error(`Package not found: ${packagePath}`);
  }

  const archivePaths = unzipList(packagePath);
  const appManifestXml = unzipText(packagePath, 'AppManifest.xml');
  const productId = xmlAttr(appManifestXml, 'ProductID').toLowerCase();
  const solutionVersion = xmlAttr(appManifestXml, 'Version');

  const featurePath = archivePaths.find((entry) => entry === `feature_${EXPECTED_FEATURE_ID}.xml`);
  if (!featurePath) throw new Error(`Missing feature_${EXPECTED_FEATURE_ID}.xml`);
  const featureXml = unzipText(packagePath, featurePath);
  const featureVersion = xmlAttr(featureXml, 'Version');

  const componentPath = archivePaths.find((entry) =>
    entry.endsWith(`/WebPart_${EXPECTED_COMPONENT_ID}.xml`),
  );
  if (!componentPath) throw new Error(`Missing WebPart_${EXPECTED_COMPONENT_ID}.xml`);
  const componentXml = unzipText(packagePath, componentPath);
  const componentManifest = JSON.parse(decodeXmlAttr(xmlAttr(componentXml, 'ComponentManifest')));
  const entries = collectToolboxEntries(componentManifest);
  const schemaPaths = archivePaths
    .filter((entry) => EXPECTED_SCHEMA_FILES.includes(basename(entry) as any))
    .sort();

  const proof: PackageProof = {
    generatedAt: new Date().toISOString(),
    packagePath,
    sha256: sha256(packagePath),
    productId,
    solutionVersion,
    feature: {
      id: EXPECTED_FEATURE_ID,
      version: featureVersion,
      path: featurePath,
    },
    components: [
      {
        id: String(componentManifest.id ?? '').toLowerCase(),
        alias: String(componentManifest.alias ?? ''),
        supportedHosts: Array.isArray(componentManifest.supportedHosts)
          ? componentManifest.supportedHosts
          : [],
        manifestXmlPath: componentPath,
        loaderAssetPaths: collectLoaderAssetPaths(componentManifest),
        preconfiguredEntries: entries,
      },
    ],
    packagedListSchemaFiles: schemaPaths,
    checks: [],
  };

  const byTitle = new Map(entries.map((entry) => [entry.title, entry]));
  const checks = [
    { name: 'product ID matches expected Foleon package', pass: productId === EXPECTED_PRODUCT_ID },
    { name: `solution version is ${EXPECTED_VERSION}`, pass: solutionVersion === EXPECTED_VERSION },
    { name: `feature version is ${EXPECTED_VERSION}`, pass: featureVersion === EXPECTED_VERSION },
    { name: 'single expected component ID is packaged', pass: proof.components[0]!.id === EXPECTED_COMPONENT_ID },
    {
      name: 'supported hosts are SharePointWebPart',
      pass: JSON.stringify(proof.components[0]!.supportedHosts) === JSON.stringify(['SharePointWebPart']),
    },
    {
      name: 'Highlights toolbox entry routes to highlights and is visible',
      pass:
        byTitle.get('HB Intel Foleon Highlights')?.foleonRoute === 'highlights' &&
        byTitle.get('HB Intel Foleon Highlights')?.hiddenFromToolbox === false,
    },
    {
      name: 'Manager toolbox entry routes to manage and is visible',
      pass:
        byTitle.get('HB Intel Foleon Manager')?.foleonRoute === 'manage' &&
        byTitle.get('HB Intel Foleon Manager')?.hiddenFromToolbox === false,
    },
    {
      name: 'loader asset paths are present',
      pass: proof.components[0]!.loaderAssetPaths.length > 0,
    },
    {
      name: 'all Foleon list schema files are packaged',
      pass: EXPECTED_SCHEMA_FILES.every((file) => schemaPaths.some((entry) => basename(entry) === file)),
    },
  ];
  const finalProof: PackageProof = { ...proof, checks };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(finalProof, null, 2)}\n`);
  console.log(JSON.stringify(finalProof, null, 2));

  const failed = checks.filter((check) => !check.pass);
  if (failed.length > 0) {
    throw new Error(`Package proof failed: ${failed.map((check) => check.name).join(', ')}`);
  }
}

main();
