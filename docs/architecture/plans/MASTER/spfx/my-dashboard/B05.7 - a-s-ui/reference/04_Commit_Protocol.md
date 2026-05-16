# 04 — Commit Protocol

## General Rule

One prompt = one scoped commit, except:

- Prompt 01: no commit.
- Prompt 08: docs/closeout commit only if repo docs are generated.

## Commit Hygiene

Before committing:

1. Run required validation commands.
2. Run `git diff --check`.
3. Verify `pnpm-lock.yaml` MD5 unchanged.
4. Stage explicitly by path.
5. Review `git diff --cached --stat`.
6. Confirm no forbidden file entered the staged set.

## Prompt-Level Suggested Commit Summaries

### Prompt 02

```text
my-dashboard(adobe-sign): correct card posture and localize module style boundary
```

### Prompt 03

```text
my-dashboard(adobe-sign): rebuild activity header status rail and semantic view switch
```

### Prompt 04

```text
my-dashboard(adobe-sign): add flagship activity rows and preview context
```

### Prompt 05

```text
my-dashboard(adobe-sign): complete authored states and completed-history retry
```

### Prompt 06

```text
my-dashboard(adobe-sign): harden responsive shell-fit and compact card behavior
```

### Prompt 07

```text
my-dashboard(adobe-sign): close accessibility and regression coverage gaps
```

### Prompt 08

```text
docs(my-dashboard): close adobe sign flagship uiux remediation evidence
```

## Required Final Report After Each Prompt

The agent's final response must include:

- Commit created? yes/no.
- Commit SHA if created.
- Files changed.
- Validations run and results.
- `pnpm-lock.yaml` MD5 before/after.
- Explicit confirmation that forbidden files were not modified.
- Remaining risks.
- Whether next prompt is ready.
