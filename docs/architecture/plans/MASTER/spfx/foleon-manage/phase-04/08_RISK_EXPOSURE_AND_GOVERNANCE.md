# 08 — Risk Exposure and Governance

## Risk register

| Risk | Exposure | Mitigation |
|---|---|---|
| Misleading users into believing sample content is live | High trust risk | Visible Preview/Sample labels on region and cards; no `Read`/`Open` live actions |
| Telemetry contamination | Medium analytics risk | Preview components must not call live telemetry callbacks; no production events |
| Preview becomes permanent and masks missing content process | Medium governance risk | Admin guidance panel; tenant runbook requires adding live content and proving preview disappears |
| Configuration errors hidden by friendly preview | High operational risk | Preview only after `canInitialize` and successful fetch; errors remain errors |
| Reader gate weakened | High security/integrity risk | Do not change `ReaderPage` gating or origin policy |
| Admin confusion in Manager route | Medium workflow risk | Guidance is explanatory only; no fake editable records |
| Accessibility failure due to disabled buttons | Medium UX risk | Visible helper text; `aria-disabled` where appropriate; no hover-only meaning |
| UI remains generic | Medium adoption risk | Purpose-built preview banner, feature hierarchy, CSS placeholders, compact behavior |
| Fixture data collides with real records | Low/medium technical risk | Preview-specific model; IDs are strings prefixed `preview-`; no Foleon doc IDs |
| Package version drift | Medium deployment risk | Single final version bump; package proof and runtime proof validation |
| Overreach into unrelated apps | Medium repo-risk | Implementation prompts explicitly prohibit Safety/shell/unrelated file changes |

## Governance requirements

- The preview fallback is a public-facing state model, not mock data integration.
- Preview records must be read-only and client-local.
- Preview fallback must never write to SharePoint.
- Preview fallback must never depend on the Azure Functions backend.
- Preview fallback must never alter list provisioning.
- Preview fallback must never relax Foleon origin, embed, or publish gates.

## Acceptance gates

Implementation cannot be accepted until:

- preview renders for configured-empty Highlights;
- preview renders for configured-empty Hub;
- Hub filter-empty remains distinct;
- live content takes precedence;
- config errors stay errors;
- no fake reader opens;
- no production telemetry for preview records;
- package proof passes;
- tenant proof confirms runtime diagnostics remain truthful.

## Open product decisions

None are blocking if the package recommendations are accepted. Optional decisions:

1. Should Manager route guidance include a direct link to provisioning docs?
2. Should the preview fallback include an admin-only “why am I seeing this?” detail expander?
3. Should a future explicit `previewMode=true` query param exist for demos/testing after the runtime fallback ships?

Recommended first pass: do not add a property toggle or query param. Keep this a deterministic configured-empty fallback.
