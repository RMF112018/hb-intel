# Prompt 09 — Fresh Reviewer Prompt

## Objective

Act as a fresh-session reviewer and audit whether the Wave 16 developer-readiness gap closure is complete enough for a developer to implement Control Center Settings without further clarification.


## Required Instruction Phrase

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

## Global Guardrails

- Work from `/Users/bobbyfetting/hb-intel`.
- Perform repo-truth verification before editing.
- Do not implement runtime feature code unless this prompt explicitly authorizes it.
- Do not edit `docs/architecture/plans/**` unless this prompt explicitly authorizes that documentation path.
- Do not run broad formatting across the repo.
- Do not mutate `package.json`, `pnpm-lock.yaml`, SPFx manifests, package-solution files, workflows, CI, deployment scripts, or tenant/provisioning settings unless explicitly authorized and justified.
- No backend write routes.
- No direct SPFx writes to SharePoint settings lists.
- No direct Graph, PnP, SharePoint REST, tenant, list, group, permission, Procore, Sage, Autodesk, Power Automate, or external-system runtime mutation.
- No raw secret values in SharePoint, fixtures, SPFx state, audit snapshots, logs, screenshots, test output, or HBI outputs.
- No HBI decision authority, approval authority, legal/claim/accounting/pricing/award authority, or automatic external execution.
- Stage only files authorized by this prompt.
- Capture validation evidence before proposing a commit.


## Allowed Scope

Read-only review. No edits unless separately authorized.

## Review Inputs

Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/
docs/reference/sharepoint/list-schemas/pcc/
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-16/
packages/models/src/pcc/
backend/functions/src/hosts/pcc-read-model/
apps/project-control-center/src/
```

## Review Questions

1. Does the package define a complete runtime DTO/read-model target?
2. Does it define schema-to-model mapping?
3. Does it define fixture scenarios sufficient for implementation tests?
4. Does it define role/action/redaction/disabled-reason behavior?
5. Does it define effective-value resolution algorithm and tests?
6. Does it define change request lifecycle and future command payload without authorizing writes?
7. Does it define Wave 14 handoff payload and routing?
8. Does it define Priority Actions candidate rules?
9. Does it define UI component tree, state ownership, copy, mobile behavior, and accessibility?
10. Does it define HBI allowed/refused behavior and citation payload?
11. Does it define audit event vocabulary and M365 audit separation?
12. Does it define security/secret display rules?
13. Does it define test matrix and acceptance criteria?
14. Does it preserve all hard guardrails?
15. What implementation-readiness gaps remain?


## Required Validation Commands

Run the repo-truth commands before and after changes where applicable:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
git diff --name-only
git diff --cached --name-only
```

Inspect package scripts before selecting package-specific validation:

```bash
cat package.json
cat packages/models/package.json
cat backend/functions/package.json
cat apps/project-control-center/package.json
```

Use only repo-supported scripts confirmed from `package.json`. Likely candidates, subject to repo truth:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

For documentation-only prompts:

```bash
pnpm exec prettier --check <touched markdown/json files>
python3 -m json.tool <touched json file>
```

Do not run `pnpm install`, `pnpm add`, or dependency updates unless separately authorized.


## Final Output

Return:

- readiness verdict: `Ready`, `Ready with minor gaps`, or `Not ready`;
- gap list;
- risk list;
- recommended corrections;
- explicit no-edit statement.
