import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import {
  ASSETS_DIR,
  EXPECTED_FEATURE_ID,
  EXPECTED_SCHEMA_FILES,
  EXPECTED_VERSION,
  buildFoleonFeatureAssetModel,
  parseElementsXml,
  parseSchemaXml,
  sha256Text,
  validateFoleonFeatureAssets,
} from './validate-foleon-feature-assets.js';

const REPO_ROOT = resolve(import.meta.dirname, '..', '..', '..');
const PACKAGE_PATH = resolve(REPO_ROOT, 'dist', 'sppkg', 'hb-intel-foleon.sppkg');
const OUTPUT_PATH = resolve(REPO_ROOT, 'dist', 'sppkg', 'hb-intel-foleon-package-proof.json');

const EXPECTED_PRODUCT_ID = 'c23635f5-ab4d-44c2-96b5-2a2c90f4afc0';
const EXPECTED_COMPONENT_ID = '2160edb3-675e-4451-92bb-8345f9d1c71e';
const EXPECTED_FOLEON_ORIGINS = 'https://viewer.us.foleon.com';
const TENANT_LIST_ID_KEYS = [
  'contentRegistryListId',
  'placementsListId',
  'eventsListId',
  'syncRunsListId',
] as const;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  allowBooleanAttributes: true,
  parseAttributeValue: false,
  parseTagValue: false,
  trimValues: true,
});

interface ToolboxEntryProof {
  readonly title: string;
  readonly description: string;
  readonly hiddenFromToolbox: boolean | null;
  readonly foleonRoute: string | null;
  readonly acceptedFoleonOrigins: string | null;
  readonly allowPreview: boolean | null;
  readonly expectedManifestId: string | null;
  readonly expectedPackageVersion: string | null;
  readonly tenantListIdDefaultKeys: ReadonlyArray<string>;
}

interface AssetProof {
  readonly sha256: string;
  readonly indexedFieldCount?: number;
}

interface PackagedAssetProof extends AssetProof {
  readonly archivePath: string;
  readonly matchesSource: boolean;
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
    readonly relationships: ReadonlyArray<{
      readonly id: string;
      readonly type: string;
      readonly target: string;
    }>;
  };
  readonly components: ReadonlyArray<{
    readonly id: string;
    readonly alias: string;
    readonly supportedHosts: ReadonlyArray<string>;
    readonly manifestXmlPath: string;
    readonly loaderAssetPaths: ReadonlyArray<string>;
    readonly preconfiguredEntries: ReadonlyArray<ToolboxEntryProof>;
  }>;
  readonly sourceAssets: Record<string, AssetProof>;
  readonly packagedAssets: Record<string, PackagedAssetProof>;
  readonly packagedListSchemaFiles: ReadonlyArray<string>;
  readonly stalePackagedSchemaFiles: ReadonlyArray<string>;
  readonly checks: ReadonlyArray<{ readonly name: string; readonly pass: boolean; readonly details?: string }>;
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

function sha256File(path: string): string {
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
  return entries.map((entry: any) => {
    const properties =
      entry?.properties && typeof entry.properties === 'object'
        ? entry.properties as Record<string, unknown>
        : {};
    return {
      title: String(entry?.title?.default ?? ''),
      description: String(entry?.description?.default ?? ''),
      hiddenFromToolbox:
        typeof entry?.hiddenFromToolbox === 'boolean' ? entry.hiddenFromToolbox : null,
      foleonRoute:
        typeof properties.foleonRoute === 'string'
          ? properties.foleonRoute
          : null,
      acceptedFoleonOrigins:
        typeof properties.acceptedFoleonOrigins === 'string'
          ? properties.acceptedFoleonOrigins
          : null,
      allowPreview:
        typeof properties.allowPreview === 'boolean'
          ? properties.allowPreview
          : null,
      expectedManifestId:
        typeof properties.expectedManifestId === 'string'
          ? properties.expectedManifestId
          : null,
      expectedPackageVersion:
        typeof properties.expectedPackageVersion === 'string'
          ? properties.expectedPackageVersion
          : null,
      tenantListIdDefaultKeys: Object.keys(properties).filter((key) =>
        TENANT_LIST_ID_KEYS.includes(key as (typeof TENANT_LIST_ID_KEYS)[number]),
      ),
    };
  });
}

function asArray<T>(value: T | ReadonlyArray<T> | undefined): ReadonlyArray<T> {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function collectFeatureRelationships(relsXml: string): PackageProof['feature']['relationships'] {
  const parsed = parser.parse(relsXml) as {
    Relationships?: {
      Relationship?: unknown;
    };
  };
  return asArray(parsed.Relationships?.Relationship as Record<string, string> | ReadonlyArray<Record<string, string>>)
    .map((relationship) => ({
      id: String(relationship.Id ?? ''),
      type: String(relationship.Type ?? ''),
      target: String(relationship.Target ?? ''),
    }));
}

function findArchivePath(archivePaths: ReadonlyArray<string>, fileName: string): string | undefined {
  return archivePaths.find((entry) => basename(entry) === fileName);
}

function assetSourceText(fileName: string): string {
  return readFileSync(resolve(ASSETS_DIR, fileName), 'utf8');
}

function check(name: string, pass: boolean, details?: string): PackageProof['checks'][number] {
  return { name, pass, ...(details ? { details } : {}) };
}

function main(): void {
  const packagePath = resolve(process.argv[2] ?? PACKAGE_PATH);
  const outputPath = resolve(process.argv[3] ?? OUTPUT_PATH);
  if (!existsSync(packagePath)) {
    throw new Error(`Package not found: ${packagePath}`);
  }

  const sourceModel = buildFoleonFeatureAssetModel();
  const sourceValidationChecks = validateFoleonFeatureAssets(sourceModel);
  const archivePaths = unzipList(packagePath);
  const appManifestXml = unzipText(packagePath, 'AppManifest.xml');
  const productId = xmlAttr(appManifestXml, 'ProductID').toLowerCase();
  const solutionVersion = xmlAttr(appManifestXml, 'Version');

  const featurePath = archivePaths.find((entry) => entry === `feature_${EXPECTED_FEATURE_ID}.xml`);
  if (!featurePath) throw new Error(`Missing feature_${EXPECTED_FEATURE_ID}.xml`);
  const featureXml = unzipText(packagePath, featurePath);
  const featureVersion = xmlAttr(featureXml, 'Version');
  const relsPath = `_rels/feature_${EXPECTED_FEATURE_ID}.xml.rels`;
  const relationships = archivePaths.includes(relsPath)
    ? collectFeatureRelationships(unzipText(packagePath, relsPath))
    : [];

  const componentPath = archivePaths.find((entry) =>
    entry.endsWith(`/WebPart_${EXPECTED_COMPONENT_ID}.xml`),
  );
  if (!componentPath) throw new Error(`Missing WebPart_${EXPECTED_COMPONENT_ID}.xml`);
  const componentXml = unzipText(packagePath, componentPath);
  const componentManifest = JSON.parse(decodeXmlAttr(xmlAttr(componentXml, 'ComponentManifest')));
  const entries = collectToolboxEntries(componentManifest);

  const assetFileNames = ['elements.xml', ...EXPECTED_SCHEMA_FILES] as const;
  const sourceAssets: Record<string, AssetProof> = {};
  const packagedAssets: Record<string, PackagedAssetProof> = {};
  for (const fileName of assetFileNames) {
    const sourceText = assetSourceText(fileName);
    const sourceSchema = fileName === 'elements.xml' ? undefined : parseSchemaXml(fileName, sourceText);
    sourceAssets[fileName] = {
      sha256: sha256Text(sourceText),
      ...(sourceSchema ? { indexedFieldCount: sourceSchema.indexedFieldCount } : {}),
    };

    const archivePath = findArchivePath(archivePaths, fileName);
    if (archivePath) {
      const packagedText = unzipText(packagePath, archivePath);
      const packagedSchema = fileName === 'elements.xml' ? undefined : parseSchemaXml(fileName, packagedText);
      packagedAssets[fileName] = {
        archivePath,
        sha256: sha256Text(packagedText),
        matchesSource: packagedText === sourceText,
        ...(packagedSchema ? { indexedFieldCount: packagedSchema.indexedFieldCount } : {}),
      };
    }
  }

  const packagedSchemaFiles = archivePaths
    .filter((entry) => /^schema-.*\.xml$/.test(basename(entry)))
    .map((entry) => basename(entry))
    .sort();
  const stalePackagedSchemaFiles = packagedSchemaFiles
    .filter((fileName) => !EXPECTED_SCHEMA_FILES.includes(fileName as (typeof EXPECTED_SCHEMA_FILES)[number]));

  const packagedElementsPath = packagedAssets['elements.xml']?.archivePath;
  const packagedListInstances = packagedElementsPath
    ? parseElementsXml(unzipText(packagePath, packagedElementsPath))
    : [];
  const customSchemaReferences = packagedListInstances.map((instance) => instance.customSchema).filter(Boolean);
  const byTitle = new Map(entries.map((entry) => [entry.title, entry]));
  const allEntriesHaveSafeDefaults = entries.every((entry) =>
    entry.acceptedFoleonOrigins === EXPECTED_FOLEON_ORIGINS &&
    entry.allowPreview === false &&
    entry.expectedManifestId === EXPECTED_COMPONENT_ID &&
    entry.expectedPackageVersion === EXPECTED_VERSION,
  );
  const tenantListIdDefaultKeys = entries.flatMap((entry) =>
    entry.tenantListIdDefaultKeys.map((key) => `${entry.title}.${key}`),
  );

  const checks = [
    check('product ID matches expected Foleon package', productId === EXPECTED_PRODUCT_ID),
    check('solution version matches expected package version', solutionVersion === EXPECTED_VERSION),
    check('feature version matches expected package version', featureVersion === EXPECTED_VERSION),
    check('feature relationships file is packaged', relationships.length > 0),
    check('single expected component ID is packaged', String(componentManifest.id ?? '').toLowerCase() === EXPECTED_COMPONENT_ID),
    check(
      'supported hosts are SharePointWebPart',
      JSON.stringify(Array.isArray(componentManifest.supportedHosts) ? componentManifest.supportedHosts : []) === JSON.stringify(['SharePointWebPart']),
    ),
    check(
      'Highlights toolbox entry routes to highlights and is visible',
      byTitle.get('HB Intel Foleon Highlights')?.foleonRoute === 'highlights' &&
        byTitle.get('HB Intel Foleon Highlights')?.hiddenFromToolbox === false,
    ),
    check(
      'Manager toolbox entry routes to manage and is visible',
      byTitle.get('HB Intel Foleon Manager')?.foleonRoute === 'manage' &&
        byTitle.get('HB Intel Foleon Manager')?.hiddenFromToolbox === false,
    ),
    check(
      'toolbox entries include safe Foleon governance defaults',
      allEntriesHaveSafeDefaults,
      entries.map((entry) => `${entry.title}: expectedPackageVersion=${entry.expectedPackageVersion ?? 'missing'}`).join('; '),
    ),
    check(
      'toolbox entries do not hard-code tenant list IDs',
      tenantListIdDefaultKeys.length === 0,
      tenantListIdDefaultKeys.join(', '),
    ),
    check('loader asset paths are present', collectLoaderAssetPaths(componentManifest).length > 0),
    check('packaged elements.xml is present', !!packagedAssets['elements.xml']),
    check(
      'all expected schema files are packaged',
      EXPECTED_SCHEMA_FILES.every((fileName) => !!packagedAssets[fileName]),
      packagedSchemaFiles.join(', '),
    ),
    check('no stale schema files are packaged', stalePackagedSchemaFiles.length === 0, stalePackagedSchemaFiles.join(', ')),
    check(
      'packaged elements.xml bytes match repo source',
      packagedAssets['elements.xml']?.matchesSource === true,
    ),
    ...EXPECTED_SCHEMA_FILES.map((fileName) => check(
      `packaged ${fileName} bytes match repo source`,
      packagedAssets[fileName]?.matchesSource === true,
    )),
    check(
      'packaged CustomSchema references resolve to packaged schema files',
      customSchemaReferences.every((fileName) => !!packagedAssets[fileName]),
      customSchemaReferences.join(', '),
    ),
    check(
      'packaged schema indexed field counts are within source threshold',
      EXPECTED_SCHEMA_FILES.every((fileName) => {
        const packagedCount = packagedAssets[fileName]?.indexedFieldCount;
        const sourceCount = sourceAssets[fileName]?.indexedFieldCount;
        return typeof packagedCount === 'number' && packagedCount === sourceCount;
      }),
    ),
    check('source Feature Framework validation passes', sourceValidationChecks.every((entry) => entry.pass)),
    check(
      'lookup target validity is statically proven',
      sourceValidationChecks
        .filter((entry) => entry.name.includes('lookup target'))
        .every((entry) => entry.pass),
    ),
    check(
      'uniqueness posture is statically proven',
      sourceValidationChecks
        .filter((entry) => entry.name.includes('uses EnforceUniqueValues') || entry.name.includes('is indexed for uniqueness'))
        .every((entry) => entry.pass),
    ),
  ];

  const proof: PackageProof = {
    generatedAt: new Date().toISOString(),
    packagePath,
    sha256: sha256File(packagePath),
    productId,
    solutionVersion,
    feature: {
      id: EXPECTED_FEATURE_ID,
      version: featureVersion,
      path: featurePath,
      relationships,
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
    sourceAssets,
    packagedAssets,
    packagedListSchemaFiles: packagedSchemaFiles,
    stalePackagedSchemaFiles,
    checks,
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(proof, null, 2)}\n`);
  console.log(JSON.stringify(proof, null, 2));

  const failed = checks.filter((entry) => !entry.pass);
  if (failed.length > 0) {
    throw new Error(`Package proof failed: ${failed.map((entry) => entry.name).join(', ')}`);
  }
}

main();
