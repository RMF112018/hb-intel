---
generated_utc: 2026-04-25T08:22:25Z
scope: HB Intel Foleon SPFx list provisioning audit
package_under_review: hb-intel-foleon 1.0.11.0
uploaded_sppkg_sha256: 3eca6e40c31747279ce259faf9f816907b162859776de631ba20f8b09589cddc
web_research_status: Not performed; web search was unavailable in this ChatGPT session. Local agent must verify current Microsoft Learn guidance before implementation.
---


# 02 — Root Cause Evidence Matrix

| Evidence Item | Source | Status | Interpretation | Closure Action |
|---|---|---:|---|---|
| `package-solution.json` version `1.0.11.0` | Repo truth | Proven | Correct version posture for remediated package. | Keep version proof. Bump version only when remediation ships. |
| `skipFeatureDeployment=false` | Repo truth | Proven | Site install is required; Feature Framework should activate at site level. | Keep only if Feature Framework provisioning remains. |
| Four schema files declared as `elementFiles` | Repo truth | Proven | Inclusion declared in solution package config. | Add byte-for-byte proof. |
| Four `ListInstance` declarations | Repo truth | Proven | App intends to create all four lists on install. | Validate clean site. |
| `Content Registry` before `Homepage Placements` | Repo truth | Proven | Lookup ordering is intentionally correct. | Still validate same-feature lookup. |
| Uploaded `.sppkg` contains schema files | Package inspection | Proven | Build/package inclusion is not the immediate failure. | Enhance proof to compare repo/package bytes. |
| Uploaded `.sppkg` feature rels include schema element files | Package inspection | Proven | Relationship packaging exists. | Validate path resolution in clean SharePoint install. |
| `HB_FoleonContentRegistry` has 27 indexed custom fields | XML inspection | Proven | Highest-probability source schema defect. | Reduce indexes and retest. |
| View field references resolve statically | XML inspection | Proven | Views are not obviously referencing missing fields. | Validate views through SharePoint REST/UI. |
| Duplicate field IDs | XML inspection | Ruled out | No duplicate custom field IDs were found. | Keep test coverage. |
| Required cross-list lookup | XML inspection | Risk confirmed | Same-feature lookup depends on target list creation state. | Move lookup to post-provision or prove clean-site. |
| Existing corrupted tenant lists | Tenant behavior | Unproven | Could survive package fix and continue failing. | Capture evidence, back up, then delete/reprovision test lists. |
| SharePoint correlation IDs | Tenant evidence | Missing | Needed to confirm exact SharePoint failure. | Capture from failed list load. |
| Clean-site repro | Tenant evidence | Missing | Required to separate source defect from tenant residue. | Run test plan. |
| Microsoft current documentation | Web research | Missing | Web search unavailable in this session. | Local agent must verify current Microsoft Learn guidance. |

## Most Likely Root Cause Ranking

1. **Schema over-indexing in `HB_FoleonContentRegistry`** — highest probability.
2. **Tenant residue from failed Feature Framework activation** — high probability after first failure.
3. **Same-feature required lookup resolution in `HB_FoleonHomepagePlacements`** — medium/high probability.
4. **Unsupported/incorrect uniqueness XML semantics** — medium probability as functional defect; lower probability as list-load corruptor.
5. **Package staging defect** — low probability based on uploaded `.sppkg`, but not fully ruled out until byte-for-byte repo/package proof is added.
6. **View field reference defect** — low probability based on static analysis.
