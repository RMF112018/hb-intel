// Project Setup domain host — Azure Functions v4 entry point
// ADR-0124: Per-domain Function App host with shared monorepo libraries
//
// This composition root registers ONLY the route families that belong
// to the Project Setup domain boundary. Domain CRUD route families
// (leads, projects, estimating, schedule, buyout, compliance, contracts,
// risk, scorecards, pmp) are intentionally excluded.
//
// See: Phase-1_Backend-Boundary-Freeze.md (AC-1)

// --- Project Setup request lifecycle ---
import '../../functions/projectRequests/index.js';

// --- Provisioning saga and deferred step ---
import '../../functions/provisioningSaga/index.js';
import '../../functions/timerFullSpec/index.js';

// --- Real-time updates ---
import '../../functions/signalr/index.js';

// --- Workflow handoff ---
import '../../functions/acknowledgments/index.js';

// --- Notification dispatch ---
import '../../functions/notifications/index.js';

// --- Health probe ---
import '../../functions/health/index.js';

// --- Idempotency cleanup timer ---
import '../../functions/cleanupIdempotency/index.js';
