# PH7-Estimating-10 — Backend API Endpoints & SharePoint List Schemas

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** EST-1 (Foundation), PH7-Estimating-9 (Cross-Module Contracts)
**Blocks:** PH7-Estimating-11 (Testing)

---

## Summary

This plan specifies all backend API endpoints for the Estimating module, their request/response schemas, authentication requirements, and the SharePoint list structures that back them.

The API is implemented as Azure Functions endpoints served from `VITE_FUNCTION_APP_URL`. All endpoints use bearer token (Azure AD) authentication and role-based access control (RBAC). Write endpoints require Estimating Manager or Admin role; some endpoints require Admin role exclusively.

---

## Why It Matters

The Estimating module is data-driven. Every feature — pursuits table, precon tracking, log, analytics — depends on a well-defined API contract. This plan locks the endpoint signatures, request/response schemas, query parameters, HTTP status codes, and error handling to prevent mid-implementation changes that cascade across the feature.

SharePoint list schemas must be defined upfront to enable parallel backend and SharePoint setup (provisioning saga). Column names, types, and constraints are binding.

---

## Files to Create / Modify

| File | Type | Action | Notes |
|---|---|---|---|
| **`backend/functions/src/functions/estimating/index.ts`** | Backend | Create | Main entry point for all estimating endpoints |
| **`backend/functions/src/functions/estimating/handlers/pursuits.ts`** | Backend | Create | Pursuit CRUD handlers |
| **`backend/functions/src/functions/estimating/handlers/preconstruction.ts`** | Backend | Create | Precon CRUD handlers |
| **`backend/functions/src/functions/estimating/handlers/log.ts`** | Backend | Create | Log CRUD + analytics |
| **`backend/functions/src/functions/estimating/handlers/templates.ts`** | Backend | Create | Template link CRUD (admin-only write) |
| **`backend/functions/src/functions/estimating/handlers/summary.ts`** | Backend | Create | Home page summary stats |
| **`packages/features/estimating/src/types/api.ts`** | Type Def | Create | Request/response interfaces |
| **`packages/features/estimating/src/data/estimatingQueries.ts`** | Data Layer | Modify | Update to call all endpoints |
| **`docs/reference/api/estimating.md`** | Reference | Create | Full API documentation |

---

## Implementation

### Part 1: API Endpoints

All endpoints are served from the URL pattern:
```
GET    /api/estimating/{resource}
POST   /api/estimating/{resource}
PATCH  /api/estimating/{resource}/{id}
DELETE /api/estimating/{resource}/{id}
```

**Authentication:** All endpoints require a Bearer token (Azure AD access token).

**Authorization:**
- Read endpoints: `estimating:read` permission
- Write endpoints (create/update): `estimating:write` permission (Estimating Manager or Admin)
- Write endpoints (templates): `admin:write` permission (Admin only)

**Error Responses:**
- `400 Bad Request` — validation error
- `401 Unauthorized` — missing/invalid token
- `403 Forbidden` — insufficient permissions
- `404 Not Found` — resource not found
- `409 Conflict` — constraint violation (e.g., duplicate projectNumber)
- `500 Internal Server Error` — server error

---

#### 1.1 Active Pursuits Endpoints

**GET `/api/estimating/pursuits`**

Fetch all active pursuits, sorted by dueDate ascending.

**Query Parameters:**
| Param | Type | Required | Notes |
|---|---|---|---|
| `status` | string | No | Filter by status (Active, Submitted, Awarded, NotAwarded, OnHold, Withdrawn); comma-separated for multiple |
| `daysUntilDue` | number | No | Filter to pursuits due within N days (0 = due today, 7 = due in next 7 days) |
| `leadEstimatorUpn` | string | No | Filter by lead estimator UPN |

**Response:**
```typescript
{
  status: 200,
  body: {
    data: IActivePursuit[],
    total: number,
    timestamp: ISO8601
  }
}

// IActivePursuit interface (see PH7-Estimating-9 for full definition)
interface IActivePursuit {
  id: string;
  projectNumber: string;
  projectName: string;
  source?: string;
  deliverable?: string;
  subBidsDue?: ISO8601;
  presubmissionReview?: ISO8601;
  winStrategyMeeting?: ISO8601;
  dueDate: ISO8601;
  leadEstimatorUpn: string;
  leadEstimatorName: string;
  contributorUpns?: string[];
  contributorNames?: string[];
  projectExecutiveUpn?: string;
  projectExecutiveName?: string;
  status: string; // Active | Submitted | Awarded | NotAwarded | OnHold | Withdrawn
  checkBidBond?: boolean;
  checkPPBond?: boolean;
  checkSchedule?: boolean;
  checkLogistics?: boolean;
  checkBimProposal?: boolean;
  checkPreconProposal?: boolean;
  checkProposalTabs?: boolean;
  checkMarketingCoordination?: boolean;
  checkBusinessTerms?: boolean;
  buildingConnectedUrl?: string;
  procoreUrl?: string;
  updatedByUpn: string;
  updatedAt: ISO8601;
}
```

**Permissions:** `estimating:read`

---

**POST `/api/estimating/pursuits`**

Create a new pursuit.

**Request Body:**
```typescript
{
  projectNumber: string; // ##-###-## format
  projectName: string;
  source?: string;
  deliverable?: string;
  subBidsDue?: ISO8601;
  presubmissionReview?: ISO8601;
  winStrategyMeeting?: ISO8601;
  dueDate: ISO8601; // required
  leadEstimatorUpn: string; // required
  leadEstimatorName: string; // required
  contributorUpns?: string[];
  contributorNames?: string[];
  projectExecutiveUpn?: string;
  projectExecutiveName?: string;
  status?: string; // default: 'Active'
  buildingConnectedUrl?: string;
  procoreUrl?: string;
}
```

**Response:**
```typescript
{
  status: 201,
  body: {
    data: IActivePursuit // newly created record with id, createdAt, updatedByUpn
  }
}
```

**Validations:**
- `projectNumber` must match pattern `##-###-##`
- `projectNumber` must be unique (409 Conflict if duplicate)
- `dueDate` is required
- `leadEstimatorUpn` is required (must be valid Azure AD UPN)
- `projectName` is required

**Permissions:** `estimating:write`

**Server-set fields:**
- `id` (GUID, generated)
- `createdAt` (timestamp, set to current time)
- `updatedAt` (timestamp, set to current time)
- `updatedByUpn` (set to current user's UPN)

---

**PATCH `/api/estimating/pursuits/:id`**

Update a pursuit (partial update).

**Route Parameters:**
| Param | Type | Notes |
|---|---|---|
| `id` | string | SharePoint item ID |

**Request Body:**
```typescript
{
  projectNumber?: string;
  projectName?: string;
  source?: string | null; // null to clear
  deliverable?: string | null;
  subBidsDue?: ISO8601 | null;
  presubmissionReview?: ISO8601 | null;
  winStrategyMeeting?: ISO8601 | null;
  dueDate?: ISO8601;
  leadEstimatorUpn?: string;
  leadEstimatorName?: string;
  contributorUpns?: string[] | null;
  contributorNames?: string[] | null;
  projectExecutiveUpn?: string | null;
  projectExecutiveName?: string | null;
  status?: string;
  checkBidBond?: boolean;
  checkPPBond?: boolean;
  checkSchedule?: boolean;
  checkLogistics?: boolean;
  checkBimProposal?: boolean;
  checkPreconProposal?: boolean;
  checkProposalTabs?: boolean;
  checkMarketingCoordination?: boolean;
  checkBusinessTerms?: boolean;
  buildingConnectedUrl?: string | null;
  procoreUrl?: string | null;
}
```

**Response:**
```typescript
{
  status: 200,
  body: {
    data: IActivePursuit // updated record
  }
}
```

**Permissions:** `estimating:write`

**Server-set fields:**
- `updatedAt` (set to current time)
- `updatedByUpn` (set to current user's UPN)
- `id`, `createdAt` (immutable)

---

**DELETE `/api/estimating/pursuits/:id`**

Hard delete a pursuit.

**Route Parameters:**
| Param | Type | Notes |
|---|---|---|
| `id` | string | SharePoint item ID |

**Response:**
```typescript
{
  status: 204 // No Content
}
```

**Permissions:** `estimating:write`

**Notes:** Hard delete is non-recoverable. Consider soft-delete with status='Withdrawn' for audit trail.

---

#### 1.2 Active Preconstruction Endpoints

**GET `/api/estimating/preconstruction`**

Fetch all active preconstruction records, sorted by projectName ascending.

**Query Parameters:**
| Param | Type | Required | Notes |
|---|---|---|---|
| `currentStage` | string | No | Filter by stage (Schematic, DD, 50% CD, GMP, Closed, On Hold); comma-separated |
| `leadEstimatorUpn` | string | No | Filter by lead estimator UPN |

**Response:**
```typescript
{
  status: 200,
  body: {
    data: IActivePrecon[],
    total: number,
    timestamp: ISO8601
  }
}

interface IActivePrecon {
  id: string;
  projectNumber: string;
  projectName: string;
  currentStage: string; // Schematic | DD | 50% CD | GMP | Closed | On Hold
  preconBudget?: number; // USD
  designBudget?: number; // USD
  billedToDate?: number; // USD
  leadEstimatorUpn: string;
  leadEstimatorName: string;
  projectExecutiveUpn?: string;
  projectExecutiveName?: string;
  notes?: string;
  updatedByUpn: string;
  updatedAt: ISO8601;
}
```

**Permissions:** `estimating:read`

---

**POST `/api/estimating/preconstruction`**

Create a new precon record.

**Request Body:**
```typescript
{
  projectNumber: string;
  projectName: string;
  currentStage: string; // required
  preconBudget?: number;
  designBudget?: number;
  billedToDate?: number;
  leadEstimatorUpn: string; // required
  leadEstimatorName: string; // required
  projectExecutiveUpn?: string;
  projectExecutiveName?: string;
  notes?: string;
}
```

**Response:**
```typescript
{
  status: 201,
  body: {
    data: IActivePrecon // newly created record
  }
}
```

**Permissions:** `estimating:write`

---

**PATCH `/api/estimating/preconstruction/:id`**

Update a precon record (partial update).

**Response:**
```typescript
{
  status: 200,
  body: {
    data: IActivePrecon // updated record
  }
}
```

**Permissions:** `estimating:write`

---

**DELETE `/api/estimating/preconstruction/:id`**

Hard delete a precon record.

**Response:**
```typescript
{
  status: 204 // No Content
}
```

**Permissions:** `estimating:write`

---

#### 1.3 Estimate Tracking Log Endpoints

**GET `/api/estimating/log`**

Fetch log entries for a fiscal year. FiscalYear query parameter is required.

**Query Parameters:**
| Param | Type | Required | Notes |
|---|---|---|---|
| `fiscalYear` | string | Yes | Format: YYYY (e.g., "2025", "2026") |
| `status` | string | No | Filter by outcome (Pending, Awarded W Precon, Awarded W/O Precon, Not Awarded) |
| `estimateType` | string | No | Filter by estimate type |

**Response:**
```typescript
{
  status: 200,
  body: {
    data: IEstimateLogEntry[],
    total: number,
    fiscalYear: string,
    timestamp: ISO8601
  }
}

interface IEstimateLogEntry {
  id: string;
  projectNumber: string;
  projectName: string;
  estimateType: string; // Conceptual, Lump Sum, GMP Est, ROM, Hard Bid, SD, Design Build, Schematic
  fiscalYear: string; // YYYY
  costPerGsf?: number;
  costPerUnit?: number; // currency
  submittedDate: ISO8601;
  outcome: string; // Pending | Awarded W Precon | Awarded W/O Precon | Not Awarded
  amountPending?: number; // currency
  amountAwardedWithoutPrecon?: number; // currency
  amountNotAwarded?: number; // currency
  amountAwardedWithPrecon?: number; // currency
  leadEstimatorUpn: string;
  leadEstimatorName: string;
  notes?: string;
  updatedAt: ISO8601;
}
```

**Permissions:** `estimating:read`

**Important:** `fiscalYear` is a required query parameter. Request without it returns 400 Bad Request.

---

**POST `/api/estimating/log`**

Create a new log entry. FiscalYear is derived from submittedDate.

**Request Body:**
```typescript
{
  projectNumber: string;
  projectName: string;
  estimateType: string; // required
  fiscalYear: string; // derived from submittedDate; provided by client for clarity
  costPerGsf?: number;
  costPerUnit?: number;
  submittedDate: ISO8601; // required
  outcome: string; // required
  amountPending?: number;
  amountAwardedWithoutPrecon?: number;
  amountNotAwarded?: number;
  amountAwardedWithPrecon?: number;
  leadEstimatorUpn: string; // required
  leadEstimatorName: string; // required
  notes?: string;
}
```

**Response:**
```typescript
{
  status: 201,
  body: {
    data: IEstimateLogEntry // newly created record
  }
}
```

**Permissions:** `estimating:write`

**Validations:**
- `fiscalYear` in request body must match fiscal year of `submittedDate`

---

**PATCH `/api/estimating/log/:id`**

Update a log entry. Note: log entries are audit trail; no deletion is supported.

**Response:**
```typescript
{
  status: 200,
  body: {
    data: IEstimateLogEntry // updated record
  }
}
```

**Permissions:** `estimating:write`

---

#### 1.4 Analytics Endpoints

**GET `/api/estimating/analytics`**

Fetch computed analytics for a fiscal year. FiscalYear query parameter is required.

**Query Parameters:**
| Param | Type | Required | Notes |
|---|---|---|---|
| `fiscalYear` | string | Yes | Format: YYYY |

**Response:**
```typescript
{
  status: 200,
  body: {
    data: IEstimatingAnalytics,
    timestamp: ISO8601
  }
}

interface IEstimatingAnalytics {
  fiscalYear: string;

  // Top-level metrics
  totalSubmitted: number; // count of log entries
  totalAwarded: number; // count: Awarded W Precon + Awarded W/O Precon
  totalNotAwarded: number; // count: Not Awarded
  winRatePercent: number; // (totalAwarded / (totalAwarded + totalNotAwarded)) * 100, rounded to 1 decimal
  totalAwardedValue: number; // sum of all amounts in awarded entries

  // Breakdown by estimate type
  byEstimateType: Array<{
    estimateType: string;
    submitted: number;
    awarded: number;
    notAwarded: number;
    winRatePercent: number;
    totalAwardedValue: number;
  }>;

  // Breakdown by lead estimator
  byEstimator: Array<{
    leadEstimatorUpn: string;
    leadEstimatorName: string;
    submitted: number;
    awarded: number;
    notAwarded: number;
    winRatePercent: number;
    totalAwardedValue: number;
  }>;

  // Monthly volume (Jan–Dec)
  monthlyVolume: Array<{
    month: number; // 1–12
    monthName: string; // 'January', 'February', etc.
    submitted: number;
    awarded: number;
  }>;
}
```

**Permissions:** `estimating:read`

**Computation Rules:**
- `winRatePercent` = `(totalAwarded / (totalAwarded + totalNotAwarded)) * 100`
  - If denominator is 0, return `null` or `0`
  - Round to 1 decimal place
- `totalAwarded` includes both "Awarded W Precon" and "Awarded W/O Precon"
- `totalNotAwarded` excludes "Pending" entries
- `totalAwardedValue` is the sum of all amount fields for awarded entries (sum of amountAwardedWithPrecon + amountAwardedWithoutPrecon)
- `byEstimateType` and `byEstimator` arrays are sorted by submitted count (descending)
- `monthlyVolume` is always 12 entries (Jan–Dec), even if some months have 0 entries

---

**GET `/api/estimating/analytics/comparison`**

Fetch current fiscal year vs. previous fiscal year comparison.

**Query Parameters:** None (uses current date to determine fiscal years).

**Response:**
```typescript
{
  status: 200,
  body: {
    data: IAnalyticsComparison,
    timestamp: ISO8601
  }
}

interface IAnalyticsComparison {
  currentFY: string; // YYYY
  previousFY: string; // YYYY

  current: {
    submitted: number;
    awarded: number;
    notAwarded: number;
    winRatePercent: number;
  };

  previous: {
    submitted: number;
    awarded: number;
    notAwarded: number;
    winRatePercent: number;
  };

  deltas: {
    submittedDelta: number; // current - previous
    awardedDelta: number;
    winRateDelta: number; // current - previous (percentage points)
  };
}
```

**Permissions:** `estimating:read`

**Fiscal Year Determination:**
- Fiscal year is calendar year (Jan 1 – Dec 31)
- Current FY: Jan 1 of current year to Dec 31 of current year
- Previous FY: Jan 1 of (current year - 1) to Dec 31 of (current year - 1)

---

#### 1.5 Template Links Endpoints

**GET `/api/estimating/templates`**

Fetch all active template links, sorted by category (in CATEGORY_ORDER) then by sortOrder.

**Query Parameters:**
| Param | Type | Required | Notes |
|---|---|---|---|
| `category` | string | No | Filter by category |

**Response:**
```typescript
{
  status: 200,
  body: {
    data: ITemplateLink[],
    total: number,
    timestamp: ISO8601
  }
}

interface ITemplateLink {
  id: string;
  title: string;
  category: string;
  sharePointUrl: string;
  fileType: string; // docx, xlsx, pdf, pptx
  description?: string;
  sortOrder: number;
  isActive: boolean;
  updatedByUpn: string;
  updatedAt: ISO8601;
}
```

**Permissions:** `estimating:read`

**Notes:** Returns only `isActive: true` records.

---

**POST `/api/estimating/templates`**

Create a new template link.

**Request Body:**
```typescript
{
  title: string;
  category: string;
  sharePointUrl: string;
  fileType: string; // docx, xlsx, pdf, pptx
  description?: string;
  sortOrder: number;
  isActive?: boolean; // default: true
}
```

**Response:**
```typescript
{
  status: 201,
  body: {
    data: ITemplateLink // newly created record
  }
}
```

**Permissions:** `admin:write` (Admin role only)

**Validations:**
- `title` is required and non-empty
- `category` must match TemplateLinkCategory enum
- `sharePointUrl` must be valid HTTPS URL
- `fileType` must be one of: docx, xlsx, pdf, pptx
- `sortOrder` must be 0–999

**Server-set fields:**
- `id` (GUID)
- `updatedAt` (current timestamp)
- `updatedByUpn` (current user's UPN)

---

**PATCH `/api/estimating/templates/:id`**

Update a template link (partial update).

**Response:**
```typescript
{
  status: 200,
  body: {
    data: ITemplateLink // updated record
  }
}
```

**Permissions:** `admin:write`

---

**DELETE `/api/estimating/templates/:id`**

Hard delete a template link.

**Response:**
```typescript
{
  status: 204 // No Content
}
```

**Permissions:** `admin:write`

---

#### 1.6 Home Summary Endpoint

**GET `/api/estimating/summary`**

Fetch aggregated home page stats.

**Query Parameters:** None.

**Response:**
```typescript
{
  status: 200,
  body: {
    data: {
      activePursuits: number; // count of pursuits with status='Active'
      activePrecon: number; // count of precon records
      fySubmitted: number; // current FY log entries (all outcomes)
      fyWinRate: number; // current FY win rate percent
      urgentPursuits: Array<{
        id: string;
        projectNumber: string;
        projectName: string;
        dueDate: ISO8601;
        daysUntilDue: number;
      }>; // pursuits due within 7 days, sorted by dueDate ascending
    },
    timestamp: ISO8601
  }
}
```

**Permissions:** `estimating:read`

**Computation Rules:**
- `activePursuits`: count where status='Active'
- `activePrecon`: count of all precon records
- `fySubmitted`: count of log entries for current fiscal year (all outcomes, including Pending)
- `fyWinRate`: win rate for current fiscal year (excludes Pending)
- `urgentPursuits`: pursuits where dueDate is between today and today+7 days (inclusive), sorted by dueDate ascending

---

### Part 2: SharePoint List Schemas

All four SharePoint lists must be created with the exact column specifications below. Indexes are recommended for performance.

---

#### 2.1 HBIntelActivePursuits

**List Description:** Tracks all active pursuit opportunities awaiting submission or in-flight.

**Columns:**

| Column Name | Type | Required | Indexed | Notes |
|---|---|---|---|---|
| **ProjectNumber** | Single line of text | Yes | Yes | Format: ##-###-## (e.g., 25-010-42). Primary key for data consistency. |
| **ProjectName** | Single line of text | Yes | No | |
| **Source** | Single line of text | No | No | Where the opportunity came from (e.g., "Broker", "Direct", "RFQ") |
| **Deliverable** | Choice | No | No | Options: Lump Sum, GMP, Hard Bid, Design Build, ROM, SD Estimate, Schematic Estimate, Conceptual Estimate |
| **SubBidsDue** | Date | No | No | |
| **PresubmissionReview** | Date | No | No | |
| **WinStrategyMeeting** | Date | No | No | |
| **DueDate** | Date | Yes | Yes | Proposal deadline. Sorted ascending in UI. |
| **LeadEstimatorUpn** | Single line of text | Yes | No | Azure AD UPN (e.g., user@hbc-partners.com) |
| **LeadEstimatorName** | Single line of text | Yes | No | Display name for lead estimator |
| **ContributorUpns** | Multi-line of text | No | No | JSON array of UPNs (e.g., `["user1@hbc-partners.com", "user2@hbc-partners.com"]`) |
| **ContributorNames** | Multi-line of text | No | No | JSON array of display names (parallel to ContributorUpns) |
| **ProjectExecutiveUpn** | Single line of text | No | No | Azure AD UPN of project executive |
| **ProjectExecutiveName** | Single line of text | No | No | Display name of project executive |
| **Status** | Choice | Yes | Yes | Options: Active, Submitted, Awarded, NotAwarded, OnHold, Withdrawn. Default: Active |
| **CheckBidBond** | Yes/No | No | No | Checklist: bid bond obtained. Default: false |
| **CheckPPBond** | Yes/No | No | No | Checklist: performance/payment bond obtained. Default: false |
| **CheckSchedule** | Yes/No | No | No | Checklist: schedule prepared. Default: false |
| **CheckLogistics** | Yes/No | No | No | Checklist: logistics coordinated. Default: false |
| **CheckBimProposal** | Yes/No | No | No | Checklist: BIM proposal completed. Default: false |
| **CheckPreconProposal** | Yes/No | No | No | Checklist: precon proposal completed. Default: false |
| **CheckProposalTabs** | Yes/No | No | No | Checklist: proposal tabs finalized. Default: false |
| **CheckMarketingCoordination** | Yes/No | No | No | Checklist: marketing coordination done. Default: false |
| **CheckBusinessTerms** | Yes/No | No | No | Checklist: business terms reviewed. Default: false |
| **BuildingConnectedUrl** | Single line of text | No | No | Deep link to Building Connected project (if available) |
| **ProcoreUrl** | Single line of text | No | No | Deep link to Procore project (if available) |
| **UpdatedByUpn** | Single line of text | Yes | No | Azure AD UPN of last modifier (set by backend) |
| **UpdatedAt** | DateTime | Yes | No | Timestamp of last update (set by backend) |

**Indexes:**
- Composite: `(ProjectNumber)` — primary key lookup
- Single: `(DueDate)` — for sorting pursuits by due date
- Single: `(Status)` — filter by status
- Composite: `(LeadEstimatorUpn, DueDate)` — filter by estimator and sort by due date

**Remarks:**
- `ContributorUpns` and `ContributorNames` must be kept in sync (parallel arrays)
- All date fields are in UTC ISO8601 format when read via API
- URLs (BuildingConnectedUrl, ProcoreUrl) are optional; omitted if not available

---

#### 2.2 HBIntelActivePreconstruction

**List Description:** Tracks active preconstruction projects and budgets.

**Columns:**

| Column Name | Type | Required | Indexed | Notes |
|---|---|---|---|---|
| **ProjectNumber** | Single line of text | Yes | Yes | Format: ##-###-##. Links to Active Pursuits if applicable. |
| **ProjectName** | Single line of text | Yes | Yes | Sorted in UI by project name. |
| **CurrentStage** | Choice | Yes | No | Options: Schematic, DD, 50% CD, GMP, Closed, On Hold. Default: Schematic |
| **PreconBudget** | Currency | No | No | Precon phase budget (USD) |
| **DesignBudget** | Currency | No | No | Design budget (USD) |
| **BilledToDate** | Currency | No | No | Amount billed to client to date (USD) |
| **LeadEstimatorUpn** | Single line of text | Yes | No | Azure AD UPN |
| **LeadEstimatorName** | Single line of text | Yes | No | Display name |
| **ProjectExecutiveUpn** | Single line of text | No | No | Azure AD UPN |
| **ProjectExecutiveName** | Single line of text | No | No | Display name |
| **Notes** | Multi-line of text | No | No | Free-form notes (e.g., client contact, project specifics) |
| **UpdatedByUpn** | Single line of text | Yes | No | Azure AD UPN of last modifier |
| **UpdatedAt** | DateTime | Yes | No | Timestamp of last update |

**Indexes:**
- Single: `(ProjectNumber)`
- Single: `(ProjectName)` — for default sort
- Single: `(CurrentStage)` — filter by stage

---

#### 2.3 HBIntelEstimateLog

**List Description:** Audit trail of all estimates submitted. No deletion; only creation and update. Supports fiscal-year analytics.

**Columns:**

| Column Name | Type | Required | Indexed | Notes |
|---|---|---|---|---|
| **ProjectNumber** | Single line of text | Yes | Yes | Reference to pursuit (may not exist in Active Pursuits if project was external) |
| **ProjectName** | Single line of text | Yes | No | Display name |
| **EstimateType** | Choice | Yes | No | Options: Conceptual Estimate, Lump Sum Proposal, GMP Est, ROM, Hard Bid, SD Estimate, Design Build, Schematic Estimate |
| **FiscalYear** | Single line of text | Yes | Yes | Format: YYYY (e.g., "2025", "2026") |
| **CostPerGsf** | Number | No | No | Cost per gross square foot (decimal, 2 places) |
| **CostPerUnit** | Currency | No | No | Cost per unit (USD) |
| **SubmittedDate** | Date | Yes | Yes | When estimate was submitted (used to derive FY if not provided) |
| **Outcome** | Choice | Yes | No | Options: Pending, Awarded W Precon, Awarded W/O Precon, Not Awarded. Default: Pending |
| **AmountPending** | Currency | No | No | Total amount when outcome is "Pending" (USD) |
| **AmountAwardedWithPrecon** | Currency | No | No | Total amount awarded with precon (USD) |
| **AmountAwardedWithoutPrecon** | Currency | No | No | Total amount awarded without precon (USD) |
| **AmountNotAwarded** | Currency | No | No | Total amount when not awarded (USD) |
| **LeadEstimatorUpn** | Single line of text | Yes | No | Azure AD UPN of lead estimator |
| **LeadEstimatorName** | Single line of text | Yes | No | Display name |
| **Notes** | Multi-line of text | No | No | Free-form notes (e.g., client feedback, reason for non-award) |
| **UpdatedByUpn** | Single line of text | Yes | No | Azure AD UPN of last modifier |
| **UpdatedAt** | DateTime | Yes | No | Timestamp of last update |

**Indexes:**
- Composite: `(FiscalYear, SubmittedDate)` — filter by FY and sort by submission date
- Single: `(ProjectNumber)` — lookup by project
- Single: `(Outcome)` — filter by outcome

**Remarks:**
- Exactly one of the `Amount*` fields should be populated per log entry, depending on `Outcome`
- `FiscalYear` is a snapshot for fast filtering; it must match the calendar year of `SubmittedDate`
- No deletion is supported; soft-delete via outcome change is discouraged (creates audit confusion)

---

#### 2.4 HBIntelTemplateLinks

**List Description:** Library of curated SharePoint document links organized by category. Managed by Admins.

**Columns:**

| Column Name | Type | Required | Indexed | Notes |
|---|---|---|---|---|
| **Title** | Single line of text | Yes | No | Display name (e.g., "HBC Standard GMP Template") |
| **Category** | Choice | Yes | Yes | Options match TemplateLinkCategory enum: Cover & Summary, Estimate, Schedule, BIM & 3D, Preconstruction, Proposal, Legal & Compliance, Other |
| **SharePointUrl** | Single line of text | Yes | No | Full HTTPS URL to SharePoint document (e.g., `https://hbcteams.sharepoint.com/sites/...`) |
| **FileType** | Single line of text | Yes | No | File extension: docx, xlsx, pdf, pptx |
| **Description** | Multi-line of text | No | No | User-facing description (150–300 characters) |
| **SortOrder** | Number | Yes | Yes | Display order within category (0–999). Ascending. Default: 0 |
| **IsActive** | Yes/No | Yes | Yes | Include in Estimating display? Default: true. Inactive templates hidden from UI. |
| **UpdatedByUpn** | Single line of text | Yes | No | Azure AD UPN of last modifier |
| **UpdatedAt** | DateTime | Yes | No | Timestamp of last update |

**Indexes:**
- Composite: `(Category, SortOrder)` — group and sort in UI
- Single: `(IsActive)` — filter to active templates only

**Remarks:**
- SharePointUrl must be HTTPS and must point to a real document
- FileType is informational (shown as icon in UI); not validated against actual file
- SortOrder is used to control display within each category; duplicates allowed but not recommended

---

### Part 3: Type Definitions (TypeScript)

Create `packages/features/estimating/src/types/api.ts`:

```typescript
// Request/Response types for all Estimating API endpoints

// Active Pursuits
export interface IActivePursuit {
  id: string;
  projectNumber: string;
  projectName: string;
  source?: string;
  deliverable?: string;
  subBidsDue?: string; // ISO8601
  presubmissionReview?: string; // ISO8601
  winStrategyMeeting?: string; // ISO8601
  dueDate: string; // ISO8601
  leadEstimatorUpn: string;
  leadEstimatorName: string;
  contributorUpns?: string[];
  contributorNames?: string[];
  projectExecutiveUpn?: string;
  projectExecutiveName?: string;
  status: 'Active' | 'Submitted' | 'Awarded' | 'NotAwarded' | 'OnHold' | 'Withdrawn';
  checkBidBond?: boolean;
  checkPPBond?: boolean;
  checkSchedule?: boolean;
  checkLogistics?: boolean;
  checkBimProposal?: boolean;
  checkPreconProposal?: boolean;
  checkProposalTabs?: boolean;
  checkMarketingCoordination?: boolean;
  checkBusinessTerms?: boolean;
  buildingConnectedUrl?: string;
  procoreUrl?: string;
  updatedByUpn: string;
  updatedAt: string; // ISO8601
}

export type CreateActivePursuitRequest = Omit<
  IActivePursuit,
  'id' | 'createdAt' | 'updatedByUpn' | 'updatedAt'
>;

export type UpdateActivePursuitRequest = Partial<
  Omit<IActivePursuit, 'id' | 'createdAt'>
>;

// Active Preconstruction
export interface IActivePrecon {
  id: string;
  projectNumber: string;
  projectName: string;
  currentStage: 'Schematic' | 'DD' | '50% CD' | 'GMP' | 'Closed' | 'On Hold';
  preconBudget?: number;
  designBudget?: number;
  billedToDate?: number;
  leadEstimatorUpn: string;
  leadEstimatorName: string;
  projectExecutiveUpn?: string;
  projectExecutiveName?: string;
  notes?: string;
  updatedByUpn: string;
  updatedAt: string; // ISO8601
}

export type CreateActivePreconRequest = Omit<
  IActivePrecon,
  'id' | 'updatedByUpn' | 'updatedAt'
>;

export type UpdateActivePreconRequest = Partial<
  Omit<IActivePrecon, 'id'>
>;

// Estimate Log
export interface IEstimateLogEntry {
  id: string;
  projectNumber: string;
  projectName: string;
  estimateType: string;
  fiscalYear: string; // YYYY
  costPerGsf?: number;
  costPerUnit?: number;
  submittedDate: string; // ISO8601
  outcome: 'Pending' | 'Awarded W Precon' | 'Awarded W/O Precon' | 'Not Awarded';
  amountPending?: number;
  amountAwardedWithoutPrecon?: number;
  amountNotAwarded?: number;
  amountAwardedWithPrecon?: number;
  leadEstimatorUpn: string;
  leadEstimatorName: string;
  notes?: string;
  updatedAt: string; // ISO8601
}

export type CreateEstimateLogRequest = Omit<
  IEstimateLogEntry,
  'id' | 'updatedAt'
>;

export type UpdateEstimateLogRequest = Partial<
  Omit<IEstimateLogEntry, 'id'>
>;

// Analytics
export interface IEstimatingAnalytics {
  fiscalYear: string;
  totalSubmitted: number;
  totalAwarded: number;
  totalNotAwarded: number;
  winRatePercent: number | null;
  totalAwardedValue: number;
  byEstimateType: Array<{
    estimateType: string;
    submitted: number;
    awarded: number;
    notAwarded: number;
    winRatePercent: number | null;
    totalAwardedValue: number;
  }>;
  byEstimator: Array<{
    leadEstimatorUpn: string;
    leadEstimatorName: string;
    submitted: number;
    awarded: number;
    notAwarded: number;
    winRatePercent: number | null;
    totalAwardedValue: number;
  }>;
  monthlyVolume: Array<{
    month: number; // 1–12
    monthName: string;
    submitted: number;
    awarded: number;
  }>;
}

export interface IAnalyticsComparison {
  currentFY: string;
  previousFY: string;
  current: {
    submitted: number;
    awarded: number;
    notAwarded: number;
    winRatePercent: number | null;
  };
  previous: {
    submitted: number;
    awarded: number;
    notAwarded: number;
    winRatePercent: number | null;
  };
  deltas: {
    submittedDelta: number;
    awardedDelta: number;
    winRateDelta: number;
  };
}

// Template Links
export interface ITemplateLink {
  id: string;
  title: string;
  category: string;
  sharePointUrl: string;
  fileType: 'docx' | 'xlsx' | 'pdf' | 'pptx';
  description?: string;
  sortOrder: number;
  isActive: boolean;
  updatedByUpn: string;
  updatedAt: string; // ISO8601
}

export type CreateTemplateLinkRequest = Omit<
  ITemplateLink,
  'id' | 'updatedByUpn' | 'updatedAt'
>;

export type UpdateTemplateLinkRequest = Partial<
  Omit<ITemplateLink, 'id'>
>;

// Home Summary
export interface IEstimatingHomeSummary {
  activePursuits: number;
  activePrecon: number;
  fySubmitted: number;
  fyWinRate: number | null;
  urgentPursuits: Array<{
    id: string;
    projectNumber: string;
    projectName: string;
    dueDate: string; // ISO8601
    daysUntilDue: number;
  }>;
}

// API Response wrapper
export interface ApiResponse<T> {
  status: number;
  body: {
    data: T;
    total?: number;
    fiscalYear?: string;
    timestamp: string; // ISO8601
  };
}
```

---

## Verification

### Endpoint Contract Tests

```bash
# Unit tests for all endpoints
cd backend/functions
pnpm vitest run src/functions/estimating/index.test.ts

# Verify all request/response schemas
pnpm vitest run src/functions/estimating/handlers/*.test.ts
```

**Checks:**
- GET /api/estimating/pursuits returns 200 with IActivePursuit[]
- POST /api/estimating/pursuits returns 201 with created record
- projectNumber validation: ##-###-## format enforced
- FiscalYear required on GET /api/estimating/log (400 without it)
- Analytics computed correctly (winRate, byEstimateType, monthlyVolume)
- Template links sorted by category + sortOrder
- Auth: All endpoints check Bearer token, verify RBAC permissions

### SharePoint List Schema Verification

```bash
# Verify list creation via provisioning saga
cd backend/provisioning
pnpm vitest run ./estimating-lists.test.ts
```

**Checks:**
- HBIntelActivePursuits: all columns exist with correct types
- HBIntelActivePreconstruction: all columns exist with correct types
- HBIntelEstimateLog: all columns exist with correct types
- HBIntelTemplateLinks: all columns exist with correct types
- All indexes created
- Choice fields have correct options
- Required fields marked correctly

---

## Definition of Done

- [ ] `backend/functions/src/functions/estimating/index.ts` created with all 6 endpoint groups (pursuits, precon, log, templates, analytics, summary)
- [ ] All endpoints follow request/response schema exactly as specified in Part 1
- [ ] All query parameters validated (e.g., fiscalYear required for log endpoints)
- [ ] All route parameters validated (e.g., id must be valid GUID)
- [ ] Bearer token auth enforced on all endpoints
- [ ] RBAC: `estimating:read` enforced on read endpoints, `estimating:write` on write, `admin:write` on template write
- [ ] All error responses include status code and error message (400, 401, 403, 404, 409, 500)
- [ ] WIN RATE COMPUTATION: `(awarded / (awarded + notAwarded)) * 100`, null if denominator is 0, rounded to 1 decimal
- [ ] All four SharePoint lists created with exact column specifications from Part 2
- [ ] List indexes created for performance (ProjectNumber, DueDate, Status, Category+SortOrder, etc.)
- [ ] IActivePursuit, IActivePrecon, IEstimateLogEntry, ITemplateLink types exported from `packages/features/estimating/src/types/api.ts`
- [ ] Request types (Create*, Update*) exported from same file
- [ ] `packages/features/estimating/src/data/estimatingQueries.ts` updated to call all endpoints
- [ ] Vitest: 30+ tests verifying endpoint contracts, schemas, validation, auth
- [ ] E2E: Playwright tests for full CRUD flows per endpoint
- [ ] API documentation: `docs/reference/api/estimating.md` created and deployed

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase: PH7-Estimating-10 (Backend API)
Status: Plan created, awaiting implementation
Next: Implement backend handlers, verify schema, proceed to PH7-Estimating-11 (Testing)
-->
