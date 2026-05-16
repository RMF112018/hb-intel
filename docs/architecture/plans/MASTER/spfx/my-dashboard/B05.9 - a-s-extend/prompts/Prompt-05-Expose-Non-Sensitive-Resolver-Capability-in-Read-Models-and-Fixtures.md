# Prompt 05 — Expose Non-Sensitive Resolver Capability in Read Models and Fixtures

    ## Objective

    Extend the Action Queue read-model path so the frontend can truthfully decide whether to render an `Act now` CTA, without carrying or persisting direct action URLs.

    ## Mandatory preflight

    Re-run and paste raw output for:

    ```bash
    git status --short
    git branch --show-current
    git rev-parse HEAD
    git log --oneline -20
    md5 pnpm-lock.yaml
    ```

    Record unrelated pre-existing drift explicitly. Do not stage it. Do not overwrite it.

    ## Current-state repo-truth

    The backend resolver now exists. The Action Queue read model still needs a safe capability signal so the frontend can distinguish:
- rows that can attempt click-time action resolution;
- rows that should be view-only;
- rows that are unavailable or reconnect-bound.

    ## Why the current implementation is insufficient

    If the UI infers actionability ad hoc, it will either lie to users or reintroduce provider assumptions into SPFx. The read model must supply non-sensitive capability metadata.

    ## Relevant governing doctrine / benchmark authorities

    - Read models may carry capability semantics.
- Read models must not carry direct signing URL values.
- Durable `sourceOpenUrl` remains view/open only.

    ## Exact files, seams, symbols, and patterns to inspect

    Inspect and update:
```text
packages/models/src/myWork/AdobeSignActionQueue.ts
packages/models/src/myWork/fixtures/adobeSignActionQueueReadModels.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts
apps/my-dashboard/src/state/myWorkCardViewModel.ts
packages/models/src/myWork/index.ts or equivalent barrel if needed
```
Inspect Recent Completions only to avoid accidental regression:
```text
packages/models/src/myWork/AdobeSignRecentCompletions.ts
packages/models/src/myWork/fixtures/adobeSignRecentCompletionsReadModels.ts
```

    ## Required implementation outcome

    Implement:
1. Non-sensitive Action Queue handoff capability metadata:
   - `resolve-on-click`
   - `view-only`
   - `unavailable`
   - closed reason codes when helpful.
2. Adapter logic that attaches capability metadata without provider URL hydration.
3. Fixture updates:
   - resolver-capable rows;
   - unavailable/view-only rows where needed;
   - no `esignUrl` or direct action target.
4. VM pass-through fields needed for the frontend.
5. Contract and selector tests.

    ## What done really looks like

    Done means the frontend can make a truthful CTA decision from read-model truth alone, while direct-action URLs remain wholly outside read-model storage.

    ## Proof of closure required

    Required proof:
- exact DTO shape;
- adapter mapping;
- fixture coverage;
- test coverage proving no direct URLs are introduced;
- staged and validation proof.

    ## Constraints / prohibited shortcuts

    - Do not edit frontend row JSX/CTA rendering in this prompt.
- Do not alter completed-item behavior except to preserve compatibility.
- Do not add direct URL fields to DTOs.

    ## Required staging discipline

    - Do not use `git add .`.
    - Stage only explicit files that belong to this prompt.
    - Before commit, paste:

    ```bash
    git status --short
    git diff --stat
    git diff --cached --stat
    git diff --check
    md5 pnpm-lock.yaml
    ```

    - Confirm `pnpm-lock.yaml` md5 is unchanged from preflight unless the prompt explicitly authorized a lockfile change. This package does not authorize lockfile changes.

    ## Commit requirement

    Use this exact commit summary:

    ```text
    feat(adobe-sign): expose safe action-handoff capability metadata
    ```

    Use this commit body, adapting only file counts or validation result lines when truthful:

    ```text
    Add non-sensitive resolver capability metadata to Adobe Sign Action Queue read models.

- Extend contracts and adapters so SPFx can render truthful action CTAs.
- Update fixtures and selector tests for resolver-capable, view-only, and unavailable states.
- Preserve completed-item view-link behavior and keep direct action URLs out of DTOs.

Validation:
- [paste exact commands and results]

Guardrails:
- No direct signing URL persistence.
- No frontend row rendering changes yet.
- Lockfile unchanged.
    ```

    ## Required final response

    Return:
- **Validation Decision**
- **Repo-Truth Checks Performed**
- **Files Changed**
- **Contract Shape Added**
- **Fixture/Selector Behavior**
- **Validation Results**
- **Staged-File Proof**
- **Lockfile md5 Before / After**
- **Explicit Exclusions**
- **Residual Risks**
- **Recommended Next Prompt:** Prompt 06

    ## Critical operating instruction

    Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.
