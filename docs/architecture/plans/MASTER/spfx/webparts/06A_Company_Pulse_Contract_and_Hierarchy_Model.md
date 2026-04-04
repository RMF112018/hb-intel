# 06A — Company Pulse Contract and Hierarchy Model

## Purpose

Lock Prompt-06 company pulse behavior so downstream prompts consume one curated editorial hierarchy contract.

## Contract Surface

- Webpart module: `apps/hb-webparts/src/webparts/companyPulse/`
- Manifest baseline: `CompanyPulseWebPart.manifest.json`
- Config contract: `CompanyPulseConfig`
- Normalization seam: `normalizeCompanyPulseConfig`

## Hierarchy Model

- Pulse content is curated into one featured item and bounded secondary items.
- Featured item carries primary hierarchy and optional category/status treatment.
- Secondary items remain concise and support optional CTA behavior.
- Audience-aware filtering is applied before hierarchy shaping.

## Fallback and Ownership

- Missing or malformed pulse content renders clear empty-state guidance.
- Site owners/content stewards maintain authored pulse entries and ordering.
- `hb-webparts` maintainers own normalization, hierarchy shaping, and fallback semantics.
