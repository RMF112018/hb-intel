# Prompt-02 — Regression Guardrails and Tests

## Objective
Add targeted regression protection so a future missing-`HbcThemeProvider` error is caught before deployment to SharePoint.

## Prompt

```text
Now that the provider-wiring fix is implemented, add narrowly tailored regression safeguards for this failure mode.

Required tasks:

1. Audit current test coverage for the PnP Operations webpart and its mount path.
   - Identify what existing tests prove.
   - Identify what they do not prove.

2. Add the strongest practical low-cost regression check(s) for this exact issue.
   Candidate options may include:
   - a render test for the PnP webpart path that fails if required theme context is missing,
   - a mount-path smoke test that exercises the PnP registration branch,
   - a targeted invariant/assertion near the render boundary,
   - a packaging/build verification check if that is the best place to catch the issue early.

3. Prefer checks that are:
   - deterministic,
   - fast,
   - easy to maintain,
   - directly tied to this crash category.

4. If there is already a reusable provider wrapper/test helper in the repo, use it instead of inventing a new pattern.

5. Keep scope tight.
   - Do not build an entire new test harness unless truly required.
   - Do not add broad platform testing unrelated to this issue.

6. Report:
   - what guardrail(s) were added,
   - what exact failure they catch,
   - what they still do not prove.

Important constraints:
- Do not re-read files already in active context unless needed to verify after edits.
- Keep the fix minimal but meaningful.
- The goal is prevention of this specific runtime regression.
```
