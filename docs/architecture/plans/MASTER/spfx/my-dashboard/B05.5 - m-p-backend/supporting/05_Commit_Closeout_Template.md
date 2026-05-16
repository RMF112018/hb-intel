# Supporting 05 — Commit and Closeout Template

## Purpose

This file provides the expected closeout format and suggested commit text for the two prompts in this package.

---

# Prompt 01 Suggested Commit

## Summary

```text
functions(graph): federate SharePoint Graph access through HB SharePoint Creator
```

## Description

```text
Route backend Graph-backed SharePoint list access through the HB SharePoint Creator app registration using the Function App user-assigned managed identity as a federated assertion credential.

- Add a federated Graph token provider based on ManagedIdentityCredential + ClientAssertionCredential.
- Exchange the Function App UAMI assertion for an HB SharePoint Creator application token before requesting Microsoft Graph.
- Rewire GraphListClient to use the shared federated token source while preserving existing Graph list/site/item behavior.
- Preserve My Projects runtime diagnostics so token/federation failures remain classifiable as token-stage failures.
- Keep Adobe Sign OAuth, refresh-token/grant-store behavior, and Function App UAMI Table Storage posture unchanged.
- Add focused tests for token exchange, required configuration, safe failures, and diagnostics compatibility.
```

---

# Prompt 02 Suggested Commit

## Summary

```text
docs(graph): document federated HB SharePoint Creator runtime path
```

## Description

```text
Document the standardized SharePoint/Graph runtime model in which the Function App user-assigned managed identity federates into the HB SharePoint Creator app registration before downstream Microsoft Graph access.

- Capture the UAMI-to-app trust posture and required app-setting relationships.
- Preserve the distinction between Function App UAMI Azure-resource access and HB SharePoint Creator Graph/SharePoint authorization.
- Add the hosted runtime proof sequence for validating My Projects after backend deployment.
- Retain existing My Projects loader telemetry guidance for diagnosing any remaining downstream failures.
```

---

# Prompt Closeout Response Format

Use this structure after each prompt execution.

## 1. Verdict
- State whether the objective is complete.
- State whether any repo-truth drift forced a deviation.

## 2. Files Changed
- List every changed file.

## 3. Key Implementation or Documentation Details
- Explain only the changes material to the prompt objective.

## 4. Validation Ledger
- List every command run and exact outcome.

## 5. Remaining Proof / Operator Steps
- State what must happen next.

## 6. Commit
- Provide recommended summary and description.
- Do not push or deploy unless explicitly authorized.

---

# Worktree Discipline

If unrelated modifications exist, state:

```text
Unrelated pre-existing modifications remain unstaged and were not touched.
```

Then list them if needed for operator clarity.
