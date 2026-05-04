# Validation and Closeout Requirements

## Required Repo-Truth Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Capture results before edits and again after edits where applicable.

## JSON Validation

Every JSON artifact added or edited must pass:

```bash
python3 -m json.tool <file>
```

## Formatting Validation

Run Prettier check against touched markdown and JSON:

```bash
pnpm exec prettier --check <touched-files>
```

## Lockfile Guard

Capture before and after:

```bash
md5 pnpm-lock.yaml
```

The MD5 must remain unchanged for documentation-only execution.

## Blocked Scope Attestation

Closeout must explicitly confirm:

- no runtime implementation;
- no package/lockfile mutation;
- no tenant/list/group/security mutation;
- no Procore writeback;
- no Sage writeback;
- no Power Automate runtime dependency;
- no external-system execution;
- no HBI decision authority;
- no source ownership transfer;
- no production rollout.

## Required Closeout Format

Return:

```text
Commit summary: <summary>

Commit description:
<description with files changed, validation, guardrails, residual risks>
```

## Hard Stops

Stop and report before editing if:

- repo worktree is not clean and changes are unrelated;
- local repo lacks expected PCC Phase 3 documentation;
- package/lockfile already changed before execution;
- Wave 13G authority path cannot be found locally and the intended update requires direct edits there;
- source files would need to be changed to satisfy documentation objective;
- any validation fails and cannot be corrected within documentation-only scope.
