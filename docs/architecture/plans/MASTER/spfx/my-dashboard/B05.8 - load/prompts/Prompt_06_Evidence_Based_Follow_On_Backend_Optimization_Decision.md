# Prompt 06 — Evidence-Based Follow-On Backend Optimization Decision

## Role

Act as a senior principal performance architect reviewing the completed My Dashboard remediation package and its post-remediation evidence.

## Objective

Using the evidence produced after Prompts 01–05, determine whether a second remediation package is warranted and define its scope without implementing it yet.

This is a read-only architecture decision prompt unless the user separately requests implementation.

## Required Inputs

Review:
- the completed remediation commit(s),
- the Prompt 05 evidence closeout,
- HAR/network findings if available,
- Application Insights query results if available,
- the original package assessment and implementation plan.

## Decision Questions

1. Did fixing card mount choreography materially improve page usefulness?
2. Are `/home` and `/project-links` now clearly overlapping?
3. Which backend route remains the dominant latency contributor?
4. Does Adobe stage telemetry show a particular bottleneck?
5. Does Project Links stage telemetry show a particular bottleneck?
6. Is cold-start investigation now justified?
7. Is stale-while-revalidate or any cache posture justified?
8. Is a user-project projection or Graph source redesign justified?
9. Is a Function hosting / always-ready / prewarm evaluation justified?

## Required Classification

Classify each option:

| Option | Classification |
|---|---|
| No further work needed | |
| Frontend stale/cache package | |
| Project Links backend optimization package | |
| Adobe path optimization package | |
| Azure Function cold-start/hosting package | |

Classification values:
- Recommended now
- Worth planning next
- Defer
- Not justified from evidence

## Required Output

### 1. Evidence Summary
### 2. Dominant Remaining Bottleneck
### 3. Follow-On Package Recommendation
### 4. Closed Decisions for That Future Package
### 5. Files Likely to Be Touched
### 6. Risks
### 7. Go / No-Go Verdict

## Stop Condition

Do not implement the next package in this prompt.
