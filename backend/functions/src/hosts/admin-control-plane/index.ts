// Admin Control Plane domain host — Azure Functions v4 entry point
// Phase 3 (P3-02, P3-04): Per-domain Function App host with shared monorepo libraries
//
// This composition root registers ONLY the route families that belong
// to the Admin Control Plane domain boundary. Route families for
// Project Setup, domain CRUD, and other domains are intentionally excluded.
//
// See: ADR-0124, Phase 3 Summary Plan

// --- Admin API (authenticated operator endpoints) ---
// Note: `adminApi/index.js` side-effect-imports `adminApi/legacy-fallback-routes.js`.
// The default host (`src/index.ts`) also imports that legacy-fallback routes module
// directly, so the legacy fallback review/admin registrations come from one shared
// source of truth regardless of which host composition is active.
import '../../functions/adminApi/index.js';

// --- P9-06: Hybrid Identity user lifecycle routes ---
import '../../functions/adminApi/hybrid-identity-routes.js';

// --- Health probe (shared infrastructure, required for all hosts) ---
import '../../functions/health/index.js';
