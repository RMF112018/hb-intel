# 08 — Active Context Efficiency

## Purpose

Reduce token waste while preserving repo-truth validation.

---

## Primary Rule

Read the smallest sufficient source set. Do not re-read files already in active context unless proof, freshness, or expanded scope requires it.

Efficiency must not override repo-truth validation.

---

## Do Not Read During Normal Work

Do not search or read these unless the user explicitly asks for historical/archive analysis or recovery:

- `.archive/claude-plans/**`
- `.claude/plans/logs/**`
- old `.claude/plans/*.md` files that have been moved to archive
- `**/*.log`
- `node_modules/**`
- `.next/**`
- `dist/**`
- `build/**`
- `coverage/**`
- `.turbo/**`
- `.vite/**`
- `playwright-report/**`
- `test-results/**`
- generated zip artifacts
- generated deployment/runtime proof logs

These paths should also be denied in `.claude/settings.json`.

---

## `.claude/plans/` Policy

`.claude/plans/` is active-only.

Allowed:

- one short current working plan;
- temporary draft plans for the current task;
- files the user explicitly asks Claude to save there.

Not allowed:

- historical plans;
- logs;
- generated JSON evidence;
- long run outputs;
- deployment evidence;
- archived closeouts;
- old prompt execution records.

Historical material belongs in:

```text
.archive/claude-plans/
```

---

## Reread Only When Needed

Reread a file only when:

- it may have changed;
- line-level proof is needed;
- final validation/closeout requires evidence;
- scope expanded;
- the user requested a repo-truth audit;
- post-execution validation is requested;
- the file is a governing source for the current task;
- current memory conflicts with live repo evidence.

---

## Repo-Truth Audit Exception

For repo-truth audits and post-execution reviews, verify current files. Do not answer from memory alone.

Use:

- `hb-repo-truth-audit`
- `hb-post-execution-closeout`

---

## Archive Exception

Only inspect `.archive/claude-plans/**` when the user explicitly asks to:

- reconstruct historical context;
- compare old plans to current state;
- recover a prior plan or log;
- audit archived execution evidence.

When archive access is needed, state that archive access is intentional and limited.
