# Prompt 03 — Standalone Foleon Leadership Message Alignment

## Objective

Add standalone Foleon support for the Leadership Message lane if not already completed by the shared package extraction.

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


## Required changes

Add route:

```text
leadershipMessage
```

Add wrapper:

```text
LeadershipMessageReader
```

Add toolbox entry:

```text
HB Intel Leadership Message Reader
```

Add telemetry/page context:

```text
Leadership Message
```

## Preserve

Do not remove existing:

- Project Spotlight Reader;
- Company Pulse Reader;
- Manager;
- legacy Highlights.

## Versioning

If Foleon source is changed and deployed, bump Foleon coherently to the next package/runtime version and run package proof.

## Validation

Run Foleon build/test/package proof if deployable package changes.

## Commit

```text
hb-intel-foleon: add leadership message reader route
```
