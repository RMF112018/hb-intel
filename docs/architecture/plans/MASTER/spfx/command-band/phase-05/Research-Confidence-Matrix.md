# Research Confidence Matrix

## Confidence legend
- **High** — supported by the supplied URL plus official product/help content and low ambiguity
- **Medium** — supported by the supplied URL and credible product evidence, but tenant-specific behavior or exact feature phrasing is not fully public
- **Low** — not used in this package; anything at this level should remain blank/defaulted instead of seeded

| Item Title | Recommended Href | Preserve / Refine | Recommended Action Key | Recommended Description | Group Key / Title | Sort Order | IsExternal | OpenInNewTab | Fields confidently identified | Fields defaulted from schema / runner posture | Fields intentionally left blank | Confidence | Evidence note |
|---|---|---|---|---|---|---:|---:|---:|---|---|---|---|---|
| HB Projects | `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/SitePages/HB-Projects.aspx` | **Refine** — strip the non-canonical `source=` return parameter and preserve the page URL itself | `hb-projects` | Open the HB Projects page in HBCentral. | `project-delivery` / `Project Delivery` | 100 | No | No | Title, internal SharePoint launch target, internal/external posture, new-tab posture | `ItemStatus`, `BadgeVariant`, `Priority`, `OverflowOnly`, `MobilePriority`, `AudienceMode`, device visibility | `IconKey`, `BadgeLabel`, `StartsAtUtc`, `EndsAtUtc`, `AudienceKeys`, item `AdminNotes` | Medium | The supplied URL clearly identifies an internal SharePoint Site Pages target; the `source=` parameter is navigation state, not page identity. |
| BambooHR | `https://hedrickbrothers.bamboohr.com/login.php?r=/home/` | **Preserve** — tenant-specific BambooHR subdomain and home redirect are likely intentional | `bamboohr` | Open BambooHR for HR self-service, time off, and employee information. | `people-benefits` / `People & Benefits` | 200 | Yes | Yes | Title, tenant-specific URL, external posture, new-tab posture, safe HR/ESS description | same defaults | same blanks | High | BambooHR’s official platform and employee self-service materials support HR/ESS usage, and BambooHR login patterns use company subdomains. |
| hh2 | `https://hedrickbrothers.hh2.com/#login` | **Preserve** — tenant-specific login URL is the correct company launch point | `hh2` | Open hh2 for construction payroll, time tracking, HR, and AP workflows. | `finance-payroll` / `Finance & Payroll` | 300 | Yes | Yes | Title, tenant-specific URL, external posture, new-tab posture, safe product description | same defaults | same blanks | High | hh2’s official product pages describe payroll, HR, time tracking, and AP for contractors; official help confirms company-specific hh2 login URLs. |
| My ADP | `https://online.adp.com/signin/v1/?APPID=RDBX&productId=80e309c3-70c6-bae1-e053-3505430b5495&returnURL=https://my.adp.com/&callingAppId=RDBX&TARGET=-SM-https://my.adp.com/` | **Preserve** — long URL is product/return-target specific and already points to My ADP | `my-adp` | Open My ADP to access pay statements, tax forms, and employer-provided employee self-service features. | `finance-payroll` / `Finance & Payroll` | 400 | Yes | Yes | Title, exact launch target, external posture, safe employee self-service description | same defaults | same blanks | High | ADP’s official login guidance positions MyADP as an employee-access portal for employer-provided access. |
| Procore | `https://login.procore.com/` | **Preserve** — direct auth launch is appropriate for a sign-in-first action | `procore` | Open Procore for project management and office-to-field construction workflows. | `project-delivery` / `Project Delivery` | 500 | Yes | Yes | Title, exact login launch, external posture, safe product description | same defaults | same blanks | High | Procore’s official product/platform pages describe it as a construction management platform spanning project execution and field/office coordination. |
| Employee Navigator | `https://www.employeenavigator.com/benefits/account/login` | **Refine** — use the official direct login page instead of the generic homepage | `employee-navigator` | Open Employee Navigator to review benefits and employee self-service resources. | `people-benefits` / `People & Benefits` | 600 | Yes | Yes | Title, external posture, official login endpoint, safe benefits/HR description | same defaults | same blanks | High | Employee Navigator’s official site presents benefits/HR administration and employee self-service; its own login flow guidance points users to the dedicated account login page. |
| Concur | `https://www.concursolutions.com/` | **Preserve** — official login/access entry remains valid for SAP Concur | `concur` | Open SAP Concur for travel, expense, and invoice management. | `finance-payroll` / `Finance & Payroll` | 700 | Yes | Yes | Title, launch target, external posture, safe product description | same defaults | same blanks | High | SAP Concur’s official site and product pages describe travel, expense, and invoice management; official support references `concursolutions.com` for access. |
| Document Crunch | `https://app.documentcrunch.com/login/` | **Preserve** — direct app login is the clearest launch target | `document-crunch` | Open Document Crunch for construction contract and risk review workflows. | `project-delivery` / `Project Delivery` | 800 | Yes | Yes | Title, login target, external posture, safe product description | same defaults | same blanks | High | Document Crunch’s official site describes an AI construction risk reduction platform spanning bid pursuit, preconstruction, and project execution. |
| Compass | `https://compass-app.com/` | **Preserve** — root domain is the canonical product entry; auth path can stay implementation-neutral | `compass` | Open Compass for contractor prequalification and risk analytics workflows. | `project-delivery` / `Project Delivery` | 900 | Yes | Yes | Title, canonical product domain, external posture, safe product description | same defaults | same blanks | Medium | Public Compass pages show the official app domain and a beta login describing standardized prequalification and risk analytics for construction. |
| HB University | `https://hedricklearn.csod.com/` | **Preserve** — tenant-specific CSOD learning portal URL | `hb-university` | Open HB University, the company learning portal hosted on Cornerstone/CSOD. | `people-benefits` / `People & Benefits` | 1000 | Yes | Yes | Title, tenant-specific learning portal URL, external posture, safe hosted-learning description | same defaults | same blanks | Medium | Public Cornerstone materials support the LMS/learning-portal characterization, but the exact tenant feature surface is customer-specific and not fully public. |

## Recommended item-wide defaults
Apply these uniformly unless a future maintainer has evidence to change them:
- `ItemStatus = Enabled`
- `BadgeVariant = neutral`
- `Priority = primary`
- `OverflowOnly = false`
- `MobilePriority = 100`
- `AudienceMode = all`
- `VisibleDesktop = VisibleLaptop = VisibleTabletLandscape = VisibleTabletPortrait = VisiblePhone = true`

## Notes on fields that should not be invented
Do not infer or fabricate:
- persona-specific audience keys
- time-window scheduling
- badge labels
- icon choices from marketing pages
- admin notes framed as user-facing descriptions
