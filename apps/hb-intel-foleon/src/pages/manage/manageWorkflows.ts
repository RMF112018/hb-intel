import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';

export async function runContentValidate(
  api: FoleonManagementApi,
  id: string,
  onRefresh: () => Promise<void>,
  setMessage: (message: string | null) => void,
): Promise<void> {
  const result = await api.validateContent(id);
  setMessage(`Validation ${result.status}; correlation ${result.correlationId}.`);
  await onRefresh();
}

export async function runContentPublish(
  api: FoleonManagementApi,
  id: string,
  onRefresh: () => Promise<void>,
  setMessage: (message: string | null) => void,
): Promise<void> {
  await api.publishContent(id);
  setMessage('Content published through backend validation.');
  await onRefresh();
}

export async function runContentSuppress(
  api: FoleonManagementApi,
  id: string,
  onRefresh: () => Promise<void>,
  setMessage: (message: string | null) => void,
): Promise<void> {
  await api.suppressContent(id);
  setMessage('Content suppressed through backend validation.');
  await onRefresh();
}

export async function runFoleonSync(
  api: FoleonManagementApi,
  type: 'docs' | 'projects',
  onRefresh: () => Promise<void>,
  setMessage: (message: string | null) => void,
): Promise<void> {
  const run = type === 'docs' ? await api.syncDocs() : await api.syncProjects();
  setMessage(`${run.runType} sync ${run.status}; correlation ${run.correlationId}.`);
  await onRefresh();
}
