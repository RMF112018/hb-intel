import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  EvaluatePccEvidencePackageCompletenessInput,
  PccEvidencePackageCompletenessRun,
  PccEvidencePackageCompletenessStatus,
  PccEvidencePackageExpectedGroup,
  PccEvidencePackageGroupCompleteness,
  PccEvidencePackageGroupId,
  PccEvidencePackageUnsafeReasonSummary,
  WritePccEvidencePackageCompletenessInput,
  WritePccEvidencePackageCompletenessResult,
} from './pcc-live.package-completeness.types';
import { PCC_SCORECARD_REPORT_OUTPUT_FILES } from './pcc-live.scorecard-report-assembler';

export const PCC_EVIDENCE_PACKAGE_COMPLETENESS_DISCLAIMER =
  'This output is evidence-package completeness review support only. It does not calculate final scorecard points, does not pass or fail hard stops, does not mark EVs finally captured, and does not approve Phase 4 readiness.';

const SPECIAL_OVERRIDE_STATUSES = new Set<PccEvidencePackageCompletenessStatus>([
  'blocked',
  'self-skipped',
  'not-configured',
  'unavailable',
]);

const EXPECTED_GROUPS: readonly PccEvidencePackageExpectedGroup[] = [
  {
    groupId: 'surface-smoke',
    label: 'Surface Smoke',
    requiredForFullPhase4ScoringPackage: true,
    expectedDirectoryPrefix: 'surface-smoke',
    expectedFiles: ['pcc-live-surface-smoke.json', 'pcc-live-surface-smoke.md'],
    absenceDefaultStatus: 'missing',
    notes: ['Smoke outputs should provide baseline lane confirmation.'],
  },
  {
    groupId: 'surface-screenshots',
    label: 'Surface Screenshots',
    requiredForFullPhase4ScoringPackage: true,
    expectedDirectoryPrefix: 'surface-screenshots',
    expectedFiles: [
      'pcc-live-screenshot-evidence.json',
      'pcc-live-screenshot-evidence.md',
      'pcc-live-screenshot-inventory.json',
      'pcc-live-dom-card-summary.json',
      'screenshot-contact-sheet.md',
      'screenshot-manifest-by-ev.json',
      'first-screen-review-index.md',
    ],
    absenceDefaultStatus: 'missing',
    notes: ['Screenshot and DOM evidence should be scrubbed and operator-approved.'],
  },
  {
    groupId: 'breakpoints',
    label: 'Breakpoints',
    requiredForFullPhase4ScoringPackage: true,
    expectedDirectoryPrefix: 'breakpoints',
    expectedFiles: [
      'pcc-live-breakpoint-evidence.json',
      'pcc-live-breakpoint-evidence.md',
      'pcc-live-breakpoint-matrix.json',
      'pcc-live-breakpoint-card-measurements.json',
      'pcc-live-breakpoint-touch-targets.json',
      'pcc-live-breakpoint-issue-register.json',
      'pcc-live-breakpoint-issue-register.md',
    ],
    absenceDefaultStatus: 'missing',
    notes: ['Breakpoint and container behavior is required for field-context review.'],
  },
  {
    groupId: 'accessibility',
    label: 'Accessibility',
    requiredForFullPhase4ScoringPackage: true,
    expectedDirectoryPrefix: 'accessibility',
    expectedFiles: [
      'pcc-live-accessibility-evidence.json',
      'pcc-live-accessibility-evidence.md',
      'pcc-live-axe-summary.json',
      'pcc-live-keyboard-focus-summary.json',
      'pcc-live-aria-label-summary.json',
      'pcc-live-contrast-summary.json',
    ],
    absenceDefaultStatus: 'missing',
    notes: ['Accessibility lane output remains review support, not pass/fail automation.'],
  },
  {
    groupId: 'workflow',
    label: 'Workflow',
    requiredForFullPhase4ScoringPackage: true,
    expectedDirectoryPrefix: 'workflow',
    expectedFiles: ['pcc-live-workflow-evidence.json', 'pcc-live-workflow-evidence.md'],
    absenceDefaultStatus: 'missing',
    notes: ['Workflow lane supports false-affordance and action-clarity review.'],
  },
  {
    groupId: 'content',
    label: 'Content',
    requiredForFullPhase4ScoringPackage: true,
    expectedDirectoryPrefix: 'content',
    expectedFiles: ['pcc-live-content-evidence.json', 'pcc-live-content-evidence.md'],
    absenceDefaultStatus: 'missing',
    notes: ['Content lane provides language and authority-boundary review signals.'],
  },
  {
    groupId: 'doctrine-source',
    label: 'Doctrine Source',
    requiredForFullPhase4ScoringPackage: true,
    expectedDirectoryPrefix: 'doctrine-source',
    expectedFiles: [
      'pcc-live-doctrine-source-evidence.json',
      'pcc-live-doctrine-source-evidence.md',
    ],
    absenceDefaultStatus: 'missing',
    notes: ['Doctrine-source group provides governing-document and source traceability.'],
  },
  {
    groupId: 'conditional',
    label: 'Conditional',
    requiredForFullPhase4ScoringPackage: false,
    expectedDirectoryPrefix: 'conditional',
    expectedFiles: ['pcc-live-conditional-evidence.json', 'pcc-live-conditional-evidence.md'],
    absenceDefaultStatus: 'operator-pending',
    notes: ['Conditional lane may require operator decision, configuration, or explicit skip.'],
  },
  {
    groupId: 'surface-blocks',
    label: 'Surface Blocks',
    requiredForFullPhase4ScoringPackage: true,
    expectedDirectoryPrefix: 'surface-blocks',
    expectedFiles: ['pcc-live-surface-blocks-evidence.json', 'pcc-live-surface-blocks-evidence.md'],
    absenceDefaultStatus: 'missing',
    notes: ['Surface blocks group supports EV-125 through EV-134 package visibility.'],
  },
  {
    groupId: 'scorecard-report',
    label: 'Scorecard Report Package',
    requiredForFullPhase4ScoringPackage: true,
    expectedDirectoryPrefix: 'scorecard-report',
    expectedFiles: [...PCC_SCORECARD_REPORT_OUTPUT_FILES],
    absenceDefaultStatus: 'missing',
    notes: ['Scorecard report package remains expert-review support and not scoring authority.'],
  },
] as const;

function toPosixPath(value: string): string {
  return value.replaceAll('\\', '/');
}

function safeRelativePath(filePath: string, rootForRelative: string): string | null {
  const normalized = toPosixPath(filePath);
  const rootNormalized = toPosixPath(rootForRelative);

  if (path.isAbsolute(filePath)) {
    const rel = toPosixPath(path.relative(rootForRelative, filePath));
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
    return rel;
  }

  if (!normalized || normalized.startsWith('..')) return null;
  if (normalized.startsWith('/')) {
    if (normalized.startsWith(`${rootNormalized}/`)) {
      const rel = normalized.slice(rootNormalized.length + 1);
      if (!rel || rel.startsWith('..')) return null;
      return rel;
    }
    return null;
  }

  return normalized;
}

type UnsafeReason = PccEvidencePackageUnsafeReasonSummary['reason'];

function unsafeReasonForPath(p: string): UnsafeReason | null {
  const lower = p.toLowerCase();

  if (lower.includes('test-results') || lower.includes('playwright-report')) {
    return 'raw-playwright-artifact';
  }

  if (
    lower.includes('storagestate') ||
    lower.includes('storage-state') ||
    lower.includes('.auth') ||
    lower.includes('.e2e-auth') ||
    lower.includes('cookie') ||
    lower.includes('token') ||
    lower.includes('auth') ||
    lower.includes('session') ||
    lower.includes('secret') ||
    lower.includes('secrets')
  ) {
    return 'auth-session-secret-material';
  }

  if (lower.includes('trace.zip') || (lower.includes('trace-') && lower.endsWith('.zip'))) {
    return 'trace-or-archive-artifact';
  }

  if (lower.endsWith('.har') || lower.endsWith('.webm') || lower.includes('network.har')) {
    return 'network-or-video-artifact';
  }

  return null;
}

async function collectRunDirectoryPaths(sourceRoot: string): Promise<string[]> {
  const out: string[] = [];

  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(abs);
        continue;
      }
      if (!entry.isFile()) continue;

      const rel = safeRelativePath(abs, sourceRoot);
      if (rel) out.push(rel);
    }
  }

  await walk(sourceRoot);
  return out.sort((a, b) => a.localeCompare(b));
}

function groupPathMatcher(prefix: string): RegExp {
  return new RegExp(`(^|/)${prefix}-[^/]+/`);
}

function missingExpectedFiles(
  observedPaths: readonly string[],
  expectedFiles: readonly string[],
): string[] {
  const observedFileNames = new Set(observedPaths.map((p) => p.split('/').pop()).filter(Boolean));
  return expectedFiles
    .filter((fileName) => !observedFileNames.has(fileName))
    .sort((a, b) => a.localeCompare(b));
}

function statusCounts(
  groups: readonly PccEvidencePackageGroupCompleteness[],
): Record<PccEvidencePackageCompletenessStatus, number> {
  const counts: Record<PccEvidencePackageCompletenessStatus, number> = {
    present: 0,
    missing: 0,
    'operator-pending': 0,
    'not-configured': 0,
    'self-skipped': 0,
    blocked: 0,
    unavailable: 0,
  };

  for (const group of groups) counts[group.status] += 1;
  return counts;
}

function finalDisposition(
  groups: readonly PccEvidencePackageGroupCompleteness[],
): 'expert-review-required' | 'operator-review-required' {
  const needsOperator = groups.some(
    (group) =>
      (group.required && group.status !== 'present') ||
      group.status === 'blocked' ||
      group.status === 'unavailable' ||
      group.status === 'operator-pending',
  );

  return needsOperator ? 'operator-review-required' : 'expert-review-required';
}

export function getPccEvidencePackageExpectedGroups(): readonly PccEvidencePackageExpectedGroup[] {
  return EXPECTED_GROUPS;
}

export async function evaluatePccEvidencePackageCompleteness(
  input: EvaluatePccEvidencePackageCompletenessInput = {},
): Promise<PccEvidencePackageCompletenessRun> {
  const sourceRoot = input.sourceRoot ? path.resolve(input.sourceRoot) : undefined;
  const artifactPaths = (input.artifactPaths ?? []).filter(
    (p): p is string => typeof p === 'string',
  );

  const artifactRelPaths = artifactPaths
    .map((p) => safeRelativePath(p, sourceRoot ?? process.cwd()))
    .filter((p): p is string => Boolean(p));

  const runDirPaths = sourceRoot ? await collectRunDirectoryPaths(sourceRoot) : [];

  const inventorySource =
    artifactRelPaths.length > 0 && runDirPaths.length > 0
      ? 'combined'
      : artifactRelPaths.length > 0
        ? 'artifact-paths'
        : 'run-directory';

  const allObserved = [...new Set([...artifactRelPaths, ...runDirPaths])].sort((a, b) =>
    a.localeCompare(b),
  );

  const reasonCounts = new Map<UnsafeReason, number>();
  const safeObserved: string[] = [];

  for (const observed of allObserved) {
    const reason = unsafeReasonForPath(observed);
    if (reason) {
      reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
      continue;
    }
    safeObserved.push(observed);
  }

  const overrides = input.statusOverrides ?? {};
  const notesByGroup = input.notesByGroup ?? {};
  const recommendedActionsByGroup = input.recommendedActionsByGroup ?? {};

  const groups: PccEvidencePackageGroupCompleteness[] = EXPECTED_GROUPS.map((expected) => {
    const matcher = groupPathMatcher(expected.expectedDirectoryPrefix);
    const observedPaths = safeObserved.filter((p) => matcher.test(p));
    const observed = observedPaths.length > 0;

    const missingFiles = observed
      ? missingExpectedFiles(observedPaths, expected.expectedFiles)
      : [];
    const overrideStatus = overrides[expected.groupId];

    let status: PccEvidencePackageCompletenessStatus;
    if (overrideStatus) {
      const noteList = (notesByGroup[expected.groupId] ?? []).map((n) => n.trim()).filter(Boolean);
      const recommended = (recommendedActionsByGroup[expected.groupId] ?? '').trim();

      if (
        SPECIAL_OVERRIDE_STATUSES.has(overrideStatus) &&
        (noteList.length === 0 || !recommended)
      ) {
        throw new Error(
          `Override status ${overrideStatus} for ${expected.groupId} requires non-empty notes and recommended action.`,
        );
      }

      status = overrideStatus;
    } else {
      status = observed ? 'present' : expected.absenceDefaultStatus;
    }

    const noteList = [
      ...expected.notes,
      ...((notesByGroup[expected.groupId] ?? []).map((n) => n.trim()).filter(Boolean) as string[]),
      ...(missingFiles.length > 0 ? [`Missing expected files: ${missingFiles.join(', ')}`] : []),
    ];

    const recommendedAction =
      (recommendedActionsByGroup[expected.groupId] ?? '').trim() ||
      (status === 'present' && missingFiles.length > 0
        ? 'Add missing expected files to the observed group directory and rerun completeness check.'
        : status === 'present'
          ? 'Proceed with expert review package checks.'
          : status === 'operator-pending'
            ? 'Complete operator action, capture movement, or explicit lane status note.'
            : status === 'missing'
              ? 'Rerun or restore missing evidence group outputs before closeout.'
              : 'Document rationale and follow-up action for this group status.');

    return {
      groupId: expected.groupId,
      label: expected.label,
      required: expected.requiredForFullPhase4ScoringPackage,
      expectedGlobOrPrefix: `${expected.expectedDirectoryPrefix}-*`,
      expectedFiles: expected.expectedFiles,
      observed,
      observedPathCount: observedPaths.length,
      observedPaths,
      missingExpectedFiles: missingFiles,
      status,
      notes: noteList,
      recommendedAction,
    };
  });

  const counts = statusCounts(groups);
  const requiredMissingGroupCount = groups.filter(
    (g) => g.required && g.status !== 'present',
  ).length;

  const summary = {
    expectedGroupCount: groups.length,
    presentGroupCount: counts.present,
    missingGroupCount: counts.missing,
    operatorPendingGroupCount: counts['operator-pending'],
    notConfiguredGroupCount: counts['not-configured'],
    selfSkippedGroupCount: counts['self-skipped'],
    blockedGroupCount: counts.blocked,
    unavailableGroupCount: counts.unavailable,
    requiredMissingGroupCount,
    observedPathCount: safeObserved.length,
    excludedUnsafePathCount: allObserved.length - safeObserved.length,
    excludedUnsafePathReasons: Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => a.reason.localeCompare(b.reason)),
  };

  return {
    runId: input.runId ?? 'pcc-live-package-completeness',
    generatedAtIso: input.generatedAtIso ?? new Date().toISOString(),
    sourceRoot,
    inventorySource,
    groups,
    summary,
    disclaimer: PCC_EVIDENCE_PACKAGE_COMPLETENESS_DISCLAIMER,
    finalDisposition: finalDisposition(groups),
  };
}

export function renderPccEvidencePackageCompletenessMarkdown(
  run: PccEvidencePackageCompletenessRun,
): string {
  const lines: string[] = ['# PCC Evidence Package Completeness', ''];
  lines.push('- Review support only.');
  lines.push('- No final score is calculated.');
  lines.push('- No hard stop is passed or failed.');
  lines.push('- No EV is finally captured.');
  lines.push('- No Phase 4 readiness is approved.');
  lines.push(`> ${run.disclaimer}`);
  lines.push('');
  lines.push(`- Run ID: ${run.runId}`);
  lines.push(`- Generated: ${run.generatedAtIso}`);
  lines.push(`- Inventory source: ${run.inventorySource}`);
  lines.push(`- Source root: ${run.sourceRoot ?? 'not-provided'}`);
  lines.push(`- Final disposition: ${run.finalDisposition}`);
  lines.push('');

  lines.push('## Group Completeness');
  lines.push('| Group | Status | Required | Observed paths | Missing expected files |');
  lines.push('|---|---|---|---:|---|');
  for (const group of run.groups) {
    lines.push(
      `| ${group.groupId} | ${group.status} | ${group.required} | ${group.observedPathCount} | ${group.missingExpectedFiles.join(', ') || '-'} |`,
    );
  }
  lines.push('');

  lines.push('## Summary');
  lines.push(`- Expected groups: ${run.summary.expectedGroupCount}`);
  lines.push(`- Present groups: ${run.summary.presentGroupCount}`);
  lines.push(`- Missing groups: ${run.summary.missingGroupCount}`);
  lines.push(`- Operator-pending groups: ${run.summary.operatorPendingGroupCount}`);
  lines.push(`- Not-configured groups: ${run.summary.notConfiguredGroupCount}`);
  lines.push(`- Self-skipped groups: ${run.summary.selfSkippedGroupCount}`);
  lines.push(`- Blocked groups: ${run.summary.blockedGroupCount}`);
  lines.push(`- Unavailable groups: ${run.summary.unavailableGroupCount}`);
  lines.push(`- Required missing groups: ${run.summary.requiredMissingGroupCount}`);
  lines.push(`- Safe observed paths: ${run.summary.observedPathCount}`);
  lines.push(`- Excluded unsafe paths: ${run.summary.excludedUnsafePathCount}`);

  if (run.summary.excludedUnsafePathReasons.length > 0) {
    lines.push('- Excluded unsafe path reasons:');
    for (const item of run.summary.excludedUnsafePathReasons) {
      lines.push(`  - ${item.reason}: ${item.count}`);
    }
  }

  const requiredMissing = run.groups.filter(
    (group) => group.required && group.status !== 'present',
  );
  lines.push('');
  lines.push('## Required Missing Groups');
  if (requiredMissing.length === 0) {
    lines.push('- none');
  } else {
    for (const group of requiredMissing) {
      lines.push(`- ${group.groupId}: ${group.status}; action: ${group.recommendedAction}`);
    }
  }

  lines.push('');
  lines.push('## Recommended Rerun / Closeout Action');
  lines.push(
    requiredMissing.length > 0
      ? '- Resolve required missing/operator statuses, regenerate affected group outputs, and rerun completeness before closeout.'
      : '- Continue with expert-review closeout workflow and preserve this completeness report in the evidence package.',
  );
  lines.push('');

  return `${lines.join('\n')}\n`;
}

export async function writePccEvidencePackageCompleteness(
  input: WritePccEvidencePackageCompletenessInput,
): Promise<WritePccEvidencePackageCompletenessResult> {
  const run = await evaluatePccEvidencePackageCompleteness(input);
  await fs.mkdir(input.outputDir, { recursive: true });

  const jsonPath = path.join(input.outputDir, 'evidence-package-completeness.json');
  const markdownPath = path.join(input.outputDir, 'evidence-package-completeness.md');

  await fs.writeFile(jsonPath, `${JSON.stringify(run, null, 2)}\n`);
  await fs.writeFile(markdownPath, renderPccEvidencePackageCompletenessMarkdown(run));

  return {
    outputDir: input.outputDir,
    run,
    jsonPath,
    markdownPath,
  };
}
