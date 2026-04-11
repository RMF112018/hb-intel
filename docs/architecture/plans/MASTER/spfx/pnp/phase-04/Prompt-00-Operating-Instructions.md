# Prompt-00 — Operating Instructions

## Objective
Execute a tightly scoped repair of the PnP Operations SharePoint webpart so that it renders successfully in SharePoint after deployment. The immediate known blocker is a runtime crash caused by missing `HbcThemeProvider` context around a webpart that uses `@hbc/ui-kit/homepage` components.

## Required Working Method

```text
You are working directly in the live local repo.

Follow these rules exactly:

1. Treat live repo code as the primary source of truth.
2. Do not re-read files that are still within your active context window or memory unless needed to verify drift after edits.
3. Do not broaden scope into runner/backend refactors unless required to complete this specific render fix.
4. Before changing code, identify the exact render path for the PnP Operations webpart and the exact place where theme context should be supplied.
5. Prefer the most repo-consistent solution already used by other working surfaces that rely on HBC UI theme hooks/components.
6. If multiple valid provider-wiring options exist, choose the one that is most consistent with existing hb-webparts runtime architecture and explain why.
7. Add regression protection so this specific category of failure is caught before SharePoint deployment.
8. After changes, rebuild/package fresh artifacts and verify that the packaged output reflects the code you changed.
9. Produce a closure report with concrete evidence, not assumptions.
```

## Current Known Runtime Symptom

```text
Uncaught Error: [HBC] useHbcTheme must be called inside <HbcThemeProvider>. Wrap your application root with HbcThemeProvider.
```

## Known Relevant Areas

```text
apps/hb-webparts/src/webparts/pnp/
apps/hb-webparts/src/mount.tsx
tools/spfx-shell/src/webparts/shell/ShellWebPart.ts
tools/build-spfx-package.ts
```

## Deliverables

```text
1. The code fix.
2. Regression guardrails/tests.
3. Fresh rebuilt package output.
4. A concise closure report proving the theme-context crash is addressed.
```
