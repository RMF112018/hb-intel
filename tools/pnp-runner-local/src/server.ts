import fs from 'node:fs';
import https from 'node:https';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { getActions } from './actionCatalog.js';
import { readRunnerConfig } from './config.js';
import { LocalRunnerService } from './runService.js';
import type { PreflightRequest, RunLaunchRequest } from './types.js';

function writeJson(res: ServerResponse, statusCode: number, body: unknown, origin: string | null): void {
  const payload = JSON.stringify(body);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.end(payload);
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const buffers: Buffer[] = [];
  for await (const chunk of req) {
    buffers.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const text = Buffer.concat(buffers).toString('utf-8');
  return (text ? JSON.parse(text) : {}) as T;
}

function matchPath(pathname: string): {
  readonly runId?: string;
  readonly artifactId?: string;
  readonly isRunById: boolean;
  readonly isRunEvidence: boolean;
  readonly isArtifactDownload: boolean;
} {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 2 && segments[0] === 'runs') {
    return { isRunById: true, isRunEvidence: false, isArtifactDownload: false, runId: segments[1] };
  }
  if (segments.length === 3 && segments[0] === 'runs' && segments[2] === 'evidence') {
    return { isRunById: false, isRunEvidence: true, isArtifactDownload: false, runId: segments[1] };
  }
  if (segments.length === 5 && segments[0] === 'runs' && segments[2] === 'artifacts' && segments[4] === 'download') {
    return { isRunById: false, isRunEvidence: false, isArtifactDownload: true, runId: segments[1], artifactId: segments[3] };
  }
  return { isRunById: false, isRunEvidence: false, isArtifactDownload: false };
}

export async function startRunnerServer(): Promise<https.Server> {
  const config = readRunnerConfig();
  const service = new LocalRunnerService(config);
  await service.initialize();

  const cert = fs.readFileSync(config.certPath);
  const key = fs.readFileSync(config.keyPath);

  const server = https.createServer({ cert, key }, async (req, res) => {
    const method = req.method ?? 'GET';
    const parsed = new URL(req.url ?? '/', `https://${config.host}:${config.port}`);
    const originHeader = req.headers.origin;
    const origin = typeof originHeader === 'string' ? originHeader : null;
    const originAllowed = !origin || config.allowedOrigins.includes(origin);

    if (origin && !originAllowed) {
      writeJson(res, 403, { error: 'Origin not allowed.' }, null);
      return;
    }
    if (method === 'OPTIONS') {
      res.statusCode = 204;
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
      }
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.end();
      return;
    }

    try {
      if (method === 'GET' && parsed.pathname === '/health') {
        writeJson(res, 200, { data: { healthy: true, mode: 'local-runner', timestamp: new Date().toISOString() } }, origin);
        return;
      }
      if (method === 'GET' && parsed.pathname === '/capabilities') {
        writeJson(
          res,
          200,
          {
            data: {
              mode: 'local-runner',
              authMode: config.authMode,
              actions: getActions().map((action) => action.actionKey),
              host: config.host,
              port: config.port,
            },
          },
          origin,
        );
        return;
      }
      if (method === 'GET' && parsed.pathname === '/actions') {
        writeJson(res, 200, { items: getActions() }, origin);
        return;
      }
      if (method === 'POST' && parsed.pathname === '/preflight') {
        const body = await readJsonBody<PreflightRequest>(req);
        const result = await service.getPreflight(body.actionKey, body.commandInput ?? {});
        writeJson(res, 200, { data: result }, origin);
        return;
      }
      if (method === 'POST' && parsed.pathname === '/runs') {
        const body = await readJsonBody<RunLaunchRequest>(req);
        const launched = await service.launch(body);
        writeJson(res, 202, { data: launched }, origin);
        return;
      }

      const matched = matchPath(parsed.pathname);
      if (method === 'GET' && matched.isRunById && matched.runId) {
        writeJson(res, 200, { data: service.getRun(matched.runId) }, origin);
        return;
      }
      if (method === 'GET' && matched.isRunEvidence && matched.runId) {
        writeJson(res, 200, { data: service.getEvidence(matched.runId) }, origin);
        return;
      }
      if (method === 'GET' && matched.isArtifactDownload && matched.runId && matched.artifactId) {
        const artifact = await service.getArtifact(matched.runId, matched.artifactId);
        res.statusCode = 200;
        if (origin) {
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Vary', 'Origin');
        }
        res.setHeader('Content-Type', artifact.contentType);
        res.setHeader('Content-Disposition', `attachment; filename=\"${artifact.fileName}\"`);
        fs.createReadStream(artifact.filePath).pipe(res);
        return;
      }

      writeJson(res, 404, { error: 'Route not found.' }, origin);
    } catch (error) {
      writeJson(
        res,
        500,
        { error: error instanceof Error ? error.message : 'Unhandled runner error.' },
        origin,
      );
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(config.port, config.host, () => resolve());
  });

  return server;
}
