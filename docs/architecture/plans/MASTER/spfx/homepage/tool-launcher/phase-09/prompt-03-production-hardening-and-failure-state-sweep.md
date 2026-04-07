# Prompt 03 — Production Hardening and Failure-State Sweep

## Objective

Complete the **production hardening and failure-state sweep** for Tool Launcher / Work Hub so the packaged launcher behaves safely under degraded live-list data, missing assets, packaging-sensitive conditions, and real deployment-time edge cases.

## Context you must respect

- By this point the launcher should already be functionally complete and packaged.
- This prompt is for hardening and edge-case safety, not feature growth.
- The launcher must remain authoring-safe, host-aware, and hierarchy-preserving even when data or assets are imperfect.

## Repo-truth targets

Audit the packaged launcher implementation under at minimum:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- related launcher helpers / models under `apps/hb-webparts/src/homepage/`
- any launcher asset / manifest references that affect packaged runtime
- relevant docs if the final hardening posture needs to be recorded

## Required work

1. Audit failure-prone areas, including:
   - missing or invalid logo references
   - absent featured records
   - empty shelves
   - missing notice / support metadata
   - search data gaps
   - overlay and focus edge cases after packaging
2. Tighten graceful-degradation behavior where runtime evidence shows weakness.
3. Confirm launcher states remain safe in:
   - packaged runtime
   - edit mode
   - partial-data conditions
   - keyboard-only use
4. Ensure no hardening work flattens hierarchy or degrades the premium utility-zone posture.
5. Document every meaningful production-hardening improvement and any remaining known limitations.

## Explicit exclusions

- Do not redesign earlier completed launcher regions unless a hardening defect requires a narrow correction.
- Do not add unrelated “nice to have” features.
- Do not use hardening as a backdoor to reopen architecture.

## Validation requirements

- prove degraded data and asset cases fail gracefully
- prove authoring safety remains intact after packaging
- prove hardening work does not regress flagship, rail, shelf, or overlay hierarchy
- document remaining known limitations clearly if any remain

## Deliverables

- production hardening updates
- documented degraded-state and failure-state coverage
- any narrow remediation needed for packaged runtime safety
- doc updates capturing the final hardening posture

## Working rules

- repo truth first
- do not re-read files still in current context unless needed
- do not broaden scope
- preserve launcher hierarchy, accessibility, and host-aware behavior
- favor explicit degraded-state handling over hidden assumptions
