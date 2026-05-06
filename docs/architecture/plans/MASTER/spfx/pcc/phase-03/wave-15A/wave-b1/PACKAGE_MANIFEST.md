# Package Manifest — PCC Shell Remediation, Context-Efficient Edition

## Package Root

Recommended repo placement:

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-b/shell-remediation-context-efficient/
```

## Files

| Path | Purpose |
|---|---|
| `README.md` | Execution overview and context-efficiency policy. |
| `docs/00_CONTEXT_EFFICIENCY_RULES.md` | Binding rules for minimizing file reads and avoiding token waste. |
| `docs/01_UPDATED_REMEDIATION_PLAN.md` | Corrected remediation plan aligned to current repo truth. |
| `docs/02_SOURCE_OWNERSHIP_MAP.md` | Known file ownership map so prompts do not need broad rediscovery. |
| `docs/03_SHELL_TARGET_SPECIFICATION.md` | Detailed target architecture for hero, tabs, shell, host fit, and bento priority. |
| `docs/04_BREAKPOINT_POLICY_SPECIFICATION.md` | Final 8-mode PCC breakpoint contract. |
| `docs/05_VALIDATION_EVIDENCE_STRATEGY.md` | Validation, screenshot, and closeout rules by prompt. |
| `docs/06_IMPLEMENTATION_SEQUENCE.md` | Prioritized task sequence and batching. |
| `prompts/*.md` | Local code-agent prompts, each scoped and context-efficient. |
| `artifacts/*.md` | Templates for closeouts, evidence, and scorecards. |

## Authority

This package supersedes the earlier smaller Prompt 02 “project context band” approach. It keeps Prompt 01 closeout as source-map baseline but redirects Prompt 02+ implementation toward the deeper shell remediation plan.

## Use

Run one prompt at a time. The agent should preserve active context between prompts. Do not ask the agent to re-audit the repo after every prompt. Require only command checks and targeted file reads.
