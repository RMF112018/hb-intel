// Phase 1 Step 5 — Contract integrity checks.
// Verifies cross-file structural constraints over schemas, the contract
// instance, field maps, and fixtures. No external dependencies.
//
// Exit codes:
//   0 — every check passed.
//   1 — at least one check failed; failures printed to stdout.

import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, basename } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = resolve(__dirname, '..');
const SCHEMAS_DIR = join(PKG_ROOT, 'schemas');
const FAMILIES_DIR = join(SCHEMAS_DIR, 'families');
const FIELDS_DIR = join(PKG_ROOT, 'fields');
const FIELDS_FAMILIES_DIR = join(FIELDS_DIR, 'families');
const FIXTURES_VALID_DIR = join(__dirname, 'fixtures', 'valid');
const REPORTS_DIR = join(__dirname, 'reports');
const REPORT_PATH = join(REPORTS_DIR, 'contract-integrity-report.json');

// Stable check catalog. Each running check pushes results here so the report
// reflects all 16 checks in deterministic order regardless of failure shape.
const CHECK_CATALOG = [
  { id: '1.family-schemas-exist', label: 'All 14 family schemas exist on disk' },
  { id: '2.families-listed', label: 'All 14 families listed in template-contract.json' },
  { id: '3.families-populated', label: 'All 14 families have status: populated' },
  { id: '4.fullExtractionComplete', label: 'fullExtractionComplete remains false (Step 5 stage; Prompt 04 flips the gate)' },
  { id: '5.family-schema-paths-resolve', label: 'Family schema paths in template-contract.json resolve' },
  { id: '6.field-maps-exist', label: 'Field maps exist for the 12 Step 3 field-map families' },
  { id: '7.oc-row-count', label: 'object-catalog-field-disposition.json has exactly 18 rows' },
  { id: '8.oc-placeholder-rows', label: 'OC-17 and OC-18 are extractionTreatment=placeholder-only and mvpTreatment=Deferred' },
  { id: '9.procore-boundary-const', label: 'integrations.schema.json Procore boundary const-true booleans + ProcoreCompanyId default 5280' },
  { id: '10.secret-scan', label: 'No secret-class field names or string values outside guardrail descriptions and invalid/ fixtures' },
  { id: '11.no-shorthand-enum', label: 'No enum definition uses scaffold shorthand values (mvp / deferred / placeholder)' },
  { id: '12.no-forbidden-projecttype', label: 'No projectType $defs enum contains forbidden tokens' },
  { id: '13.no-archived-as-stage', label: 'No projectStage $defs enum contains Archived' },
  { id: '14.visibilitybystage-keys', label: 'modules.visibilityByStage keys are exactly the six ProjectStage tokens' },
  { id: '15.seedrule-keyedon', label: 'seedRule / verticalSeeding keyedOn is "projectType" wherever present' },
  { id: '16.forbidden-deps', label: 'package.json declares no backend / SPFx / provisioning / Procore-runtime dependency markers' },
];

const FAMILY_NAMES = [
  'template-manifest',
  'enums',
  'settings',
  'permissions',
  'site',
  'pages',
  'libraries',
  'lists',
  'modules',
  'workflows',
  'integrations',
  'site-health',
  'provisioning-validation',
  'validation-rules',
];

// 12 families with field maps (enums and validation-rules are populated as
// schema content in Phase 1 Step 2 and have no separate field map).
const FIELD_MAP_FAMILIES = [
  'template-manifest',
  'settings',
  'permissions',
  'site',
  'pages',
  'libraries',
  'lists',
  'modules',
  'workflows',
  'integrations',
  'site-health',
  'provisioning-validation',
];

// Secret-class tokens. Structural scan: matched only against object KEYS and
// string VALUES that are not inside a `description` field. Allowlist: any
// property whose key is `description` (anywhere in the JSON tree) is skipped
// entirely, since contract documentation legitimately discusses these tokens
// in guardrail descriptions. The validation/fixtures/invalid/ directory is
// also skipped because invalid fixtures are designed to demonstrate violations
// the schemas should reject.
const SECRET_TOKENS = [
  'client_secret',
  'clientsecret',
  'refresh_token',
  'refreshtoken',
  'dmsa_credential',
  'dmsacredential',
  'oauth_secret',
  'oauthsecret',
  'api_key',
  'apikey',
  'bearer_token',
  'bearertoken',
];

const failures = [];

function fail(check, detail) {
  failures.push({ check, detail });
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function exists(path) {
  try { statSync(path); return true; } catch { return false; }
}

function walkSchemaEnums(node, parentKey, found) {
  if (Array.isArray(node)) {
    for (const item of node) walkSchemaEnums(item, parentKey, found);
    return;
  }
  if (node && typeof node === 'object') {
    if (parentKey === 'enum' && Array.isArray(node)) {
      // shouldn't happen because arrays handled above, but defensive
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k === 'enum' && Array.isArray(v)) {
        found.push({ pathHint: parentKey, values: v });
      }
      walkSchemaEnums(v, k, found);
    }
  }
}

function findEnumValuesByDefName(schema, defName) {
  // Walk schema $defs for a named subschema and return its enum array if any.
  const defs = schema.$defs ?? schema.definitions;
  if (!defs || !defs[defName]) return null;
  const def = defs[defName];
  if (Array.isArray(def.enum)) return def.enum;
  return null;
}

function walkAllStringNodes(node, parentKey, visit) {
  if (Array.isArray(node)) {
    for (const item of node) walkAllStringNodes(item, parentKey, visit);
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      // Allowlist: skip the entire subtree when the key is `description` —
      // descriptions intentionally reference secret-class terminology in
      // guardrail prose.
      if (k === 'description') continue;
      visit({ kind: 'key', key: k, parentKey });
      walkAllStringNodes(v, k, visit);
    }
    return;
  }
  if (typeof node === 'string') {
    visit({ kind: 'value', value: node, parentKey });
  }
}

function tokenMatch(s) {
  const lower = String(s).toLowerCase();
  return SECRET_TOKENS.find((t) => lower.includes(t));
}

function listJsonFiles(dir) {
  try {
    return readdirSync(dir)
      .filter((n) => n.endsWith('.json'))
      .map((n) => join(dir, n))
      .filter((p) => statSync(p).isFile());
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Check 1: All 14 family schema files exist on disk.
// ---------------------------------------------------------------------------
for (const family of FAMILY_NAMES) {
  const path = join(FAMILIES_DIR, `${family}.schema.json`);
  if (!exists(path)) fail('1.family-schemas-exist', `Missing schema: ${path}`);
}

// ---------------------------------------------------------------------------
// Check 2 + 3: All 14 families listed and `populated` in template-contract.json.
// ---------------------------------------------------------------------------
const contractPath = join(PKG_ROOT, 'template-contract.json');
let contract;
try {
  contract = readJson(contractPath);
} catch (e) {
  fail('2.contract-readable', `Cannot read ${contractPath}: ${e.message}`);
}
if (contract) {
  const familyEntries = contract.families ?? {};
  for (const family of FAMILY_NAMES) {
    if (!Object.prototype.hasOwnProperty.call(familyEntries, family)) {
      fail('2.families-listed', `Missing family in template-contract.json: ${family}`);
    } else if (familyEntries[family].status !== 'populated') {
      fail('3.families-populated', `Family not populated: ${family} (status=${familyEntries[family].status})`);
    }
  }

  // ---------------------------------------------------------------------------
  // Check 4: fullExtractionComplete remains false (Step 5 stage; gate flips
  // only after Run-Harness-and-Remediate prompt acknowledges clean run).
  // ---------------------------------------------------------------------------
  if (contract.status?.fullExtractionComplete !== false) {
    fail('4.fullExtractionComplete', `Expected false, got ${contract.status?.fullExtractionComplete}`);
  }

  // ---------------------------------------------------------------------------
  // Check 5: Family schema paths in the contract resolve.
  // ---------------------------------------------------------------------------
  for (const [family, entry] of Object.entries(familyEntries)) {
    if (typeof entry.schema !== 'string') continue;
    const rel = entry.schema.replace(/^\.\//, '');
    const abs = join(PKG_ROOT, rel);
    if (!exists(abs)) fail('5.family-schema-paths-resolve', `Missing path for ${family}: ${abs}`);
  }
}

// ---------------------------------------------------------------------------
// Check 6: Field maps exist for the 12 Step 3 field-map families.
// ---------------------------------------------------------------------------
for (const family of FIELD_MAP_FAMILIES) {
  const path = join(FIELDS_FAMILIES_DIR, `${family}.fields.json`);
  if (!exists(path)) fail('6.field-maps-exist', `Missing field map: ${path}`);
}

// ---------------------------------------------------------------------------
// Check 7 + 8: Object catalog disposition has 18 rows; OC-17 + OC-18 placeholder.
// ---------------------------------------------------------------------------
const ocPath = join(FIELDS_DIR, 'object-catalog-field-disposition.json');
if (!exists(ocPath)) {
  fail('7.oc-disposition-exists', `Missing: ${ocPath}`);
} else {
  const oc = readJson(ocPath);
  if (!Array.isArray(oc.rows) || oc.rows.length !== 18) {
    fail('7.oc-row-count', `Expected 18 rows, got ${oc.rows?.length ?? 'n/a'}`);
  } else {
    for (const id of ['OC-17', 'OC-18']) {
      const row = oc.rows.find((r) => r.catalogId === id);
      if (!row) {
        fail('8.oc-placeholder-rows', `Missing row ${id}`);
        continue;
      }
      if (row.extractionTreatment !== 'placeholder-only') {
        fail('8.oc-placeholder-treatment', `${id} extractionTreatment=${row.extractionTreatment}`);
      }
      if (row.mvpTreatment !== 'Deferred') {
        fail('8.oc-placeholder-mvp', `${id} mvpTreatment=${row.mvpTreatment}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Check 9: integrations.schema.json Procore boundary asserts.
// ---------------------------------------------------------------------------
const integrationsPath = join(FAMILIES_DIR, 'integrations.schema.json');
if (!exists(integrationsPath)) {
  fail('9.integrations-schema-exists', `Missing ${integrationsPath}`);
} else {
  const integrations = readJson(integrationsPath);
  const props = integrations.properties ?? {};
  const constTrueChecks = [
    'noFullProcoreMirror',
    'noDirectSpfxToProcore',
    'noProcoreSecrets',
    'procoreDirectoryComparison_ReadOnly',
    'procoreWriteback_Deferred',
  ];
  for (const k of constTrueChecks) {
    if (props[k]?.const !== true) {
      fail('9.procore-boundary-const', `${k}.const expected true, got ${JSON.stringify(props[k]?.const)}`);
    }
  }
  if (props.procoreMapping_ProcoreCompanyId?.default !== '5280') {
    fail('9.procore-companyid-default', `procoreMapping_ProcoreCompanyId.default expected "5280", got ${JSON.stringify(props.procoreMapping_ProcoreCompanyId?.default)}`);
  }
}

// ---------------------------------------------------------------------------
// Check 10: No secret-class field names or values in schemas, fields, or
// VALID fixtures (invalid fixtures are designed to demonstrate violations).
// `description` strings are skipped because they legitimately discuss the
// guardrail tokens in prose.
// ---------------------------------------------------------------------------
const scanRoots = [
  { dir: SCHEMAS_DIR, label: 'schemas' },
  { dir: FAMILIES_DIR, label: 'schemas/families' },
  { dir: FIELDS_DIR, label: 'fields' },
  { dir: FIELDS_FAMILIES_DIR, label: 'fields/families' },
  { dir: FIXTURES_VALID_DIR, label: 'fixtures/valid' },
];
function scanDir(dir, label) {
  for (const path of listJsonFiles(dir)) {
    const fileName = basename(path);
    let json;
    try {
      json = readJson(path);
    } catch (e) {
      fail('10.secret-scan-readable', `${label}/${fileName}: ${e.message}`);
      continue;
    }
    walkAllStringNodes(json, null, ({ kind, key, value }) => {
      if (kind === 'key') {
        const m = tokenMatch(key);
        if (m) fail('10.secret-key', `${label}/${fileName}: key "${key}" matches secret token "${m}"`);
      } else if (kind === 'value') {
        const m = tokenMatch(value);
        if (m) fail('10.secret-value', `${label}/${fileName}: value contains secret token "${m}"`);
      }
    });
  }
}
for (const root of scanRoots) scanDir(root.dir, root.label);

// ---------------------------------------------------------------------------
// Check 11: No enum definition uses scaffold shorthand values.
// ---------------------------------------------------------------------------
const SHORTHAND_VALUES = new Set(['mvp', 'deferred', 'placeholder']);
for (const family of FAMILY_NAMES) {
  const path = join(FAMILIES_DIR, `${family}.schema.json`);
  if (!exists(path)) continue;
  const schema = readJson(path);
  const enumsFound = [];
  walkSchemaEnums(schema, null, enumsFound);
  for (const e of enumsFound) {
    for (const v of e.values) {
      if (typeof v === 'string' && SHORTHAND_VALUES.has(v)) {
        fail('11.no-shorthand-enum', `${family}: scaffold shorthand "${v}" found in enum`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Check 12: No projectType $defs enum contains forbidden tokens.
// ---------------------------------------------------------------------------
const FORBIDDEN_PROJECT_TYPES = ['preconstruction_only', 'warranty_closeout', 'active_construction'];
for (const family of FAMILY_NAMES) {
  const path = join(FAMILIES_DIR, `${family}.schema.json`);
  if (!exists(path)) continue;
  const schema = readJson(path);
  const ptEnum = findEnumValuesByDefName(schema, 'projectType');
  if (!ptEnum) continue;
  for (const forbidden of FORBIDDEN_PROJECT_TYPES) {
    if (ptEnum.includes(forbidden)) {
      fail('12.no-forbidden-projecttype', `${family}: projectType enum contains forbidden value "${forbidden}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// Check 13: No projectStage $defs enum contains "Archived".
// ---------------------------------------------------------------------------
for (const family of FAMILY_NAMES) {
  const path = join(FAMILIES_DIR, `${family}.schema.json`);
  if (!exists(path)) continue;
  const schema = readJson(path);
  const psEnum = findEnumValuesByDefName(schema, 'projectStage');
  if (!psEnum) continue;
  if (psEnum.includes('Archived')) {
    fail('13.no-archived-as-stage', `${family}: projectStage enum contains "Archived"`);
  }
}

// ---------------------------------------------------------------------------
// Check 14: modules.visibilityByStage uses ONLY the six ProjectStage tokens.
// ---------------------------------------------------------------------------
const modulesPath = join(FAMILIES_DIR, 'modules.schema.json');
if (exists(modulesPath)) {
  const modules = readJson(modulesPath);
  const vbsProps = modules.properties?.visibilityByStage?.properties ?? {};
  const expected = new Set(['lead', 'estimating', 'preconstruction', 'active_construction', 'closeout', 'warranty']);
  const got = new Set(Object.keys(vbsProps));
  for (const k of got) {
    if (!expected.has(k)) {
      fail('14.visibilitybystage-key', `modules.visibilityByStage has non-ProjectStage key "${k}"`);
    }
  }
  for (const k of expected) {
    if (!got.has(k)) {
      fail('14.visibilitybystage-missing', `modules.visibilityByStage missing ProjectStage key "${k}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// Check 15: seedRule.keyedOn / verticalSeeding.keyedOn use "projectType".
// ---------------------------------------------------------------------------
function checkKeyedOnIsProjectType(schema, family) {
  const stack = [{ node: schema, path: family }];
  while (stack.length) {
    const { node, path } = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (Array.isArray(node)) {
      for (const item of node) stack.push({ node: item, path });
      continue;
    }
    for (const [k, v] of Object.entries(node)) {
      if ((k === 'seedRule' || k === 'verticalSeeding') && v && typeof v === 'object' && v.properties) {
        const keyedOn = v.properties.keyedOn;
        if (keyedOn && keyedOn.const && keyedOn.const !== 'projectType') {
          fail('15.seedrule-keyedon', `${family}: ${k}.keyedOn.const = ${JSON.stringify(keyedOn.const)} (expected "projectType")`);
        }
      }
      stack.push({ node: v, path: `${path}.${k}` });
    }
  }
}
for (const family of FAMILY_NAMES) {
  const path = join(FAMILIES_DIR, `${family}.schema.json`);
  if (!exists(path)) continue;
  const schema = readJson(path);
  checkKeyedOnIsProjectType(schema, family);
}

// ---------------------------------------------------------------------------
// Check 16: package.json declares no backend / SPFx / provisioning markers.
// ---------------------------------------------------------------------------
const pkgPath = join(PKG_ROOT, 'package.json');
const pkg = readJson(pkgPath);
const FORBIDDEN_DEP_PATTERNS = [/spfx/i, /sharepoint/i, /azure-functions/i, /procore/i];
for (const depTable of ['dependencies', 'devDependencies', 'peerDependencies']) {
  const deps = pkg[depTable] ?? {};
  for (const dep of Object.keys(deps)) {
    for (const pat of FORBIDDEN_DEP_PATTERNS) {
      if (pat.test(dep)) {
        fail('16.forbidden-deps', `package.json ${depTable} contains forbidden marker: ${dep}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Output, report, and exit.
// ---------------------------------------------------------------------------

// Build per-check report rows in the catalog's stable order. Each catalog entry
// becomes one row. A check is "pass" when no failure was recorded against its
// id-prefix; otherwise "fail" with all matching failure details.
function ensureDir(dir) {
  try { mkdirSync(dir, { recursive: true }); } catch {}
}

const reportChecks = CHECK_CATALOG.map(({ id, label }) => {
  const matching = failures
    .filter((f) => f.check === id || f.check.startsWith(id + '.') || f.check.startsWith(id))
    .sort((a, b) => a.detail.localeCompare(b.detail));
  return {
    id,
    label,
    pass: matching.length === 0,
    failures: matching.map((m) => ({ check: m.check, detail: m.detail })),
  };
});

// Allow id-prefix sloppy matches in the catalog above, but also bucket any
// failure that did not map cleanly into an "uncatalogued" row. (Defensive; the
// ids above are designed to cover every fail() call.)
const uncatalogued = failures.filter((f) =>
  !CHECK_CATALOG.some(({ id }) => f.check === id || f.check.startsWith(id + '.') || f.check.startsWith(id))
);
if (uncatalogued.length) {
  reportChecks.push({
    id: '99.uncatalogued',
    label: 'Failures not mapped to a known check id',
    pass: false,
    failures: uncatalogued.map((m) => ({ check: m.check, detail: m.detail })),
  });
}

const totalChecks = CHECK_CATALOG.length;
const passingChecks = reportChecks.filter((c) => c.pass).length;
const failingChecks = reportChecks.length - passingChecks;

console.log('\ncontract integrity checks — phase 1 step 5\n');
if (failures.length === 0) {
  console.log(`  all checks passed (${passingChecks}/${totalChecks})`);
} else {
  console.log(`  ${failures.length} failure(s):\n`);
  for (const f of failures) {
    console.log(`  [${f.check}] ${f.detail}`);
  }
}

const report = {
  harnessVersion: '1.0.0',
  totalChecks,
  passing: passingChecks,
  failing: failingChecks,
  reportPath: 'validation/reports/contract-integrity-report.json',
  checks: reportChecks,
};
ensureDir(REPORTS_DIR);
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log('\n  report: validation/reports/contract-integrity-report.json');

process.exit(failures.length === 0 ? 0 : 1);
