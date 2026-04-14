# Article Publisher Remediation Prompt Package

## Objective
This package converts the updated audit findings into a sequential, one-gap-at-a-time remediation package for a local code agent.

## Package contents
- `Plan-Summary.md`
- `README.md`
- `Prompt-01` through `Prompt-14`, one tightly bounded prompt per remediation gap

## How to use this package
1. Run the prompts in numeric order.
2. Use a fresh local code-agent session for each prompt unless the current session still contains the exact needed context.
3. Do not combine prompts.
4. Do not skip ahead to workflow, template, validation, or publish hardening until the earlier schema/data-model prompts are fully closed.
5. Require closure proof after each prompt before moving to the next one.

## Sequencing logic
- Prompts 01–08 close the highest-risk data-model and repository gaps first.
- Prompts 09–11 complete operational lifecycle behavior.
- Prompts 12–13 realign validation and downstream integration.
- Prompt 14 finishes terminology cleanup after the functional seams are corrected.

## Binding authority
- Tenant schema authority: `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- Rebrand authority: `docs/architecture/plans/MASTER/spfx/publisher/architecture/publisher-rebranding-report.md`
- Audit findings: `/mnt/data/03-Findings-Register.md`
- Remediation sequence: `/mnt/data/04-Recommended-Remediation-Sequence.md`

## Important guardrails
- Preserve the **Article Publisher** app identity.
- Preserve **Project Spotlight** as the current destination identity where materially correct.
- Do not rename preserved destination-scoped values that the rebranding report intentionally left unchanged.
- Treat tenant list titles and tenant field names as authoritative over pre-refactor assumptions.
