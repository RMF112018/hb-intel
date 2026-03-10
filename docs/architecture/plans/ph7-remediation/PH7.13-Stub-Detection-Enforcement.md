> **Tier 1 Classification Banner**
> **Document Class:** Canonical Normative Plan
> **Status:** Active — PH7.13 remediation; may be implemented independently of PH7.12 sign-off as a quality-infrastructure addition
> **Governs:** `packages/eslint-plugin-hbc/`, `.eslintrc.base.js`, `.github/workflows/ci.yml`, all stub-bearing source files in `packages/`, `apps/`, `backend/`
> **ADR:** ADR-0095 (see §ADR-0095 below)
> **Next available ADR after this plan:** ADR-0096

---

# PH7.13 — Stub Detection and Incomplete Implementation Enforcement

**Date:** 2026-03-10
**Phase Reference:** DOCS-AUDIT (2026-03-10) → Gap remediation; extension of Phase 7 quality infrastructure
**Depends On:** PH7.8 (Test Governance Normalization), PH7.5 (ESLint boundary rules in eslint-plugin-hbc)
**Effort Estimate:** 1.0 sprint-week (T1–T5 are mechanical; T6 is optional tooling)
**Blocking:** None — this plan adds quality gates; it does not restructure any existing package

---

## Objective

The DOCS-AUDIT phase (2026-03-10) established that the HB Intel codebase has **zero automated enforcement** against stub implementations and incomplete code. Known stubs — `acknowledgments/stubs.ts`, `BicModuleRegistry.ts` server aggregation, `cd.yml` SPFx deploy — are silently committed with no lint warning, no CI gate, and no pre-commit hook. This plan closes that gap by introducing three enforcement layers, an escape-hatch convention for intentional stubs, and remediating the known stub inventory with explicit exemptions or implementation.

---

## 3-Line Plan

1. Add `no-warning-comments` and `@typescript-eslint/ban-ts-comment` to `.eslintrc.base.js`; create a new `no-stub-implementations` rule in `packages/eslint-plugin-hbc/`.
2. Add a CI grep-scan step to `.github/workflows/ci.yml`; apply `// stub-approved: <reason>` markers to all intentional stubs in the known inventory.
3. Run all four mechanical gates; confirm zero new lint errors; confirm all known stubs are either remediated or explicitly exempted; update `current-state-map.md §2`.

---

## Background: DOCS-AUDIT Findings (2026-03-10)

The DOCS-AUDIT phase inspected all SF\*-T09-\*.md files and, as a byproduct, performed a codebase-wide stub survey. The survey found:

| Layer | Status |
|-------|--------|
| ESLint `no-warning-comments` | **Absent** — TODO/FIXME comments are silently committed |
| ESLint `@typescript-eslint/ban-ts-comment` | **Absent** — `@ts-ignore` has no description requirement |
| Custom stub-detection rule | **Absent** — `throw new Error('not implemented')` is not caught |
| CI grep scan | **Absent** — no workflow step scans for stub patterns |
| Git pre-commit hooks | **Absent** — no Husky or lint-staged configured |
| Existing stubs (live, undetected) | **6 confirmed** (see §Known Stub Inventory) |

The `branches: 95` coverage gate (ADR-0085, PH7.8) provides partial mitigation for the P1 packages: stubs that lack test coverage fail the coverage gate. However, this applies only to the five P1 packages and only catches stubs that happen not to be tested — it does not prevent stub-pattern commits.

---

## Scope: Three Enforcement Layers

```
Layer 1 — ESLint (static, local + CI)
  ├── no-warning-comments           →  surfaces TODO/FIXME at lint time
  ├── @typescript-eslint/ban-ts-comment  →  requires description on @ts-ignore
  └── @hb-intel/hbc/no-stub-implementations  →  blocks throw-not-implemented pattern

Layer 2 — CI Grep Scan (explicit, fail-fast)
  └── ci.yml lint-and-typecheck job  →  grep for unapproved throw-not-implemented
                                         across packages/, apps/, backend/

Layer 3 — Stub Inventory Remediation
  └── All 6 known stubs  →  either implemented or marked // stub-approved: <reason>
```

**Escape hatch convention (D-04):** Any stub that is intentional and tracked must be marked with an inline comment immediately preceding the stub code:

```typescript
// stub-approved: <non-empty reason explaining intent and tracking reference>
```

A blank or missing reason is not valid. The CI grep and ESLint rule both exclude lines carrying this marker.

---

## Known Stub Inventory (Pre-PH7.13)

| # | File | Stub Description | Disposition |
|---|------|-----------------|-------------|
| S-01 | `backend/functions/src/functions/acknowledgments/stubs.ts` | BIC-completion, notification, next-party notification — log-only stubs | `stub-approved` marker (pending SF04 full integration) |
| S-02 | `packages/bic-next-move/src/registry/BicModuleRegistry.ts` | Server-side BIC aggregation endpoint — log-only stub (D-06) | `stub-approved` marker (locked decision: server aggregation deferred) |
| S-03 | `tools/mocks/sp-core-library.ts` | SPFx `@microsoft/sp-core-library` mock for jsdom | Globally exempt — `tools/mocks/` excluded from all scans (D-06) |
| S-04 | `tools/mocks/sp-property-pane.ts` | SPFx PropertyPane API mock for jsdom | Globally exempt — `tools/mocks/` excluded from all scans (D-06) |
| S-05 | `tools/mocks/sp-webpart-base.ts` | `BaseClientSideWebPart` stub for jsdom | Globally exempt — `tools/mocks/` excluded from all scans (D-06) |
| S-06 | `.github/workflows/cd.yml` (SPFx deploy job) | `if: false` deploy job with `echo "SPFx deploy is stubbed"` | `# stub-approved:` YAML marker (pending Vite-to-.sppkg pipeline, PH8) |

---

## Task Implementations

### T1 — `no-warning-comments` and `@typescript-eslint/ban-ts-comment`

**File:** `.eslintrc.base.js`

Add two rules to the root `rules` block:

```js
// .eslintrc.base.js — add inside the root rules: {} object

// PH7.13 T1 — Surface TODO/FIXME at lint time (warn, not error, to preserve flow)
'no-warning-comments': ['warn', {
  terms: ['TODO', 'FIXME', 'HACK', 'XXX'],
  location: 'anywhere',
}],

// PH7.13 T1 — Require a description when suppressing TypeScript errors
'@typescript-eslint/ban-ts-comment': ['error', {
  'ts-ignore': 'allow-with-description',
  'ts-expect-error': 'allow-with-description',
  'ts-nocheck': true,
  minimumDescriptionLength: 10,
}],
```

**Rationale for warn vs. error on `no-warning-comments`:** Elevating all existing TODOs to lint errors would immediately block CI. The warn level surfaces the debt in lint output without breaking the build, allowing incremental resolution. Any new TODO that is unacceptable can be escalated to error by the reviewer at PR time.

**Verification:**

```bash
# Should emit warning for any TODO/FIXME in source
echo "// TODO: fix this" > /tmp/test-warning.ts
pnpm eslint /tmp/test-warning.ts --no-eslintrc --rule '{"no-warning-comments": "warn"}'
# Expected: 1 warning

# Should error if @ts-ignore has no description
pnpm turbo run lint --filter @hbc/auth-core
```

---

### T2 — `no-stub-implementations` ESLint Rule

**File (new):** `packages/eslint-plugin-hbc/src/rules/no-stub-implementations.js`

```js
/**
 * @hb-intel/hbc/no-stub-implementations
 * PH7.13 — Stub Detection and Incomplete Implementation Enforcement
 *
 * Detects:
 *   (a) throw statements whose message matches a stub/not-implemented pattern
 *   (b) function bodies whose sole statement is a stub throw (with no logic)
 *
 * Escape hatch: precede the throw with a line comment containing
 *   "stub-approved:" followed by a non-empty reason.
 *
 * @see docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md
 * @see docs/architecture/adr/0095-stub-detection-enforcement-standard.md
 */
'use strict';

const STUB_PATTERN = /not.?implement|stub|placeholder|todo\s*:/i;

/**
 * Returns true if the node has a leading comment containing "stub-approved:"
 * with a non-empty reason on the same or immediately preceding line.
 */
function hasStubbApprovedComment(node, sourceCode) {
  const comments = sourceCode.getCommentsBefore(node);
  return comments.some((c) => {
    const text = c.value.trim();
    const match = text.match(/stub-approved:\s*(.+)/i);
    return match && match[1].trim().length > 0;
  });
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow throw statements whose message indicates an unimplemented stub',
      category: 'HBC Quality',
      recommended: true,
      url: 'docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md',
    },
    schema: [],
    messages: {
      stubThrow:
        'Stub implementation detected: "{{msg}}". Implement the function or add ' +
        '// stub-approved: <reason> above this line.',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      ThrowStatement(node) {
        // Only inspect throws whose argument is a `new Error(...)` call
        if (
          node.argument?.type !== 'NewExpression' ||
          node.argument.callee?.name !== 'Error'
        ) {
          return;
        }

        const args = node.argument.arguments;
        if (!args || args.length === 0) return;

        const firstArg = args[0];
        // Get the string value of the error message (string literal or template literal)
        let msg = null;
        if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
          msg = firstArg.value;
        } else if (firstArg.type === 'TemplateLiteral') {
          msg = firstArg.quasis.map((q) => q.value.cooked).join('');
        }

        if (!msg || !STUB_PATTERN.test(msg)) return;

        // Escape hatch: stub-approved comment on the preceding line
        if (hasStubbApprovedComment(node, sourceCode)) return;

        context.report({
          node,
          messageId: 'stubThrow',
          data: { msg },
        });
      },
    };
  },
};
```

**Register in plugin index:**

```js
// packages/eslint-plugin-hbc/src/index.js — add to the rules object:
'no-stub-implementations': require('./rules/no-stub-implementations'),
```

**Enable in `.eslintrc.base.js` overrides (source files only — not test utilities or mocks):**

```js
// .eslintrc.base.js — add a new override block:
{
  files: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx',
          'apps/**/*.ts', 'apps/**/*.tsx',
          'backend/**/*.ts'],
  excludedFiles: ['**/*.test.ts', '**/*.spec.ts', '**/*.stories.tsx',
                  'tools/mocks/**', '**/testing/**'],
  rules: {
    '@hb-intel/hbc/no-stub-implementations': 'error',
  },
},
```

**Verification:**

```bash
# Confirm rule is registered in the plugin
node -e "const p = require('./packages/eslint-plugin-hbc/src/index.js'); console.log(Object.keys(p.rules))"
# Expected: [..., 'no-stub-implementations']

# Confirm rule fires on a stub throw
cat > /tmp/test-stub.ts << 'EOF'
export function myFn() {
  throw new Error('not implemented');
}
EOF
pnpm eslint /tmp/test-stub.ts --rulesdir packages/eslint-plugin-hbc/src/rules
# Expected: error on the throw statement

# Confirm escape hatch suppresses the error
cat > /tmp/test-stub-approved.ts << 'EOF'
export function myFn() {
  // stub-approved: pending SF04 integration — tracked in backlog
  throw new Error('not implemented');
}
EOF
pnpm eslint /tmp/test-stub-approved.ts --rulesdir packages/eslint-plugin-hbc/src/rules
# Expected: 0 errors
```

---

### T3 — CI Grep Scan Step

**File:** `.github/workflows/ci.yml`

Add the following step to the `lint-and-typecheck` job, immediately after the `pnpm turbo run lint` step:

```yaml
      - name: Scan for unapproved stub patterns
        # PH7.13 T3 — CI-level grep gate for throw-not-implemented patterns not
        # caught by ESLint (e.g., patterns in .js files, generated code, edge cases).
        # Complements Layer 1 (ESLint) as Layer 2 enforcement.
        # Exclusions:
        #   - tools/mocks/   — SPFx SDK mocks (D-06 globally exempt)
        #   - dist/          — generated output
        #   - node_modules/  — dependencies
        #   - coverage/      — test output
        #   - *.test.ts, *.spec.ts — test files may legitimately mock stubs
        run: |
          FOUND=$(grep -rn \
            --include="*.ts" --include="*.tsx" --include="*.js" \
            --exclude-dir=dist \
            --exclude-dir=node_modules \
            --exclude-dir=coverage \
            --exclude-dir=".git" \
            -E "(throw new Error\(['\"\`][^'\"]+not.?impl|throw new Error\(['\"\`][^'\"]+placeholder)" \
            packages/ apps/ backend/ 2>/dev/null \
            | grep -v "stub-approved:" \
            | grep -v "\.test\.\|\.spec\.\|tools/mocks" \
            || true)

          if [ -n "$FOUND" ]; then
            echo "::error::Unapproved stub patterns detected. Implement the function or add '// stub-approved: <reason>' above the throw."
            echo ""
            echo "$FOUND"
            exit 1
          fi

          echo "Stub scan: no unapproved stub patterns found."
```

**Verification:**

```bash
# Simulate the grep locally — should return empty after T5 remediation is complete
grep -rn \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=dist --exclude-dir=node_modules --exclude-dir=coverage \
  -E "(throw new Error\(['\"\`][^'\"]+not.?impl|throw new Error\(['\"\`][^'\"]+placeholder)" \
  packages/ apps/ backend/ 2>/dev/null \
  | grep -v "stub-approved:" \
  | grep -v "\.test\.\|\.spec\.\|tools/mocks"
# Expected: empty output (exit 1 means stubs found; exit 0 means clean)
```

---

### T4 — Existing Stub Remediation (S-01, S-02, S-06)

Apply `stub-approved` markers to the three stubs that require explicit exemption (S-03, S-04, S-05 are globally excluded by directory).

**S-01 — `backend/functions/src/functions/acknowledgments/stubs.ts`**

Add to the top of each stub function (or at the file header):

```typescript
// stub-approved: intentional BIC-completion and notification stubs pending SF04
// full platform integration. Tracked: implement when @hbc/acknowledgment T07 is activated.
```

**S-02 — `packages/bic-next-move/src/registry/BicModuleRegistry.ts`** (server-side aggregation)

Add immediately above the stub throw or log:

```typescript
// stub-approved: server-side BIC aggregation deferred per ADR-0095 D-07.
// Implement when backend aggregation endpoint is activated in PH8.
```

**S-06 — `.github/workflows/cd.yml`** (SPFx deploy job)

Replace:

```yaml
    - run: echo "SPFx deploy is stubbed — see TODO comments"
```

with:

```yaml
    # stub-approved: SPFx deployment pending Vite-to-.sppkg packaging pipeline (PH8 CI/CD phase).
    - run: echo "SPFx deploy is not yet active — see PH8 CI/CD plan."
```

**Verification for T4:**

```bash
# Confirm S-01 has stub-approved marker
grep -n "stub-approved" backend/functions/src/functions/acknowledgments/stubs.ts

# Confirm S-02 has stub-approved marker
grep -n "stub-approved" packages/bic-next-move/src/registry/BicModuleRegistry.ts

# Confirm S-06 has stub-approved marker in cd.yml
grep -n "stub-approved" .github/workflows/cd.yml

# Full clean run of the CI grep (T3 command) — must return empty
grep -rn \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=dist --exclude-dir=node_modules --exclude-dir=coverage \
  -E "(throw new Error\(['\"\`][^'\"]+not.?impl|throw new Error\(['\"\`][^'\"]+placeholder)" \
  packages/ apps/ backend/ 2>/dev/null \
  | grep -v "stub-approved:" | grep -v "\.test\.\|\.spec\.\|tools/mocks"
# Expected: no output
```

---

### T5 — `tools/scan-stubs.ts` (Developer Tool)

**File (new):** `tools/scan-stubs.ts`

Provides a developer-friendly local stub scanner with annotated output — equivalent to the CI grep (T3) but with line context and a summary table.

```typescript
/**
 * tools/scan-stubs.ts — Local stub pattern scanner
 * PH7.13 — Stub Detection and Incomplete Implementation Enforcement
 *
 * Usage:
 *   pnpm tsx tools/scan-stubs.ts
 *   pnpm tsx tools/scan-stubs.ts --include-approved   # also list stub-approved entries
 *
 * @see docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md
 */
import { execSync } from 'node:child_process';
import { argv } from 'node:process';

const includeApproved = argv.includes('--include-approved');

const STUB_PATTERN =
  '(throw new Error\\([\'"`][^\'"]+not.?impl|throw new Error\\([\'"`][^\'"]+placeholder)';

const EXCLUDE_DIRS = [
  '--exclude-dir=dist',
  '--exclude-dir=node_modules',
  '--exclude-dir=coverage',
  '--exclude-dir=.git',
  '--exclude-dir=tools/mocks',
].join(' ');

const INCLUDE_FILES = '--include="*.ts" --include="*.tsx"';

function runScan(dirs: string[]): string {
  try {
    return execSync(
      `grep -rn ${INCLUDE_FILES} ${EXCLUDE_DIRS} -E "${STUB_PATTERN}" ${dirs.join(' ')} 2>/dev/null`,
      { encoding: 'utf-8' }
    );
  } catch {
    return ''; // grep returns exit code 1 when no matches found
  }
}

const raw = runScan(['packages/', 'apps/', 'backend/']);
const lines = raw.split('\n').filter(Boolean);

const approved: string[] = [];
const unapproved: string[] = [];

for (const line of lines) {
  if (line.includes('stub-approved:') || line.includes('.test.') || line.includes('.spec.')) {
    approved.push(line);
  } else {
    unapproved.push(line);
  }
}

console.log('\n── HB Intel Stub Scanner (PH7.13) ────────────────────────────────');

if (unapproved.length === 0) {
  console.log('✅  No unapproved stubs found.\n');
} else {
  console.log(`❌  ${unapproved.length} unapproved stub(s) found:\n`);
  unapproved.forEach((l) => console.log('  ', l));
  console.log('');
  console.log('  → Implement the function, or add // stub-approved: <reason> above the throw.');
}

if (includeApproved && approved.length > 0) {
  console.log(`\n⚠️   ${approved.length} approved stub(s) (informational):\n`);
  approved.forEach((l) => console.log('  ', l));
}

console.log('───────────────────────────────────────────────────────────────────\n');
process.exit(unapproved.length > 0 ? 1 : 0);
```

Add a convenience script to root `package.json`:

```json
"scan-stubs": "tsx tools/scan-stubs.ts",
"scan-stubs:all": "tsx tools/scan-stubs.ts --include-approved"
```

**Verification:**

```bash
pnpm scan-stubs
# Expected: ✅ No unapproved stubs found. (after T4 is complete)

pnpm scan-stubs:all
# Expected: lists the stub-approved entries for visibility
```

---

## ADR-0095: Stub Detection and Incomplete Implementation Enforcement Standard

**File:** `docs/architecture/adr/0095-stub-detection-enforcement-standard.md`

```markdown
# ADR-0095 — Stub Detection and Incomplete Implementation Enforcement Standard

**Status:** Accepted
**Date:** 2026-03-10
**Deciders:** HB Intel Architecture Team
**Supersedes:** None
**Triggered By:** DOCS-AUDIT phase (2026-03-10) — confirmed zero automated enforcement against stub implementations codebase-wide

---

## Context

The DOCS-AUDIT phase (2026-03-10) found that the HB Intel codebase had no automated detection of stub implementations or incomplete code. Six known stubs existed with no lint warning, no CI gate, and no pre-commit hook. The `branches: 95` P1 coverage gate (ADR-0085) provides partial mitigation for five packages, but has no effect on packages outside P1 and does not prevent stub-pattern commits. This ADR establishes a permanent, layered enforcement standard.

---

## Decisions

### D-01 — `no-warning-comments` at warn level

**Decision:** Add `no-warning-comments: warn` to `.eslintrc.base.js` targeting `TODO`, `FIXME`, `HACK`, `XXX`.

**Rationale:** Warn (not error) preserves developer velocity and avoids immediately failing CI on the existing debt. The warn level surfaces debt in lint output and PR annotations without blocking merges, allowing incremental resolution. Reviewers may escalate to error on a per-PR basis.

**Consequences:** All TODO/FIXME comments become visible in lint output. Existing TODOs accumulate as warnings until resolved. No CI hard stop.

### D-02 — `@typescript-eslint/ban-ts-comment` at error level with description requirement

**Decision:** All `@ts-ignore` and `@ts-expect-error` suppressions must include a description of ≥10 characters explaining why the suppression is necessary. Bare suppressions are a lint error.

**Rationale:** Bare type suppressions hide implementation gaps and mask real TypeScript issues. Requiring a description forces the developer to articulate the reason, making suppressions reviewable and searchable.

**Consequences:** Existing bare `@ts-ignore` instances must be updated with descriptions before CI passes on files that contain them.

### D-03 — `no-stub-implementations` rule in `eslint-plugin-hbc` at error level

**Decision:** A new ESLint rule that detects `throw new Error(msg)` statements where `msg` matches `/not.?implement|stub|placeholder/i` is added to `eslint-plugin-hbc`. It fires at error level on all source files (excluding test files and `tools/mocks/`).

**Rationale:** The `throw new Error('not implemented')` pattern is the canonical stub idiom in TypeScript. Detecting it statically at lint time catches the pattern before it reaches CI or code review.

**Consequences:** Any new stub throw that lacks a `stub-approved` exemption will fail `pnpm turbo run lint`.

### D-04 — `stub-approved: <reason>` escape-hatch convention

**Decision:** Intentional stubs that are permanently or durably deferred may be exempted by placing `// stub-approved: <non-empty reason>` on the line immediately preceding the stub code. A blank or missing reason does not satisfy the escape hatch.

**Rationale:** Not all stubs are bugs. Some are explicitly locked design decisions (e.g., D-06 server-side BIC aggregation deferred to PH8). A convention-based escape hatch is preferable to ESLint disable comments because it is searchable, self-documenting, and carries the reason inline.

**Consequences:** `stub-approved` entries are indexable via `pnpm scan-stubs:all`. The inventory can be reviewed at each phase gate to assess deferred items.

### D-05 — CI grep scan as Layer 2 enforcement

**Decision:** A CI step in the `lint-and-typecheck` job runs a grep scan for stub throw patterns across `packages/`, `apps/`, and `backend/`. The scan excludes `dist/`, `node_modules/`, `coverage/`, `tools/mocks/`, and lines containing `stub-approved:`. A match fails the CI job.

**Rationale:** ESLint (Layer 1) operates on parsed AST and may miss edge cases in `.js` files, generated code, or files not yet covered by the ESLint config. The grep scan (Layer 2) is a fast, explicit, file-system-level gate that catches patterns ESLint may miss.

**Consequences:** CI is harder to pass with an unexempted stub. The grep is fast (<2 seconds on the current codebase size).

### D-06 — `tools/mocks/` is globally exempt

**Decision:** The `tools/mocks/` directory is excluded from all stub scans (both ESLint override and CI grep). No `stub-approved` marker is required for mock files in this directory.

**Rationale:** SPFx SDK mocks (`sp-core-library`, `sp-property-pane`, `sp-webpart-base`) are legitimate test infrastructure. They implement stub-like patterns by design (replacing a real SDK with jsdom-compatible stubs). Requiring exemption markers on every method would be noise.

**Consequences:** `tools/mocks/` is a defined exemption zone. Any new file added to this directory is automatically exempt.

### D-07 — Server-side BIC aggregation stub is permanently deferred

**Decision:** The `BicModuleRegistry.ts` server-side aggregation stub is exempted with a `stub-approved` marker referencing the deferral reason and PH8 activation timeline. It is not required to be implemented before PH7.13 closes.

**Rationale:** Server-side BIC aggregation is a PH8 concern. Implementing it now would pull in infrastructure (Azure Functions aggregation endpoint) that is explicitly deferred by the Foundation Plan.

**Consequences:** The stub persists with an explicit exemption. It becomes a PH8 activation item.

### D-08 — All known stubs must be dispositioned before PH7.13 closes

**Decision:** PH7.13 does not close until every entry in the Known Stub Inventory (§Known Stub Inventory) has been either implemented or marked with a valid `stub-approved` exemption, and the CI grep scan (T3 verification command) returns zero unapproved results.

**Rationale:** Partial remediation leaves the gap open. The acceptance criteria require a complete inventory pass.

**Consequences:** The six known stubs (S-01 through S-06) must all be dispositioned. New stubs introduced before PH7.13 closes are subject to the same requirement.
```

---

## Acceptance Criteria (Definition of Done)

All items below must be checked before PH7.13 is considered complete:

### Layer 1 — ESLint

- [ ] `no-warning-comments: warn` active in `.eslintrc.base.js`; `pnpm turbo run lint` surfaces existing TODOs as warnings
- [ ] `@typescript-eslint/ban-ts-comment: error` active; bare `@ts-ignore` fails lint
- [ ] `no-stub-implementations` rule registered in `packages/eslint-plugin-hbc/src/index.js`
- [ ] Rule fires on `throw new Error('not implemented')` with no `stub-approved` marker
- [ ] Rule is suppressed by valid `// stub-approved: <reason>` marker
- [ ] Rule is applied in `.eslintrc.base.js` override for `packages/*/src/**`, `apps/**`, `backend/**`
- [ ] Rule is excluded for `**/*.test.ts`, `**/*.spec.ts`, `tools/mocks/**`, `**/testing/**`

### Layer 2 — CI Scan

- [ ] CI grep step added to `lint-and-typecheck` job in `.github/workflows/ci.yml`
- [ ] CI step excludes `dist/`, `node_modules/`, `coverage/`, `tools/mocks/`, `*.test.*`, `*.spec.*`
- [ ] CI step excludes lines containing `stub-approved:`
- [ ] CI step fails job and prints the offending lines if unapproved stubs are found

### Layer 3 — Stub Inventory Remediation

- [ ] S-01 (`acknowledgments/stubs.ts`) — `stub-approved` marker applied with tracking reason
- [ ] S-02 (`BicModuleRegistry.ts`) — `stub-approved` marker applied with PH8 deferral reference
- [ ] S-03, S-04, S-05 (`tools/mocks/`) — confirmed globally exempt; no markers required
- [ ] S-06 (`cd.yml` SPFx deploy) — `# stub-approved:` YAML marker applied
- [ ] Full CI grep scan returns zero unapproved results

### Tooling

- [ ] `tools/scan-stubs.ts` created; `pnpm scan-stubs` exits 0 after inventory remediation
- [ ] `pnpm scan-stubs:all` lists all `stub-approved` entries for visibility

### Documentation & Governance

- [ ] `docs/architecture/adr/0095-stub-detection-enforcement-standard.md` written and accepted
- [ ] `packages/eslint-plugin-hbc/README.md` or inline JSDoc updated to document `no-stub-implementations` and the `stub-approved` convention
- [ ] `docs/README.md` ADR index updated with ADR-0095 entry
- [ ] `current-state-map.md §2` updated with PH7.13 and ADR-0095 classification rows

### Mechanical Gates (CLAUDE.md §6.3.3)

- [ ] `pnpm turbo run build` — zero errors
- [ ] `pnpm turbo run lint` — zero errors (warnings for existing TODOs are expected and acceptable)
- [ ] `pnpm turbo run check-types` — zero TypeScript errors
- [ ] `pnpm turbo run test --filter=@hbc/auth-core --filter=@hbc/shell --filter=@hbc/ui-kit --filter=@hbc/shared-kernel --filter=@hbc/app-types` — all pass; `branches: 95` maintained

---

## Verification Commands

```bash
# ── Layer 1: ESLint ───────────────────────────────────────────────────────────

# Confirm no-warning-comments is active
pnpm turbo run lint 2>&1 | grep -c "no-warning-comments" || echo "No warnings found"

# Confirm no-stub-implementations rule is registered
node -e "const p = require('./packages/eslint-plugin-hbc/src/index.js'); \
  console.log('no-stub-implementations:', 'no-stub-implementations' in p.rules ? '✅' : '❌')"

# Run full lint gate
pnpm turbo run lint

# ── Layer 2: CI Grep Scan ─────────────────────────────────────────────────────

# Run the same grep locally — must return zero lines
grep -rn \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=dist --exclude-dir=node_modules --exclude-dir=coverage \
  -E "(throw new Error\(['\"\`][^'\"]+not.?impl|throw new Error\(['\"\`][^'\"]+placeholder)" \
  packages/ apps/ backend/ 2>/dev/null \
  | grep -v "stub-approved:" | grep -v "\.test\.\|\.spec\.\|tools/mocks"
# Expected: no output (exit 1 means stubs found)

# ── Layer 3: Stub Inventory ───────────────────────────────────────────────────

# Confirm all stub-approved markers are in place
grep -n "stub-approved" \
  backend/functions/src/functions/acknowledgments/stubs.ts \
  packages/bic-next-move/src/registry/BicModuleRegistry.ts \
  .github/workflows/cd.yml

# ── Developer Tool ────────────────────────────────────────────────────────────

pnpm scan-stubs         # Expected: ✅ No unapproved stubs found.
pnpm scan-stubs:all     # Expected: lists stub-approved entries only

# ── Documentation Deliverables ────────────────────────────────────────────────

test -f docs/architecture/adr/0095-stub-detection-enforcement-standard.md && echo "ADR OK" || echo "ADR MISSING"
grep -c "ADR-0095" docs/README.md

# ── Mechanical Enforcement Gates ─────────────────────────────────────────────

pnpm turbo run build
pnpm turbo run lint
pnpm turbo run check-types
pnpm turbo run test \
  --filter=@hbc/auth-core \
  --filter=@hbc/shell \
  --filter=@hbc/ui-kit \
  --filter=@hbc/shared-kernel \
  --filter=@hbc/app-types
```

---

## Blueprint Progress Comment

After all acceptance criteria are met, add this comment block to `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md`:

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.13 completed: {DATE}
Stub Detection and Incomplete Implementation Enforcement — three-layer enforcement added.
Layer 1: ESLint rules (no-warning-comments, ban-ts-comment, no-stub-implementations)
Layer 2: CI grep scan in lint-and-typecheck job
Layer 3: All 6 known stubs remediated or exempted with stub-approved markers
ADR created: docs/architecture/adr/0095-stub-detection-enforcement-standard.md
Tool added: tools/scan-stubs.ts (pnpm scan-stubs)
All four mechanical enforcement gates passed.
current-state-map.md §2 updated: PH7.13 and ADR-0095 classification rows added.
Next: PH7.12 final verification or PH8 CI/CD expansion per Foundation Plan sequencing.
-->
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.13 authored: 2026-03-10
Status: Plan complete — ready for implementation.
Triggered by: DOCS-AUDIT phase (2026-03-10), six known stubs confirmed undetected.
ADR assigned: ADR-0095 (next available after ADR-0094 / SF09-Data-Seeding).
Implementation ready to begin at T1 (no blockers; PH7.8 ESLint infrastructure already in place).
T1–T4 are mechanical edits to existing files.
T5 applies stub-approved markers to known stubs — requires access to backend/ and packages/.
T6 (scan-stubs.ts) is optional tooling; does not block acceptance.
-->
