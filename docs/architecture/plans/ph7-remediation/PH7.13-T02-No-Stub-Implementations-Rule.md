# PH7.13-T02 — `no-stub-implementations` ESLint Rule

**Phase Reference:** PH7.13 (Stub Detection and Incomplete Implementation Enforcement)
**Spec Source:** `docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md`
**Decisions Applied:** D-03 (error level; source-only), D-04 (stub-approved escape hatch), D-06 (`tools/mocks/` globally exempt)
**Estimated Effort:** 0.3 sprint-weeks
**Depends On:** PH7.5 (eslint-plugin-hbc infrastructure already in place)

> **Doc Classification:** Canonical Normative Plan — PH7.13-T02 task; sub-plan of `PH7.13-Stub-Detection-Enforcement.md`.

---

## Objective

Create the `no-stub-implementations` rule in `packages/eslint-plugin-hbc/src/rules/`, register it in the plugin index, and enable it in `.eslintrc.base.js` for source files. The rule fires as an error on any `throw new Error(msg)` where `msg` matches the stub pattern — unless the throw is preceded by a valid `// stub-approved: <reason>` comment.

This task produces one new file and edits two existing files.

---

## 3-Line Plan

1. Create `packages/eslint-plugin-hbc/src/rules/no-stub-implementations.js` with the stub-pattern visitor and escape-hatch logic.
2. Register the rule in `packages/eslint-plugin-hbc/src/index.js` and add an override block to `.eslintrc.base.js`.
3. Verify the rule fires on a test stub and is suppressed by a valid `stub-approved` comment.

---

## File 1 (New): `packages/eslint-plugin-hbc/src/rules/no-stub-implementations.js`

```js
/**
 * @hb-intel/hbc/no-stub-implementations
 * PH7.13 — Stub Detection and Incomplete Implementation Enforcement
 *
 * Detects throw statements whose Error message matches a stub/not-implemented
 * pattern, indicating an unimplemented function body.
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
function hasStubApprovedComment(node, sourceCode) {
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
        if (hasStubApprovedComment(node, sourceCode)) return;

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

---

## File 2 (Edit): `packages/eslint-plugin-hbc/src/index.js`

Locate the `rules` object in the plugin's index file and add the new rule entry. The entry must be added alphabetically by rule name to maintain the existing ordering convention.

```js
// Add to the rules: {} object in packages/eslint-plugin-hbc/src/index.js:
'no-stub-implementations': require('./rules/no-stub-implementations'),
```

After this edit, the plugin exposes the rule at `@hb-intel/hbc/no-stub-implementations`.

---

## File 3 (Edit): `.eslintrc.base.js`

Add a new `overrides` block targeting source files only. This block must exclude test files, Storybook files, and the `tools/mocks/` directory (D-06 global exemption).

```js
// .eslintrc.base.js — add a new entry to the overrides: [] array:
{
  files: [
    'packages/*/src/**/*.ts',
    'packages/*/src/**/*.tsx',
    'apps/**/*.ts',
    'apps/**/*.tsx',
    'backend/**/*.ts',
  ],
  excludedFiles: [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.stories.tsx',
    'tools/mocks/**',
    '**/testing/**',
  ],
  rules: {
    // PH7.13 T02-D03 — Error on stub throw patterns in source files.
    // Use // stub-approved: <reason> above the throw to exempt intentional stubs.
    '@hb-intel/hbc/no-stub-implementations': 'error',
  },
},
```

---

## Stub Pattern Coverage

The `STUB_PATTERN` regex `/not.?implement|stub|placeholder|todo\s*:/i` matches the following common stub messages:

| Message | Match |
|---------|-------|
| `'not implemented'` | ✅ `not.?implement` |
| `'Not Implemented'` | ✅ case-insensitive |
| `'not yet implemented'` | ✅ |
| `'stub: replace with real impl'` | ✅ `stub` |
| `'placeholder — implement later'` | ✅ `placeholder` |
| `'TODO: implement this'` | ✅ `todo\s*:` |
| `'feature not available'` | ❌ (intentional — not a stub pattern) |
| `` `not implemented: ${feature}` `` | ✅ (template literal cooked value) |

---

## Verification Commands

```bash
# 1. Confirm the rule file exists
test -f packages/eslint-plugin-hbc/src/rules/no-stub-implementations.js && echo "Rule file OK" || echo "MISSING"

# 2. Confirm the rule is registered in the plugin
node -e "const p = require('./packages/eslint-plugin-hbc/src/index.js'); \
  console.log('no-stub-implementations:', \
  'no-stub-implementations' in p.rules ? '✅ registered' : '❌ missing')"

# 3. Confirm rule fires on an unapproved stub throw
cat > /tmp/test-stub.ts << 'EOF'
export function myFn(): string {
  throw new Error('not implemented');
}
EOF
pnpm eslint /tmp/test-stub.ts
# Expected: @hb-intel/hbc/no-stub-implementations error

# 4. Confirm escape hatch suppresses the error
cat > /tmp/test-stub-approved.ts << 'EOF'
export function myFn(): string {
  // stub-approved: pending SF04 integration — tracked in backlog issue #42
  throw new Error('not implemented');
}
EOF
pnpm eslint /tmp/test-stub-approved.ts
# Expected: 0 errors from no-stub-implementations

# 5. Run full lint gate — zero errors (warnings for TODOs are expected)
pnpm turbo run lint
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.13-T02 not yet started.
Next: PH7.13-T03 (CI Grep Scan)
-->
