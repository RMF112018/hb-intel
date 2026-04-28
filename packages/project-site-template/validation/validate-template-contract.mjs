// Phase 1 Step 5 — Project Site Template Contract schema validation harness.
// Compiles all 14 family schemas plus the high-level template-contract scaffold
// schema, then validates template-contract.json and the fixture set.
//
// Exit codes:
//   0 — every test outcome matched expectation.
//   1 — at least one unexpected outcome (valid fixture failed, invalid fixture
//       passed, contract instance failed, or schema failed to compile).

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, basename } from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = resolve(__dirname, '..');
const SCHEMAS_DIR = join(PKG_ROOT, 'schemas');
const FAMILIES_DIR = join(SCHEMAS_DIR, 'families');
const FIXTURES_VALID_DIR = join(__dirname, 'fixtures', 'valid');
const FIXTURES_INVALID_DIR = join(__dirname, 'fixtures', 'invalid');
const FIXTURE_MANIFEST_PATH = join(__dirname, 'fixtures', 'fixture-manifest.json');
const REPORTS_DIR = join(__dirname, 'reports');
const REPORT_PATH = join(REPORTS_DIR, 'schema-validation-report.json');

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

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function buildAjv() {
  const ajv = new Ajv({
    strict: false,
    allErrors: true,
    allowUnionTypes: false,
  });
  addFormats(ajv);
  return ajv;
}

function compileAll() {
  const ajv = buildAjv();
  const schemasById = new Map();

  // Add family schemas first; schemas reference local $defs only, so order is
  // not strictly required. Adding all schemas before compiling lets ajv resolve
  // any cross-schema references should they be introduced later.
  for (const family of FAMILY_NAMES) {
    const path = join(FAMILIES_DIR, `${family}.schema.json`);
    const schema = readJson(path);
    ajv.addSchema(schema);
    schemasById.set(family, schema);
  }

  const contractSchemaPath = join(SCHEMAS_DIR, 'template-contract.schema.json');
  const contractSchema = readJson(contractSchemaPath);
  ajv.addSchema(contractSchema, contractSchema.$id);
  schemasById.set('template-contract', contractSchema);

  // Compile validators and capture per-family failures.
  const validators = new Map();
  for (const [name, schema] of schemasById) {
    try {
      validators.set(name, ajv.compile(schema));
    } catch (err) {
      console.error(`Schema compile failed for ${name}: ${err.message}`);
      return { ajv, validators: null, schemasById, compileError: { name, message: err.message } };
    }
  }

  return { ajv, validators, schemasById };
}

function validateInstance(validator, instance) {
  const ok = validator(instance);
  return { ok, errors: ok ? [] : (validator.errors ?? []).map((e) => ({
    instancePath: e.instancePath,
    schemaPath: e.schemaPath,
    keyword: e.keyword,
    message: e.message,
    params: e.params,
  })) };
}

function listJsonFiles(dir) {
  try {
    return readdirSync(dir)
      .filter((name) => name.endsWith('.json'))
      .sort() // deterministic ordering for report stability
      .map((name) => ({ name, path: join(dir, name) }))
      .filter((f) => statSync(f.path).isFile());
  } catch {
    return [];
  }
}

function deriveFamilyFromValidFixtureName(name) {
  // <family>.valid.json
  const match = name.match(/^(.+)\.valid\.json$/);
  return match ? match[1] : null;
}

function ensureDir(dir) {
  try {
    mkdirSync(dir, { recursive: true });
  } catch {}
}

function main() {
  const { validators, schemasById, compileError } = compileAll();

  const results = [];
  let unexpected = 0;

  if (compileError) {
    results.push({
      kind: 'schema-compile',
      name: compileError.name,
      pass: false,
      errors: [{ message: compileError.message }],
    });
    unexpected += 1;
  } else {
    // Validate template-contract.json against template-contract.schema.json.
    const contractValidator = validators.get('template-contract');
    const contractInstancePath = join(PKG_ROOT, 'template-contract.json');
    const contractInstance = readJson(contractInstancePath);
    const contractResult = validateInstance(contractValidator, contractInstance);
    results.push({
      kind: 'contract-instance',
      name: 'template-contract.json',
      schema: 'template-contract.schema.json',
      pass: contractResult.ok,
      errors: contractResult.errors,
    });
    if (!contractResult.ok) unexpected += 1;

    // Valid fixtures: each must pass against its family schema.
    const validFiles = listJsonFiles(FIXTURES_VALID_DIR);
    for (const f of validFiles) {
      const family = deriveFamilyFromValidFixtureName(f.name);
      if (!family || !validators.has(family)) {
        results.push({
          kind: 'valid-fixture',
          name: f.name,
          schema: family ?? '(unknown)',
          pass: false,
          errors: [{ message: `No schema mapped for fixture "${f.name}"` }],
        });
        unexpected += 1;
        continue;
      }
      const validator = validators.get(family);
      const instance = readJson(f.path);
      const r = validateInstance(validator, instance);
      results.push({
        kind: 'valid-fixture',
        name: f.name,
        schema: `${family}.schema.json`,
        pass: r.ok,
        errors: r.errors,
      });
      if (!r.ok) unexpected += 1; // expected pass; failure is unexpected.
    }

    // Invalid fixtures: read manifest to know which schema each targets.
    let manifest = { invalid: {} };
    try {
      manifest = readJson(FIXTURE_MANIFEST_PATH);
    } catch {
      // Missing manifest is a hard failure for the harness contract.
      results.push({
        kind: 'invalid-fixture-manifest',
        name: 'fixture-manifest.json',
        pass: false,
        errors: [{ message: 'fixture-manifest.json missing or unreadable' }],
      });
      unexpected += 1;
    }
    const invalidFiles = listJsonFiles(FIXTURES_INVALID_DIR);
    for (const f of invalidFiles) {
      const entry = manifest.invalid?.[f.name];
      if (!entry) {
        results.push({
          kind: 'invalid-fixture',
          name: f.name,
          schema: '(no manifest entry)',
          pass: false,
          errors: [{ message: `No fixture-manifest.json entry for "${f.name}"` }],
        });
        unexpected += 1;
        continue;
      }
      const targetSchemaName = entry.targetSchema; // e.g., "site" or "template-contract"
      const validator = validators.get(targetSchemaName);
      if (!validator) {
        results.push({
          kind: 'invalid-fixture',
          name: f.name,
          schema: targetSchemaName,
          pass: false,
          errors: [{ message: `Unknown target schema "${targetSchemaName}"` }],
        });
        unexpected += 1;
        continue;
      }
      const instance = readJson(f.path);
      const r = validateInstance(validator, instance);
      // Expected to fail; pass=false here means the schema rejected as expected.
      const expected = !r.ok;
      results.push({
        kind: 'invalid-fixture',
        name: f.name,
        schema: `${targetSchemaName}.schema.json`,
        expectedFailureReason: entry.expectedFailureReason,
        targetFamily: entry.targetFamily,
        ajvAccepted: r.ok,
        pass: expected,
        errors: r.errors,
      });
      if (!expected) unexpected += 1;
    }
  }

  // Console report.
  const headerCols = ['kind', 'name', 'schema', 'outcome'];
  console.log('\nschema validation harness — phase 1 step 5\n');
  console.log(headerCols.map((c) => c.padEnd(28)).join('  '));
  console.log(headerCols.map((c) => '-'.repeat(28)).join('  '));
  for (const r of results) {
    const outcome = r.pass ? 'PASS' : 'FAIL';
    console.log(
      [r.kind, r.name, r.schema ?? '', outcome]
        .map((c) => String(c ?? '').padEnd(28))
        .join('  ')
    );
    if (!r.pass && r.errors?.length) {
      for (const e of r.errors.slice(0, 5)) {
        console.log(`    ${e.instancePath ?? ''} ${e.keyword ?? ''} ${e.message ?? e.message}`);
      }
      if (r.errors.length > 5) {
        console.log(`    ... ${r.errors.length - 5} more errors`);
      }
    }
  }

  // Sort results by (kind, name) for stable, byte-deterministic output across
  // runs. Console table also reads in this order.
  const KIND_ORDER = ['schema-compile', 'contract-instance', 'valid-fixture', 'invalid-fixture', 'invalid-fixture-manifest'];
  results.sort((a, b) => {
    const ki = KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind);
    if (ki !== 0) return ki;
    return String(a.name).localeCompare(String(b.name));
  });

  // Deterministic report. No timestamps, no absolute paths, sorted ordering.
  ensureDir(REPORTS_DIR);
  const report = {
    harnessVersion: '1.0.0',
    schemasLoaded: schemasById ? [...schemasById.keys()].sort() : [],
    unexpectedOutcomes: unexpected,
    reportPath: 'validation/reports/schema-validation-report.json',
    results,
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log(
    `\nschema validation: ${unexpected === 0 ? 'clean' : `${unexpected} unexpected outcome(s)`}`
  );
  console.log('report: validation/reports/schema-validation-report.json');
  process.exit(unexpected === 0 ? 0 : 1);
}

main();
