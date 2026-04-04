# 06B — Leadership Message Authoring and Rotation Contract

## Purpose

Define Prompt-06 leadership-message authoring rules, hierarchy expectations, and optional media discipline.

## Contract Surface

- Webpart module: `apps/hb-webparts/src/webparts/leadershipMessage/`
- Manifest baseline: `LeadershipMessageWebPart.manifest.json`
- Config contract: `LeadershipMessageConfig`
- Normalization seam: `normalizeLeadershipMessageConfig`

## Authoring and Rotation Rules

- Leadership entries are curated into one featured message plus bounded archived/secondary entries.
- Required fields for valid entries: id, title, message, leaderName.
- Optional media is rendered only when source and accessible alt text are both present.
- CTA metadata is optional and normalized for maintainable authored updates.

## Fallback and Ownership

- Malformed/empty leadership entries fall back to explicit empty-state guidance.
- Site owners maintain authored message rotation; maintainers own normalization and rendering guardrails.
