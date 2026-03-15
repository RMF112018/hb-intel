# Stub Enforcement in CI

**Purpose:** Document how PH7.13 stub detection enforcement works in CI, what it catches, and how to handle findings.
**Date:** 2026-03-15
**Governing decision:** ADR-0095 (Stub Detection and Incomplete Implementation Enforcement Standard)
**Implementation plan:** `docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md`

---

## 1. Three-Layer Enforcement Architecture

| Layer | Tool | Enforcement Level | When It Runs |
|-------|------|-------------------|-------------|
| **Layer 1** | ESLint rule `@hb-intel/hbc/no-stub-implementations` | Error — blocks lint | Dev time + CI `lint` step |
| **Layer 2** | CI grep scan | Error — fails CI job | CI `lint-and-typecheck` job, after ESLint |
| **Layer 3** | `pnpm scan-stubs` | Developer tool | Local use before push |

### Why Three Layers?

- Layer 1 (ESLint) catches most patterns at dev time with clear error messages
- Layer 2 (CI grep) catches edge cases ESLint may miss: `.js` files, generated code, files outside ESLint scope
- Layer 3 (developer tool) provides local CI-equivalent verification and approved-stub inventory

---

## 2. What It Catches

### Detection Pattern

```
throw new Error(['"\`][^'"]*not.?impl|throw new Error(['"\`][^'"]*placeholder)
```

This matches:
- `throw new Error('Not implemented')`
- `throw new Error("not yet implemented")`
- `throw new Error(\`${name} not implemented\`)`
- `throw new Error('placeholder')`
- And variants with different casing/spacing

### Scanned Directories

`packages/`, `apps/`, `backend/` — all `.ts`, `.tsx`, `.js` files

### Excluded

| Exclusion | Reason |
|-----------|--------|
| `dist/` | Generated output |
| `node_modules/` | Dependencies |
| `coverage/` | Test output |
| `.git/` | Version control metadata |
| `tools/mocks/` | SPFx SDK mocks (globally exempt per ADR-0095 D-06) |
| `*.test.*` | Test files may legitimately reference stub patterns |
| `*.spec.*` | Spec files may legitimately reference stub patterns |
| Lines with `stub-approved:` | Intentional stubs with documented escape hatch |

---

## 3. Escape Hatch

Add `// stub-approved: <non-empty reason>` on the line preceding the throw:

```typescript
// stub-approved: server-side BIC aggregation deferred per ADR-0095 D-07
throw new Error('Server-side aggregation not implemented');
```

The reason must be non-empty and should reference the governing decision or deferral plan.

### Currently Approved Stubs

| ID | File | Reason |
|----|------|--------|
| S-01 | `backend/functions/src/functions/acknowledgments/stubs.ts` | BIC-completion and notification stubs pending SF04 integration |
| S-02 | `packages/bic-next-move/src/registry/BicModuleRegistry.ts` | Server-side BIC aggregation deferred to PH8 (ADR-0095 D-07) |
| S-03 | `tools/mocks/sp-core-library.ts` | SPFx SDK mock (globally exempt via D-06) |
| S-04 | `tools/mocks/sp-property-pane.ts` | SPFx SDK mock (globally exempt via D-06) |
| S-05 | `tools/mocks/sp-webpart-base.ts` | SPFx SDK mock (globally exempt via D-06) |
| S-06 | `.github/workflows/cd.yml` | SPFx deployment pending Vite-to-.sppkg pipeline (PH8) |

Use `pnpm scan-stubs:all` to see the full inventory with markers.

---

## 4. Handling CI Failures

If CI fails on a stub finding:

### Step 1: Identify the finding
The CI output shows the file, line number, and matched pattern.

### Step 2: Decide the disposition

| If the stub is... | Action |
|-------------------|--------|
| **Should be implemented** | Implement the function before merging |
| **Intentionally deferred** | Add `// stub-approved: <reason>` with rationale |
| **A false positive** | Check if the pattern is in a test file or mock — verify exclusions apply |

### Step 3: Verify locally

```bash
pnpm scan-stubs          # CI-equivalent — should exit 0
pnpm scan-stubs:all      # Full inventory including approved stubs
```

### Step 4: Push and re-run CI

After fixing, push the change. The stub scan will re-run in the `lint-and-typecheck` job.

---

## 5. ADR-0095 Locked Decisions Reference

| Decision | Rule |
|----------|------|
| D-01 | `no-warning-comments` at `warn` level — surfaces TODO/FIXME/HACK/XXX without blocking |
| D-02 | `ban-ts-comment` at `error` level — requires ≥10-char description on `@ts-ignore` |
| D-03 | `no-stub-implementations` at `error` level — canonical stub pattern caught at lint |
| D-04 | `stub-approved` escape hatch — self-documenting, searchable convention |
| D-05 | CI grep scan as Layer 2 — catches edge cases ESLint may miss |
| D-06 | `tools/mocks/` globally exempt — SPFx SDK mocks are legitimate test infrastructure |
| D-07 | BIC aggregation deferred to PH8 — explicit deferral with ADR reference |
| D-08 | Full inventory closure — no stubs left unapproved; all must be dispositioned |

---

## Related Documents

- [Wave 1 CI Gates](./wave-1-ci-gates.md) — CI job definitions
- [Stub Detection Guide](../../how-to/developer/stub-detection-guide.md) — developer onboarding
- [ADR-0095](../../architecture/adr/0095-stub-detection-enforcement-standard.md) — governing ADR
