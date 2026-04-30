---
name: hb-backend-functions-artifact-gate
description: Route backend Functions work through route, host, health, readiness, artifact-shape, and runtime-identity validation when applicable.
when_to_use: Use for backend Functions routes, admin control plane, health/readiness, Safety ingestion, Graph data-plane, deploy artifact, or runtime identity work.
argument-hint: "[backend scope]"
agent: hb-tenant-deployment-gatekeeper
---

# HB Backend Functions Artifact Gate

Review:

```text
$ARGUMENTS
```

## Required Sources

```text
backend/functions/package.json
scripts/package-functions-artifact.ts
docs/reference/developer/verification-commands.md
```

## Decide

- Local code validation only?
- Route/host registration validation?
- Artifact-shape validation?
- Health/readiness proof?
- Hosted proof requiring explicit authorization?

## Output

- Required validation
- Artifact/routing risks
- Hosted checks blocked unless authorized
- Redaction requirements
