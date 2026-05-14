
# My Projects Source-List Provisioning — Local Code-Agent Prompt Package

Prepared: 2026-05-14  
Repo: `RMF112018/hb-intel`  
Branch target: `main` or a fresh feature branch from current `main`

## Objective

Implement the recommended provisioning method from the audit: a dedicated, repo-native, operator-gated TypeScript provisioner for the My Projects source-list schema expansion.

## Recommended prompt execution order

1. `Prompt-01-Shared-SharePoint-Schema-Provisioning-Utilities.md`
2. `Prompt-02-My-Projects-Source-List-Schema-Descriptor.md`
3. `Prompt-03-Dedicated-My-Projects-Source-List-Provisioner.md`
4. `Prompt-04-Verification-Backfill-And-Operator-Runbook-Integration.md`
5. `Prompt-05-Tests-Evidence-And-Closeout.md`

## Non-negotiable safety posture

- No tenant mutation without explicit `--apply`.
- Dry-run must be default.
- Do not create or recreate the `Projects` or `Legacy Project Fallback Registry` lists.
- Do not delete/recreate fields automatically.
- Wrong-type fields are blockers.
- Isolate `FolderWebUrl` drift from the My Projects schema delta.
- Keep SPFx `access_as_user` separate from app-only provisioning identity.
- Preserve existing legacy fallback behavior after shared utility extraction.
