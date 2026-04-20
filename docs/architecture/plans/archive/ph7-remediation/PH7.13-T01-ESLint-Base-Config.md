# PH7.13-T01 — ESLint Base Config: `no-warning-comments` and `ban-ts-comment`

**Phase Reference:** PH7.13 (Stub Detection and Incomplete Implementation Enforcement)
**Spec Source:** `docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md`
**Decisions Applied:** D-01 (warn level for `no-warning-comments`), D-02 (error level for `ban-ts-comment`)
**Estimated Effort:** 0.1 sprint-weeks
**Depends On:** None — `.eslintrc.base.js` already exists; no new packages required

> **Doc Classification:** Canonical Normative Plan — PH7.13-T01 task; sub-plan of `PH7.13-Stub-Detection-Enforcement.md`.

---

## Objective

Add two rules to `.eslintrc.base.js` that provide Layer 1 static enforcement for warning comments and TypeScript suppression comments:

1. `no-warning-comments: warn` — surfaces `TODO`, `FIXME`, `HACK`, `XXX` in lint output without blocking CI
2. `@typescript-eslint/ban-ts-comment: error` — requires a ≥10-character description on every `@ts-ignore` or `@ts-expect-error`

This task produces only config edits — no new files.

---

## 3-Line Plan

1. Read `.eslintrc.base.js` to locate the root `rules` block.
2. Insert the two rule entries with inline rationale comments.
3. Run `pnpm turbo run lint` and confirm: warnings for any existing TODO/FIXME; error for any bare `@ts-ignore`.

---

## File to Edit

**File:** `.eslintrc.base.js` (repository root)

Locate the root `rules: {}` object. Add the following two entries:

```js
// .eslintrc.base.js — add inside the root rules: {} object

// PH7.13 T01-D01 — Surface TODO/FIXME/HACK/XXX at lint time.
// Warn (not error) to avoid immediately blocking CI on existing debt.
// Reviewers may escalate individual TODOs to errors at PR time.
'no-warning-comments': ['warn', {
  terms: ['TODO', 'FIXME', 'HACK', 'XXX'],
  location: 'anywhere',
}],

// PH7.13 T01-D02 — Require a description when suppressing TypeScript errors.
// Bare @ts-ignore is an error; @ts-ignore with ≥10-char description is allowed.
'@typescript-eslint/ban-ts-comment': ['error', {
  'ts-ignore': 'allow-with-description',
  'ts-expect-error': 'allow-with-description',
  'ts-nocheck': true,
  minimumDescriptionLength: 10,
}],
```

---

## Rationale

**Why warn, not error, for `no-warning-comments`?**

Elevating all existing `TODO` comments to lint errors would immediately fail CI. The codebase has an unknown number of in-flight TODOs (deferred scope items, pending integration work). The `warn` level makes every TODO visible in lint output and PR annotations — surfacing the debt without breaking the build. Any new TODO that a reviewer considers unacceptable can be escalated to an error on a per-case basis. Existing TODO debt can be resolved incrementally per phase.

**Why error for `ban-ts-comment`?**

Bare `@ts-ignore` suppressions hide real TypeScript issues and implementation gaps. Unlike TODOs, which may represent deferred scope, `@ts-ignore` without explanation is nearly always a code-quality problem. The description requirement forces the developer to articulate the reason (e.g., `// @ts-ignore: third-party type stub missing generics — upstream issue tracked`), making suppressions reviewable and searchable.

---

## Expected Lint Output After This Change

- Existing `TODO:` / `FIXME:` comments in source → `no-warning-comments` warnings (informational; build passes)
- Bare `@ts-ignore` (if any exist) → `@typescript-eslint/ban-ts-comment` error (must be fixed before CI passes)
- All other lint results → unchanged

---

## Verification Commands

```bash
# 1. Confirm the two rules are present in the base config
grep -n "no-warning-comments\|ban-ts-comment" .eslintrc.base.js
# Expected: both entries visible with their config objects

# 2. Run the full lint gate — zero errors expected; warnings acceptable
pnpm turbo run lint
# Expected: exit 0; any existing TODO lines surface as warnings

# 3. Spot-check: confirm a bare @ts-ignore would fail lint
#    (create and clean up a temp file)
cat > /tmp/test-ts-ignore.ts << 'EOF'
// @ts-ignore
const x: any = 'test';
EOF
pnpm eslint /tmp/test-ts-ignore.ts
# Expected: @typescript-eslint/ban-ts-comment error

# 4. Confirm @ts-ignore with description passes
cat > /tmp/test-ts-ignore-ok.ts << 'EOF'
// @ts-ignore: third-party type stub missing generics — upstream tracked
const x: any = 'test';
EOF
pnpm eslint /tmp/test-ts-ignore-ok.ts
# Expected: 0 errors on ban-ts-comment
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.13-T01 completed: 2026-03-10
- Added `no-warning-comments` (warn) and `@typescript-eslint/ban-ts-comment` (error) to `.eslintrc.base.js`
- Verification: all 4 checks passed (grep confirm, lint exit 0, bare @ts-ignore error, described @ts-ignore pass)
- `pnpm turbo run lint` — 30/30 tasks successful, zero errors
Next: PH7.13-T02 (no-stub-implementations ESLint Rule)
-->
