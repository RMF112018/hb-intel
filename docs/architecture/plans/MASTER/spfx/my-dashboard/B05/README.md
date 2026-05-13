# HB Intel My Dashboard — B05 Runtime Integration + OAuth Configuration Prompt Package

## Purpose

This package converts the canonical **B05 Adobe Sign Integration Architecture** into a focused implementation sequence for a local code agent. It is intentionally distinct from the existing **docs-only B05 authority-alignment package** already present in the repository.

This package covers:

- delegated Adobe OAuth implementation seams,
- authenticated actor → Adobe grant resolution,
- protected OAuth initiation route,
- public Adobe OAuth callback route,
- OAuth callback/state configuration,
- secure grant/token-store abstraction and configuration gates,
- bounded Adobe Sign action-queue search adapter posture,
- source-handoff URL validation,
- validation and closeout,
- the exact **Adobe Configure OAuth** values to register for the current dev Function App host.

---

## 1. Repo-truth posture addressed by this package

### Current repository facts

The repository already contains:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/
└── B05_Adobe_Sign_Integration_Architecture_Development.md
```

and an existing B05 prompt package under:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/B05/
```

That repository package is **documentation/planning only**. It does **not** instruct implementation of OAuth routes, Adobe client code, token/grant store seams, or provider runtime logic.

### This package is different

This ZIP is the **runtime implementation + OAuth configuration package** that should follow the committed B05 architecture. It is meant for local-agent execution after the B02/B03/B04 implementation foundations are present in the working tree.

---

## 2. Binding architecture decisions

The prompts in this package treat these decisions as closed:

1. **Adobe auth baseline:** delegated user OAuth, not shared/admin Adobe principal.
2. **Adobe app type:** `CUSTOMER`.
3. **Adobe queue scope:** `agreement_read:self`.
4. **Actor key:** stable Entra identity, using trusted tenant context + `claims.oid`; UPN is display/diagnostic only.
5. **App-only HB tokens:** not eligible for user-specific Adobe queue retrieval.
6. **Principal resolution:** grant-record based, not email lookup and never shared-principal fallback.
7. **Queue retrieval:** bounded `POST v6/search`.
8. **Queue statuses:** exact six B04/B05 current-user action statuses only.
9. **Source handoff:** row URL only when backend-supplied and policy-validated; no guessed links.
10. **OAuth route contract:**
    ```http
    POST /api/my-work/me/adobe-sign/oauth/start
    GET  /api/my-work/adobe-sign/oauth/callback
    ```

---

## 3. OAuth registration decision included in this package

The package includes:

```text
06_B05_Adobe_OAuth_Configuration_Runbook.md
```

which closes the current Adobe app-registration posture:

| Adobe OAuth field | Value |
|---|---|
| Redirect URI | `https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net/api/my-work/adobe-sign/oauth/callback` |
| Enabled scope | `agreement_read` |
| Modifier | `self` |
| Other scopes | Leave unchecked |

The runbook also requires confirming the Function App’s **current live hostname** in Azure before saving, because the repo-captured resource snapshot is evidence, not a fresh Azure metadata read.

---

## 4. Package contents

| File | Purpose |
|---|---|
| `README.md` | This guide |
| `00_B05_Implementation_Package_Overview.md` | Objective, repo-truth posture, scope, decisions |
| `01_B05_Repo_Truth_Implementation_Plan.md` | Sequenced implementation plan and file map |
| `02_B05_Target_Architecture_OAuth_And_Configuration_Map.md` | Architecture, route map, actor/grant/token seams, environment settings |
| `03_B05_Validation_And_Closeout_Requirements.md` | Acceptance tests, validation commands, closeout format |
| `04_B05_Implementation_Gap_Register.md` | Gap-by-gap implementation register |
| `05_B05_Targeted_Web_Verification_Notes.md` | Time-sensitive Adobe/Microsoft verification notes |
| `06_B05_Adobe_OAuth_Configuration_Runbook.md` | Exact Acrobat Sign OAuth configuration and callback/public-origin decision |
| `Prompt_01_Preflight_B05_Runtime_And_Predecessor_Foundations.md` | Preflight and repo-truth gate |
| `Prompt_02_Implement_Actor_Grant_Contracts_And_Configuration_Gates.md` | Actor resolution, grant contracts, env/readiness gates |
| `Prompt_03_Implement_OAuth_Start_And_Public_Callback_Routes.md` | Protected start route + public callback route |
| `Prompt_04_Implement_Grant_Store_And_Token_Service_Boundaries.md` | Store abstraction, token lifecycle, redaction posture |
| `Prompt_05_Implement_Adobe_Search_Adapter_And_Action_Queue_Mapping.md` | Search client, status mapping, provider translation |
| `Prompt_06_Implement_Source_Handoff_Policy_And_Module_Seams.md` | URL policy + handoff DTO/UX seams |
| `Prompt_07_Validate_B05_OAuth_Configuration_Runtime_Readiness_And_Closeout.md` | Full validation and final closeout |

---

## 5. Recommended execution order

Execute in order:

1. `Prompt_01_Preflight_B05_Runtime_And_Predecessor_Foundations.md`
2. `Prompt_02_Implement_Actor_Grant_Contracts_And_Configuration_Gates.md`
3. `Prompt_03_Implement_OAuth_Start_And_Public_Callback_Routes.md`
4. `Prompt_04_Implement_Grant_Store_And_Token_Service_Boundaries.md`
5. `Prompt_05_Implement_Adobe_Search_Adapter_And_Action_Queue_Mapping.md`
6. `Prompt_06_Implement_Source_Handoff_Policy_And_Module_Seams.md`
7. `Prompt_07_Validate_B05_OAuth_Configuration_Runtime_Readiness_And_Closeout.md`

### Operator action timing

Use the OAuth configuration runbook before final live callback validation. The route code may be developed first, but the Adobe application must contain the exact redirect URI before the first real callback round-trip can succeed.

---

## 6. Explicit implementation posture

This package instructs the code agent to implement the **B05 integration backbone** while preserving the B05 production-live gate:

- It should add route and service seams.
- It should add tests, configuration/readiness behavior, and mockable provider abstractions.
- It should not fabricate secrets, generate a fake production grant store, or claim live Adobe readiness when the operator-controlled dependencies are not in place.
- It should preserve `configuration-required` / `authorization-required` / `principal-unresolved` source-state behavior when live prerequisites are absent.

---

## 7. What “done” means

B05 runtime implementation is complete only when:

1. the protected OAuth start route and public callback route are implemented at the locked paths,
2. callback state is cryptographically generated, single-use, actor-bound, return-flow-bound, and expiry-bound,
3. actor normalization rejects app-only identities for personal queue operations,
4. grant/token persistence is represented through a deliberate backend-only abstraction with secure configuration gates,
5. no Adobe token, refresh token, OAuth code, or raw provider payload crosses the SPFx boundary,
6. queue reads remain bounded around the B04/B05 six-status contract,
7. source URLs remain optional and policy-validated,
8. tests prove source-state mapping and no actor override behavior,
9. docs/readiness output clearly identifies what is still operator-gated for live enablement,
10. the exact OAuth app-registration values are documented and ready for Azure/Adobe confirmation.

---

## 8. Suggested commit themes if executed as separate commits

A reasonable local sequence would be:

1. `feat(my-dashboard): add Adobe actor/grant readiness contracts`
2. `feat(my-dashboard): add Adobe OAuth start and callback route seams`
3. `feat(my-dashboard): add Adobe grant/token service abstractions`
4. `feat(my-dashboard): add Adobe action-queue search adapter`
5. `feat(my-dashboard): harden Adobe handoff policy and B05 validation`

The executing agent should adapt commit boundaries to the actual repo state and the team’s normal commit discipline.
