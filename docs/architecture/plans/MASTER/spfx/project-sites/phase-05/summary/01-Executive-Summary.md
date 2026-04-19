# Executive Summary

## Objective

Replace the attached legacy fallback backend audit and prompt packages with one materially stronger combined package that is more precise about the **current** blocker set, more faithful to live repo truth, and more explicit about what closure actually requires.

## Bottom line

The attached packages were directionally useful but incomplete.

They were right that the earlier zero-registration/indexing problem is no longer the primary blocker. They were also right that the SharePoint-backed persistence boundary is still an active risk area. But they were too shallow on several repo seams that materially affect correctness **now**.

## Most important upgraded findings

### 1. The repo contains a host-composition contradiction the attached packages did not surface clearly enough

The default Functions deploy artifact still points at `backend/functions/src/index.ts`, which imports a broad shared host surface. But the legacy fallback review/override routes are registered through `backend/functions/src/functions/adminApi/index.ts` and the dedicated `backend/functions/src/hosts/admin-control-plane/index.ts` lane. The attached packages did not elevate this into a first-class finding.

That means the repo documents a richer legacy fallback admin API surface than the default entrypoint is guaranteed to register.

### 2. The project-index provider undermines its own field-resolution abstraction

`LegacyFallbackProjectIndexProvider` calls `resolveSpField('projectNumber')` and `resolveSpField('projectName')`, but then maps rows using hard-coded `field_2` and `field_3` access instead of the resolved field names. This is a concrete schema-drift risk and a direct violation of the mapper contract.

The attached packages missed this completely.

### 3. The hosting/deployment story is more internally inconsistent than the attached packages described

The repo mixes:

- a shared hosted lane runbook,
- a Flex-style `functionAppConfig.deployment.storage` infrastructure pattern,
- dedicated-plan defaults and plan-reuse options,
- and deployment instructions that still mention `config-zip` for a Flex closure path.

This is not just a documentation cleanliness issue. It can produce the wrong operator behavior and the wrong proof standard.

### 4. Sync-run persistence is still under-modeled as a first-class operational record

The discovery service computes counters for matched, review-required, unmatched, and marked-inactive outcomes, but the shared sync-run model, list descriptors, and repository write shape do not fully persist those counters as first-class columns. Important runtime truth is currently pushed into `SummaryJson` instead of being fully queryable as structured operational state.

### 5. The current artifact is still broader than the actual objective

The packaging script still asserts unrelated workspace packages in the staged artifact and still packages the broad shared host entrypoint. That makes the artifact deployable, but not purpose-fit for the legacy fallback backend objective.

## Correct current blocker statement

The best current blocker statement is:

> Hosted registration appears materially improved, but legacy fallback backend closure is still not complete because the first hosted SharePoint persistence boundary remains unproven, the admin/review registration surface is not yet reconciled with the deployed host entrypoint, the project-index mapping seam is not trustworthy enough, and the hosting/deployment truth is still internally inconsistent.

## What “done” must mean

Done means all of the following are true:

- the selected host entrypoint is explicit and correct,
- all required legacy fallback routes register from that host and no required ones are omitted,
- the hosted run writes a sync-run record and registry records successfully,
- the project index is loaded through the canonical field-resolution contract,
- the deploy method matches the real hosting model,
- the artifact contains only the runtime graph needed for that host,
- sync-run observability fields are queryable enough for operations,
- and the runbook/closure checklist reflects the actual hosted validation path.

## Recommended remediation path

1. Close the first hosted SharePoint persistence boundary.
2. Correct the project-index field-resolution defect before trusting match outcomes.
3. Reconcile the deployed host entrypoint with the documented legacy fallback route surface.
4. Reconcile hosting-model truth with IaC and deployment instructions.
5. Shrink the artifact to the true runtime graph.
6. Promote sync-run evidence into stronger structured operational state.
7. Require closure-grade hosted validation evidence before any fixed/final language is used.
