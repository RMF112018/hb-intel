# Prompt 01 — Add Leadership Lane Schema and Tenant Values

## Objective

Add and provision the schema/choice values needed for the third Foleon lane:

```text
Leadership Message
```

## Global rules

- Work in `/Users/bobbyfetting/hb-intel` on `main`.
- Use live repo truth. Do not rely on summaries without checking current files.
- Do not re-read files still in current context unless verifying a specific contradiction or line.
- Do not touch unrelated `.gitignore`, Safety files, backend files outside Foleon scope, or untracked phase docs.
- Do not hardcode tenant GUIDs.
- Do not mutate tenant lists unless the prompt explicitly authorizes tenant provisioning.
- Do not reintroduce public person-field `$select` or `$expand`.
- Do not mount `window.__hbIntel_foleon` inside the homepage.
- Do not weaken reader gate, origin allowlist, preview URL blocking, or runtime proof redaction.
- Use Node 18 where SPFx tooling requires it.


## Required repo changes

Add/verify schema constants and XML support for:

```text
ReaderKey: leadership-message
HomepageSlot: Leadership Message Reader
PlacementKey: Leadership Message Active
PageContext: Leadership Message
```

Do not add a new `ContentTypeKey` unless repo truth proves `Leadership` is insufficient.

## Required tenant provisioning

Using the approved tenant provisioning pattern, add/verify those choices in HBCentral.

Do not recreate lists or update rows.

## Target lists

- `HB_FoleonContentRegistry`
- `HB_FoleonHomepagePlacements`
- `HB_FoleonInteractionEvents`

## Tests

Add/update tests proving all schema constants, XML values, and tenant validation expectations include Leadership Message.

## Validation

Run affected schema and package tests. At minimum:

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate
```

## Commit

```text
hb-intel-foleon: add leadership message lane schema
```

## Closure report

Include:

- files changed;
- tenant choices added/verified;
- validation results;
- confirmation no content rows changed;
- commit SHA.
