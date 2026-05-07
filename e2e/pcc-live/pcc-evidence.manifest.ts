import fs from 'node:fs/promises';
import path from 'node:path';
import {
  PCC_EVIDENCE_DISCLAIMER,
  REQUIRED_PCC_EVIDENCE_IDS,
  type CreatePccEvidenceManifestInput,
  type PccEvidenceCoverageResult,
  type PccEvidenceId,
  type PccEvidenceManifest,
  type PccEvidenceManifestWriteResult,
  type PccEvidenceRecord,
  type PccEvidenceRunMetadata,
  type WritePccEvidenceManifestInput,
} from './pcc-evidence.types';
import { sortPccEvidenceRecords } from './pcc-evidence.registry';

function evNum(id: string): number {
  return Number(id.replace('EV-', ''));
}

function isKnownEvidenceId(id: string): id is PccEvidenceId {
  return (REQUIRED_PCC_EVIDENCE_IDS as readonly string[]).includes(id);
}

function sanitizeMetadata(metadata: PccEvidenceRunMetadata): PccEvidenceRunMetadata {
  return {
    runId: metadata.runId,
    generatedAtIso: metadata.generatedAtIso,
    repoCommit: metadata.repoCommit,
    packageVersion: metadata.packageVersion,
    expectedPackageVersion: metadata.expectedPackageVersion,
    tenantSiteUrl: metadata.tenantSiteUrl,
    tenantPageUrl: metadata.tenantPageUrl,
    evidenceOutputDir: metadata.evidenceOutputDir,
    generatedBy: metadata.generatedBy,
    prompt: metadata.prompt,
  };
}

const UNSAFE_ARTIFACT_PATH_PATTERN =
  /(^|[\\/])(?:test-results|playwright-report|\.auth|\.e2e-auth|\.secrets|\.storage-state)(?:[\\/]|$)|storagestate|storage-state|cookie|token|auth|secrets|session|trace|video|har/i;

function isSafeArtifactPath(artifactPath: string): boolean {
  return !UNSAFE_ARTIFACT_PATH_PATTERN.test(artifactPath);
}

function hasMalformedFields(record: PccEvidenceRecord): boolean {
  return (
    !record.title.trim() ||
    !record.objective.trim() ||
    record.pillarRefs.length === 0 ||
    record.sourceRefs.length === 0 ||
    record.requiredArtifacts.length === 0 ||
    record.hardStopRefs === undefined ||
    record.reviewerNotes === undefined
  );
}

export function getPccEvidenceCoverage(
  registry: readonly PccEvidenceRecord[],
): PccEvidenceCoverageResult {
  const ids = registry.map((r) => r.id);
  const idCounts = new Map<string, number>();
  for (const id of ids) idCounts.set(id, (idCounts.get(id) ?? 0) + 1);

  const missingIds = REQUIRED_PCC_EVIDENCE_IDS.filter((id) => !ids.includes(id)) as PccEvidenceId[];

  const duplicateIds = Array.from(idCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([id]) => id)
    .filter(isKnownEvidenceId)
    .sort((a, b) => evNum(a) - evNum(b));

  const unexpectedIds = Array.from(idCounts.keys())
    .filter((id) => !isKnownEvidenceId(id))
    .sort((a, b) => evNum(a) - evNum(b));

  const malformedIds = registry
    .filter((r) => hasMalformedFields(r))
    .map((r) => r.id)
    .filter(isKnownEvidenceId)
    .sort((a, b) => evNum(a) - evNum(b));

  const statusCounts: PccEvidenceCoverageResult['statusCounts'] = {
    'not-started': 0,
    'foundation-ready': 0,
    'operator-pending': 0,
    captured: 0,
    'review-required': 0,
    blocked: 0,
    'not-applicable': 0,
  };

  const hardStopCounts: PccEvidenceCoverageResult['hardStopCounts'] = {};
  for (const record of registry) {
    statusCounts[record.status] += 1;
    for (const hs of record.hardStopRefs) {
      hardStopCounts[hs] = (hardStopCounts[hs] ?? 0) + 1;
    }
  }

  const warnings: string[] = [];
  if (missingIds.length) warnings.push(`Missing EV IDs: ${missingIds.join(', ')}`);
  if (duplicateIds.length) warnings.push(`Duplicate EV IDs: ${duplicateIds.join(', ')}`);
  if (unexpectedIds.length) warnings.push(`Unexpected EV IDs: ${unexpectedIds.join(', ')}`);
  if (malformedIds.length) warnings.push(`Malformed EV records: ${malformedIds.join(', ')}`);
  if (statusCounts.captured === 0) {
    warnings.push('No EV records are marked captured. This is expected for Prompt 02 foundation.');
  }

  return {
    requiredCount: REQUIRED_PCC_EVIDENCE_IDS.length,
    registryCount: registry.length,
    missingIds,
    duplicateIds,
    unexpectedIds,
    malformedIds,
    statusCounts,
    hardStopCounts,
    warnings,
  };
}

export function createPccEvidenceManifest(
  input: CreatePccEvidenceManifestInput,
): PccEvidenceManifest {
  const sorted = sortPccEvidenceRecords(input.registry);
  const coverage = getPccEvidenceCoverage(sorted);

  const artifactPaths = (input.artifactPaths ?? []).filter(isSafeArtifactPath);

  return {
    metadata: sanitizeMetadata(input.metadata),
    disclaimer: PCC_EVIDENCE_DISCLAIMER,
    coverage,
    records: sorted,
    artifactPaths,
  };
}

export function renderPccEvidenceMarkdownSummary(manifest: PccEvidenceManifest): string {
  const lines: string[] = [];
  lines.push('# PCC Evidence Summary');
  lines.push('');
  lines.push(`- Run ID: ${manifest.metadata.runId}`);
  lines.push(`- Generated: ${manifest.metadata.generatedAtIso}`);
  if (manifest.metadata.repoCommit) lines.push(`- Repo commit: ${manifest.metadata.repoCommit}`);
  if (manifest.metadata.packageVersion)
    lines.push(`- Package version: ${manifest.metadata.packageVersion}`);
  if (manifest.metadata.expectedPackageVersion)
    lines.push(`- Expected package version: ${manifest.metadata.expectedPackageVersion}`);
  if (manifest.metadata.tenantSiteUrl)
    lines.push(`- Tenant site URL: ${manifest.metadata.tenantSiteUrl}`);
  if (manifest.metadata.tenantPageUrl)
    lines.push(`- Tenant page URL: ${manifest.metadata.tenantPageUrl}`);
  lines.push(`- Evidence output dir: ${manifest.metadata.evidenceOutputDir}`);
  lines.push('');
  lines.push('## Coverage');
  lines.push(`- Required EV count: ${manifest.coverage.requiredCount}`);
  lines.push(`- Registry EV count: ${manifest.coverage.registryCount}`);
  lines.push(`- Missing EV IDs: ${manifest.coverage.missingIds.join(', ') || 'None'}`);
  lines.push(`- Duplicate EV IDs: ${manifest.coverage.duplicateIds.join(', ') || 'None'}`);
  lines.push(`- Unexpected EV IDs: ${manifest.coverage.unexpectedIds.join(', ') || 'None'}`);
  lines.push(`- Malformed EV IDs: ${manifest.coverage.malformedIds.join(', ') || 'None'}`);
  lines.push('');
  lines.push('## Status Counts');
  for (const [status, count] of Object.entries(manifest.coverage.statusCounts)) {
    lines.push(`- ${status}: ${count}`);
  }
  lines.push('');
  lines.push('## Hard-Stop Mapping');
  const hardStops = Object.entries(manifest.coverage.hardStopCounts);
  if (hardStops.length === 0) {
    lines.push('- None');
  } else {
    for (const [hs, count] of hardStops) {
      lines.push(`- ${hs}: ${count}`);
    }
  }
  lines.push('');
  lines.push('## Artifact Paths');
  if (manifest.artifactPaths.length === 0) {
    lines.push('- None supplied');
  } else {
    for (const artifactPath of manifest.artifactPaths) {
      lines.push(`- ${artifactPath}`);
    }
  }
  lines.push('');
  lines.push('## Warnings');
  if (manifest.coverage.warnings.length === 0) {
    lines.push('- None');
  } else {
    for (const warning of manifest.coverage.warnings) {
      lines.push(`- ${warning}`);
    }
  }
  lines.push('');
  lines.push(`> ${manifest.disclaimer}`);

  return lines.join('\n');
}

export async function writePccEvidenceManifest(
  input: WritePccEvidenceManifestInput,
): Promise<PccEvidenceManifestWriteResult> {
  const manifest = createPccEvidenceManifest(input);
  await fs.mkdir(input.outputDir, { recursive: true });

  const manifestPath = path.join(input.outputDir, 'pcc-evidence-manifest.json');
  const summaryPath = path.join(input.outputDir, 'pcc-evidence-summary.md');

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
  await fs.writeFile(summaryPath, `${renderPccEvidenceMarkdownSummary(manifest)}\n`, 'utf-8');

  return { manifest, manifestPath, summaryPath };
}
