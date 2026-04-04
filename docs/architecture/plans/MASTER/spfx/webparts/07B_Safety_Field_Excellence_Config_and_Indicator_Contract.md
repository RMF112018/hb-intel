# 07B — Safety / Field Excellence Config and Indicator Contract

## Purpose

Define Prompt-07 safety/field excellence configuration rules, indicator semantics, and lightweight awareness-lane boundaries.

## Contract Surface

- Webpart module: `apps/hb-webparts/src/webparts/safetyFieldExcellence/`
- Manifest baseline: `SafetyFieldExcellenceWebPart.manifest.json`
- Config contract: `SafetyFieldExcellenceConfig`
- Normalization seam: `normalizeSafetyFieldExcellenceConfig`

## Config and Indicator Rules

- Supports authored highlights, recognitions, reminders, and notices.
- Curates one featured item with bounded secondary entries.
- Indicator/status metadata is optional but normalized when present.
- CTA metadata is optional and remains concise for homepage-safe transitions.

## Freshness, Fallback, and Ownership

- Supports optional freshness metadata for live/curated signal context and stale detection.
- Missing, malformed, or partially populated items fall back to explicit empty-state guidance.
- Site owners maintain authored safety/field items; `hb-webparts` maintainers own normalization, stale semantics, and guardrails.
