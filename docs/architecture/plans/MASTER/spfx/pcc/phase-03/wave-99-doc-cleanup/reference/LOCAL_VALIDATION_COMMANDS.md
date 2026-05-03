# Local Validation Commands

Run from:

```text
/Users/bobbyfetting/hb-intel
```

## Baseline

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## During Work

After creating or modifying docs:

```bash
git status --short
git diff --check
md5 pnpm-lock.yaml
```

Run Prettier check only on touched Markdown files:

```bash
pnpm exec prettier --check <touched-markdown-files>
```

If needed, write only touched/failing Markdown files:

```bash
pnpm exec prettier --write <failing-markdown-files>
pnpm exec prettier --check <same-markdown-files>
```

## Final

```bash
git status --short
git diff --check
md5 pnpm-lock.yaml
```

Confirm:

- No runtime source files changed.
- No TypeScript model files changed.
- No SPFx app source files changed.
- No backend files changed.
- No package manifests changed.
- `pnpm-lock.yaml` MD5 unchanged from baseline.
- All touched Markdown files pass Prettier.
