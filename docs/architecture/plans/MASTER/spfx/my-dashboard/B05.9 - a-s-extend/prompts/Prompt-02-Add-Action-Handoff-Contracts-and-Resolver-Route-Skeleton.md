# Prompt 02 — Add Action-Handoff Contracts and Resolver Route Skeleton

    ## Objective

    Implement the first source slice for Adobe Sign direct actionability: define the backend resolver request/result contracts and add the protected resolver route skeleton without yet implementing the full provider-resolution client.

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

    Repo truth currently provides:
- durable view-link DTOs via `sourceOpenUrl`;
- source-handoff URL policy for durable row links;
- OAuth actor/token seams;
- protected My Work route patterns;
- no direct-action resolver route.

    ## Why the current implementation is insufficient

    The app cannot offer true row-level action handoff until a stable protected backend resolver contract and route exist. Adding provider logic before the route/result contract is frozen would create drift and rework.

    ## Relevant governing doctrine / benchmark authorities

    - Preserve read-model-first architecture.
- Do not store direct action URLs in read models.
- Resolver route belongs under authenticated `/me/...` posture.
- Outcome vocabulary must be closed and security-safe.

    ## Exact files, seams, symbols, and patterns to inspect

    Re-read only the owning files necessary to implement the route and contract:
```text
backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts
backend/functions/src/hosts/my-work-read-model/routes or equivalent current route registration patterns
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-principal-resolution.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-token-service.ts
apps/my-dashboard/src/api/myWorkReadModelClient.ts
packages/models/src/myWork/AdobeSignActionQueue.ts
```
Create or adapt the new owning resolver route file named, unless current repo conventions require a nearby equivalent:
```text
backend/functions/src/hosts/my-work-read-model/adobe-sign-action-link-routes.ts
```

    ## Required implementation outcome

    Implement:
1. Resolver request contract containing `itemId`, `agreementId`, and `requiredAction`.
2. Resolver normalized result union / response shape covering:
   - redirect-ready
   - invalid-input
   - authorization-required
   - principal-unresolved
   - scope-insufficient
   - source-unavailable
   - not-ready
   - no-action-url
   - rate-limited
   - policy-rejected
3. Protected route skeleton:
   ```text
   POST /api/my-work/me/adobe-sign/action-link/resolve
   ```
4. Input validation and closed rejection behavior.
5. Focused route tests proving the path exists, auth posture is correct, and malformed input is rejected safely.

    ## What done really looks like

    Done means the repo has a stable route entrypoint and result vocabulary that later prompts can build on without reopening basic contract shape decisions.

    ## Proof of closure required

    Required proof:
- file list changed;
- validation commands run and exact results;
- test coverage added for route existence and invalid input;
- staged-file proof before commit;
- lockfile md5 before/after unchanged.

    ## Constraints / prohibited shortcuts

    - Do not implement the live signing URL client in this prompt.
- Do not implement transient URL policy in this prompt.
- Do not change frontend rendering in this prompt.
- Do not mutate `pnpm-lock.yaml`, package dependencies, manifests, workflows, tenant settings, or deployment assets.

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
    feat(adobe-sign): add protected action-link resolver route contract
    ```

    Use this commit body, adapting only file counts or validation result lines when truthful:

    ```text
    Establish the protected Adobe Sign action-link resolver boundary for My Dashboard.

- Add the resolver request/result contract and closed outcome vocabulary.
- Register the authenticated `POST /api/my-work/me/adobe-sign/action-link/resolve` route skeleton.
- Reject malformed input safely without exposing provider or URL material.
- Add focused route/contract tests that lock the new boundary before provider implementation begins.

Validation:
- [paste exact commands and results]

Guardrails:
- No lockfile mutation.
- No frontend changes.
- No provider client implementation yet.
    ```

    ## Required final response

    Return:
- **Validation Decision**
- **Repo-Truth Checks Performed**
- **Files Changed**
- **Implementation Notes**
- **Validation Results**
- **Staged-File Proof**
- **Lockfile md5 Before / After**
- **Explicit Exclusions**
- **Residual Risks**
- **Recommended Next Prompt:** Prompt 03

    ## Critical operating instruction

    Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.
