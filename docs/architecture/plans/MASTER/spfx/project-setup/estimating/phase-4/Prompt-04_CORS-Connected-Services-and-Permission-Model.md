# Prompt 04 — CORS, Connected Services, and Permission Model

You are continuing the **HB Intel Estimating / Project Setup SPFx** Phase 4 effort.

## Authoritative repository

- Repo: `https://github.com/RMF112018/hb-intel.git`

## Objective

Implement the **CORS / connected-services / permission-model** hardening required to make the retained Project Setup deployment production-safe.

This prompt is focused on browser-origin rules, Microsoft 365/Azure service prerequisites, and least-privilege service access.

## Critical instructions

- Use the Phase 4 baseline and prior Phase 4 prompt outputs as governing context.
- Do **not** re-read files already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do **not** preserve permissive CORS or broad permissions for convenience.
- Do **not** broaden service dependencies beyond what the isolated Project Setup deployment actually needs.

## Required working approach

1. Define the exact browser origins that require Project Setup API access.
2. Implement/document the required CORS posture for those origins only.
3. Review SharePoint App Catalog, API access approval, Graph, and site-permission prerequisites for retained capabilities.
4. Produce an explicit least-privilege permission matrix.
5. Remove or clearly mark unsupported connected-service assumptions.

## Specific outcomes required

By the end of this prompt:
- the required browser origins should be explicit
- the permission model for retained services should be explicit
- unsupported connected-service assumptions should no longer remain implicit
- deployment/support teams should know exactly which Azure/M365 approvals and grants are required

## Required implementation outputs

Make the code and documentation changes necessary to:
- tighten/document CORS posture
- document connected-service prerequisites
- define permission boundaries for retained service usage
- remove or neutralize unsupported service assumptions where feasible

Update or create markdown summarizing:
- required origins
- permission prerequisites
- connected services retained vs removed
- unresolved platform/tenant dependencies

## Acceptance criteria

- Only required origins and retained service dependencies are documented/allowed.
- The permission model is least-privilege and deployment-specific.
- Operators know exactly what service approvals and grants are required.

## Required summary back to me

When done, report:
- files changed
- browser origins retained
- permission prerequisites documented
- connected services removed, retained, or explicitly unsupported
- any tenant-level dependencies that remain unresolved
