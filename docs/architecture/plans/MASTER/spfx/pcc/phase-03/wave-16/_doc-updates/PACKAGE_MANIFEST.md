# Package Manifest — Wave 16 Control Center Settings

## Package type
Documentation update package with schema, UX, architecture, artifacts, and agent prompts.

## Resolved outcomes
- Control Center Settings is a governed configuration control surface, not a raw admin list.
- Storage is split across HBCentral/global policy, project-site effective values/overrides/workflow, backend-only secrets, and source-system-owned read-only values.
- Current PCC generic configuration schemas are not sufficient alone; explicit Wave 16 setting-definition/value/override/request/validation/audit/dependency schemas are required.
- Wireframes are included for every major screen/component group.
- HBI can explain/cite/draft/refuse only; it cannot mutate, approve, bypass, or expose secrets.
