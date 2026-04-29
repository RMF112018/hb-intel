# Validation Matrix

| Prompt | Expected Changes | Required Validation | Must Not Change |
|---|---|---|---|
| Prompt 01 | Inventory docs, scope lock, classification matrix | `git status --short`; docs lint/check if available | Source assets, app code, package versions |
| Prompt 02 | UI-kit README, doctrine README, governance map, supersession register | `git status --short`; markdown/link validation if available | Product code, brand binaries |
| Prompt 03 | SPFx full-page/widget overlay, acceptance/scoring model | `git status --short`; markdown/link validation | Product UI implementation |
| Prompt 04 | Brand governance docs reconciled with UI doctrine | `git status --short`; markdown/link validation | No font redistribution in generated artifacts |
| Prompt 05 | Curated web-ready brand assets under ui-kit branding; registry update | `git status --short`; `pnpm --filter @hbc/ui-kit check-types`; `pnpm --filter @hbc/ui-kit build`; relevant asset/type checks | No app-local raw brand imports; no package version bump unless authorized |
| Prompt 06 | Font placement/theme governance, only if license-safe | `git status --short`; `pnpm --filter @hbc/ui-kit check-types`; `pnpm --filter @hbc/ui-kit build`; CSS/font path checks | No font copies if license unclear; no generated external font zips |
| Prompt 07 | Pattern/standard docs for PCC, bento/cockpit, breakpoints, state models | `git status --short`; markdown/link validation if available | Product UI implementation |
| Prompt 08 | Component reference headers/classification | `git status --short`; script/grep proof that headers were added | No substantive API rewrite unless required |
| Prompt 09 | Closeout, usage guide, final validation | all prior relevant commands; optional repo docs validation | No scope expansion |

## Candidate Commands

The agent must derive exact scripts from live `package.json` files.

Likely commands:

```bash
git status --short
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/ui-kit build
pnpm --filter @hbc/ui-kit test
pnpm --filter @hbc/ui-kit lint
pnpm format:check
```

If a command does not exist, record it and run the nearest repo-supported equivalent.
