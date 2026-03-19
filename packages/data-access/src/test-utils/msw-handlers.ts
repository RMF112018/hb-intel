import { http, HttpResponse } from 'msw';
import {
  LEAD_FIXTURES,
  PROJECT_FIXTURES,
  ESTIMATING_TRACKER_FIXTURES,
  PORTFOLIO_SUMMARY_FIXTURE,
  makePagedResponse,
} from './msw-fixtures.js';

const API_BASE = 'http://localhost:7071/api';

let nextLeadId = 100;
let nextProjectId = 100;
let nextTrackerId = 100;

// ─── Lead Handlers ───────────────────────────────────────────────────────────

export const leadsHandlers = [
  // GET /api/leads — paged list (also handles search via ?q= param)
  http.get(`${API_BASE}/leads`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 25);
    const q = url.searchParams.get('q');

    let items = LEAD_FIXTURES;
    if (q) {
      const lower = q.toLowerCase();
      items = items.filter(
        (l) =>
          l.title.toLowerCase().includes(lower) ||
          l.clientName.toLowerCase().includes(lower),
      );
    }

    return HttpResponse.json(makePagedResponse(items, page, pageSize));
  }),

  // GET /api/leads/:id — single item
  http.get(`${API_BASE}/leads/:id`, ({ params }) => {
    const lead = LEAD_FIXTURES.find((l) => l.id === Number(params.id));
    if (!lead) {
      return HttpResponse.json(
        { message: 'Lead not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: lead });
  }),

  // POST /api/leads — create
  http.post(`${API_BASE}/leads`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newLead = {
      ...body,
      id: nextLeadId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newLead }, { status: 201 });
  }),

  // PUT /api/leads/:id — update (D5: PUT-only)
  http.put(`${API_BASE}/leads/:id`, async ({ params, request }) => {
    const lead = LEAD_FIXTURES.find((l) => l.id === Number(params.id));
    if (!lead) {
      return HttpResponse.json(
        { message: 'Lead not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    const body = (await request.json()) as Record<string, unknown>;
    const updated = {
      ...lead,
      ...body,
      id: lead.id,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ data: updated });
  }),

  // DELETE /api/leads/:id — 204 No Content
  http.delete(`${API_BASE}/leads/:id`, ({ params }) => {
    const lead = LEAD_FIXTURES.find((l) => l.id === Number(params.id));
    if (!lead) {
      return HttpResponse.json(
        { message: 'Lead not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),
];

// ─── Project Handlers ────────────────────────────────────────────────────────

export const projectsHandlers = [
  // GET /api/projects/summary — portfolio aggregate (before :id catch-all)
  http.get(`${API_BASE}/projects/summary`, () => {
    return HttpResponse.json({ data: PORTFOLIO_SUMMARY_FIXTURE });
  }),

  // GET /api/projects — paged list
  http.get(`${API_BASE}/projects`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 25);
    return HttpResponse.json(makePagedResponse(PROJECT_FIXTURES, page, pageSize));
  }),

  // GET /api/projects/:id — single item
  http.get(`${API_BASE}/projects/:id`, ({ params }) => {
    const project = PROJECT_FIXTURES.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json(
        { message: 'Project not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: project });
  }),

  // POST /api/projects — create
  http.post(`${API_BASE}/projects`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newProject = {
      ...body,
      id: `generated-uuid-${nextProjectId++}`,
    };
    return HttpResponse.json({ data: newProject }, { status: 201 });
  }),

  // PUT /api/projects/:id — update
  http.put(`${API_BASE}/projects/:id`, async ({ params, request }) => {
    const project = PROJECT_FIXTURES.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json(
        { message: 'Project not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    const body = (await request.json()) as Record<string, unknown>;
    const updated = { ...project, ...body, id: project.id };
    return HttpResponse.json({ data: updated });
  }),

  // DELETE /api/projects/:id — 204 No Content
  http.delete(`${API_BASE}/projects/:id`, ({ params }) => {
    const project = PROJECT_FIXTURES.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json(
        { message: 'Project not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),
];

// ─── Estimating Handlers ─────────────────────────────────────────────────────

export const estimatingHandlers = [
  // GET /api/estimating/trackers — paged list
  http.get(`${API_BASE}/estimating/trackers`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 25);
    return HttpResponse.json(
      makePagedResponse(ESTIMATING_TRACKER_FIXTURES, page, pageSize),
    );
  }),

  // GET /api/estimating/trackers/:id — single item
  http.get(`${API_BASE}/estimating/trackers/:id`, ({ params }) => {
    const tracker = ESTIMATING_TRACKER_FIXTURES.find(
      (t) => t.id === Number(params.id),
    );
    if (!tracker) {
      return HttpResponse.json(
        { message: 'Tracker not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: tracker });
  }),

  // POST /api/estimating/trackers — create
  http.post(`${API_BASE}/estimating/trackers`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newTracker = {
      ...body,
      id: nextTrackerId++,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newTracker }, { status: 201 });
  }),

  // PUT /api/estimating/trackers/:id — update
  http.put(`${API_BASE}/estimating/trackers/:id`, async ({ params, request }) => {
    const tracker = ESTIMATING_TRACKER_FIXTURES.find(
      (t) => t.id === Number(params.id),
    );
    if (!tracker) {
      return HttpResponse.json(
        { message: 'Tracker not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    const body = (await request.json()) as Record<string, unknown>;
    const updated = {
      ...tracker,
      ...body,
      id: tracker.id,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ data: updated });
  }),

  // DELETE /api/estimating/trackers/:id — 204 No Content
  http.delete(`${API_BASE}/estimating/trackers/:id`, ({ params }) => {
    const tracker = ESTIMATING_TRACKER_FIXTURES.find(
      (t) => t.id === Number(params.id),
    );
    if (!tracker) {
      return HttpResponse.json(
        { message: 'Tracker not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),
];

// ─── Combined Handlers ───────────────────────────────────────────────────────

export const defaultHandlers = [
  ...leadsHandlers,
  ...projectsHandlers,
  ...estimatingHandlers,
];
