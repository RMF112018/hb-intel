# PnP Operations Theme Provider Gap Closure — Targeted Prompt Package

This package is narrowly focused on the **actual current render blocker** for the SharePoint PnP Operations webpart:

- The webpart loads in SharePoint.
- The shell entry renders.
- The React tree crashes with:
  - `[HBC] useHbcTheme must be called inside <HbcThemeProvider>. Wrap your application root with HbcThemeProvider.`

## Package Contents

- `Prompt-00-Operating-Instructions.md`
- `Prompt-01-Theme-Provider-Root-Cause-and-Fix.md`
- `Prompt-02-Regression-Guardrails-and-Tests.md`
- `Prompt-03-Build-Package-Deploy-Validation.md`
- `Prompt-04-Final-Closure-Report.md`

## Intended Use

Run these prompts in order with your local code agent.

The goals are to:
1. Fix the missing `HbcThemeProvider` wiring for the PnP Operations render path.
2. Keep the fix aligned with repo truth and existing HBC UI patterns.
3. Add regression safeguards so future packages fail before SharePoint runtime does.
4. Rebuild and validate that the webpart renders without the theme-context crash.
