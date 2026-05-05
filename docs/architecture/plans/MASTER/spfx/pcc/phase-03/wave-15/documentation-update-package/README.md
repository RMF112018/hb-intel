# PCC Phase 3 Wave 15 — External Systems Launch Pad Documentation Update Package

## Purpose

This package gives a local code agent the complete, decision-locked documentation update plan for **External Systems Launch Pad**, the user-facing PCC feature for governed project-level launch links, external-system mapping visibility, source-health posture, and access/mapping review.

## Authority

This is a documentation update package. It authorizes documentation and planning artifacts only. It does not authorize runtime implementation, package mutation, lockfile mutation, tenant mutation, live integrations, source-system writeback, or deployment.

## Core Decisions Locked

- User-facing feature name: **External Systems Launch Pad**.
- Internal module/domain name: **External Systems**.
- Existing route ID should remain `external-systems`.
- `Projects` remains the project identity anchor, not a child-record storage location.
- Project-level launcher records are stored in project-site lists.
- Global system definitions and URL policy are stored centrally in HB Central.
- Custom project links require PM or PX approval.
- Permitting links can have multiple AHJ/private-provider instances per project.
- Progress camera links can have multiple provider/camera instances per project.
- Accounting Specialist is project-assigned.
- Accounting Manager receives all-project standard permission.
- All live external reads, iframe/current-image camera embedding, webhooks, and sync/writeback remain future-gated unless explicitly authorized later.

## Execution Order

1. Run repo-truth audit.
2. Verify HB Central schema references.
3. Update governing Wave 15 docs.
4. Add/refresh target architecture, contracts, schema, UX, security, and validation docs.
5. Add machine-readable JSON artifacts.
6. Run validation gates.
7. Produce closeout and auditor handoff.

## Revised Package Addition

This revised package adds a binding canonical documentation promotion requirement. The local agent must not simply commit the package folder. It must promote/copy/split/merge package contents into the appropriate canonical repo documentation locations and prove that promotion in closeout.

Primary checklist files:

- `docs/19_Artifact_Placement_And_Canonical_Docs_Promotion_Map.md`
- `artifacts/artifact_placement_map.json`
