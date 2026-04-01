# Prompt-06 — Phase 9 Final Release Closure and Signoff Report

## Objective

Produce the final Phase 9 release closure and signoff report for the Accounting app and connected Project Setup / provisioning workflow.

Use the outputs from all prior Phase 9 prompts.

This is the final consolidation step for the release package. It must produce an evidence-based release recommendation.

## Critical Working Rules

- Treat live repo truth as authoritative.
- Do not re-read files already in active context unless needed to verify contradiction, capture exact evidence, or confirm a change.
- This is a closure/signoff prompt, not a broad planning or remediation prompt.
- Be candid. If something is still blocked or only conditionally ready, say so.

## Required Deliverable

Create or update:

`docs/architecture/reviews/phase-9-final-release-closure-and-signoff-report.md`

## Required Report Structure

- Executive Summary
- Scope Closed
- Evidence Reviewed
- Readiness by Category
  - code readiness
  - deployment readiness
  - pilot readiness
  - cutover readiness
  - operational readiness
- Remaining Risks
- Remaining External Dependencies
- Explicit Go / No-Go Recommendation
- Recommended Immediate Next Actions
- Closure Statement

## Required Classification Model

For every major category, classify it as one of:

- **ready / repo-proven**
- **ready pending manual validation**
- **ready pending external prerequisite**
- **partially ready**
- **not ready**
- **deferred / not in current release scope**

Do not use vague language.

## Core Questions You Must Answer Explicitly

1. Is the repo itself ready to support a controlled pilot?
2. Is the repo itself ready to support production cutover, assuming named external prerequisites are satisfied?
3. Which readiness claims are actually proven by repo evidence?
4. Which readiness claims still depend on manual environment validation?
5. Which readiness claims still depend on tenant/admin/platform approvals?
6. What exact rollback method is assumed for the recommended release path?
7. What exact post-cutover support posture is assumed?
8. Is the final recommendation:
   - go for pilot only
   - go for pilot with constraints
   - go for production cutover
   - no-go
   - conditional go / no-go split by stage

## Hard Requirements

- Be explicit about what is fully complete, partially complete, or externally blocked.
- Distinguish between “ready to pilot” and “ready for production cutover” if the evidence requires it.
- Do not overstate staging, pilot, or production readiness.
- Tie the final recommendation to the exact evidence reviewed.

## Completion Standard

This prompt is complete only when the repo contains a final release closure report that could support a real release decision without relying on hidden assumptions or overstated confidence.
