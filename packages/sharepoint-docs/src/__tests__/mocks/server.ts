import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

/** Base URL of the Azure Functions backend proxy — matches VITE_API_BASE_URL in test env. */
const API_BASE = 'http://localhost:7071';

export const server = setupServer(
  // folder-exists endpoint
  http.get(`${API_BASE}/api/sharepoint/folder-exists`, () => {
    return HttpResponse.json({ exists: false });
  }),

  // folder creation
  http.post(`${API_BASE}/api/sharepoint/folder`, () => {
    return HttpResponse.json({ ok: true });
  }),

  // folder URL
  http.get(`${API_BASE}/api/sharepoint/folder-url`, () => {
    return HttpResponse.json({ url: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test-Project_Smith' });
  }),

  // small file upload
  http.post(`${API_BASE}/api/sharepoint/file-upload`, () => {
    return HttpResponse.json({ url: 'https://contoso.sharepoint.com/sites/hb-intel/Shared Documents/BD Leads/20260308_Test-Project_Smith/RFP/test.pdf' });
  }),

  // upload session creation
  http.post(`${API_BASE}/api/sharepoint/upload-session`, () => {
    return HttpResponse.json({ uploadUrl: `${API_BASE}/api/sharepoint/upload-chunk-session/abc123` });
  }),

  // chunk upload (returns 202 for intermediate, 200 with URL for last chunk)
  http.put(`${API_BASE}/api/sharepoint/upload-chunk`, ({ request }) => {
    const range = request.headers.get('Content-Range') ?? '';
    const [, rangeEnd, total] = range.match(/bytes (\d+)-(\d+)\/(\d+)/) ?? [];
    if (rangeEnd === total) {
      return HttpResponse.json({ url: 'https://contoso.sharepoint.com/sites/hb-intel/.../large-file.rvt' }, { status: 200 });
    }
    return new HttpResponse(null, { status: 202 });
  }),

  // file move
  http.post(`${API_BASE}/api/sharepoint/file-move`, () => {
    return HttpResponse.json({ url: 'https://contoso.sharepoint.com/sites/project-123/.../test.pdf' });
  }),

  // URL file creation (tombstone)
  http.post(`${API_BASE}/api/sharepoint/url-file`, () => {
    return HttpResponse.json({ url: 'https://contoso.sharepoint.com/sites/hb-intel/.../test.pdf.migrated.url' });
  }),

  // list files in folder
  http.get(`${API_BASE}/api/sharepoint/folder-files`, () => {
    return HttpResponse.json([
      { name: 'existing-doc.pdf', size: 1024000, url: 'https://...', modifiedAt: '2026-03-01T10:00:00Z' },
    ]);
  }),

  // SharePoint list operations (document registry)
  http.post('https://contoso.sharepoint.com/sites/hb-intel/_api/web/lists/getbytitle*/items', () => {
    return HttpResponse.json({ id: 42 });
  }),
);
