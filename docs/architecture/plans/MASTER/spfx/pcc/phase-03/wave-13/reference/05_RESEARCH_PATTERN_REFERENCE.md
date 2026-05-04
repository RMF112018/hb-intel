# 05 — Research Pattern Reference

## Construction Buyout / Bid Leveling

- BuildingConnected defines bid leveling as organizing, comparing, and analyzing project bids to support subcontractor selection and identify bid discrepancies so package details and quotes are comparable.
- Source: https://support.buildingconnected.com/hc/en-us/articles/47949854611219-Bid-Leveling-Overview

## Procore Commitments

- Procore Commitments tracks contracts and purchase orders, status/current value, approved commitments, invoices, and payments.
- Procore describes purchase orders and subcontracts as commitments.
- Sources:
  - https://support.procore.com/products/online/user-guide/project-level/commitments
  - https://support.procore.com/products/online/user-guide/project-level/commitments/tutorials/create-a-commitment-change-order-cco
  - https://www.procore.com/financial-management/commitments

## Microsoft Graph / SharePoint

- Delegated permissions allow the app to act on behalf of a signed-in user but cannot access more than the user can access.
- Application permissions are app-only and can be broader, requiring admin consent and stricter governance.
- Microsoft Graph throttling guidance recommends honoring `Retry-After`, avoiding immediate retries, using exponential backoff where needed, and avoiding polling/scanning when change tracking/change notifications are available.
- Sources:
  - https://learn.microsoft.com/en-us/graph/permissions-overview
  - https://learn.microsoft.com/en-us/graph/throttling

## AI / HBI Governance

- NIST AI RMF supports trustworthy AI risk management across design, development, deployment, use, and evaluation.
- OWASP LLM Top 10 identifies prompt injection, sensitive information disclosure, improper output handling, excessive agency, vector/embedding weaknesses, misinformation, and unbounded consumption as relevant LLM application risks.
- Sources:
  - https://www.nist.gov/itl/ai-risk-management-framework
  - https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10
  - https://owasp.org/www-project-top-10-for-large-language-model-applications/assets/PDF/OWASP-Top-10-for-LLMs-v2025.pdf

## Implementation Implication

Use these as pattern inputs only. Do not clone external tools or implement live integrations in Wave 13.
