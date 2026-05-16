# Prompt 07 — Harden OAuth Scope, Reconsent, and Unsupported Action-Type Handling

    ## Objective

    Close the scope and operational correctness lane: make resolver failures caused by insufficient Adobe scope or unsupported/no-action URL conditions explicit, reconnect-aware, and test-backed.

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

    The existing repo reads governed OAuth scopes from `ADOBE_SIGN_OAUTH_SCOPES` and persists granted scopes. The resolver path may require scope beyond a prior grant’s current permission envelope. The feature must not degrade into ambiguous unavailable states.

    ## Why the current implementation is insufficient

    Without explicit scope/reconsent and unsupported-action handling, the new CTA could fail without giving the user or operator a correct explanation.

    ## Relevant governing doctrine / benchmark authorities

    - Scope insufficiency is a first-class resolver outcome.
- Existing user grants must not be assumed sufficient after scope expansion.
- The feature must support all six HB action categories with truthful normalized outcomes, even where Adobe yields no direct URL.

    ## Exact files, seams, symbols, and patterns to inspect

    Inspect:
```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-config.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-oauth-service.ts
backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-grant-record.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-token-service.ts
backend/functions/src/hosts/my-work-read-model/adobe-sign-action-link-routes.ts
packages/models/src/myWork/AdobeSignActionQueue.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
```
Also inspect tests adjacent to these seams.

    ## Required implementation outcome

    Implement:
1. Resolver-side scope insufficiency detection using existing grant/scope truth.
2. A reconnect / reauthorization signal path that can be surfaced truthfully in the UI.
3. Explicit handling for:
   - no usable action URL returned;
   - action type supported by HB model but not resolved by Adobe for that row;
   - stale grant scope relative to required resolver path.
4. Tests for:
   - sufficient scope;
   - insufficient scope;
   - stale grant / reconnect recommendation;
   - no-action-url fallback;
   - all six action types flowing through a normalized capability/result path.
5. Documentation-free source comments only when materially needed; do not create broad planning docs.

    ## What done really looks like

    Done means the resolver no longer hides scope or unsupported-action failures inside generic unavailable states, and the UI/contract can represent those cases accurately.

    ## Proof of closure required

    Required proof:
- exact insufficiency detection point;
- exact reconnect / reauthorization user-state path;
- action-type normalization matrix;
- validation outputs and staged proof.

    ## Constraints / prohibited shortcuts

    - Do not add new Adobe scopes blindly without checking the repo’s config posture and prompt-level need.
- Do not mutate deployment secrets or live app settings.
- Do not perform a production rollout from the local agent.
- Do not dilute failure states into generic fallback copy.

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
    feat(adobe-sign): harden resolver scope and unsupported-action states
    ```

    Use this commit body, adapting only file counts or validation result lines when truthful:

    ```text
    Harden Adobe Sign direct-action resolution around scope truth and unsupported/no-action outcomes.

- Detect insufficient or stale grant scope for the resolver path.
- Surface reconnect-aware, closed resolver states instead of opaque failures.
- Normalize no-action-url and unsupported provider outcomes across the six HB action classes.
- Add focused tests for scope sufficiency, stale grants, reconnect guidance, and action-type fallback.

Validation:
- [paste exact commands and results]

Guardrails:
- No live settings mutation.
- No broad doc changes.
- Lockfile unchanged.
    ```

    ## Required final response

    Return:
- **Validation Decision**
- **Repo-Truth Checks Performed**
- **Files Changed**
- **Scope / Reconsent Behavior Implemented**
- **Action-Type Outcome Matrix**
- **Validation Results**
- **Staged-File Proof**
- **Lockfile md5 Before / After**
- **Explicit Exclusions**
- **Residual Risks**
- **Recommended Next Prompt:** Prompt 08

    ## Critical operating instruction

    Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.
