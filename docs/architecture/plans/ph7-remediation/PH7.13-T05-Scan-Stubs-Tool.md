# PH7.13-T05 — `tools/scan-stubs.ts` Developer Tool

**Phase Reference:** PH7.13 (Stub Detection and Incomplete Implementation Enforcement)
**Spec Source:** `docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md`
**Decisions Applied:** D-04 (stub-approved convention), D-06 (`tools/mocks/` globally exempt)
**Estimated Effort:** 0.2 sprint-weeks
**Depends On:** T04 (stub-approved markers in place so the tool exits 0 cleanly)

> **Doc Classification:** Canonical Normative Plan — PH7.13-T05 task; sub-plan of `PH7.13-Stub-Detection-Enforcement.md`.

---

## Objective

Create `tools/scan-stubs.ts` — a developer-friendly local stub scanner that provides annotated output and a summary table. Add `pnpm scan-stubs` and `pnpm scan-stubs:all` scripts to the root `package.json`. This tool is the local equivalent of the CI grep scan (T03) but with richer output and the ability to also list approved stubs for visibility.

This task produces one new file and edits one existing file.

---

## 3-Line Plan

1. Create `tools/scan-stubs.ts` with the grep runner, approved/unapproved classification, and formatted output.
2. Add `scan-stubs` and `scan-stubs:all` scripts to root `package.json`.
3. Run `pnpm scan-stubs` and confirm exit 0 with the clean-stub message; run `pnpm scan-stubs:all` and confirm the approved entries are listed.

---

## File 1 (New): `tools/scan-stubs.ts`

```typescript
/**
 * tools/scan-stubs.ts — Local stub pattern scanner
 * PH7.13 — Stub Detection and Incomplete Implementation Enforcement
 *
 * Provides a developer-friendly view of stub patterns in the codebase.
 * Equivalent to the CI grep scan (T03) but with annotated output and
 * the ability to also list stub-approved entries for inventory review.
 *
 * Usage:
 *   pnpm scan-stubs                  # Report unapproved stubs only (CI-equivalent)
 *   pnpm scan-stubs:all              # Also list stub-approved entries (inventory view)
 *
 * Exit codes:
 *   0 — no unapproved stubs found
 *   1 — one or more unapproved stubs found
 *
 * @see docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md
 * @see docs/architecture/adr/0095-stub-detection-enforcement-standard.md
 */
import { execSync } from 'node:child_process';
import { argv } from 'node:process';

const includeApproved = argv.includes('--include-approved');

const STUB_PATTERN =
  "(throw new Error\\(['\"`][^'\"]+not.?impl|throw new Error\\(['\"`][^'\"]+placeholder)";

const EXCLUDE_DIRS = [
  '--exclude-dir=dist',
  '--exclude-dir=node_modules',
  '--exclude-dir=coverage',
  '--exclude-dir=.git',
  '--exclude-dir=tools/mocks',
].join(' ');

const INCLUDE_FILES = '--include="*.ts" --include="*.tsx"';

const SCAN_DIRS = ['packages/', 'apps/', 'backend/'];

function runScan(dirs: string[]): string {
  try {
    return execSync(
      `grep -rn ${INCLUDE_FILES} ${EXCLUDE_DIRS} -E "${STUB_PATTERN}" ${dirs.join(' ')} 2>/dev/null`,
      { encoding: 'utf-8' }
    );
  } catch {
    // grep exits with code 1 when no matches are found — not an error
    return '';
  }
}

const raw = runScan(SCAN_DIRS);
const lines = raw.split('\n').filter(Boolean);

const approved: string[] = [];
const unapproved: string[] = [];

for (const line of lines) {
  if (
    line.includes('stub-approved:') ||
    line.includes('.test.') ||
    line.includes('.spec.')
  ) {
    approved.push(line);
  } else {
    unapproved.push(line);
  }
}

const DIVIDER = '───────────────────────────────────────────────────────────────────';

console.log(`\n── HB Intel Stub Scanner (PH7.13) ${DIVIDER.slice(35)}`);

if (unapproved.length === 0) {
  console.log('✅  No unapproved stubs found.\n');
} else {
  console.log(`❌  ${unapproved.length} unapproved stub(s) found:\n`);
  for (const line of unapproved) {
    console.log('   ', line);
  }
  console.log('');
  console.log(
    '   → Implement the function, or add // stub-approved: <reason> above the throw.'
  );
  console.log(
    '   → See docs/architecture/plans/ph7-remediation/PH7.13-T04-Stub-Inventory-Remediation.md'
  );
}

if (includeApproved) {
  if (approved.length > 0) {
    console.log(`\n⚠️   ${approved.length} approved stub(s) (informational — inventory view):\n`);
    for (const line of approved) {
      console.log('   ', line);
    }
    console.log(
      '\n   → These stubs are intentionally deferred. Review at each phase gate.'
    );
  } else {
    console.log('\nℹ️   No stub-approved entries found in the codebase.\n');
  }
}

console.log(`${DIVIDER}\n`);

process.exit(unapproved.length > 0 ? 1 : 0);
```

---

## File 2 (Edit): Root `package.json`

Locate the `"scripts"` block in the root `package.json` and add the two scan scripts. Add them after any existing `lint` or `test` entries, in alphabetical order:

```json
"scan-stubs": "tsx tools/scan-stubs.ts",
"scan-stubs:all": "tsx tools/scan-stubs.ts --include-approved"
```

**Note:** `tsx` is already available in the workspace as a dev dependency (used by Turborepo for TypeScript execution). If `tsx` is not present at the root level, add it as a root devDependency:

```bash
pnpm add -D tsx -w
```

---

## Tool Behavior Summary

| Command | Output | Exit Code |
|---------|--------|-----------|
| `pnpm scan-stubs` (clean) | `✅ No unapproved stubs found.` | 0 |
| `pnpm scan-stubs` (dirty) | `❌ N unapproved stub(s) found:` + file list | 1 |
| `pnpm scan-stubs:all` (clean) | `✅ No unapproved stubs found.` + approved list | 0 |
| `pnpm scan-stubs:all` (dirty) | `❌ N unapproved stub(s) found:` + `⚠️ M approved stubs` | 1 |

The approved stubs listed by `scan-stubs:all` correspond to S-01, S-02, and S-06 after T04 is complete — the three intentional deferred stubs with `stub-approved` markers.

---

## Verification Commands

```bash
# 1. Confirm the tool file exists
test -f tools/scan-stubs.ts && echo "Tool file OK" || echo "MISSING"

# 2. Confirm scripts are registered in root package.json
grep -n "scan-stubs" package.json
# Expected: both scan-stubs and scan-stubs:all entries

# 3. Run the clean check — must exit 0 after T04 is complete
pnpm scan-stubs
# Expected: ✅ No unapproved stubs found.
# Expected exit code: 0

# 4. Run the inventory view — must list S-01, S-02, S-06 as approved stubs
pnpm scan-stubs:all
# Expected: ⚠️ 3 approved stub(s) (informational...)
#           + 3 file paths with stub-approved markers

# 5. Simulate a dirty state to verify exit code 1
cat > /tmp/fake-stub.ts << 'EOF'
export function myFn(): void {
  throw new Error('not implemented');
}
EOF
# Move to packages to be in scan scope temporarily
cp /tmp/fake-stub.ts packages/shared-kernel/src/fake-stub.ts
pnpm scan-stubs
echo "Exit code: $?"
# Expected: ❌ 1 unapproved stub(s) found; exit code 1
rm packages/shared-kernel/src/fake-stub.ts
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.13-T05 not yet started.
Next: PH7.13-T09 (Deployment — Documentation, ADR, README, ADR Index Update)
-->
