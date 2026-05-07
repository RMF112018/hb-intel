# Target Architecture — Project Home Flagship Command Center

## Product objective

Project Home is the PCC landing surface. Its job is not to show everything. Its job is to orient the project team, expose the highest-risk work, clarify source boundaries, and provide a grounded path into deeper modules.

Project Home should read as:

```text
Project identity + operating posture
→ today's highest-value actions
→ core control modules
→ lifecycle continuity and HBI intelligence
→ reference/context/history
```

## Target information architecture

### Tier 1 — Command summary

A single Tier 1 command card should remain the active surface panel carrier.

Target card:

```text
Project Command Summary
```

Responsibilities:

- project number/name/location/value/stage/completion;
- project operating posture;
- priority-action count / critical count;
- approval/readiness/document-control/site-health risk summary;
- source freshness / confidence summary;
- HBI advisory boundary cue;
- mock/demo/fixture transparency where appropriate.

### Tier 2 — Operating priorities

Target card:

```text
Today's Operating Priorities
```

Responsibilities:

- top 5–7 priority actions only;
- visible priority, owner/persona, due date, work center, and source module;
- clear "reference-only" or "preview-only" posture;
- category totals for hidden/remaining items;
- no live execution;
- compact enough to avoid multi-thousand-pixel mobile height.

### Tier 2 — Core-control module cluster

Target cards:

```text
Approvals & Checkpoints
Project Readiness
Document Control Center
Site Health / Setup Health
```

Responsibilities:

- make the PCC feel like an operating layer, not a collection of tools;
- show concise posture and next-action/owner signals;
- preserve source boundaries;
- avoid duplicating deep module pages.

### Tier 2 — Intelligence entry points

Target concepts:

```text
Lifecycle Continuity
Ask HBI — Grounded Project Answers
Source Confidence / Procore posture
```

Responsibilities:

- surface what makes PCC different from generic dashboards;
- connect estimating/preconstruction/ops/warranty/project-memory logic;
- make HBI visible but bounded;
- avoid auto-fetches or mutation claims.

### Tier 3 — Reference and context

Target cards:

```text
External Platforms
Team Snapshot
Recent Activity
Project Memory / Related Records / Project Lens detail
Procore source details
```

Responsibilities:

- support deeper context;
- remain below the operational fold;
- avoid competing with daily operating priorities.

## Target read-model card order

The exact order can be refined by repo-truth, but the target order should be close to:

| Target index | Card/concept                                           | Tier           | Region                 | Notes                                   |
| -----------: | ------------------------------------------------------ | -------------- | ---------------------- | --------------------------------------- |
|            0 | Project Command Summary                                | tier1          | command                | sole active panel marker                |
|            1 | Today's Operating Priorities                           | tier2          | operational            | compact, not full rail wall             |
|            2 | Approvals & Checkpoints                                | tier2          | operational            | core-control cluster                    |
|            3 | Project Readiness                                      | tier2          | operational            | core-control cluster                    |
|            4 | Document Control Center                                | tier2          | operational            | core-control cluster                    |
|            5 | Site Health / Setup Health                             | tier2 or state | operational/state      | promote only if blocking                |
|            6 | Lifecycle Continuity                                   | tier2          | detail/command-support | compact differentiator                  |
|            7 | Ask HBI Entry / Grounded Answers                       | tier2          | detail                 | visible earlier; no auto mutation       |
|            8 | Source Confidence / Procore Snapshot                   | tier3          | reference/deferred     | lower unless blocking                   |
|            9 | External Platforms                                     | tier3          | reference              | lower context                           |
|           10 | Team Snapshot                                          | tier3          | rail                   | lower context                           |
|           11 | Recent Activity                                        | tier3          | reference              | lower history                           |
|          12+ | Project Memory / Project Lens / Related Records detail | tier3          | reference/detail       | grouped lower or progressive disclosure |

## Technical architecture rules

### Composition

- `PccProjectHome.tsx` remains the fixture-only composition seam.
- `PccProjectHomeReadModelContent.tsx` remains the read-model-driven composition seam.
- Both paths must render a Fragment of `PccDashboardCard` direct children.
- Do not add wrappers between Project Home and `PccBentoGrid`.

### View-models

Prefer local Project Home view-model helpers for:

- command summary aggregation;
- compact priority action selection;
- source-confidence summary;
- lifecycle/HBI summary metadata;
- setup/blocking status.

Add tests for helpers.

### Local state

Allowed:

- local preview-only expansion toggle for showing all priority actions;
- local selected category filter for priority actions;
- local non-persistent view selection for compact lifecycle/HBI summaries.

Not allowed:

- persistent writes;
- URL mutation unless an existing shell pattern already owns it;
- external-system writeback;
- source-system launch behavior.

### Accessibility

- No color-only state.
- Touch targets must be safe on phone.
- Muted text must still pass contrast.
- Disabled/inert controls must explain condition and next step.
- HBI must be keyboard-accessible and not rely on hover-only discovery.

### Evidence architecture

The evidence suite must capture:

- above-fold screenshot;
- at least two real Project Home scroll segments below the first fold;
- DOM card order/tier/region;
- breakpoint/card measurements;
- axe/contrast/touch evidence;
- content findings;
- workflow/false-affordance/HBI authority evidence.

## Anti-goals

Do not:

- turn Project Home into a deep module page;
- add more cards to solve clarity;
- hide source boundaries;
- create live execution buttons;
- create HBI mutation authority;
- downgrade test coverage to pass quickly;
- edit package manifests or lockfiles;
- claim final scorecard pass.
