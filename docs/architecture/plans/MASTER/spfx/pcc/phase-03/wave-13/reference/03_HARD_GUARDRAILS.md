# Hard Guardrails

1. Do not edit `docs/architecture/plans/**` unless separately authorized.
2. Do not run broad formatting or broad Prettier writes across the repo.
3. Do not change package dependencies, `pnpm-lock.yaml`, manifests, workflows, CI, deployment files, or tenant configuration unless the prompt explicitly authorizes and justifies it.
4. Do not add backend write routes or mutation endpoints.
5. Do not add Procore, Sage, Microsoft Graph, SharePoint REST/PnP, Autodesk, AHJ portal, utility portal, scraping, polling, sync, mirror, or write-back runtime behavior.
6. Do not create, update, approve, post, or transmit commitments, purchase orders, subcontracts, SOVs, CCOs, invoices, payments, accounting entries, legal notices, claims, or entitlement determinations.
7. Do not implement evidence-binary upload/download/sync/storage ownership in Wave 13; store/display references only.
8. Do not execute Wave 14 approval/checkpoint behavior; create only reference prompts, signals, or candidate records.
9. Stage only files authorized by the active prompt.
10. Keep backend Wave 13 read model GET-only.
11. Keep SPFx fixture-first unless backend opt-in is already repo-standard and explicitly configured.
12. Preserve source-lineage for every source-derived value.
