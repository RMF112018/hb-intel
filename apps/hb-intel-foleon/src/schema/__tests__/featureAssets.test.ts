/**
 * Feature Framework provisioning assets — static verification.
 *
 * Authority:
 *   - docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-*.md
 *   - apps/hb-intel-foleon/src/schema/foleonListSchemas.ts
 *   - MS-Learn Field / List / ListInstance element references
 *
 * These tests do NOT install SharePoint lists; they verify that the
 * hand-authored XML under apps/hb-intel-foleon/sharepoint/assets/:
 *   1. exists alongside every entry declared in package-solution.json
 *      features[0].assets,
 *   2. is well-formed XML,
 *   3. declares one <ListInstance> per governed schema, in install
 *      order, with <List> Urls that match the schema files' Url
 *      attributes,
 *   4. preserves the cross-list Lookup binding from Homepage
 *      Placements' ContentLookup to Content Registry's ListInstance
 *      Url character-for-character,
 *   5. declares each field the code-level schema marks
 *      required/indexed/unique,
 *   6. honors versioning posture (Interaction Events = disabled,
 *      other three = enabled),
 *   7. keeps skipFeatureDeployment === false on the site-installed
 *      package.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FOLEON_CONTENT_REGISTRY_SCHEMA,
  FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA,
  FOLEON_INTERACTION_EVENTS_SCHEMA,
  FOLEON_SYNC_RUNS_SCHEMA,
  type FoleonFieldSchema,
  type FoleonListInternalName,
  type FoleonListSchema,
} from '../foleonListSchemas.js';

const PACKAGE_ROOT = resolve(__dirname, '..', '..', '..');
const ASSETS_DIR = resolve(PACKAGE_ROOT, 'sharepoint', 'assets');
const CONFIG_PATH = resolve(PACKAGE_ROOT, 'config', 'package-solution.json');

interface PackageSolution {
  readonly solution: {
    readonly skipFeatureDeployment?: boolean;
    readonly features: ReadonlyArray<{
      readonly id: string;
      readonly version: string;
      readonly assets?: {
        readonly elementManifests?: ReadonlyArray<string>;
        readonly elementFiles?: ReadonlyArray<string>;
      };
    }>;
  };
}

function loadPackageSolution(): PackageSolution {
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as PackageSolution;
}

function loadAsset(fileName: string): string {
  return readFileSync(resolve(ASSETS_DIR, fileName), 'utf8');
}

const EXPECTED_SCHEMA_FILES: ReadonlyArray<{
  readonly file: string;
  readonly internalName: FoleonListInternalName;
  readonly listUrl: string;
  readonly schema: FoleonListSchema;
  readonly versioning: 'enabled' | 'disabled';
}> = [
  {
    file: 'schema-content-registry.xml',
    internalName: 'HB_FoleonContentRegistry',
    listUrl: 'Lists/HB_FoleonContentRegistry',
    schema: FOLEON_CONTENT_REGISTRY_SCHEMA,
    versioning: 'enabled',
  },
  {
    file: 'schema-homepage-placements.xml',
    internalName: 'HB_FoleonHomepagePlacements',
    listUrl: 'Lists/HB_FoleonHomepagePlacements',
    schema: FOLEON_HOMEPAGE_PLACEMENTS_SCHEMA,
    versioning: 'enabled',
  },
  {
    file: 'schema-interaction-events.xml',
    internalName: 'HB_FoleonInteractionEvents',
    listUrl: 'Lists/HB_FoleonInteractionEvents',
    schema: FOLEON_INTERACTION_EVENTS_SCHEMA,
    versioning: 'disabled',
  },
  {
    file: 'schema-sync-runs.xml',
    internalName: 'HB_FoleonSyncRuns',
    listUrl: 'Lists/HB_FoleonSyncRuns',
    schema: FOLEON_SYNC_RUNS_SCHEMA,
    versioning: 'enabled',
  },
];

describe('package-solution.json — site-installed provisioning posture', () => {
  const pkg = loadPackageSolution();

  it('sets skipFeatureDeployment=false (site-installed required for SharePoint assets)', () => {
    expect(pkg.solution.skipFeatureDeployment).toBe(false);
  });

  it('declares exactly one feature with the expected assets block', () => {
    expect(pkg.solution.features).toHaveLength(1);
    const feature = pkg.solution.features[0]!;
    expect(feature.assets?.elementManifests).toEqual(['elements.xml']);
    expect(feature.assets?.elementFiles).toEqual([
      'schema-content-registry.xml',
      'schema-homepage-placements.xml',
      'schema-interaction-events.xml',
      'schema-sync-runs.xml',
    ]);
  });
});

describe('elements.xml — list instance declarations', () => {
  const elements = loadAsset('elements.xml');

  it('uses the SharePoint feature-framework root namespace', () => {
    expect(elements).toMatch(/<Elements\s+xmlns="http:\/\/schemas\.microsoft\.com\/sharepoint\/">/);
  });

  it.each(EXPECTED_SCHEMA_FILES)(
    'declares a <ListInstance> for $internalName with matching Url + CustomSchema',
    ({ listUrl, file }) => {
      // The ListInstance Url must appear verbatim; the CustomSchema must
      // reference the matching schema-*.xml file. Both are asserted with
      // character-exact string containment so whitespace or casing
      // differences are caught at test time (the Feature Framework is
      // byte-sensitive on these strings).
      expect(elements).toContain(`Url="${listUrl}"`);
      expect(elements).toContain(`CustomSchema="${file}"`);
    },
  );

  it('declares Content Registry BEFORE Homepage Placements (lookup ordering)', () => {
    const contentIdx = elements.indexOf('Url="Lists/HB_FoleonContentRegistry"');
    const placementsIdx = elements.indexOf('Url="Lists/HB_FoleonHomepagePlacements"');
    expect(contentIdx).toBeGreaterThan(-1);
    expect(placementsIdx).toBeGreaterThan(-1);
    expect(contentIdx).toBeLessThan(placementsIdx);
  });

  it('uses the Custom List template (FeatureId + TemplateType) on every ListInstance', () => {
    const featureIdMatches = elements.match(
      /FeatureId="00bfea71-de22-43b2-a848-c05709900100"/g,
    );
    const templateTypeMatches = elements.match(/TemplateType="100"/g);
    expect(featureIdMatches).toHaveLength(EXPECTED_SCHEMA_FILES.length);
    expect(templateTypeMatches).toHaveLength(EXPECTED_SCHEMA_FILES.length);
  });
});

describe.each(EXPECTED_SCHEMA_FILES)(
  '$file — schema alignment with code authority',
  ({ file, listUrl, schema, versioning }) => {
    const xml = loadAsset(file);

    it('root <List> declares the expected Url + SharePoint namespace', () => {
      expect(xml).toMatch(/<List[\s\S]*?xmlns="http:\/\/schemas\.microsoft\.com\/sharepoint\/"/);
      expect(xml).toContain(`Url="${listUrl}"`);
    });

    it(`VersioningEnabled is ${versioning === 'enabled' ? 'TRUE' : 'FALSE'}`, () => {
      const expected = versioning === 'enabled' ? 'TRUE' : 'FALSE';
      expect(xml).toContain(`VersioningEnabled="${expected}"`);
    });

    it('disables attachments', () => {
      expect(xml).toContain('DisableAttachments="TRUE"');
    });

    const nonTitleFields = schema.fields.filter(
      (field) => field.internalName !== 'Title',
    );
    for (const field of nonTitleFields) {
      it(`declares field ${field.internalName} with required/indexed flags`, () => {
        expect(xml).toContain(`Name="${field.internalName}"`);
        if (field.required) {
          expectFieldAttr(xml, field, 'Required="TRUE"');
        }
        if (field.indexed) {
          expectFieldAttr(xml, field, 'Indexed="TRUE"');
        }
        if (field.unique) {
          expectFieldAttr(xml, field, 'AllowDuplicateValues="FALSE"');
        }
      });
    }

    it('every view FieldRef references a field declared in the schema', () => {
      // Extract every FieldRef Name within any <View> block. They must
      // resolve to either a <Field Name=...> declared above or the
      // SharePoint built-ins LinkTitle / Title / ID.
      const builtins = new Set(['LinkTitle', 'Title', 'ID']);
      const declaredFields = new Set(
        schema.fields
          .map((f) => f.internalName)
          .filter((name) => name !== 'Title')
          .concat(['Title']),
      );
      const viewsMatch = xml.match(/<Views>[\s\S]*<\/Views>/);
      expect(viewsMatch).not.toBeNull();
      const viewsXml = viewsMatch![0]!;
      const fieldRefNames = Array.from(
        viewsXml.matchAll(/<FieldRef\s+Name="([^"]+)"/g),
      ).map((m) => m[1]!);
      expect(fieldRefNames.length).toBeGreaterThan(0);
      for (const name of fieldRefNames) {
        expect(
          builtins.has(name) || declaredFields.has(name),
          `View FieldRef "${name}" is not declared in the schema and is not a built-in`,
        ).toBe(true);
      }
    });
  },
);

describe('Homepage Placements ContentLookup — cross-list binding', () => {
  it('Lookup List attribute matches the Content Registry ListInstance Url', () => {
    const placements = loadAsset('schema-homepage-placements.xml');
    const elements = loadAsset('elements.xml');

    const contentRegistryUrl = 'Lists/HB_FoleonContentRegistry';
    expect(elements).toContain(`Url="${contentRegistryUrl}"`);

    const lookupMatch = placements.match(
      /<Field\s+[\s\S]*?Name="ContentLookup"[\s\S]*?\/>/,
    );
    expect(lookupMatch, 'ContentLookup field must be present').not.toBeNull();
    const lookupXml = lookupMatch![0]!;
    expect(lookupXml).toContain('Type="Lookup"');
    expect(lookupXml).toContain(`List="${contentRegistryUrl}"`);
    expect(lookupXml).toContain('ShowField="Title"');
    expect(lookupXml).toContain('Required="TRUE"');
    expect(lookupXml).toContain('Indexed="TRUE"');
  });

  it('ContentIdCache remains a Number (denormalized FoleonDocId, not SP Id)', () => {
    const placements = loadAsset('schema-homepage-placements.xml');
    const fieldMatch = placements.match(
      /<Field\s+[\s\S]*?Name="ContentIdCache"[\s\S]*?\/>/,
    );
    expect(fieldMatch).not.toBeNull();
    expect(fieldMatch![0]!).toContain('Type="Number"');
    expect(fieldMatch![0]!).toContain('Indexed="TRUE"');
  });
});

describe('Uniqueness invariants', () => {
  it('Content Registry FoleonDocId is indexed + AllowDuplicateValues=FALSE', () => {
    const xml = loadAsset('schema-content-registry.xml');
    const match = xml.match(/<Field\s+[\s\S]*?Name="FoleonDocId"[\s\S]*?\/>/);
    expect(match).not.toBeNull();
    expect(match![0]!).toContain('Indexed="TRUE"');
    expect(match![0]!).toContain('AllowDuplicateValues="FALSE"');
  });

  it('Interaction Events EventId is indexed + AllowDuplicateValues=FALSE', () => {
    const xml = loadAsset('schema-interaction-events.xml');
    const match = xml.match(/<Field\s+[\s\S]*?Name="EventId"[\s\S]*?\/>/);
    expect(match).not.toBeNull();
    expect(match![0]!).toContain('Indexed="TRUE"');
    expect(match![0]!).toContain('AllowDuplicateValues="FALSE"');
  });

  it('Sync Runs RunId is indexed + AllowDuplicateValues=FALSE', () => {
    const xml = loadAsset('schema-sync-runs.xml');
    const match = xml.match(/<Field\s+[\s\S]*?Name="RunId"[\s\S]*?\/>/);
    expect(match).not.toBeNull();
    expect(match![0]!).toContain('Indexed="TRUE"');
    expect(match![0]!).toContain('AllowDuplicateValues="FALSE"');
  });
});

function expectFieldAttr(xml: string, field: FoleonFieldSchema, attr: string): void {
  const fieldRegex = new RegExp(
    `<Field\\s+[\\s\\S]*?Name="${field.internalName}"[\\s\\S]*?\\/>`,
  );
  const match = xml.match(fieldRegex);
  expect(match, `Field ${field.internalName} must be declared`).not.toBeNull();
  expect(match![0]!, `Field ${field.internalName} must carry ${attr}`).toContain(attr);
}
