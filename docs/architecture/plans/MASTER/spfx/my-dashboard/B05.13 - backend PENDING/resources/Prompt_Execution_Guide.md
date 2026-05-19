# Resource | Prompt Execution Guide

## Purpose

Guide Bobby and the local code agent through the package prompt set without losing sequencing or mixing infrastructure, code, migration, and validation tasks.

---

# 1. Recommended Operating Mode

For each prompt:

1. Start a fresh local-agent session when the prompt says so.
2. Provide the referenced package files to the agent if needed.
3. The agent should revalidate repo truth, then produce a concise plan.
4. Bobby reviews the plan.
5. After approval, the agent executes the implementation in that session or a follow-up session as appropriate.
6. Close each prompt with:
   - files changed,
   - validations run,
   - exact failures if any,
   - next prompt readiness.

---

# 2. Prompt Sequence

| Prompt | Purpose |
|---|---|
| Prompt 00 | Repo truth revalidation and worktree scope lock |
| Prompt 01 | Projection contracts, configuration, constants, package dependencies |
| Prompt 02 | SharePoint registry descriptor, provisioning, verification |
| Prompt 03 | Azure Table operational state repositories |
| Prompt 04 | Service Bus queue contract and webhook ingress |
| Prompt 05 | Graph subscription manager and renewal timer |
| Prompt 06 | Graph delta client and sync worker |
| Prompt 07 | Domain extraction and projection slice engine |
| Prompt 08 | Initial seed, rebuild, admin endpoints, CLI |
| Prompt 09 | Projection-backed read model and feature flag cutover seam |
| Prompt 10 | Parity harness, telemetry, evidence |
| Prompt 11 | Deployment docs and pre-permission staging |
| Prompt 12 | Post-permission live Graph validation |
| Prompt 13 | Projection read cutover, monitoring, rollback |
| Prompt 14 | Stage-three admin UI controls |

---

# 3. Prompt Gating

## Prompts 00–11
May proceed before `Sites.Read.All` admin consent lands.

## Prompt 12
Must wait until `Sites.Read.All` Application permission is granted and deployment is live.

## Prompt 13
Must wait until Prompt 12 has proven live:
- subscription creation,
- delta seed,
- webhook handshake,
- queue → delta → projection flow.

## Prompt 14
May proceed after core backend migration is stable; not MVP-blocking.

---

# 4. Universal Agent Guardrails

Every prompt includes or assumes these rules:

- Do not re-read files that are still clearly present in the agent's current context or memory; only re-open a file when verification of exact current contents is required.
- Do not leave architecture decisions open; use the package decision register.
- Do not introduce alternative infra choices unless repo truth makes the package impossible, and if so, stop and report the contradiction precisely.
- Preserve current My Projects user-visible semantics unless the package explicitly changes them.
- Keep permission-sensitive claims precise: live Graph subscription/delta validation is blocked until `Sites.Read.All` is granted.
- Report exact validation commands and outcomes.
