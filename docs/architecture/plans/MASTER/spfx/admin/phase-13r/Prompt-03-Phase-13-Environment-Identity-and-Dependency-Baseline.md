# Prompt-03 — Phase 13 Environment, Identity, and Dependency Baseline

## Objective

Document the production environment, identity, configuration, and major dependency posture required to support a real release of the Admin SPFx IT Control Center.

## Important execution rules

- Do **not** re-read files still in current context unless needed.
- Keep the output factual and environment-oriented.
- Do not redesign the runtime; document and reconcile the intended baseline.

## Inputs

Use:
- Prompt-01 audit
- Prompt-02 release baseline
- `backend/functions/README.md`
- relevant admin/backend config docs
- any existing deployment/env docs

## Create

- `docs/architecture/plans/MASTER/spfx/admin/phase-13/admin-spfx-phase-13-environment-identity-and-dependency-baseline.md`

## Required sections

1. **Purpose**
2. **Environment model**
   - local
   - staging / preproduction
   - production
3. **Identity posture**
   - managed identity
   - app registrations / service principals where relevant
   - operator identity / admin access assumptions
4. **Configuration and secret posture**
5. **Critical external dependencies**
6. **Dependency failure considerations**
7. **Least-privilege and approval-sensitive areas**
8. **Known environment risks**
9. **Operational ownership notes**

## Required subject areas

Cover at minimum:
- SPFx package/runtime dependencies
- Azure Functions runtime dependencies
- storage / persistence dependencies
- SharePoint tenant/app catalog dependencies
- Graph / Entra dependencies
- auth middleware assumptions
- environment variables and where they belong conceptually
- secret rotation / update considerations if documented or required

## Validation

Before finishing:
- confirm the document does not invent unavailable environment details as facts,
- explicitly label assumptions where necessary,
- ensure the output is specific enough to support runbooks and production gates.

## Completion condition

Stop after the baseline doc is complete.
