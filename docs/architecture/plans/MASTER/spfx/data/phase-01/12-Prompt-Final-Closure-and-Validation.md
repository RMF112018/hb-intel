# 12 — Prompt — Final Closure and Validation

## Objective
Perform a final repo-truth closure pass proving that the 3-layer architecture extraction is complete, boundary-clean, and hosted-SharePoint safe.

## Repo authority
Use the live `main` branch of:
- `https://github.com/RMF112018/hb-intel.git`

## Required instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required closure audit
Conduct an exhaustive closure audit over:
- the new platform package
- the Kudos domain adapter layer
- the public Kudos runtime
- the companion runtime
- second-consumer proof work, if implemented

## Required questions
You must answer all of the following:
1. Are the Layer 1 platform mechanics fully extracted and centralized?
2. Are the Layer 2 Kudos adapters explicit and typed?
3. Does Layer 3 still own persona/state/orchestration locally?
4. Does any deprecated low-level seam still remain in use?
5. Did any generic CRUD abstraction slip into the design?
6. Are GUID-safe bindings still intact?
7. Are ETag/MERGE protections still intact?
8. Are audit-event writes still guaranteed for governance actions?
9. Is canonical list-host behavior still explicit and correct?
10. Is hosted SharePoint runtime behavior still validated?

## Mandatory closure outputs
Produce:
- changed-file inventory
- final boundary map
- remaining risks, if any
- test evidence summary
- explicit go/no-go recommendation

## Failure gate
If any seam is only partially migrated, do not declare closure.
Instead produce a precise gap list and the minimum remaining remediation steps needed to finish the extraction properly.
