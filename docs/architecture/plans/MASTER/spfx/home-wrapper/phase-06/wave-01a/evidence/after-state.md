# Homepage Canvas — After-State Evidence

Capture the output of the authoritative proof action **after** any apply action runs, or immediately (if `before-state.md` already shows `passed === true`).

## How to populate

1. If an apply was required, the `flagship-action-layer-cutover` run emits a `preCutover` and `postCutover` block in `normalized.json > pageComposition`. Paste the `postCutover` block in the section below.
2. Always re-run the read-only proof action after apply. Paste the post-apply `homepageActionLayerProof` block below. The proof must show `passed === true` and `actionLayerState === 'already-cutover'`.
3. Commit this file with operator output replacing the templates.

## Run identity

- Proof `runId`: _pending operator execution_
- Apply `runId` (if cutover was performed): _pending or N/A_
- Executed by: _pending_
- Executed at (UTC): _pending_

## Post-apply composition (paste from `pageComposition.postCutover` — only if apply ran)

```json
{
  "postCutover": {
    "pageName": "<paste>",
    "actionLayerState": "<paste>",
    "orderValid": "<paste>",
    "controls": ["<paste ordered control summaries>"]
  }
}
```

## Final proof output (paste from post-apply `normalized.json`)

```json
{
  "homepageActionLayerProof": {
    "pageName": "<paste>",
    "actionLayerState": "already-cutover",
    "orderValid": true,
    "passed": true,
    "issues": [],
    "controls": ["<paste ordered control summaries>"]
  }
}
```

## Required assertions

- Quick Links webpart id `c70391ea-0b10-4ee9-b2b4-006d3fcad0cd` is NOT in `controls[*].webPartId`.
- PriorityActionsRail `b3f07190-79cf-437d-a1d6-ecbf3f77e616` IS in `controls[*].webPartId`.
- HB Signature Hero `28acd6a7-2582-4d8a-86d4-b52bfbeb375c` IS in `controls[*].webPartId`.
- hbHomepage `e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf` IS in `controls[*].webPartId`.
- Positional order: hero `positionIndex` &lt; rail `positionIndex` &lt; hbHomepage `positionIndex`.
- If apply ran: page was published (captured implicitly because the apply action invokes `Set-PnPPage -Publish`).
