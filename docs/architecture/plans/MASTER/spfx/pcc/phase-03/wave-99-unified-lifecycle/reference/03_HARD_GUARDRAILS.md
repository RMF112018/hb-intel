# Hard Guardrails

The local code agent must not:

- create a standalone unified lifecycle shell route;
- create departmental workspaces;
- edit `docs/architecture/plans/**` unless separately authorized;
- run broad Prettier write across the repo;
- add dependencies or modify package manifests unless explicitly authorized;
- change `pnpm-lock.yaml` unless explicitly authorized;
- change SharePoint manifests, deployment files, or CI/workflow files;
- perform tenant mutation;
- add backend POST/PUT/PATCH/DELETE routes for unified lifecycle;
- add live Microsoft Graph, SharePoint REST/PnP, Procore, Sage, Autodesk, CRM, Adobe, DocuSign, LLM, vector, or search runtime calls;
- add source-system writeback, sync, scraping, polling, or mirroring;
- add external URL launch behavior outside approved External Systems launcher posture;
- allow HBI uncited answers;
- allow HBI to claim source-of-truth authority;
- infer legal, accounting, claim, liability, warranty responsibility, entitlement, compensability, delay damages, or forensic schedule analysis conclusions;
- expose restricted, privileged, or withheld records through summaries or synthetic fixtures.
