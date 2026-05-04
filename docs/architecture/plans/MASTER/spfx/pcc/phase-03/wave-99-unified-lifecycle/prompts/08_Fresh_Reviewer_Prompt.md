# 08 — Fresh Reviewer Prompt: Unified Lifecycle Implementation Audit

## Objective

Use this prompt in a fresh ChatGPT/session after local execution of Prompts 01–07. Audit the implementation against repo truth, target architecture, tests, and guardrails. Do not edit the repo unless explicitly asked.

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Required Audit Commands

Ask the local agent/user to provide or run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git show --stat --oneline HEAD
git show --name-only --oneline HEAD
```

## Required Review Scope

Review:

- unified lifecycle governing docs;
- developer contracts;
- model contracts/fixtures/tests;
- backend routes/provider/tests;
- SPFx client/fixtures/adapters/hooks/components/tests;
- Project Home / Project Readiness integration;
- Ask-HBI grounding/security tests;
- closeout documentation.

## Required Questions

1. Does implementation preserve one PCC shell?
2. Were any forbidden routes/workspaces added?
3. Are model contracts complete and exported?
4. Are backend routes GET-only and mock/read-model-safe?
5. Are SPFx client/fixture/backend paths aligned?
6. Do Project Home and Project Readiness render lifecycle content without gating existing surfaces?
7. Does Ask-HBI require citations and refuse correctly?
8. Are withheld/restricted/privileged records protected?
9. Are warranty responsibility conclusions blocked without evidence threshold?
10. Are cross-project knowledge references summary-safe and permission-filtered?
11. Are there any live external integration imports or calls?
12. Were package/lockfile/manifest/workflow changes avoided unless authorized?
13. Do validation results prove the touched packages?
14. Is the closeout accurate?
15. What should proceed next?

## Final Output Required

Return a structured audit report with:

- completeness rating;
- files/areas reviewed;
- validation evidence reviewed;
- defects or gaps;
- residual risks;
- recommended follow-up prompts;
- explicit pass/fail on guardrails.
