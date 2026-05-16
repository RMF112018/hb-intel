# Prompt 06 — Implement Frontend `Act now` CTA, Resolve State, and Fallback UX

    ## Objective

    Implement the user-facing actionability layer in the Adobe Sign card so action queue rows expose direct action handoff clearly and completed rows remain view-oriented.

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

    The backend route, provider client, transient safety policy, and Action Queue capability metadata are now expected to exist. The card still needs to expose that capability with direct, trustworthy interaction behavior.

    ## Why the current implementation is insufficient

    Without this slice, the backend feature exists but users cannot access it from My Dashboard.

    ## Relevant governing doctrine / benchmark authorities

    - Queue rows are action-oriented.
- Completed rows are view-oriented.
- Loading/failure states must be visible and row-local where practical.
- UX must never imply success before resolver success occurs.

    ## Exact files, seams, symbols, and patterns to inspect

    Inspect:
```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActivityList.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActivityRow.tsx
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
```
Inspect module-local test files and styling modules only as needed to implement cleanly.

    ## Required implementation outcome

    Implement:
1. `Act now` CTA for Action Queue rows with resolver capability.
2. `Opening…` / resolving state after click.
3. Backend resolver invocation using the route contract established earlier.
4. Success handling:
   - redirect/open as dictated by backend response shape.
5. Failure handling:
   - truthful inline or localized error state;
   - preserve durable `View` fallback if present.
6. Completed/history row CTA label as `View` when `sourceOpenUrl` exists.
7. Vitest/React coverage for:
   - CTA visibility;
   - resolving state;
   - failure state;
   - completed row View behavior;
   - no misleading CTA when unavailable.

    ## What done really looks like

    Done means a user can act from the queue row through a clear CTA and the card degrades visibly and truthfully when the resolver cannot complete.

    ## Proof of closure required

    Required proof:
- screenshots are not required unless the repo’s established test/evidence workflow demands them;
- tests demonstrate CTA state changes;
- exact API client method or browser-navigation path documented in closeout;
- staged and validation proof included.

    ## Constraints / prohibited shortcuts

    - Do not redesign the whole Adobe Sign card.
- Do not add new tabs or restructure the module beyond what direct actionability requires.
- Do not invent unsupported copy.
- Do not leak direct action URLs into persisted frontend state.

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
    feat(adobe-sign): add direct action row CTA and resolver UX
    ```

    Use this commit body, adapting only file counts or validation result lines when truthful:

    ```text
    Deliver the My Dashboard Adobe Sign direct-action user experience.

- Add `Act now` queue-row interaction backed by the protected resolver route.
- Handle resolving, success, and failure states without misleading copy.
- Preserve durable fallback View behavior where available.
- Keep completed rows view-oriented and validate the full interaction matrix with focused frontend tests.

Validation:
- [paste exact commands and results]

Guardrails:
- No card-wide redesign.
- No sensitive URL persistence.
- Lockfile unchanged.
    ```

    ## Required final response

    Return:
- **Validation Decision**
- **Repo-Truth Checks Performed**
- **Files Changed**
- **CTA / State Behavior Implemented**
- **Validation Results**
- **Staged-File Proof**
- **Lockfile md5 Before / After**
- **Explicit Exclusions**
- **Residual Risks**
- **Recommended Next Prompt:** Prompt 07

    ## Critical operating instruction

    Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.
