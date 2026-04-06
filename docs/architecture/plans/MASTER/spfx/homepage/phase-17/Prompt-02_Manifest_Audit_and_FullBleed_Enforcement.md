# Prompt 02 — Manifest Audit and FullBleed Enforcement

## Objective

Audit manifest structure for all homepage webparts and enforce full-bleed support on the signature hero banner.

## Focus Path

Audit every webpart folder under:

- `apps/hb-webparts/src/webparts/`

## Required Manifest Rules

### 1. Every webpart folder must include the appropriate manifest
Each real homepage webpart must have the correct adjacent SPFx webpart manifest.

Do not assume manifest coverage is correct.
Verify it.

### 2. Signature hero banner manifest must include full-bleed support
The manifest for the signature hero banner webpart must include:

```json
"supportsFullBleed": true,
```

### 3. Validate naming and adjacency
The manifest must remain adjacent to the correct webpart entry and stay aligned with the webpart’s actual render target.

## Required Output

Produce:

- manifest inventory by webpart
- missing manifest list, if any
- corrections made
- explicit proof that the hero banner manifest now includes `supportsFullBleed: true`

## Hard Rules

- Do not skip this because the current package builds.
- Do not treat manifest correctness as secondary.
- Do not leave any homepage webpart without its manifest.
- If the hero banner manifest is missing or misnamed, fix it.
