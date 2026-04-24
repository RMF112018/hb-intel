/**
 * Public liveness + deployment-identity probe.
 *
 * This route is intentionally anonymous and intentionally minimal. Its only
 * responsibilities are:
 *   1. prove the process is alive (200 with a small, stable body),
 *   2. expose the running artifact identity so the post-deploy CI gate can
 *      assert BOTH `artifact.commitSha` and `artifact.version` match the
 *      intended release (see backend/functions/README.md "Deployment and
 *      artifact truth").
 *
 * All readiness/config/permission posture disclosure lives behind the
 * admin-gated `/api/health/ready` route. Do not add new fields here —
 * every field on this route is public, unauthenticated surface.
 */

import { app, type HttpResponseInit } from '@azure/functions';
import { resolveBackendArtifactIdentity } from '../../utils/backend-version.js';

app.http('health', {
  route: 'health',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (): Promise<HttpResponseInit> => {
    const artifactIdentity = resolveBackendArtifactIdentity();
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
      jsonBody: {
        status: 'healthy',
        artifact: {
          version: artifactIdentity.version,
          commitSha: artifactIdentity.commitSha,
          buildTimestamp: artifactIdentity.buildTimestamp,
        },
        timestamp: new Date().toISOString(),
      },
    };
  },
});

// Register the admin-gated readiness route as a side-effect of importing
// this module; both live under the same `health` function family.
import './ready.js';
