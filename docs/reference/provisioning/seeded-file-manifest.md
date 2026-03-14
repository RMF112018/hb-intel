# Seeded File Manifest Reference

> **Doc Classification:** Canonical Current-State — Reference quadrant; provisioning audience; documents all 18 template file entries for Step 3 upload.

**Source:** W0-G2-T08 — Validation, Idempotency, Migration, and Seed Rules (§1.5, §4.3)
**Config:** `backend/functions/src/config/template-file-manifest.ts`

---

## Template File Entries (18 total)

| # | fileName | targetLibrary | assetPath | Source Task |
|---|----------|---------------|-----------|-------------|
| 1 | Project Setup Checklist.xlsx | Project Documents | Project Setup Checklist.xlsx | G1-T01 (core) |
| 2 | Submittal Register Template.xlsx | Project Documents | Submittal Register Template.xlsx | G1-T01 (core) |
| 3 | Meeting Agenda Template.docx | Project Documents | Meeting Agenda Template.docx | G1-T01 (core) |
| 4 | RFI Log Template.xlsx | Project Documents | RFI Log Template.xlsx | G1-T01 (core) |
| 5 | Estimating Kickoff Template.xlsx | Project Documents | Estimating Kickoff Template.xlsx | G2-T02 |
| 6 | Responsibility Matrix Template.xlsx | Project Documents | Responsibility Matrix Template.xlsx | G2-T02 |
| 7 | Project Management Plan Template.docx | Project Documents | Project Management Plan Template.docx | G2-T02 |
| 8 | Procore Startup Checklist Reference.pdf | Project Documents | Procore Startup Checklist Reference.pdf | G2-T02 |
| 9 | Project Closeout Guide.docx | Project Documents | Project Closeout Guide.docx | G2-T03 |
| 10 | Closeout Checklist Reference.pdf | Project Documents | Closeout Checklist Reference.pdf | G2-T03 |
| 11 | JHA Form Template.docx | Project Documents | JHA Form Template.docx | G2-T04 |
| 12 | JHA Instructions.docx | Project Documents | JHA Instructions.docx | G2-T04 |
| 13 | Incident Report Form.docx | Project Documents | Incident Report Form.docx | G2-T04 |
| 14 | Site Specific Safety Plan Template.docx | Project Documents | Site Specific Safety Plan Template.docx | G2-T04 |
| 15 | Required Inspections Template.xlsx | Project Documents | Required Inspections Template.xlsx | G2-T05 |
| 16 | Buyout Log Template.xlsx | Project Documents | Buyout Log Template.xlsx | G2-T06 |
| 17 | Draw Schedule Template.xlsx | Project Documents | Draw Schedule Template.xlsx | G2-T06 |
| 18 | Financial Forecast Checklist.xlsx | Project Documents | Financial Forecast Checklist.xlsx | G2-T06 |

---

## Graceful-Skip Rule (T08 §1.5)

Template asset files (.xlsx, .docx, .pdf) are G2 scope deliverables. During Wave 0, Step 3 **gracefully skips** any entry whose asset file is not yet on disk:

- `uploadTemplateFile` returns `false` when `fs.existsSync(fullPath)` fails
- Step 3 collects skipped entries in `result.metadata.missingAssets`
- Step 3 still returns `Completed` — missing assets are expected during early waves
- `validateManifestAssets()` provides a structured disk-presence report

---

## Seeded-File Governance (T08 §4.3)

- Template files are **never overwritten** once uploaded (T08 §3.4 no-overwrite rule)
- `fileExists` check runs before every upload attempt
- If a file already exists on SharePoint, the upload is idempotently skipped
- New manifest entries added in future tasks will upload on next provisioning run
- Asset files must be placed in `backend/functions/src/assets/templates/` to be discovered

---

*End of Seeded File Manifest Reference v1.0*
