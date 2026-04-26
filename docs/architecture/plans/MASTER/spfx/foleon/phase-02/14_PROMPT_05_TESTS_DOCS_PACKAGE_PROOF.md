# Prompt 05 — Final Tests, Docs, Version, Package Proof, and Tenant Rollout

## Objective

Finalize and package the two-lane Foleon reader release.

## Global Rules

- Work in `/Users/bobbyfetting/hb-intel` on `main`.
- Use live repo truth. Do not rely on summaries without checking current files.
- Do not re-read files still in your current context unless verifying a specific contradiction or line.
- Do not touch unrelated `.gitignore`, Safety/backend files outside Foleon scope, or untracked phase docs.
- Do not weaken Foleon reader gate, origin allowlist, preview URL blocking, or runtime proof.
- Preserve the scalar-safe public content registry projection.
- Do not add public `$select` of `MarketingOwner`, `AudienceGroups`, or any person field without a specific `$expand` design and tests.
- Do not make tenant changes unless this prompt explicitly asks for a tenant migration step.
- Keep generated artifacts out of commits unless repo policy proves they are committed.


## Version

Bump:

```text
1.0.17.0 → 1.0.18.0
```

Verify version-bearing files before editing.

## Documentation

Update:

```text
apps/hb-intel-foleon/README.md
apps/hb-intel-foleon/docs/release-runbook.md
apps/hb-intel-foleon/docs/telemetry.md
apps/hb-intel-foleon/docs/provisioning.md
apps/hb-intel-foleon/docs/breakpoint-contract.md
apps/hb-intel-foleon/docs/homepage-uiux-audit-scorecard-foleon.md
docs/reference/sharepoint/list-schemas/hbcentral/lists/*.md
```

Add tenant persisted-property warning for existing page instances.

## Full Validation

Run:

```bash
git status --short
git branch --show-current
git log -5 --oneline

npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts

pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate

pnpm --dir tools/spfx-shell build

npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

If SPFx shell build fails under Node 22 because of engine guards, rerun under Node 18 and document both results.

## Tenant Rollout Docs

Include:

- field migration steps;
- choice value additions;
- index validation;
- App Catalog update;
- property-pane version update;
- runtime proof checks;
- Project Spotlight active record test;
- Company Pulse active record test;
- mobile behavior test;
- rollback plan.

## Commit

```text
hb-intel-foleon: finalize two-lane reader package proof
```

## Closure Report

Include:

- version-bearing files changed;
- package artifact path;
- package artifact staged status;
- test/build/package proof results;
- tenant follow-ups;
- runtime proof expected result;
- commit SHA.
