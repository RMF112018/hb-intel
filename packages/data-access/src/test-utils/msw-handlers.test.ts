import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './msw-server.js';
import {
  LEAD_FIXTURES,
  PROJECT_FIXTURES,
  ESTIMATING_TRACKER_FIXTURES,
  PORTFOLIO_SUMMARY_FIXTURE,
} from './msw-fixtures.js';

const API_BASE = 'http://localhost:7071/api';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Leads ───────────────────────────────────────────────────────────────────

describe('Leads MSW handlers', () => {
  it('GET /api/leads returns paged envelope', async () => {
    const res = await fetch(`${API_BASE}/leads`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('total', LEAD_FIXTURES.length);
    expect(body).toHaveProperty('page', 1);
    expect(body).toHaveProperty('pageSize', 25);
    expect(body.items).toHaveLength(LEAD_FIXTURES.length);
  });

  it('GET /api/leads supports pagination', async () => {
    const res = await fetch(`${API_BASE}/leads?page=1&pageSize=2`);
    const body = await res.json();
    expect(body.items).toHaveLength(2);
    expect(body.total).toBe(LEAD_FIXTURES.length);
    expect(body.pageSize).toBe(2);
  });

  it('GET /api/leads?q= filters by search query', async () => {
    const res = await fetch(`${API_BASE}/leads?q=highway`);
    const body = await res.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].title).toContain('Highway');
  });

  it('GET /api/leads/:id returns { data: ILead }', async () => {
    const res = await fetch(`${API_BASE}/leads/1`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body.data.id).toBe(1);
    expect(body.data.title).toBe(LEAD_FIXTURES[0].title);
  });

  it('GET /api/leads/:id returns 404 for unknown ID', async () => {
    const res = await fetch(`${API_BASE}/leads/999`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('message', 'Lead not found');
    expect(body).toHaveProperty('code', 'NOT_FOUND');
  });

  it('POST /api/leads returns 201 with created entity', async () => {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Lead',
        stage: 'Identified',
        clientName: 'Test Corp',
        estimatedValue: 100000,
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toHaveProperty('id');
    expect(body.data.title).toBe('New Lead');
    expect(body.data).toHaveProperty('createdAt');
  });

  it('PUT /api/leads/:id returns updated entity', async () => {
    const res = await fetch(`${API_BASE}/leads/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated Title' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.title).toBe('Updated Title');
    expect(body.data.id).toBe(1);
  });

  it('DELETE /api/leads/:id returns 204 with empty body', async () => {
    const res = await fetch(`${API_BASE}/leads/1`, { method: 'DELETE' });
    expect(res.status).toBe(204);
    const text = await res.text();
    expect(text).toBe('');
  });
});

// ─── Projects ────────────────────────────────────────────────────────────────

describe('Projects MSW handlers', () => {
  it('GET /api/projects returns paged envelope', async () => {
    const res = await fetch(`${API_BASE}/projects`);
    const body = await res.json();
    expect(body.items).toHaveLength(PROJECT_FIXTURES.length);
    expect(body.total).toBe(PROJECT_FIXTURES.length);
  });

  it('GET /api/projects/summary returns portfolio summary', async () => {
    const res = await fetch(`${API_BASE}/projects/summary`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toEqual(PORTFOLIO_SUMMARY_FIXTURE);
  });

  it('GET /api/projects/:id returns single project', async () => {
    const id = PROJECT_FIXTURES[0].id;
    const res = await fetch(`${API_BASE}/projects/${id}`);
    const body = await res.json();
    expect(body.data.id).toBe(id);
    expect(body.data.name).toBe(PROJECT_FIXTURES[0].name);
  });

  it('DELETE /api/projects/:id returns 204', async () => {
    const id = PROJECT_FIXTURES[0].id;
    const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
    expect(res.status).toBe(204);
  });
});

// ─── Estimating ──────────────────────────────────────────────────────────────

describe('Estimating MSW handlers', () => {
  it('GET /api/estimating/trackers returns paged envelope', async () => {
    const res = await fetch(`${API_BASE}/estimating/trackers`);
    const body = await res.json();
    expect(body.items).toHaveLength(ESTIMATING_TRACKER_FIXTURES.length);
    expect(body.total).toBe(ESTIMATING_TRACKER_FIXTURES.length);
  });

  it('GET /api/estimating/trackers/:id returns single tracker', async () => {
    const res = await fetch(`${API_BASE}/estimating/trackers/1`);
    const body = await res.json();
    expect(body.data.id).toBe(1);
    expect(body.data.bidNumber).toBe(ESTIMATING_TRACKER_FIXTURES[0].bidNumber);
  });

  it('POST /api/estimating/trackers returns 201', async () => {
    const res = await fetch(`${API_BASE}/estimating/trackers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: 'uuid-1',
        bidNumber: 'BID-NEW',
        status: 'Draft',
        dueDate: '2026-06-01T00:00:00Z',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data).toHaveProperty('id');
    expect(body.data.bidNumber).toBe('BID-NEW');
  });
});
