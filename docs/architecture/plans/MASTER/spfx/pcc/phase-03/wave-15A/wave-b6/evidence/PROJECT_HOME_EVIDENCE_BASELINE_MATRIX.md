# Project Home Evidence Baseline Matrix

## Baseline evidence path

```text
docs/architecture/evidence/pcc-live/20260507-171608-wave-15A-b5-prompt-05/
```

## Baseline card order

| Index | Card                               | Tier  | Region      | Footprint |
| ----: | ---------------------------------- | ----- | ----------- | --------- |
|     0 | Project Intelligence Header        | tier1 | command     | hero      |
|     1 | Priority Actions                   | tier2 | operational | wide      |
|     2 | Missing Configurations             | state | state       | standard  |
|     3 | Site Health Summary                | tier2 | operational | standard  |
|     4 | Procore snapshot                   | tier3 | deferred    | standard  |
|     5 | Approvals & Checkpoints            | tier2 | operational | standard  |
|     6 | Project Readiness                  | tier2 | operational | standard  |
|     7 | Document Control Center            | tier2 | operational | wide      |
|     8 | External Platforms                 | tier3 | reference   | standard  |
|     9 | Team Snapshot                      | tier3 | rail        | rail      |
|    10 | Recent Activity                    | tier3 | reference   | tall      |
|    11 | Lifecycle Timeline                 | tier2 | detail      | detail    |
|    12 | Project Memory                     | tier3 | reference   | standard  |
|    13 | Project Lens                       | tier3 | rail        | rail      |
|    14 | Related Records                    | tier3 | detail      | detail    |
|    15 | Ask HBI — Grounded Project Answers | tier2 | detail      | detail    |

## Baseline responsive metrics

| Metric                          | Baseline |
| ------------------------------- | -------: |
| Phone measured container height |   8432px |
| Tablet portrait height          |   6464px |
| Tablet landscape height         |   4304px |
| Small laptop height             |   4688px |
| Standard laptop height          |   3848px |
| Horizontal overflow             |        0 |

## Baseline card height issues

| Card                   | Phone measured height | Issue                               |
| ---------------------- | --------------------: | ----------------------------------- |
| Project Intelligence   |                 315px | acceptable, but contrast findings   |
| Priority Actions       |                2573px | too tall for default home-page rail |
| Missing Configurations |                 318px | high placement questionable         |
| Document Control       |                 558px | acceptable if core cluster          |
| Project Memory         |                 966px | too heavy if too high               |
| Ask HBI                |                 485px | 5 min touch-target issues           |

## Baseline accessibility

| Metric              | Baseline |
| ------------------- | -------: |
| Axe violations      |        4 |
| ARIA needs-review   |        2 |
| Contrast entries    |        2 |
| Touch issues        |       18 |
| Hover-only risks    |        0 |
| Dialog/modal review |        0 |

## Baseline content

| Metric                | Baseline |
| --------------------- | -------: |
| Copy snippets         |       79 |
| Headings              |       20 |
| Actions               |       28 |
| State snippets        |        2 |
| Source snippets       |        1 |
| HBI snippets          |        2 |
| Owner/action snippets |        2 |
| Mock/demo snippets    |        1 |
| Needs-review findings |       27 |

## Baseline workflow

| Metric                        | Baseline |
| ----------------------------- | -------: |
| Action observations           |       29 |
| Primary actions               |        9 |
| Disabled without reason       |        0 |
| False-affordance needs-review |        0 |
| State observations            |       14 |
| Source observations           |        1 |
| HBI risk                      |        0 |

## Required post-remediation deltas

| Metric                            | Target                                                    |
| --------------------------------- | --------------------------------------------------------- |
| Project Home command card title   | operator-facing, not `Project Intelligence Header`        |
| Priority Actions visible rows     | <= 7 default                                              |
| Priority Actions phone height     | materially lower than 2573px                              |
| Project Home axe violations       | 0 PCC-owned                                               |
| Project Home content needs-review | materially lower than 27                                  |
| Ask HBI touch issues              | fixed or classified                                       |
| Card order                        | Tier 2 core-control cards before deferred/reference cards |
| Procore snapshot                  | below core operational cluster unless blocking            |
| Screenshot scroll evidence        | real below-fold segments                                  |
