# P1-F6-T07: Sage Intacct Published Read Models and Downstream Consumer Surfaces

## Published Read Models

- Project financial-control snapshot
- Finance reconciliation views aligned to project identity and cost-control consumers
- Published operational finance summaries for Project Hub and admin/operator surfaces

## Consumer Boundary

- Downstream consumption stays behind governed repositories and `@hbc/query-hooks`.
- Feature packages must not consume raw Intacct contracts or credentials directly.
