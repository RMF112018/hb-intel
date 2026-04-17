import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { EvidenceRef } from './types.js';

export interface RunPaths {
  readonly runDir: string;
  readonly artifactsDir: string;
  readonly rawPath: string;
  readonly normalizedPath: string;
  readonly summaryPath: string;
  readonly provisionSummaryPath: string;
  readonly seedSummaryPath: string;
  readonly manifestPath: string;
  readonly bundlePath: string;
}

export async function ensureStorageDir(storageDir: string): Promise<void> {
  await fs.mkdir(storageDir, { recursive: true });
}

export async function assertStorageWritable(storageDir: string): Promise<void> {
  await ensureStorageDir(storageDir);
  const markerPath = path.join(storageDir, '.write-test.tmp');
  await fs.writeFile(markerPath, 'ok', 'utf-8');
  await fs.rm(markerPath, { force: true });
}

export async function createRunPaths(storageDir: string, runId: string): Promise<RunPaths> {
  const runDir = path.join(storageDir, 'runs', runId);
  const artifactsDir = path.join(runDir, 'artifacts');
  await fs.mkdir(artifactsDir, { recursive: true });
  return {
    runDir,
    artifactsDir,
    rawPath: path.join(artifactsDir, 'raw.json'),
    normalizedPath: path.join(artifactsDir, 'normalized.json'),
    summaryPath: path.join(artifactsDir, 'summary.md'),
    provisionSummaryPath: path.join(artifactsDir, 'provision-summary.json'),
    seedSummaryPath: path.join(artifactsDir, 'seed-summary.json'),
    manifestPath: path.join(artifactsDir, 'artifact-manifest.json'),
    bundlePath: path.join(artifactsDir, 'artifact-bundle.zip'),
  };
}

export async function fileSizeBytes(filePath: string): Promise<number> {
  const stat = await fs.stat(filePath);
  return stat.size;
}

export async function fileSha256(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath);
  return createHash('sha256').update(data).digest('hex');
}

export async function readText(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

export function toArtifactId(fileName: string): string {
  return fileName;
}

export function buildDownloadUrl(runId: string, artifactId: string): string {
  return `/runs/${encodeURIComponent(runId)}/artifacts/${encodeURIComponent(artifactId)}/download`;
}

export async function buildEvidenceRefs(runId: string, artifactFiles: readonly {
  fileName: string;
  filePath: string;
  contentType: string;
  label: string;
  isBundle?: boolean;
  bundleFormat?: 'zip' | null;
}[]): Promise<readonly EvidenceRef[]> {
  const refs: EvidenceRef[] = [];
  for (const file of artifactFiles) {
    const artifactId = toArtifactId(file.fileName);
    const size = await fileSizeBytes(file.filePath);
    refs.push({
      evidenceId: artifactId,
      label: file.label,
      fileName: file.fileName,
      contentType: file.contentType,
      sizeBytes: size,
      isBundle: file.isBundle === true,
      bundleFormat: file.bundleFormat ?? null,
      availability: 'available',
      downloadUrl: buildDownloadUrl(runId, artifactId),
    });
  }
  refs.sort((a, b) => {
    if (a.isBundle && !b.isBundle) return -1;
    if (!a.isBundle && b.isBundle) return 1;
    return a.fileName.localeCompare(b.fileName);
  });
  return refs;
}
