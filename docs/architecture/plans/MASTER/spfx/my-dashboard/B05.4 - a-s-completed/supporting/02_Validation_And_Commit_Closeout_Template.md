# Supporting 02 — Validation and Commit Closeout Template

Use this closeout format at the end of every implementation prompt.

## Prompt closeout

### Execution decision

- `PASS`
- `PARTIAL`
- `BLOCKED`

### Summary of work completed

- ...

### Files changed

```text
...
```

### Validation performed

```bash
...
```

Results:

```text
...
```

### Lockfile checksum

Before:

```text
...
```

After:

```text
...
```

Assessment:

```text
MATCH / MISMATCH
```

### Staged-file proof

```bash
git status --short
git diff --stat
git diff --cached --stat
```

Output summary:

```text
...
```

### Explicit exclusions preserved

- no `pnpm-lock.yaml` edit;
- no package-manifest edit;
- no workflow edit;
- no deployment action;
- no tenant mutation;
- no unrelated module changes.

### Commit summary

```text
...
```

### Commit body

```text
...
```

### Remaining risks or blockers

- None, or exact blocker with evidence.

### Recommended next prompt

```text
Prompt XX — ...
```
