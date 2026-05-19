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
// My Projects projection — Microsoft Graph webhook ingress (B05.13 Prompt 04).
import './functions/myProjectsProjectionWebhook/index.js';
// My Projects projection — Graph subscription renewal timer + admin route (B05.13 Prompt 05).
import './functions/myProjectsProjectionSubscriptionRenewal/index.js';
import './functions/myProjectsProjectionSubscriptionAdmin/index.js';
// My Projects projection — SharePoint pending-work processor timer (B05.16 Prompt 04).
import './functions/myProjectsProjectionPendingWorkProcessor/index.js';
// My Projects projection — Service Bus queue-trigger delta sync worker (B05.13 Prompt 06).
import './functions/myProjectsProjectionSyncWorker/index.js';
// Legacy fallback review/admin routes. This module is the single source of
// /admin-api/legacy-fallback/review/* registrations and is also imported by
// the admin-control-plane host so both composition paths stay in sync. The
// `admin-api/` prefix avoids the Azure Functions reserved `admin/` route
// namespace that would otherwise produce a startup-time route conflict.
import './functions/adminApi/legacy-fallback-routes.js';
// Safety record-keeping admin API routes are co-hosted with the monolithic
// host to support production ingestion and provisioning operations.
import './functions/adminApi/safety-record-keeping-routes.js';
// Safety Field Excellence rollup, candidates, highlight workflow, and
// homepage current endpoint (Waves 03–04).
import './functions/adminApi/safety-field-excellence-routes.js';
// Foleon connector routes keep content management, placement, and sync writes
// behind the backend app-role and Graph control plane.
import './functions/adminApi/foleon-routes.js';

// Health probe (P1-C3 §2.2.1)
import './functions/health/index.js';

// Idempotency cleanup timer (P1-D1)
import './functions/cleanupIdempotency/index.js';

// Safety Field Excellence weekly rollup timer (Wave 04).
import './functions/safetyFieldExcellenceWeeklyRollup/index.js';

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
import './hosts/pcc-read-model/pcc-read-model-routes.js';

// My Dashboard / My Work protected read-model routes
import './hosts/my-work-read-model/my-work-read-model-routes.js';

// My Dashboard / Adobe Sign delegated OAuth routes
import './hosts/my-work-read-model/adobe-sign-oauth-routes.js';

// My Dashboard / Adobe Sign action-link resolver route
import './hosts/my-work-read-model/adobe-sign-action-link-routes.js';
