# Repo Truth Findings to Verify

## Remote Audit Baseline

- Repo: `RMF112018/hb-intel`
- Remote `main`: `a444cebf999b92437ad1db6d630ca027409fd11c`
- Wave 16 closeout reference: `714ca190c0dc12d738b10cc342b5253f94909895`
- Wave 17 canonical blueprint path was not found on remote `main`.
- Existing Site Health files were found in models, fixtures, project-site-template schema, and project-site-template fields.

## Local Commands Required

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Existing Site Health Files to Verify

- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/Prompt_09_PCC_Site_Health_Drift_Read_Model_Gated_Implementation.md`
- `packages/models/src/pcc/SiteHealth.ts`
- `packages/models/src/pcc/fixtures/siteHealth.ts`
- `packages/project-site-template/schemas/families/site-health.schema.json`
- `packages/project-site-template/fields/families/site-health.fields.json`

## Wave 16 Files to Verify

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/README.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-16/README.md`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-16/_doc-updates/README.md`
- `docs/reference/sharepoint/list-schemas/pcc/lists/control-center-setting-health-snapshots.md`

## Local-Agent Rule

If local repo truth differs from this remote audit, document the difference and prefer local repo truth before edits.
