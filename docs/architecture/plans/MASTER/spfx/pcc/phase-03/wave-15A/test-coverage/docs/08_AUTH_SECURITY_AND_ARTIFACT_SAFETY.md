# Auth, Security, and Artifact Safety

## Storage State

Capture once:

```bash
mkdir -p "$HOME/.config/hbc"
pnpm exec playwright codegen "$PCC_LIVE_PAGE_URL" --save-storage "$PCC_LIVE_STORAGE_STATE"
```

Do not commit the storage state.

## Artifact Handling

Default artifact output:

```text
artifacts/pcc-live-evidence/<run-id>/
```

This path must be ignored by git.

## Tenant Safety

- No item creation.
- No list writes.
- No page edits.
- Edit-mode evidence is screenshot-only and conditional.
- Unauthorized evidence requires a separate low-permission storage state.

## Commit Safety Check

```bash
git ls-files | grep -E "(sp-auth|storageState|pcc-live-evidence|\.png$|\.webm$|trace\.zip|playwright-report)" && exit 1 || true
find . -name ".DS_Store" -print
```
