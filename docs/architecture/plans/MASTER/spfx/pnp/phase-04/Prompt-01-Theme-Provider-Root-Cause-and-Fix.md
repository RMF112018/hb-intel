# Prompt-01 — Theme Provider Root Cause and Fix

## Objective
Identify and fix the exact missing-theme-provider wiring that causes the PnP Operations webpart to crash during render in SharePoint.

## Prompt

```text
Conduct a focused repo-truth audit of the PnP Operations render path and implement the correct fix for the current runtime failure.

Primary symptom to resolve:
`[HBC] useHbcTheme must be called inside <HbcThemeProvider>. Wrap your application root with HbcThemeProvider.`

Required tasks:

1. Trace the complete PnP Operations render path from the SPFx shell to the React component tree.
   - Confirm the webpart ID registration path.
   - Confirm how `PnpOps` is mounted.
   - Confirm where `@hbc/ui-kit/homepage` components are first introduced.

2. Identify the existing theme-provider pattern already used elsewhere in the repo for HBC UI components.
   - Search for `HbcThemeProvider` usage.
   - Determine whether working webparts wrap at:
     a. the mount/root level,
     b. an intermediate composition boundary, or
     c. inside the component itself.

3. Choose the best-fit fix location for PnP Operations.
   - Prefer the solution most consistent with existing hb-webparts architecture.
   - Avoid introducing duplicate or inconsistent theme-provider nesting unless clearly justified.

4. Implement the fix.
   - Ensure the PnP Operations webpart receives valid theme context before any HBC UI hook/component renders.
   - Keep the fix narrow and avoid unrelated refactors.

5. Verify no additional missing-provider issues appear immediately behind this one.
   - Check for any other required root providers used by the same UI-kit surface.
   - If found, wire only what is necessary and document it.

6. Document exactly what changed and why.

Important constraints:
- Do not re-read files that are still in your current context unless necessary after edits.
- Do not perform speculative refactors.
- Do not stop at “it compiles”; verify the render path is structurally correct.

Required output:
- Root cause summary.
- Exact files changed.
- Why the chosen provider location is the correct repo-consistent fix.
- Any assumptions or follow-up concerns.
```
