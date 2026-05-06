# 00 — Context-Efficiency Rules

## Objective

Prevent local-agent token waste during PCC shell remediation while preserving engineering discipline.

## Binding Rules for Every Prompt

1. **Use active context first.**
   - Do not re-read a file that is already in current context and has not changed.
   - Do not re-open files just to confirm what the prompt already states unless exact line text is needed for an edit.

2. **Read only targeted files.**
   - Read a file only when:
     - it is being edited,
     - it defines a type/import used by an edited file,
     - a test failure points to it,
     - current context is stale after a prior prompt changed it,
     - an exact command result, path, or line is needed for closeout accuracy.

3. **No broad repo-truth loops.**
   - Do not run broad searches like `grep -R`, `find`, or repo-wide scans unless a prompt explicitly names the pattern and reason.
   - Prefer targeted searches under `apps/project-control-center/src/**` only.

4. **No repeated doctrine rereads.**
   - Doctrine and plan authority are embedded in this package.
   - Re-read doctrine docs only if an implementation conflict arises or the prompt explicitly requires a direct citation in a closeout.

5. **Use commands as truth for validation, not exploratory reading.**
   - Typecheck, focused tests, full tests, build, Prettier, lockfile hash, and git diff are the validation source of truth.
   - Do not compensate for failed commands by browsing unrelated files.

6. **Carry forward closeout results.**
   - Each prompt should use the immediately prior prompt closeout as context.
   - Do not re-read all older closeouts unless a specific unresolved item is being addressed.

7. **Stop before scope expansion.**
   - If a prompt requires files outside its allowed list, stop and report the required expansion.
   - Do not silently broaden scope to surfaces, backend, manifests, or shared packages.

## Minimal Baseline Checks Per Runtime Prompt

At the start of a runtime prompt, run:

```bash
git status --short
md5 pnpm-lock.yaml
```

Do not run `git rev-parse HEAD` unless the prompt asks for commit baseline or the closeout requires it.

## Reads Allowed by Default

Unless the prompt says otherwise, the agent may read:

- files it will edit,
- co-located tests it will update,
- the immediately prior prompt closeout,
- this package’s relevant spec file,
- exact TypeScript type definitions required to compile.

## Reads Not Allowed by Default

Do not read by default:

- unrelated surfaces,
- backend functions,
- `@hbc/models` internals beyond exported surface ID/type usage,
- `@hbc/ui-kit` internals unless importing a component and needing its public API,
- old archived plans,
- broad doctrine folders,
- unrelated SharePoint app packages.

## Closeout Language

Every closeout must include a short “Context Efficiency” section:

```text
Context Efficiency:
- Relied on active context for: <list>.
- Re-read only: <list>.
- Did not perform broad repo audit.
```
