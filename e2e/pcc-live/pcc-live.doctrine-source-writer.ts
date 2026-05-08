import fs from 'node:fs/promises';
import path from 'node:path';
import {
  buildDoctrineSourceSummary,
  type CapturePccDoctrineSourceResult,
} from './pcc-live.doctrine-source-capture';
import type { PccDoctrineSourceEvidenceRun } from './pcc-live.doctrine-source.types';
import {
  isPccLiveUnsafeArtifactPath,
  sanitizePccLiveArtifactPath,
  sanitizePccLiveText,
} from './pcc-live.sanitization';

const DISCLAIMER =
  'This output is doctrine, source, and Mold Breaker review support for EV-37 through EV-58 only. It is not a final scorecard result, does not mark any EV captured, and does not mark any hard stop passed or failed.';

function sanitizeText(input: string): string {
  return sanitizePccLiveText(input, { maxLength: 240, redactPolicyClaims: true });
}

function safePath(pathLike: string): boolean {
  return !isPccLiveUnsafeArtifactPath(pathLike);
}

function mdHeader(run: PccDoctrineSourceEvidenceRun): string[] {
  return [
    `- Run ID: ${run.runId}`,
    `- Generated: ${run.generatedAtIso}`,
    `- Tenant target: ${run.tenantSiteUrl}`,
    `- EV refs: ${run.evRefs.join(', ')}`,
    `- Governing docs: ${run.summary.governingDocCount}`,
    `- Missing governing docs: ${run.summary.missingGoverningDocCount}`,
    `- Indexed source files: ${run.summary.indexedSourceFileCount}`,
    `- Missing source areas: ${run.summary.missingSourceAreaCount}`,
    `- Doctrine categories: ${run.summary.doctrineCategoryCount}`,
    `- Mold Breaker themes: ${run.summary.moldBreakerThemeCount}`,
    `- Expert-review-required count: ${run.summary.expertReviewRequiredCount}`,
    `- Warning count: ${run.summary.warningCount}`,
    '',
    '- Operator/expert review reminder: outputs are review support only.',
    `- Final judgment: expert-review-required.`,
    `> ${DISCLAIMER}`,
    '',
  ];
}

function renderSimpleTable(headers: string[], rows: string[][]): string[] {
  const out: string[] = [];
  out.push(`| ${headers.join(' | ')} |`);
  out.push(`|${headers.map(() => '---').join('|')}|`);
  for (const row of rows) {
    out.push(`| ${row.join(' | ')} |`);
  }
  return out;
}

function sanitizeRun(run: CapturePccDoctrineSourceResult): PccDoctrineSourceEvidenceRun {
  const summary = buildDoctrineSourceSummary(run);
  return {
    ...run,
    runId: sanitizeText(run.runId),
    tenantSiteUrl: sanitizeText(run.tenantSiteUrl),
    repoRootLabel: sanitizeText(run.repoRootLabel),
    governingDocs: run.governingDocs.map((doc) => ({
      ...doc,
      path: sanitizeText(doc.path),
      detectedHeadings: doc.detectedHeadings.map(sanitizeText),
      notes: doc.notes.map(sanitizeText),
    })),
    sourceIndex: run.sourceIndex.map((entry) => ({
      ...entry,
      path: sanitizeText(entry.path),
      sourceArea: sanitizeText(entry.sourceArea),
      detectedMarkers: entry.detectedMarkers.map(sanitizeText),
      boundedSignalSnippets: entry.boundedSignalSnippets.map(sanitizeText),
    })),
    doctrineConformance: run.doctrineConformance.map((item) => ({
      ...item,
      supportingDocPaths: item.supportingDocPaths.map(sanitizeText),
      supportingSourcePaths: item.supportingSourcePaths.map(sanitizeText),
      observedSignals: item.observedSignals.map(sanitizeText),
      missingSignals: item.missingSignals.map(sanitizeText),
      expertReviewQuestions: item.expertReviewQuestions.map(sanitizeText),
    })),
    moldBreakerReview: run.moldBreakerReview.map((item) => ({
      ...item,
      supportingDocPaths: item.supportingDocPaths.map(sanitizeText),
      supportingSourceAreas: item.supportingSourceAreas.map(sanitizeText),
      observedSignals: item.observedSignals.map(sanitizeText),
      incumbentFailureModeContrast: sanitizeText(item.incumbentFailureModeContrast),
      expertReviewQuestions: item.expertReviewQuestions.map(sanitizeText),
    })),
    packageVersionProof: {
      ...run.packageVersionProof,
      packageSolutionPath: run.packageVersionProof.packageSolutionPath
        ? sanitizePccLiveArtifactPath(run.packageVersionProof.packageSolutionPath)
        : undefined,
      manifestPaths: run.packageVersionProof.manifestPaths
        .filter(safePath)
        .map(sanitizePccLiveArtifactPath),
      detectedVersions: run.packageVersionProof.detectedVersions.map(sanitizeText),
      packageNameSignals: run.packageVersionProof.packageNameSignals.map(sanitizeText),
      notes: run.packageVersionProof.notes.map(sanitizeText),
    },
    summary,
    warnings: run.warnings.map(sanitizeText),
    disclaimer: DISCLAIMER,
  };
}

export interface WritePccDoctrineSourceInput {
  outputDir: string;
  run: CapturePccDoctrineSourceResult;
}

export interface WritePccDoctrineSourceResult {
  outputDir: string;
  evidenceJsonPath: string;
  evidenceMarkdownPath: string;
  governingDocVerificationPath: string;
  sourceFileIndexJsonPath: string;
  sourceFileIndexMarkdownPath: string;
  doctrineConformanceJsonPath: string;
  doctrineConformanceMarkdownPath: string;
  moldBreakerReviewPath: string;
  incumbentFailureModeMapPath: string;
  cognitiveLoadReviewPath: string;
  progressiveDisclosureReviewPath: string;
  fieldOfficeContinuityReviewPath: string;
  primitiveSourceReviewPath: string;
  surfaceSourceReviewPath: string;
  stateSourceReviewPath: string;
  testCoverageReviewPath: string;
  packageVersionProofPath: string;
}

export async function writePccDoctrineSource(
  input: WritePccDoctrineSourceInput,
): Promise<WritePccDoctrineSourceResult> {
  await fs.mkdir(input.outputDir, { recursive: true });
  const run = sanitizeRun(input.run);

  const evidenceJsonPath = path.join(input.outputDir, 'pcc-live-doctrine-source-evidence.json');
  const evidenceMarkdownPath = path.join(input.outputDir, 'pcc-live-doctrine-source-evidence.md');
  const governingDocVerificationPath = path.join(
    input.outputDir,
    'governing-doc-verification.json',
  );
  const sourceFileIndexJsonPath = path.join(input.outputDir, 'source-file-index.json');
  const sourceFileIndexMarkdownPath = path.join(input.outputDir, 'source-file-index.md');
  const doctrineConformanceJsonPath = path.join(input.outputDir, 'doctrine-conformance-map.json');
  const doctrineConformanceMarkdownPath = path.join(input.outputDir, 'doctrine-conformance-map.md');
  const moldBreakerReviewPath = path.join(input.outputDir, 'mold-breaker-review.md');
  const incumbentFailureModeMapPath = path.join(input.outputDir, 'incumbent-failure-mode-map.md');
  const cognitiveLoadReviewPath = path.join(input.outputDir, 'cognitive-load-review.md');
  const progressiveDisclosureReviewPath = path.join(
    input.outputDir,
    'progressive-disclosure-review.md',
  );
  const fieldOfficeContinuityReviewPath = path.join(
    input.outputDir,
    'field-office-continuity-review.md',
  );
  const primitiveSourceReviewPath = path.join(input.outputDir, 'primitive-source-review.md');
  const surfaceSourceReviewPath = path.join(input.outputDir, 'surface-source-review.md');
  const stateSourceReviewPath = path.join(input.outputDir, 'state-source-review.md');
  const testCoverageReviewPath = path.join(input.outputDir, 'test-coverage-review.md');
  const packageVersionProofPath = path.join(input.outputDir, 'package-version-proof.md');

  await fs.writeFile(evidenceJsonPath, `${JSON.stringify(run, null, 2)}\n`);
  await fs.writeFile(
    governingDocVerificationPath,
    `${JSON.stringify(run.governingDocs, null, 2)}\n`,
  );
  await fs.writeFile(sourceFileIndexJsonPath, `${JSON.stringify(run.sourceIndex, null, 2)}\n`);
  await fs.writeFile(
    doctrineConformanceJsonPath,
    `${JSON.stringify(run.doctrineConformance, null, 2)}\n`,
  );

  const evidenceMd: string[] = ['# PCC Doctrine/Source Evidence', ''];
  evidenceMd.push(...mdHeader(run));
  evidenceMd.push('## Related Governing Docs');
  for (const doc of run.governingDocs) {
    evidenceMd.push(`- ${doc.path} (${doc.reviewDisposition})`);
  }
  evidenceMd.push('');
  evidenceMd.push('## Related Source Areas');
  for (const area of Array.from(new Set(run.sourceIndex.map((entry) => entry.sourceArea))).sort()) {
    evidenceMd.push(`- ${area}`);
  }
  evidenceMd.push('');
  evidenceMd.push('## Review Questions');
  for (const item of run.doctrineConformance) {
    for (const q of item.expertReviewQuestions) {
      evidenceMd.push(`- [${item.category}] ${q}`);
    }
  }
  evidenceMd.push('');
  evidenceMd.push('- Final judgment: expert-review-required.');
  await fs.writeFile(evidenceMarkdownPath, `${evidenceMd.join('\n')}\n`);

  const sourceIndexMd: string[] = ['# Source File Index', ''];
  sourceIndexMd.push(...mdHeader(run));
  sourceIndexMd.push(
    ...renderSimpleTable(
      ['Path', 'Area', 'Kind', 'Size', 'Lines', 'Markers', 'Disposition'],
      run.sourceIndex
        .slice(0, 200)
        .map((entry) => [
          entry.path,
          entry.sourceArea,
          entry.kind,
          String(entry.sizeBytes),
          String(entry.lineCount),
          String(entry.detectedMarkers.length),
          entry.reviewDisposition,
        ]),
    ),
  );
  sourceIndexMd.push('');
  sourceIndexMd.push('- Final judgment: expert-review-required.');
  await fs.writeFile(sourceFileIndexMarkdownPath, `${sourceIndexMd.join('\n')}\n`);

  const doctrineMd: string[] = ['# Doctrine Conformance Map', ''];
  doctrineMd.push(...mdHeader(run));
  for (const item of run.doctrineConformance) {
    doctrineMd.push(`## ${item.category}`);
    doctrineMd.push(`- Disposition: ${item.reviewDisposition}`);
    doctrineMd.push(`- Related EV IDs: ${item.relatedEvidenceIds.join(', ')}`);
    doctrineMd.push(`- Supporting docs: ${item.supportingDocPaths.join(', ') || 'none'}`);
    doctrineMd.push(
      `- Supporting source paths (sample): ${item.supportingSourcePaths.slice(0, 8).join(', ') || 'none'}`,
    );
    doctrineMd.push(`- Observed signals: ${item.observedSignals.slice(0, 8).join(', ') || 'none'}`);
    doctrineMd.push(`- Missing signals: ${item.missingSignals.slice(0, 8).join(', ') || 'none'}`);
    doctrineMd.push(`- Expert review questions: ${item.expertReviewQuestions.join(' | ')}`);
    doctrineMd.push('');
  }
  doctrineMd.push('- Final judgment: expert-review-required.');
  await fs.writeFile(doctrineConformanceMarkdownPath, `${doctrineMd.join('\n')}\n`);

  const moldMd: string[] = ['# Mold Breaker Review', ''];
  moldMd.push(...mdHeader(run));
  for (const item of run.moldBreakerReview) {
    moldMd.push(`## ${item.theme}`);
    moldMd.push(`- Disposition: ${item.reviewDisposition}`);
    moldMd.push(`- Related EV IDs: ${item.relatedEvidenceIds.join(', ')}`);
    moldMd.push(`- Related governing docs: ${item.supportingDocPaths.join(', ') || 'none'}`);
    moldMd.push(`- Related source areas: ${item.supportingSourceAreas.join(', ') || 'none'}`);
    moldMd.push(`- Observed signals: ${item.observedSignals.slice(0, 8).join(', ') || 'none'}`);
    moldMd.push(`- Contrast: ${item.incumbentFailureModeContrast}`);
    moldMd.push(`- Expert review questions: ${item.expertReviewQuestions.join(' | ')}`);
    moldMd.push('');
  }
  moldMd.push('- Final judgment: expert-review-required.');
  await fs.writeFile(moldBreakerReviewPath, `${moldMd.join('\n')}\n`);

  const focusedArtifacts = [
    {
      file: incumbentFailureModeMapPath,
      title: 'Incumbent Failure Mode Map',
      theme: 'incumbent-failure-mode-contrast',
    },
    {
      file: cognitiveLoadReviewPath,
      title: 'Cognitive Load Review',
      theme: 'cognitive-load-reduction',
    },
    {
      file: progressiveDisclosureReviewPath,
      title: 'Progressive Disclosure Review',
      theme: 'progressive-disclosure',
    },
    {
      file: fieldOfficeContinuityReviewPath,
      title: 'Field/Office Continuity Review',
      theme: 'field-office-continuity',
    },
  ] as const;

  for (const artifact of focusedArtifacts) {
    const themeItem = run.moldBreakerReview.find((item) => item.theme === artifact.theme);
    const lines: string[] = [`# ${artifact.title}`, ''];
    lines.push(...mdHeader(run));
    if (themeItem) {
      lines.push(`- Theme: ${themeItem.theme}`);
      lines.push(`- Related EV IDs: ${themeItem.relatedEvidenceIds.join(', ')}`);
      lines.push(`- Supporting docs: ${themeItem.supportingDocPaths.join(', ') || 'none'}`);
      lines.push(
        `- Supporting source areas: ${themeItem.supportingSourceAreas.join(', ') || 'none'}`,
      );
      lines.push(
        `- Observed signals: ${themeItem.observedSignals.slice(0, 10).join(', ') || 'none'}`,
      );
      lines.push(`- Expert review questions: ${themeItem.expertReviewQuestions.join(' | ')}`);
      lines.push(`- Disposition: ${themeItem.reviewDisposition}`);
    } else {
      lines.push('- Theme not observed; expert-review-required.');
    }
    lines.push('');
    lines.push('- Final judgment: expert-review-required.');
    await fs.writeFile(artifact.file, `${lines.join('\n')}\n`);
  }

  const primitiveLines: string[] = ['# Primitive Source Review', ''];
  primitiveLines.push(...mdHeader(run));
  const primitiveEntries = run.sourceIndex.filter((entry) =>
    entry.detectedMarkers.some((marker) =>
      /aria-|role=|PccDashboardCard|PccBentoGrid/i.test(marker),
    ),
  );
  primitiveLines.push(`- Primitive-oriented source entries: ${primitiveEntries.length}`);
  primitiveLines.push(
    ...renderSimpleTable(
      ['Path', 'Markers', 'Snippets', 'Disposition'],
      primitiveEntries
        .slice(0, 80)
        .map((entry) => [
          entry.path,
          entry.detectedMarkers.slice(0, 4).join(', ') || 'none',
          entry.boundedSignalSnippets.slice(0, 2).join(' | ') || 'none',
          entry.reviewDisposition,
        ]),
    ),
  );
  primitiveLines.push('');
  primitiveLines.push('- Final judgment: expert-review-required.');
  await fs.writeFile(primitiveSourceReviewPath, `${primitiveLines.join('\n')}\n`);

  const surfaceLines: string[] = ['# Surface Source Review', ''];
  surfaceLines.push(...mdHeader(run));
  const surfaceEntries = run.sourceIndex.filter(
    (entry) => entry.kind === 'surface' || entry.kind === 'shell',
  );
  surfaceLines.push(`- Surface/shell entries: ${surfaceEntries.length}`);
  surfaceLines.push(
    ...renderSimpleTable(
      ['Path', 'Kind', 'Markers', 'Disposition'],
      surfaceEntries
        .slice(0, 120)
        .map((entry) => [
          entry.path,
          entry.kind,
          entry.detectedMarkers.slice(0, 4).join(', ') || 'none',
          entry.reviewDisposition,
        ]),
    ),
  );
  surfaceLines.push('');
  surfaceLines.push('- Final judgment: expert-review-required.');
  await fs.writeFile(surfaceSourceReviewPath, `${surfaceLines.join('\n')}\n`);

  const stateLines: string[] = ['# State Source Review', ''];
  stateLines.push(...mdHeader(run));
  const stateEntries = run.sourceIndex.filter((entry) =>
    entry.detectedMarkers.some((marker) =>
      /read-only|preview|deferred|blocked|degraded|source of record/i.test(marker),
    ),
  );
  stateLines.push(`- State/source boundary entries: ${stateEntries.length}`);
  stateLines.push(
    ...renderSimpleTable(
      ['Path', 'Markers', 'Sample snippets', 'Disposition'],
      stateEntries
        .slice(0, 120)
        .map((entry) => [
          entry.path,
          entry.detectedMarkers.slice(0, 4).join(', ') || 'none',
          entry.boundedSignalSnippets.slice(0, 2).join(' | ') || 'none',
          entry.reviewDisposition,
        ]),
    ),
  );
  stateLines.push('');
  stateLines.push('- Final judgment: expert-review-required.');
  await fs.writeFile(stateSourceReviewPath, `${stateLines.join('\n')}\n`);

  const coverageLines: string[] = ['# Test Coverage Review', ''];
  coverageLines.push(...mdHeader(run));
  const testEntries = run.sourceIndex.filter(
    (entry) => entry.kind === 'test' || entry.path.startsWith('e2e/pcc-live/'),
  );
  coverageLines.push(`- Test/evidence-tooling entries: ${testEntries.length}`);
  coverageLines.push(`- Related EV refs: ${run.evRefs.join(', ')}`);
  coverageLines.push(`- Review disposition: expert-review-required`);
  coverageLines.push('');
  coverageLines.push('- Final judgment: expert-review-required.');
  await fs.writeFile(testCoverageReviewPath, `${coverageLines.join('\n')}\n`);

  const packageLines: string[] = ['# Package Version Proof', ''];
  packageLines.push(...mdHeader(run));
  packageLines.push(
    `- Package solution path: ${run.packageVersionProof.packageSolutionPath ?? 'not-observed'}`,
  );
  packageLines.push(
    `- Manifest paths: ${run.packageVersionProof.manifestPaths.join(', ') || 'source-missing'}`,
  );
  packageLines.push(
    `- Detected versions: ${run.packageVersionProof.detectedVersions.join(', ') || 'not-observed'}`,
  );
  packageLines.push(
    `- Package name signals: ${run.packageVersionProof.packageNameSignals.join(', ') || 'not-observed'}`,
  );
  packageLines.push(`- Review disposition: ${run.packageVersionProof.reviewDisposition}`);
  packageLines.push(`- Notes: ${run.packageVersionProof.notes.join(' | ') || 'none'}`);
  packageLines.push('');
  packageLines.push('- Final judgment: expert-review-required.');
  await fs.writeFile(packageVersionProofPath, `${packageLines.join('\n')}\n`);

  return {
    outputDir: input.outputDir,
    evidenceJsonPath,
    evidenceMarkdownPath,
    governingDocVerificationPath,
    sourceFileIndexJsonPath,
    sourceFileIndexMarkdownPath,
    doctrineConformanceJsonPath,
    doctrineConformanceMarkdownPath,
    moldBreakerReviewPath,
    incumbentFailureModeMapPath,
    cognitiveLoadReviewPath,
    progressiveDisclosureReviewPath,
    fieldOfficeContinuityReviewPath,
    primitiveSourceReviewPath,
    surfaceSourceReviewPath,
    stateSourceReviewPath,
    testCoverageReviewPath,
    packageVersionProofPath,
  };
}
