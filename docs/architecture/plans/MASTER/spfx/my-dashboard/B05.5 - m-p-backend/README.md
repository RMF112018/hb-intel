# HB Intel — Federated HB SharePoint Creator Graph Access Backend Prompt Package

## Purpose

This package instructs a fresh local code-agent session to implement the backend changes required to standardize HB Intel SharePoint / Microsoft Graph access under the existing **HB SharePoint Creator** app registration, using the newly created **managed-identity federated credential**, without disrupting the existing Adobe Sign backend or Function App user-assigned managed identity posture.

## Package Use

Execute the prompts in order:

1. `prompts/Prompt_01_Implement_Federated_HB_SharePoint_Creator_Graph_Token_Path.md`
2. `prompts/Prompt_02_Reconcile_Docs_Deployment_Prerequisites_And_Hosted_Proof.md`

Before executing Prompt 01, provide the agent with the supporting files in this package as context. The prompts explicitly reference those files and assume their contents are available.

## Core Decision Locked by This Package

The implementation must preserve this split:

```text
Function App UAMI
  = workload identity, Azure-resource access, and federated assertion source

HB SharePoint Creator app registration
  = canonical SharePoint / Microsoft Graph application principal
```

The required runtime exchange is:

```text
Function App UAMI 77ad...
→ managed identity assertion for api://AzureADTokenExchange/.default
→ HB SharePoint Creator app token 08c...
→ Microsoft Graph token for https://graph.microsoft.com/.default
→ Graph / SharePoint access under HB SharePoint Creator
```

## Why This Package Exists

The My Projects backend currently fails because:

- the Function App calls Graph directly as its UAMI;
- the SharePoint / Graph grants that previously allowed HBCentral reads belong to **HB SharePoint Creator**;
- both My Projects source loaders fail at the shared HBCentral Graph site-resolution step with `401`.

The operator has already created the needed federated credential on **HB SharePoint Creator**. This package only covers the repo/backend implementation and supporting docs/proof path.

## Package Structure

See `FILE_TREE.txt` and `PACKAGE_MANIFEST.md`.
