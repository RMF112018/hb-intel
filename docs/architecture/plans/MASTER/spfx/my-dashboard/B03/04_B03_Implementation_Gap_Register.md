# B03 Implementation Gap Register

## Purpose

This register translates the B03 planning artifact into concrete implementation gaps visible against the current repo trajectory. It is intended to keep the local code agent focused on what B03 must add and what it must not accidentally add.

## Gap register

| ID | Gap | Why it matters | Required B03 resolution |
|---|---|---|---|
| B03-G01 | No My Work navigation registry in `packages/models/src/myWork` | The shell needs typed primary/module identifiers and normalized state | Create registry, helpers, exports |
| B03-G02 | No My Work shell state hook | Navigation needs deterministic `home` vs focused Adobe module state | Create `useMyWorkShellState` |
| B03-G03 | No My Work shell component set | The B02 app foundation does not itself provide the B03 UX shell | Create shell, nav, hero, router |
| B03-G04 | No tab-group-attached module launcher | The Adobe module needs a future-ready, accessible grouped-nav entry point | Implement launcher menu with WAI-ARIA pattern |
| B03-G05 | No My Work hero band | The shell needs user-context orientation and module-focused title switching | Implement home/focused hero copy and microcopy |
| B03-G06 | No My Work bento/grid choreography layer | The B03 home/module card matrices must render consistently across host widths | Implement responsive modes + span overrides |
| B03-G07 | No home/focused surface router | B03’s module focus model requires shell-content swapping without routing | Implement router and shell view-state marker |
| B03-G08 | No structural home cards / focused Adobe shell-placement cards | Layout and navigation cannot be meaningfully validated without cards | Implement structural B03 cards, staying within B04/B05 limits |
| B03-G09 | No B03 data-attribute selector contract | Hosted evidence and future Playwright need stable selectors | Add `data-my-work-*` selectors |
| B03-G10 | No B03-specific accessibility coverage | The module launcher and shell active panel are interaction-risk areas | Add unit/integration tests |
| B03-G11 | Risk of PCC project-context leakage | My Dashboard must be user-contextual, not project-contextual | Explicitly omit project facts/search/project copy |
| B03-G12 | Risk of competing with `@hbc/my-work-feed` | My Work platform doctrine already exists | Keep B03 shell host-specific and non-aggregating |

## Prompt-to-gap mapping

| Prompt | Primary gaps |
|---|---|
| 01 | G01, G02, G12 |
| 02 | G03, G04, G09, G10 |
| 03 | G05, G11 |
| 04 | G06, G07, G09 |
| 05 | G08, G11, G12 |
| 06 | G10 plus overall closure |

## Explicit out-of-scope register

| Out of scope | Owner batch |
|---|---|
| Source-backed My Work read-model envelopes | B04 |
| Adobe queue row normalization and detailed filter behavior | B05 |
| Protected `/api/my-work/me/...` backend routes | B06 |
| Adobe OAuth and live integration backbone | B07 |
| Hosted SharePoint Playwright evidence suite | B08 |
| Analytics cards | Deferred beyond current MVP |
