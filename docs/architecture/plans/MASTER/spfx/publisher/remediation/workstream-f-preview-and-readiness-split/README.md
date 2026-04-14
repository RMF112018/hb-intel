# Workstream F — Preview and Publish-Readiness Split

Separates the Article Publisher's single PreviewPanel (which narrated preview, validation, drift, and publish-decision trace together) into a dedicated author-facing visual **Article Preview** surface and an operator-facing **Publish Readiness** diagnostics surface. Rewrites lifecycle messaging for author confidence.

## Steps
- [Step 01 — Information architecture design](./step-01/DESIGN.md)
- [Step 02 — Visual ArticlePreview surface](./step-02/CLOSURE.md)
- [Step 03 — PublishReadinessDiagnostics panel](./step-03/CLOSURE.md)
- [Step 04 — Lifecycle messaging + dead-code removal](./step-04/CLOSURE.md)
- [Step 05 — Scrub + end-to-end readiness validation](./step-05/CLOSURE.md)

## Final architecture

```
apps/hb-webparts/src/webparts/articlePublisher/
├── previewSurface/
│   ├── ArticlePreview.tsx           # editorial visual preview (hero + body + team + gallery + homepage card)
│   ├── articlePreview.module.css
│   └── index.ts
├── readinessSurface/
│   ├── PublishReadinessDiagnostics.tsx    # plain-English "what happens on publish" + collapsible technical details
│   ├── publishReadinessDiagnostics.test.ts
│   ├── publishReadiness.module.css
│   └── index.ts
└── lifecycleMessaging.ts            # 9 pure message builders (+ 17 tests)
```

All three modules read from the shared `PreviewOutcome` produced by `previewBuilder.ts`. No schema, no adapter, no orchestrator, no write-seam change.

## Surface responsibilities

| Surface | Reads | Shows | Does NOT show |
| --- | --- | --- | --- |
| `ArticlePreview` | `PreviewOutcome.resolution` (article, teamMembers, media) | Hero, subhead, summary, body, callout, pull quote, teammate roster, gallery grid, homepage card preview | Validation, drift, decision trace, machine identifiers |
| `PublishReadinessDiagnostics` | `PreviewOutcome.decision`, `.drift`, `.validation`, existing binding | Plain-English decision sentence, collapsible technical-details drawer (drift diffs + finding codes) | Editorial copy, article body, team chips, gallery tiles |
| Readiness rail blocks | `composeReadinessSummary`, `latestValidation` | Author-voice summary, blocking issues (friendly messages), warnings, primary + workflow + destructive actions, last-action banner | Machine identifiers, technical drift numbers (those live in the diagnostics drawer) |

## Lifecycle invariants preserved
- `PreviewOutcome` shape unchanged.
- `previewBuilder`, `publishOrchestrator`, `validationEngine`, `republishPolicy`, `composeReadinessSummary` untouched.
- Publish / republish / archive / withdraw orchestrator contracts unchanged — only their outcome messages are rewritten for display.
- SPFx mount wiring unchanged.
