# Prompt 01 — Revalidate Repo Truth and Freeze Implementation Boundaries

    ## Objective

    Perform a verification-first, read-only implementation-boundary pass for Adobe Sign direct actionability. Confirm that the current local repo truth still matches the package assumptions before any code edits begin.

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

    The package audit was based on pushed repo truth at commit:

```text
06e5fff21c5a3e9ef541f8a86c0e6b9f0f5ac1e1
```

The audit found:
- durable `sourceOpenUrl` plumbing already exists;
- search rows use `sourceOpenUrlCandidate`;
- the durable source-handoff policy excludes signing-endpoint URLs;
- row UI renders links only when `sourceOpenUrl` exists;
- the missing flagship capability is a separate transient direct-action resolver.

    ## Why the current implementation is insufficient

    This package must not drive edits against stale assumptions. If the local repo has moved since the audit, the implementation sequence needs a precise delta record before Prompt 02 begins.

    ## Relevant governing doctrine / benchmark authorities

    - Repo truth is authoritative.
- The hybrid resolver architecture remains the target unless current source truth makes a direct contradiction unavoidable.
- Do not reinterpret this as an opportunity to reopen already-closed decisions without concrete repo evidence.

    ## Exact files, seams, symbols, and patterns to inspect

    Inspect current local versions of:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-source-handoff-policy.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-adapter.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-oauth-service.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-config.ts
backend/functions/src/hosts/my-work-read-model/adobe-sign-oauth-routes.ts
packages/models/src/myWork/AdobeSignActionQueue.ts
packages/models/src/myWork/AdobeSignRecentCompletions.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActivityRow.tsx
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
```

Confirm whether the anticipated seams and names remain current. Record any drift that would affect Prompt 02.

    ## Required implementation outcome

    Produce a concise repo-truth delta note in your response only. Do not edit files, do not stage files, and do not commit.

The output must answer:
1. Does the local repo still support the same target architecture?
2. Did any owning file names or route seams move?
3. Did any implementation already land that changes Prompt 02?
4. Are there unrelated dirty files that must be avoided?

    ## What done really looks like

    Done means the implementation path is either confirmed as still valid or the exact local drift is documented with enough precision to update subsequent prompt execution without guessing.

    ## Proof of closure required

    Required proof:
- raw preflight command output;
- concise file/seam verification notes;
- explicit statement that no files were edited;
- explicit recommendation: proceed to Prompt 02 / pause for package refresh.

    ## Constraints / prohibited shortcuts

    - Read-only only.
- Do not edit, stage, commit, format, run installs, or mutate generated artifacts.
- Do not change package files, lockfiles, manifests, workflows, tenant settings, or backend config.
- Do not perform live Adobe calls.

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
    audit(adobe-sign): revalidate action-link resolver implementation boundaries
    ```

    Use this commit body, adapting only file counts or validation result lines when truthful:

    ```text
    Read-only repo-truth revalidation for the Adobe Sign direct actionability implementation package. No source files changed.
    ```

    ## Required final response

    Return:
- **Validation Decision:** Proceed to Prompt 02 / Pause for package refresh
- **Repo-Truth Checks Performed**
- **Findings**
- **Unrelated Dirty State**
- **Exact Drift That Changes Later Prompts**, if any
- **Required Follow-Up**

    ## Critical operating instruction

    Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.
