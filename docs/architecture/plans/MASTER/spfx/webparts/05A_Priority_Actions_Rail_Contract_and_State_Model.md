# 05A — Priority Actions Rail Contract and State Model

## Purpose

Lock Prompt-05 priority-actions behavior so downstream prompts consume one governed utility acceleration contract.

## Contract Surface

- Webpart module: `apps/hb-webparts/src/webparts/priorityActionsRail/`
- Manifest baseline: `PriorityActionsRailWebPart.manifest.json`
- Config contract: `PriorityActionsRailConfig`
- Normalization seam: `normalizePriorityActionsRailConfig`

## State and Behavior Model

- Actions are normalized, deduplicated, audience-filtered, and ordered deterministically.
- Grouping supports authored buckets while defaulting malformed/unspecified group values to safe fallbacks.
- Optional status badges render urgency/attention signals without replacing concise action labels.
- Loading uses shared homepage loading state; malformed or empty config falls back to a clear empty state.

## Ownership and Maintenance

- Site owners/content maintainers own authored action links, ordering, and optional badge labels via property-pane config.
- `hb-webparts` maintainers own normalization, grouping behavior, and fallback semantics.
