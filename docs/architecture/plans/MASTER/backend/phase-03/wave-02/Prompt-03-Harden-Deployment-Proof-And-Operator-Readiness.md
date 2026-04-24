# Prompt-03-Harden-Deployment-Proof-And-Operator-Readiness

## Objective

Tighten deployment proof, hosting-plan alignment, and incident/operator readiness for the backend.

## Governing authorities

- packaging script
- workflow(s) that deploy `hb-intel-function-app`
- health and readiness routes
- current Azure Functions deployment guidance for the hosting plan
- current Azure Functions monitoring guidance

## Required work

1. Confirm and document that the live host deployment method matches the current hosting-plan guidance.
2. Keep artifact version/SHA proof and make it impossible to misread.
3. Produce a runbook-level proof path for:
   - artifact drift
   - identity drift
   - graph grant failure
   - reporting-period/item binding failure
4. Review telemetry classes and retention assumptions for high-value Safety failures.

## Required outcome

- operators can diagnose the next live failure quickly and accurately
- deployment proof aligns with actual hosting-plan behavior

## Proof of closure required

- exact workflow/packaging changes
- exact runbook additions
- exact verification steps for release and incident response

## Prohibitions

- no generic docs churn
- no weakening of the minimal anonymous `/api/health` surface
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
