# Prompt 08 — Complete Test Coverage, Validation Gates, and Release Proof

    ## Objective

    Perform the final integrated closeout for Adobe Sign direct actionability. Verify the implementation as a complete system, fill any test gaps discovered during integration, and produce release-proof evidence in the final report.

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

    Prompts 02–07 should have delivered:
- resolver contracts and route;
- live signing URL client;
- transient handoff policy and telemetry;
- Action Queue capability metadata;
- frontend `Act now` UX;
- OAuth/reconsent and unsupported-action hardening.

    ## Why the current implementation is insufficient

    The implementation is not complete until integrated validation proves the pieces work together, the repo remains clean, and no security-sensitive regression slipped through.

    ## Relevant governing doctrine / benchmark authorities

    - Validation must be end-to-end enough to prove architecture closure locally.
- Do not stop at isolated unit-green status if integrated tests reveal wiring gaps.
- Any necessary test-only or small remediation source changes discovered during Prompt 08 are permitted if strictly required to close the implementation.

    ## Exact files, seams, symbols, and patterns to inspect

    Re-read only owning files/tests necessary to verify and close:
```text
backend/functions/src/hosts/my-work-read-model/adobe-sign-action-link-routes.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-link-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-action-link-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-handoff-policy.ts
packages/models/src/myWork/AdobeSignActionQueue.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
adjacent tests
```

    ## Required implementation outcome

    Execute:
1. Review integrated diff for architecture violations.
2. Add any narrowly missing tests required for complete closure.
3. Run the prompt’s full validation set, including:
   ```bash
   git diff --check
   pnpm --filter @hbc/spfx-my-dashboard check-types
   pnpm --filter @hbc/spfx-my-dashboard test
   ```
   Plus the authoritative backend validation commands discovered from current repo truth.
4. Confirm no direct action URL appears in:
   - read-model DTOs;
   - fixtures;
   - telemetry/event payloads;
   - error responses.
5. Produce final implementation report in the response.

    ## What done really looks like

    Done means the implementation is fully validated, the staged diff is exact, known risks are explicit, and the next step is hosted operator validation rather than more source ambiguity.

    ## Proof of closure required

    Required proof:
- full validation command list and exact results;
- changed files list;
- lockfile md5 before/after;
- staged file proof;
- architecture conformance statement;
- remaining hosted-only validation needs;
- recommended deployment/hosted validation next action.

    ## Constraints / prohibited shortcuts

    - Do not stage unrelated drift.
- Do not add new features beyond closure gaps.
- Do not mutate deployment assets, manifests, workflows, or lockfiles.
- Do not perform live Adobe actions or tenant changes.

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
    test(adobe-sign): close direct actionability validation and release proof
    ```

    Use this commit body, adapting only file counts or validation result lines when truthful:

    ```text
    Complete integrated validation for Adobe Sign direct actionability.

- Review the final implementation against the hybrid resolver architecture.
- Fill any narrowly scoped test or wiring gaps required for closure.
- Run the full local validation matrix and prove no sensitive URL persistence or telemetry leakage.
- Produce release-ready closeout notes with residual hosted-validation requirements.

Validation:
- [paste exact commands and results]

Guardrails:
- No unrelated drift staged.
- No lockfile mutation.
- Hosted validation remains operator-owned after deploy.
    ```

    ## Required final response

    Return:
- **Validation Decision:** Approved for hosted validation / Needs follow-up / Do not deploy yet
- **Repo-Truth Checks Performed**
- **Files Changed**
- **Integrated Architecture Review**
- **Validation Results**
- **Sensitive-Data Absence Checks**
- **Staged-File Proof**
- **Lockfile md5 Before / After**
- **Explicit Exclusions**
- **Residual Risks**
- **Hosted Validation Steps to Run Next**

    ## Critical operating instruction

    Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.
