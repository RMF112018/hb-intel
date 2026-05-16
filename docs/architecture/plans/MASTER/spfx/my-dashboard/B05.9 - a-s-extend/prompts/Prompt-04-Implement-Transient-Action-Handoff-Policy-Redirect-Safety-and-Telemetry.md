# Prompt 04 — Implement Transient Action-Handoff Policy, Redirect Safety, and Telemetry

    ## Objective

    Complete the backend security/control layer around direct action handoff: add the transient URL policy, wire resolver route success/failure logic, and emit safe structured telemetry.

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

    Prompt 03 added the provider client that can resolve signing URLs. The repo still needs:
- a policy layer distinct from durable `sourceOpenUrl` evaluation;
- safe resolver route finalization;
- operational telemetry that excludes sensitive URL material.

    ## Why the current implementation is insufficient

    Without this slice, the route either cannot safely hand off users or risks blurring the durable view-link policy with query-bearing direct action URLs.

    ## Relevant governing doctrine / benchmark authorities

    - Existing `adobe-sign-source-handoff-policy.ts` remains the durable read-model policy.
- Direct-action signing URLs require a distinct transient policy posture.
- Telemetry must be outcome-only.

    ## Exact files, seams, symbols, and patterns to inspect

    Inspect:
```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-source-handoff-policy.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-runtime-diagnostics.ts
backend/functions/src/hosts/my-work-read-model/adobe-sign-action-link-routes.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-action-link-client.ts
backend/functions/src/utils/withTelemetry.ts or the current owning telemetry utility
```
Create:
```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-handoff-policy.ts
```

    ## Required implementation outcome

    Implement:
1. A transient action-handoff URL policy that:
   - allows only HTTPS Adobe-hosted action URLs per current approved-host doctrine;
   - treats URL material as ephemeral;
   - does not persist or log raw URLs;
   - remains separate from `sourceOpenUrl` durable-link policy.
2. Resolver route integration with the provider client and transient policy.
3. Preferred safe handoff behavior:
   - backend redirect when repo route mechanics support it cleanly; otherwise
   - tightly scoped one-time JSON handoff result consumed immediately by the client.
4. Telemetry events:
   ```text
   adobeSign.actionLink.resolve.attempt
   adobeSign.actionLink.resolve.success
   adobeSign.actionLink.resolve.failure
   ```
5. Tests proving:
   - policy accept/reject behavior;
   - raw URL absent from telemetry/error logs;
   - safe normalized route outcomes.

    ## What done really looks like

    Done means the backend resolver is secure enough to expose to the frontend without contaminating the existing durable-link architecture or leaking direct-action URL material.

    ## Proof of closure required

    Required proof:
- transient policy file exists and is distinct from durable source-handoff policy;
- resolver route is materially functional;
- telemetry tests verify safe fields only;
- validation outputs and staged proof are included.

    ## Constraints / prohibited shortcuts

    - Do not rewrite the durable source-handoff policy into a direct-action policy.
- Do not add URL persistence or caching.
- Do not edit frontend CTA behavior in this prompt.
- Do not mutate packages, lockfiles, workflows, or deployment assets.

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
    feat(adobe-sign): add transient action-handoff policy and resolver telemetry
    ```

    Use this commit body, adapting only file counts or validation result lines when truthful:

    ```text
    Secure and finalize the Adobe Sign action-link resolver backend path.

- Add a transient action-handoff URL policy separate from durable sourceOpenUrl handling.
- Wire resolver outcomes through safe handoff logic.
- Emit structured attempt/success/failure telemetry without raw URL leakage.
- Lock the policy and telemetry posture with focused tests.

Validation:
- [paste exact commands and results]

Guardrails:
- Durable row-link policy preserved.
- No URL persistence.
- No lockfile mutation.
    ```

    ## Required final response

    Return:
- **Validation Decision**
- **Repo-Truth Checks Performed**
- **Files Changed**
- **Security / Policy Behavior Implemented**
- **Telemetry Event Matrix**
- **Validation Results**
- **Staged-File Proof**
- **Lockfile md5 Before / After**
- **Explicit Exclusions**
- **Residual Risks**
- **Recommended Next Prompt:** Prompt 05

    ## Critical operating instruction

    Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.
