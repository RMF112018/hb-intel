// Azure Functions v4 entry point
// Each import triggers function registration via app.http() / app.timer()

import './functions/provisioningSaga/index.js';
import './functions/proxy/index.js';
import './functions/timerFullSpec/index.js';
import './functions/signalr/index.js';
import './functions/projectRequests/index.js';
import './functions/acknowledgments/index.js';
import './functions/notifications/index.js';
import './functions/legacyFallbackDiscovery/index.js';
// Legacy fallback review/admin routes. This module is the single source of
// /admin/legacy-fallback/review/* registrations and is also imported by the
// admin-control-plane host so both composition paths stay in sync.
import './functions/adminApi/legacy-fallback-routes.js';

// Health probe (P1-C3 §2.2.1)
import './functions/health/index.js';

// Idempotency cleanup timer (P1-D1)
import './functions/cleanupIdempotency/index.js';

// Phase 1 domain route handlers (P1-C1-a)
import './functions/leads/index.js';
import './functions/projects/index.js';
import './functions/estimating/index.js';
import './functions/schedule/index.js';
import './functions/buyout/index.js';
import './functions/compliance/index.js';
import './functions/contracts/index.js';
import './functions/risk/index.js';
import './functions/scorecards/index.js';
import './functions/pmp/index.js';
