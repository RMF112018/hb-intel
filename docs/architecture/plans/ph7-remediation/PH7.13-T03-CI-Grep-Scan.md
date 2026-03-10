# PH7.13-T03 — CI Grep Scan Step

**Phase Reference:** PH7.13 (Stub Detection and Incomplete Implementation Enforcement)
**Spec Source:** `docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md`
**Decisions Applied:** D-05 (CI grep as Layer 2 enforcement), D-06 (`tools/mocks/` globally exempt)
**Estimated Effort:** 0.1 sprint-weeks
**Depends On:** None — `.github/workflows/ci.yml` already exists; this is a single step addition

> **Doc Classification:** Canonical Normative Plan — PH7.13-T03 task; sub-plan of `PH7.13-Stub-Detection-Enforcement.md`.

---

## Objective

Add a grep scan step to the `lint-and-typecheck` job in `.github/workflows/ci.yml` that provides Layer 2 enforcement against unapproved stub patterns. The step runs after the ESLint step, scans `packages/`, `apps/`, and `backend/` for `throw new Error(...)` messages matching the stub pattern, and fails the job if any unapproved matches are found.

This task produces only one file edit.

---

## 3-Line Plan

1. Locate the `lint-and-typecheck` job in `.github/workflows/ci.yml` and find the `pnpm turbo run lint` step.
2. Insert the grep scan step immediately after the lint step, with all exclusions and the `stub-approved:` filter.
3. Verify locally that the grep returns zero lines after T04 stub remediation is complete.

---

## File to Edit

**File:** `.github/workflows/ci.yml`

Locate the `lint-and-typecheck` job. Find the step that runs `pnpm turbo run lint`. Insert the following step **immediately after** that step:

```yaml
      - name: Scan for unapproved stub patterns
        # PH7.13 T03 — CI-level grep gate for throw-not-implemented patterns.
        # Layer 2 enforcement: complements ESLint (Layer 1) by catching patterns
        # in .js files, generated code, or files outside the ESLint config scope.
        #
        # Exclusions (D-06 and test file conventions):
        #   tools/mocks/   — SPFx SDK mocks (globally exempt per ADR-0095 D-06)
        #   dist/          — generated output
        #   node_modules/  — dependencies
        #   coverage/      — test output
        #   .git/          — version control metadata
        #   *.test.*       — test files may legitimately mock stubs
        #   *.spec.*       — spec files may legitimately mock stubs
        #   stub-approved: — intentional stubs marked with escape hatch
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

---

## Placement in the Job

The step should appear in this order within `lint-and-typecheck`:

```
steps:
  - uses: actions/checkout@v4
  - ... (setup node, pnpm install, etc.)
  - name: Type check
    run: pnpm turbo run check-types
  - name: Lint
    run: pnpm turbo run lint
  - name: Scan for unapproved stub patterns    ← INSERT HERE (after lint)
    run: |
      ...
```

The grep scan runs after lint so that Layer 1 (ESLint) findings are reported first. If both layers fail, the developer sees the ESLint errors before the CI grep output.

---

## Grep Pattern Coverage

The grep targets two primary stub throw patterns:

| Pattern | Matches |
|---------|---------|
| `throw new Error('..not impl..')` | `not implemented`, `not yet implemented`, `notImplemented` |
| `throw new Error('..placeholder..')` | `placeholder`, `placeholder value` |
| Template literals with same patterns | ✅ (grep is text-level, not AST-level) |
| `throw new Error('not implemented')` with preceding `stub-approved:` | ❌ excluded by `grep -v "stub-approved:"` |
| Files in `tools/mocks/` | ❌ excluded by `grep -v "tools/mocks"` |
| `*.test.ts`, `*.spec.ts` files | ❌ excluded by `grep -v "\.test\.\|\.spec\."` |

**What the CI grep catches that ESLint may miss:**

- `.js` source files not covered by the TypeScript ESLint parser
- Generated files in `apps/` or `backend/` that are excluded from the ESLint config
- Edge cases where the ESLint override glob does not match a new file location
- Any file that was added to the repo without being included in the ESLint `files` glob

---

## Local Simulation Commands

```bash
# Run the same grep locally — must return empty after T04 stub remediation
grep -rn \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=dist --exclude-dir=node_modules --exclude-dir=coverage \
  -E "(throw new Error\(['\"\`][^'\"]+not.?impl|throw new Error\(['\"\`][^'\"]+placeholder)" \
  packages/ apps/ backend/ 2>/dev/null \
  | grep -v "stub-approved:" \
  | grep -v "\.test\.\|\.spec\.\|tools/mocks"
# Expected: no output (empty = clean)

# Confirm the step exists in ci.yml
grep -n "Scan for unapproved stub patterns" .github/workflows/ci.yml
# Expected: line number of the step name
```

---

## Verification Commands

```bash
# 1. Confirm step is present in the workflow file
grep -n "Scan for unapproved stub patterns" .github/workflows/ci.yml
# Expected: returns the line number

# 2. Confirm the full grep block is present
grep -A 25 "Scan for unapproved stub patterns" .github/workflows/ci.yml
# Expected: full run: block visible

# 3. Simulate the scan locally (must be run after T04 is complete)
grep -rn \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=dist --exclude-dir=node_modules --exclude-dir=coverage \
  -E "(throw new Error\(['\"\`][^'\"]+not.?impl|throw new Error\(['\"\`][^'\"]+placeholder)" \
  packages/ apps/ backend/ 2>/dev/null \
  | grep -v "stub-approved:" | grep -v "\.test\.\|\.spec\.\|tools/mocks"
# Expected: empty output

# 4. Validate ci.yml is syntactically valid YAML
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML valid"
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.13-T03 not yet started.
Next: PH7.13-T04 (Stub Inventory Remediation)
-->
