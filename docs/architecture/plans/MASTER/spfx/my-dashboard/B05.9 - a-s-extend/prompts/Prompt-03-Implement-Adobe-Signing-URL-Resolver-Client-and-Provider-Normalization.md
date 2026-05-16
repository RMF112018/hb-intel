# Prompt 03 — Implement Adobe Signing URL Resolver Client and Provider Normalization

    ## Objective

    Implement the live Adobe provider client that resolves direct action URLs through the official signing URL endpoint and normalizes provider response/error posture for the backend resolver route.

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

    Prompt 02 established the resolver route boundary and result contract. The repo still lacks the provider client that can call Adobe, parse signing URL responses, choose the correct participant URL, and collapse provider failures into safe application outcomes.

    ## Why the current implementation is insufficient

    Without this provider client, the route is only a skeleton and the dashboard cannot actually produce direct handoff behavior.

    ## Relevant governing doctrine / benchmark authorities

    - Primary provider mechanism is Signing URL lookup for direct actionability.
- Calls must be bounded and closed-enum normalized.
- No raw provider JSON should escape.
- No direct action URL may be logged.

    ## Exact files, seams, symbols, and patterns to inspect

    Inspect only the fresh owning files required:
```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-oauth-service.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-token-service.ts
backend/functions/src/hosts/my-work-read-model/adobe-sign-action-link-routes.ts
```
Create:
```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-link-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-action-link-client.ts
```

    ## Required implementation outcome

    Implement:
1. An internal client seam for action-link resolution.
2. A live HTTP adapter for:
   ```text
   GET /api/rest/v6/agreements/{agreementId}/signingUrls
   ```
3. Safe parsing of signing URL response structures.
4. Recipient-match logic that chooses the actor-relevant participant URL where possible.
5. Normalized closed outcomes for:
   - ok / redirect-ready candidate
   - unauthorized
   - not-ready / document-not-yet-available
   - no-action-url
   - no-recipient-match
   - rate-limited
   - http-4xx / http-5xx
   - malformed-response
   - network / timeout
   - invalid access point
6. Tests for success, multiple URL sets, recipient mismatch, malformed body, 401/403, 404, 429, 5xx, network, and timeout.

    ## What done really looks like

    Done means the resolver has a production-grade provider client seam that is narrow, deterministic, test-backed, and does not leak sensitive direct-action URL material outside success handoff handling.

    ## Proof of closure required

    Required proof:
- new client seam files created;
- route composes with the client or is ready to do so in the next prompt as defined by the current file map;
- normalized error tests are present;
- no URL material appears in telemetry or failure logs;
- staged proof and validation outputs included.

    ## Constraints / prohibited shortcuts

    - Do not persist signing URLs in DTOs or fixtures.
- Do not prefetch signing URLs in queue-read adapters.
- Do not broaden package dependencies.
- Do not change frontend files in this prompt.

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
    feat(adobe-sign): implement live signing-url resolver client
    ```

    Use this commit body, adapting only file counts or validation result lines when truthful:

    ```text
    Add the Adobe Sign provider client for direct action handoff.

- Introduce the action-link client seam and live signing-url HTTP adapter.
- Normalize provider success and failure states into the protected resolver vocabulary.
- Match participant URLs to the current actor where possible without leaking raw response bodies.
- Cover success, participant mismatch, not-ready, rate-limited, malformed, and transport failure paths with focused tests.

Validation:
- [paste exact commands and results]

Guardrails:
- No direct action URLs persisted.
- No lockfile changes.
- No frontend edits in this slice.
    ```

    ## Required final response

    Return:
- **Validation Decision**
- **Repo-Truth Checks Performed**
- **Files Changed**
- **Provider Normalization Matrix Implemented**
- **Validation Results**
- **Staged-File Proof**
- **Lockfile md5 Before / After**
- **Explicit Exclusions**
- **Residual Risks**
- **Recommended Next Prompt:** Prompt 04

    ## Critical operating instruction

    Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.
