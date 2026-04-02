// Admin Control Plane domain host — Azure Functions v4 entry point
// Phase 3 (P3-02): Per-domain Function App host with shared monorepo libraries
//
// This composition root registers ONLY the route families that belong
// to the Admin Control Plane domain boundary. Route families for
// Project Setup, domain CRUD, and other domains are intentionally excluded.
//
// See: ADR-0124, Phase 3 Summary Plan

// --- Health probe (shared infrastructure, required for all hosts) ---
import '../../functions/health/index.js';
