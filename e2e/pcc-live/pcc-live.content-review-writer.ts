import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  PccContentEvidenceRun,
  PccContentReviewCategory,
  PccContentReviewFinding,
  PccVisibleCopyRecord,
} from './pcc-live.content.types';

const DISCLAIMER =
  'This output is visible-copy, construction-language, source-of-record, state-copy, disabled-reason, and HBI authority review support for EV-83 through EV-106 only. It is not a final scorecard result and does not mark any EV captured or any hard-stop disposition.';
const PHONE_RE = /\+?[0-9][0-9()\-\s]{7,}[0-9]/g;
const UNSAFE_PATH_PATTERN =
  /(^|[\\/])(?:test-results|playwright-report|\.auth|\.e2e-auth|\.secrets|\.storage-state)(?:[\\/]|$)|storagestate|storage-state|cookie|token|auth|session|secrets|trace|video|har|unauthorized/i;

function sanitizeText(input: string): string {
  const noQuery = input.replace(/\?.*$/g, '');
  const noEmail = noQuery.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]');
  const noPhone = noEmail.replace(PHONE_RE, '[redacted-phone]');
  const noCred = noPhone.replace(
    /\b(storageState|storage-state|cookie|token|auth|session|secrets)\b/gi,
    '[redacted-cred]',
  );
  const noRawArtifacts = noCred
    .replace(/test-results/gi, '[redacted-artifact]')
    .replace(/playwright-report/gi, '[redacted-artifact]')
    .replace(/trace\.zip/gi, '[redacted-artifact]')
    .replace(/video\.webm/gi, '[redacted-artifact]')
    .replace(/network\.har/gi, '[redacted-artifact]')
    .replace(/\.auth/gi, '[redacted-cred]');
  const noPolicyClaims = noRawArtifacts
    .replace(/hard stop passed/gi, '[redacted-claim]')
    .replace(/hard stop failed/gi, '[redacted-claim]')
    .replace(/score-ready/gi, '[redacted-claim]')
    .replace(/Phase 4 ready/gi, '[redacted-claim]');
  const noHtml = noPolicyClaims.replace(/<[^>]+>/g, '[redacted-html]');
  const noBlob = noHtml.replace(
    /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g,
    '[redacted-blob]',
  );
  return noBlob.slice(0, 240);
}

function safeArtifactPath(pathLike: string): boolean {
  return !UNSAFE_PATH_PATTERN.test(pathLike);
}

function sanitizeRecord(r: PccVisibleCopyRecord): PccVisibleCopyRecord {
  return {
    ...r,
    selector: sanitizeText(r.selector),
    textSnippet: sanitizeText(r.textSnippet),
    textHash: sanitizeText(r.textHash),
  };
}

function sanitizeFinding(f: PccContentReviewFinding): PccContentReviewFinding {
  return {
    ...f,
    title: sanitizeText(f.title),
    rationale: sanitizeText(f.rationale),
    supportingCopyHashes: f.supportingCopyHashes.map(sanitizeText),
    reviewerPrompt: sanitizeText(f.reviewerPrompt),
  };
}

function mdSectionForCategory(
  title: string,
  scope: string,
  pillars: string,
  hardStops: string,
  evIds: string,
  findings: PccContentReviewFinding[],
): string {
  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push('');
  lines.push('## Purpose');
  lines.push(`- ${sanitizeText(scope)}`);
  lines.push('');
  lines.push('## Scope');
  lines.push(`- ${sanitizeText(scope)}`);
  lines.push('');
  lines.push('## Related Scorecard Pillars');
  lines.push(`- ${pillars}`);
  lines.push('');
  lines.push('## Related Hard Stops');
  lines.push(`- ${hardStops}`);
  lines.push('');
  lines.push('## Related EV IDs');
  lines.push(`- ${evIds}`);
  lines.push('');
  lines.push('## Automated Extraction Summary');
  lines.push(`- Finding count: ${findings.length}`);
  lines.push(
    `- Needs-review count: ${findings.filter((f) => f.disposition === 'needs-review').length}`,
  );
  lines.push('');
  lines.push('## Reviewer Checklist');
  lines.push('- Confirm language clarity, ownership, and next-action semantics.');
  lines.push('- Confirm boundaries are explicit and not overstated.');
  lines.push('- Confirm wording is construction-operations appropriate.');
  lines.push('');
  lines.push('## Findings Table');
  lines.push('| Disposition | Surface | Title | Support Hashes | Reviewer Prompt |');
  lines.push('|---|---|---|---|---|');
  for (const f of findings) {
    lines.push(
      `| ${f.disposition} | ${f.surfaceId ?? '-'} | ${f.title} | ${f.supportingCopyHashes.slice(0, 5).join(', ')} | ${f.reviewerPrompt} |`,
    );
  }
  if (findings.length === 0) {
    lines.push('| not-observed | - | No findings recorded | - | Operator review pending. |');
  }
  lines.push('');
  lines.push('## Open Reviewer Notes');
  lines.push('- Notes:');
  lines.push('');
  lines.push('## Review Support Statement');
  lines.push(
    '- This document is review support only and does not mark any EV captured or any hard-stop disposition.',
  );
  lines.push('');
  return `${lines.join('\n')}\n`;
}

export interface WritePccContentReviewInput {
  outputDir: string;
  run: Omit<
    PccContentEvidenceRun,
    'summary' | 'warnings' | 'disclaimer' | 'copyRecords' | 'findings'
  > & {
    copyRecords: readonly PccVisibleCopyRecord[];
    findings: readonly PccContentReviewFinding[];
    warnings?: string[];
  };
  artifactPaths?: string[];
}

export interface WritePccContentReviewResult {
  outputDir: string;
  evidenceJsonPath: string;
  evidenceMarkdownPath: string;
  extractedVisibleCopyPath: string;
  findingsPath: string;
  constructionReviewPath: string;
  stateCopyReviewPath: string;
  sourceOfRecordReviewPath: string;
  hbiAuthorityReviewPath: string;
  disabledReasonReviewPath: string;
}

export async function writePccContentReview(
  input: WritePccContentReviewInput,
): Promise<WritePccContentReviewResult> {
  await fs.mkdir(input.outputDir, { recursive: true });

  const copyRecords = input.run.copyRecords.map(sanitizeRecord);
  const findings = input.run.findings.map(sanitizeFinding);
  const warnings = (input.run.warnings ?? []).map(sanitizeText);

  const summary = {
    surfaceCount: input.run.surfaces.length,
    copyRecordCount: copyRecords.length,
    findingCount: findings.length,
    constructionLanguageFindingCount: findings.filter((f) => f.category === 'construction-language')
      .length,
    stateCopyFindingCount: findings.filter((f) => f.category === 'state-copy-quality').length,
    sourceLanguageFindingCount: findings.filter((f) => f.category === 'source-of-record-language')
      .length,
    hbiAuthorityFindingCount: findings.filter((f) => f.category === 'hbi-authority-language')
      .length,
    disabledReasonFindingCount: findings.filter((f) => f.category === 'disabled-reason-copy')
      .length,
    ownerActionFindingCount: findings.filter((f) => f.category === 'owner-action-responsibility')
      .length,
    mockFixtureFindingCount: findings.filter((f) => f.category === 'mock-fixture-transparency')
      .length,
    needsReviewCount: findings.filter((f) => f.disposition === 'needs-review').length,
    warningCount: warnings.length,
  };

  const runPayload: PccContentEvidenceRun = {
    ...input.run,
    tenantSiteUrl: sanitizeText(input.run.tenantSiteUrl),
    tenantPageUrl: sanitizeText(input.run.tenantPageUrl),
    surfaces: input.run.surfaces.map((s) => ({ ...s, label: sanitizeText(s.label) })),
    copyRecords,
    findings,
    summary,
    warnings,
    disclaimer: DISCLAIMER,
  };

  const artifactPaths = (input.artifactPaths ?? [])
    .filter(safeArtifactPath)
    .map((p) => sanitizeText(p));

  const evidenceJsonPath = path.join(input.outputDir, 'pcc-live-content-evidence.json');
  const evidenceMarkdownPath = path.join(input.outputDir, 'pcc-live-content-evidence.md');
  const extractedVisibleCopyPath = path.join(input.outputDir, 'extracted-visible-copy.json');
  const findingsPath = path.join(input.outputDir, 'content-review-findings.json');
  const constructionReviewPath = path.join(input.outputDir, 'construction-language-review.md');
  const stateCopyReviewPath = path.join(input.outputDir, 'state-copy-quality-review.md');
  const sourceOfRecordReviewPath = path.join(
    input.outputDir,
    'source-of-record-language-review.md',
  );
  const hbiAuthorityReviewPath = path.join(input.outputDir, 'hbi-authority-language-review.md');
  const disabledReasonReviewPath = path.join(input.outputDir, 'disabled-reason-copy-review.md');

  await fs.writeFile(
    evidenceJsonPath,
    `${JSON.stringify({ ...runPayload, artifactPaths }, null, 2)}\n`,
  );
  await fs.writeFile(extractedVisibleCopyPath, `${JSON.stringify(copyRecords, null, 2)}\n`);
  await fs.writeFile(findingsPath, `${JSON.stringify(findings, null, 2)}\n`);

  const md: string[] = [];
  md.push('# PCC Live Content Evidence');
  md.push('');
  md.push(`- Run ID: ${runPayload.runId}`);
  md.push(`- Generated: ${runPayload.generatedAtIso}`);
  md.push(`- Tenant site: ${runPayload.tenantSiteUrl}`);
  md.push(`- Tenant page: ${runPayload.tenantPageUrl}`);
  md.push(`- Expected package version: ${runPayload.expectedPackageVersion}`);
  md.push(`- EV refs: ${runPayload.evRefs.join(', ')}`);
  md.push('');
  md.push('## Surface Summary Table');
  md.push(
    '| Surface | Copy | Heading | Action | Disabled reason | State | Source | HBI | Owner | Mock | Needs review |',
  );
  md.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const s of runPayload.surfaces) {
    md.push(
      `| ${s.surfaceId} | ${s.visibleCopyCount} | ${s.headingCount} | ${s.actionLabelCount} | ${s.disabledReasonCount} | ${s.stateCopyCount} | ${s.sourceLabelCount} | ${s.hbiCopyCount} | ${s.ownerResponsibilityCount} | ${s.mockFixtureLabelCount} | ${s.needsReviewCount} |`,
    );
  }
  md.push('');
  md.push('## Copy/Finding Counts');
  md.push(`- Copy record count: ${summary.copyRecordCount}`);
  md.push(`- Finding count: ${summary.findingCount}`);
  md.push(`- Construction language finding count: ${summary.constructionLanguageFindingCount}`);
  md.push(`- State copy finding count: ${summary.stateCopyFindingCount}`);
  md.push(`- Source language finding count: ${summary.sourceLanguageFindingCount}`);
  md.push(`- HBI authority finding count: ${summary.hbiAuthorityFindingCount}`);
  md.push(`- Disabled reason finding count: ${summary.disabledReasonFindingCount}`);
  md.push(`- Needs-review count: ${summary.needsReviewCount}`);
  md.push(`- Warning count: ${summary.warningCount}`);
  md.push('');
  md.push('## Operator Review Reminder');
  md.push(
    '- Content language findings are review support only and require operator/expert judgment.',
  );
  md.push('');
  md.push(`> ${DISCLAIMER}`);

  await fs.writeFile(evidenceMarkdownPath, `${md.join('\n')}\n`);

  const byCategory = (cat: PccContentReviewCategory) => findings.filter((f) => f.category === cat);

  await fs.writeFile(
    constructionReviewPath,
    mdSectionForCategory(
      'Construction Language Review',
      'Construction operations vocabulary and mold-breaker clarity checks across visible-copy snippets.',
      'P1, P2, P5, P9',
      'HS-02, HS-03, HS-09',
      'EV-83, EV-84, EV-85, EV-86',
      byCategory('construction-language'),
    ),
  );

  await fs.writeFile(
    stateCopyReviewPath,
    mdSectionForCategory(
      'State Copy Quality Review',
      'State language for loading, blocked, degraded, preview, read-only, deferred, unavailable, stale, and related states.',
      'P5, P6, P9',
      'HS-04, HS-06, HS-09',
      'EV-93, EV-94, EV-95, EV-96, EV-97, EV-98, EV-99',
      byCategory('state-copy-quality'),
    ),
  );

  await fs.writeFile(
    sourceOfRecordReviewPath,
    mdSectionForCategory(
      'Source of Record Language Review',
      'Source boundary, confidence, freshness, and ownership language across visible copy.',
      'P5, P6, P9',
      'HS-06, HS-09',
      'EV-93, EV-94, EV-95, EV-96, EV-97, EV-98, EV-99',
      byCategory('source-of-record-language'),
    ),
  );

  await fs.writeFile(
    hbiAuthorityReviewPath,
    mdSectionForCategory(
      'HBI Authority Language Review',
      'HBI command/search and authority boundary language, including risky mutation-authority terms.',
      'P1, P2, P5, P9',
      'HS-10, HS-09',
      'EV-100, EV-101, EV-102, EV-103',
      byCategory('hbi-authority-language'),
    ),
  );

  await fs.writeFile(
    disabledReasonReviewPath,
    mdSectionForCategory(
      'Disabled Reason Copy Review',
      'Disabled control explanation quality and false-affordance risk support.',
      'P5, P6, P8, P9',
      'HS-04, HS-06, HS-09',
      'EV-87, EV-88, EV-89, EV-90',
      byCategory('disabled-reason-copy'),
    ),
  );

  return {
    outputDir: input.outputDir,
    evidenceJsonPath,
    evidenceMarkdownPath,
    extractedVisibleCopyPath,
    findingsPath,
    constructionReviewPath,
    stateCopyReviewPath,
    sourceOfRecordReviewPath,
    hbiAuthorityReviewPath,
    disabledReasonReviewPath,
  };
}
