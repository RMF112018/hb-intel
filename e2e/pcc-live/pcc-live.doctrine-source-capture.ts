import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { PccEvidenceId } from './pcc-evidence.types';
import {
  PCC_DOCTRINE_SOURCE_EVIDENCE_IDS,
  type PccDoctrineCategory,
  type PccDoctrineConformanceItem,
  type PccDoctrineSourceDisposition,
  type PccDoctrineSourceEvidenceRun,
  type PccGoverningDocVerification,
  type PccMoldBreakerReviewItem,
  type PccMoldBreakerTheme,
  type PccPackageVersionProof,
  type PccSourceFileIndexEntry,
} from './pcc-live.doctrine-source.types';

const MAX_SNIPPETS_PER_FILE = 3;
const MAX_SNIPPET_CHARS = 160;

const PHONE_RE = /\+?[0-9][0-9()\-\s]{7,}[0-9]/g;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const HTML_RE = /<[^>]+>/g;
const TOKEN_RE =
  /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g;
const QUERY_RE = /\?.*$/g;

const REDACT_TERMS_RE = /\b(storageState|storage-state|cookie|token|auth|session|secrets?)\b/gi;
const FORBIDDEN_CLAIMS_RE =
  /(hard stop passed|hard stop failed|score-ready|phase 4 ready|56\/56 achieved|100\/100|mold breaker achieved)/gi;
const PLAYWRIGHT_ARTIFACT_RE =
  /(test-results|playwright-report|trace\.zip|video\.webm|network\.har|\.auth)/gi;

const SOURCE_MARKERS = [
  'data-pcc-',
  'PccDashboardCard',
  'PccBentoGrid',
  'PccHorizontalTabs',
  'data-pcc-active-surface-panel',
  'role=',
  'aria-',
  'PCC_RESPONSIVE_THRESHOLDS_PX',
  'FOOTPRINT_COLUMN_SPANS',
  'source of record',
  'system of record',
  'source-confidence',
  'HBI',
  'command search',
  'read-only',
  'preview',
  'deferred',
  'blocked',
  'degraded',
  'mock',
  'fixture',
  'Playwright',
  'axe',
  'keyboard',
  'scorecard',
  'mold breaker',
] as const;

const MARKER_REGEX = SOURCE_MARKERS.map((m) => ({
  marker: m,
  pattern: new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
}));

const REQUIRED_GOVERNING_DOCS = [
  {
    path: 'docs/explanation/design-decisions/con-tech-ui-study.md',
    role: 'con-tech-ui-study',
  },
  {
    path: 'docs/explanation/design-decisions/con-tech-ux-study.md',
    role: 'con-tech-ux-study',
  },
  {
    path: 'docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md',
    role: 'ui-doctrine',
  },
  {
    path: 'docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md',
    role: 'acceptance-scoring-model',
  },
  {
    path: 'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    role: 'pcc-scorecard',
  },
] as const;

const ALLOWED_SOURCE_AREAS = [
  'apps/project-control-center/src/shell/',
  'apps/project-control-center/src/layout/',
  'apps/project-control-center/src/surfaces/',
  'apps/project-control-center/src/ui/',
  'apps/project-control-center/src/tests/',
  'apps/project-control-center/config/',
  'tools/spfx-shell/config/',
  'e2e/pcc-live/',
  'docs/architecture/blueprint/sp-project-control-center/',
  'docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/test-coverage/',
] as const;

const ALLOWED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.scss']);

const EXCLUDED_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'build',
  'coverage',
  'temp',
  '.next',
  '.turbo',
  '.git',
  'playwright-report',
  'test-results',
]);

const EXCLUDED_PATH_RE =
  /(^|[\/])(?:playwright-report|test-results|node_modules|dist|build|coverage|temp|\.next|\.turbo|\.git|\.auth|\.e2e-auth|\.secrets|\.storage-state|storage-state|storagestate|auth|session)([\/]|$)/i;

type SourceKind = PccSourceFileIndexEntry['kind'];

function sanitizeText(input: string): string {
  const normalized = input.replace(/\s+/g, ' ').trim();
  const noQuery = normalized.replace(QUERY_RE, '');
  const noEmail = noQuery.replace(EMAIL_RE, '[redacted-email]');
  const noPhone = noEmail.replace(PHONE_RE, '[redacted-phone]');
  const noCred = noPhone.replace(REDACT_TERMS_RE, '[redacted-cred]');
  const noArtifact = noCred.replace(PLAYWRIGHT_ARTIFACT_RE, '[redacted-artifact]');
  const noClaim = noArtifact.replace(FORBIDDEN_CLAIMS_RE, '[redacted-claim]');
  const noHtml = noClaim.replace(HTML_RE, '[redacted-html]');
  const noBlob = noHtml.replace(TOKEN_RE, '[redacted-blob]');
  const evScoped = noBlob.replace(/\bEV-(\d+)\b/g, (_match, idRaw: string) => {
    const id = Number(idRaw);
    if (Number.isNaN(id)) return '[redacted-ev]';
    return id >= 37 && id <= 58 ? `EV-${id}` : '[redacted-ev]';
  });
  return evScoped.slice(0, MAX_SNIPPET_CHARS);
}

function safeRepoRelative(relPath: string): boolean {
  if (!relPath || path.isAbsolute(relPath)) return false;
  if (relPath.startsWith('..')) return false;
  return !EXCLUDED_PATH_RE.test(relPath);
}

function countLines(content: string): number {
  if (!content) return 0;
  return content.split(/\r?\n/).length;
}

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('hex');
}

function detectHeadings(content: string): string[] {
  const headings = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^#{1,6}\s+/.test(line))
    .slice(0, 20)
    .map((line) => sanitizeText(line));
  return Array.from(new Set(headings));
}

function classifySourceKind(relPath: string): SourceKind {
  if (relPath.startsWith('apps/project-control-center/src/shell/')) return 'shell';
  if (relPath.startsWith('apps/project-control-center/src/layout/')) return 'layout';
  if (relPath.startsWith('apps/project-control-center/src/surfaces/')) return 'surface';
  if (relPath.startsWith('apps/project-control-center/src/ui/')) return 'ui';
  if (relPath.startsWith('apps/project-control-center/src/tests/')) return 'test';
  if (relPath.startsWith('apps/project-control-center/config/')) return 'config';
  if (relPath.startsWith('tools/spfx-shell/config/')) return 'tool-config';
  if (relPath.startsWith('e2e/pcc-live/')) return 'evidence-tooling';
  if (relPath.startsWith('docs/architecture/blueprint/sp-project-control-center/'))
    return 'blueprint-doc';
  if (
    relPath.startsWith('docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/test-coverage/')
  ) {
    return 'planning-doc';
  }
  return 'unknown';
}

function findMarkersAndSnippets(content: string): { markers: string[]; snippets: string[] } {
  const markers = new Set<string>();
  const snippets: string[] = [];
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    for (const { marker, pattern } of MARKER_REGEX) {
      if (!pattern.test(line)) continue;
      markers.add(marker);
      if (snippets.length >= MAX_SNIPPETS_PER_FILE) continue;
      const snippet = sanitizeText(line);
      if (!snippet) continue;
      if (!snippets.includes(snippet)) snippets.push(snippet);
    }
    if (snippets.length >= MAX_SNIPPETS_PER_FILE && markers.size >= 4) {
      break;
    }
  }

  return {
    markers: Array.from(markers).sort(),
    snippets,
  };
}

async function readUtf8IfFile(absPath: string): Promise<string | null> {
  try {
    const stat = await fs.stat(absPath);
    if (!stat.isFile()) return null;
    return await fs.readFile(absPath, 'utf-8');
  } catch {
    return null;
  }
}

async function collectFiles(areaAbs: string, fileCap: number): Promise<string[]> {
  const output: string[] = [];

  async function walk(current: string): Promise<void> {
    if (output.length >= fileCap) return;
    const entries = await fs.readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      if (output.length >= fileCap) return;
      const abs = path.join(current, entry.name);

      if (entry.isDirectory()) {
        if (EXCLUDED_DIR_NAMES.has(entry.name)) continue;
        if (EXCLUDED_PATH_RE.test(abs)) continue;
        await walk(abs);
        continue;
      }

      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) continue;
      output.push(abs);
    }
  }

  await walk(areaAbs);
  return output;
}

function docDisposition(exists: boolean): PccDoctrineSourceDisposition {
  return exists ? 'source-present' : 'source-missing';
}

function sourceDisposition(
  entryExists: boolean,
  markersCount: number,
): PccDoctrineSourceDisposition {
  if (!entryExists) return 'source-missing';
  if (markersCount > 0) return 'review-support';
  return 'not-observed';
}

const DOCTRINE_CATEGORY_CONFIG: Record<
  PccDoctrineCategory,
  { evRefs: readonly PccEvidenceId[]; markerHints: string[]; questions: string[] }
> = {
  'shell-host-fit': {
    evRefs: ['EV-37', 'EV-39', 'EV-52'],
    markerHints: ['PccHorizontalTabs', 'PccBentoGrid'],
    questions: [
      'Does shell layout match doctrine host-fit principles for command-center orientation?',
    ],
  },
  'navigation-orientation': {
    evRefs: ['EV-38', 'EV-52', 'EV-55'],
    markerHints: ['data-pcc-active-surface-panel', 'PccHorizontalTabs'],
    questions: ['Are navigation orientation signals explicit and consistent across surfaces?'],
  },
  'bento-card-hierarchy': {
    evRefs: ['EV-39', 'EV-40', 'EV-52'],
    markerHints: ['PccDashboardCard', 'data-pcc-card'],
    questions: ['Do bento/card hierarchies reinforce priority-first operational decisions?'],
  },
  'responsive-container-discipline': {
    evRefs: ['EV-53', 'EV-54'],
    markerHints: ['PCC_RESPONSIVE_THRESHOLDS_PX', 'FOOTPRINT_COLUMN_SPANS'],
    questions: ['Does source evidence indicate disciplined responsive container behavior?'],
  },
  'accessibility-semantics': {
    evRefs: ['EV-53', 'EV-54', 'EV-55'],
    markerHints: ['aria-', 'role='],
    questions: ['Are semantic accessibility primitives present in source and test coverage?'],
  },
  'state-feedback': {
    evRefs: ['EV-56', 'EV-57', 'EV-58'],
    markerHints: ['read-only', 'preview', 'deferred', 'blocked', 'degraded'],
    questions: ['Do state feedback patterns provide clear condition-impact-next-step posture?'],
  },
  'source-of-record-boundary': {
    evRefs: ['EV-45', 'EV-46', 'EV-57'],
    markerHints: ['source of record', 'system of record', 'source-confidence'],
    questions: ['Are source-of-record boundaries and confidence/freshness cues explicit?'],
  },
  'hbi-authority-boundary': {
    evRefs: ['EV-50', 'EV-51', 'EV-58'],
    markerHints: ['HBI', 'command search'],
    questions: [
      'Is HBI language constrained to advisory boundaries rather than mutation authority?',
    ],
  },
  'external-launch-boundary': {
    evRefs: ['EV-49', 'EV-50', 'EV-57'],
    markerHints: ['external systems', 'launch'],
    questions: ['Do external launch boundaries avoid implied mutation authority in PCC?'],
  },
  'approval-mutation-boundary': {
    evRefs: ['EV-49', 'EV-50', 'EV-57'],
    markerHints: ['approve', 'reject', 'submit'],
    questions: ['Are approval/posture boundaries explicit and defensible for review-only context?'],
  },
  'content-language-quality': {
    evRefs: ['EV-44', 'EV-45', 'EV-46', 'EV-47'],
    markerHints: ['owner', 'next action', 'mock', 'fixture'],
    questions: [
      'Does visible language support construction-operational clarity over dashboard genericity?',
    ],
  },
  'mold-breaker-differentiation': {
    evRefs: ['EV-44', 'EV-45', 'EV-46', 'EV-47', 'EV-48'],
    markerHints: ['mold breaker', 'scorecard'],
    questions: ['Do documented signals substantively differentiate PCC from incumbent patterns?'],
  },
  'test-coverage-evidence': {
    evRefs: ['EV-52', 'EV-53', 'EV-54', 'EV-55', 'EV-58'],
    markerHints: ['Playwright', 'axe', 'keyboard', 'scorecard'],
    questions: [
      'Is test-coverage evidence sufficient for expert review of scorecard traceability?',
    ],
  },
  'package-version-evidence': {
    evRefs: ['EV-58'],
    markerHints: ['version', 'package-solution.json'],
    questions: ['Are package version signals present and traceable without claiming readiness?'],
  },
};

const MOLD_BREAKER_THEME_CONFIG: Record<
  PccMoldBreakerTheme,
  { evRefs: readonly PccEvidenceId[]; contrast: string; questions: string[] }
> = {
  'incumbent-failure-mode-contrast': {
    evRefs: ['EV-44', 'EV-45', 'EV-46'],
    contrast:
      'Compare source/doc signals against incumbent fragmented workflows, stale states, and opaque ownership language.',
    questions: ['Which concrete signals demonstrate contrast versus incumbent failure modes?'],
  },
  'cognitive-load-reduction': {
    evRefs: ['EV-47', 'EV-48', 'EV-52'],
    contrast:
      'Evaluate whether signals suggest reduced cognitive overload and clearer operational prioritization.',
    questions: [
      'Do indexed signals indicate actionable simplification rather than dashboard accumulation?',
    ],
  },
  'progressive-disclosure': {
    evRefs: ['EV-48', 'EV-53', 'EV-54'],
    contrast:
      'Review whether source markers align to progressive disclosure and responsive disclosure discipline.',
    questions: ['Are progressive-disclosure cues explicit across source and governance documents?'],
  },
  'field-office-continuity': {
    evRefs: ['EV-49', 'EV-52', 'EV-55'],
    contrast:
      'Review continuity cues between field and office contexts, ownership handoff, and lifecycle references.',
    questions: ['Do references support cross-module continuity for field/office roles?'],
  },
  'source-clarity-and-confidence': {
    evRefs: ['EV-46', 'EV-56', 'EV-57', 'EV-58'],
    contrast:
      'Review source-of-record, confidence, and freshness boundary signals against incumbent ambiguity.',
    questions: [
      'Are source and confidence boundaries explicit enough for operator trust decisions?',
    ],
  },
  'role-action-clarity': {
    evRefs: ['EV-45', 'EV-49', 'EV-50'],
    contrast:
      'Review role/action ownership and disabled-reason cues versus ambiguous incumbent control posture.',
    questions: [
      'Do signals define role, action authority, and next steps without false affordance?',
    ],
  },
  'pwa-live-runtime-resilience': {
    evRefs: ['EV-52', 'EV-55', 'EV-57'],
    contrast:
      'Review runtime and source discipline signals for resilient live operational behavior.',
    questions: ['Do runtime-related markers support resilient, bounded live experience claims?'],
  },
  'mold-breaker-differentiation': {
    evRefs: ['EV-50', 'EV-51', 'EV-58'],
    contrast:
      'Assess whether doctrine and source evidence indicate substantive mold-breaker differentiation.',
    questions: ['What expert evidence is still needed before any differentiation conclusion?'],
  },
};

async function verifyGoverningDocs(repoRoot: string): Promise<PccGoverningDocVerification[]> {
  const out: PccGoverningDocVerification[] = [];
  for (const doc of REQUIRED_GOVERNING_DOCS) {
    const abs = path.join(repoRoot, doc.path);
    const content = await readUtf8IfFile(abs);
    if (content == null) {
      out.push({
        path: doc.path,
        exists: false,
        sizeBytes: 0,
        lineCount: 0,
        detectedHeadings: [],
        requiredReferenceRole: doc.role,
        reviewDisposition: 'source-missing',
        notes: ['Required governing document missing; expert review required.'],
      });
      continue;
    }

    const headings = detectHeadings(content);
    out.push({
      path: doc.path,
      exists: true,
      sizeBytes: Buffer.byteLength(content, 'utf-8'),
      lineCount: countLines(content),
      sha256: sha256(content),
      detectedHeadings: headings,
      requiredReferenceRole: doc.role,
      reviewDisposition: docDisposition(true),
      notes: [
        headings.length > 0
          ? 'Heading signals detected for review support.'
          : 'No markdown heading markers detected; expert review required.',
      ].map(sanitizeText),
    });
  }
  return out;
}

async function indexSourceArea(
  repoRoot: string,
  sourceArea: string,
  fileCap: number,
): Promise<{ entries: PccSourceFileIndexEntry[]; missing: boolean }> {
  const areaAbs = path.join(repoRoot, sourceArea);
  try {
    const stat = await fs.stat(areaAbs);
    if (!stat.isDirectory()) {
      return { entries: [], missing: true };
    }
  } catch {
    return { entries: [], missing: true };
  }

  const files = await collectFiles(areaAbs, fileCap);
  const entries: PccSourceFileIndexEntry[] = [];

  for (const absPath of files) {
    const rel = path.relative(repoRoot, absPath).replaceAll(path.sep, '/');
    if (!safeRepoRelative(rel)) continue;
    if (!rel.startsWith(sourceArea)) continue;

    const content = await readUtf8IfFile(absPath);
    if (content == null) continue;

    const ext = path.extname(rel).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) continue;

    const markerData = findMarkersAndSnippets(content);

    entries.push({
      path: rel,
      sourceArea,
      extension: ext,
      kind: classifySourceKind(rel),
      exists: true,
      sizeBytes: Buffer.byteLength(content, 'utf-8'),
      lineCount: countLines(content),
      sha256: sha256(content),
      detectedMarkers: markerData.markers,
      boundedSignalSnippets: markerData.snippets,
      reviewDisposition: sourceDisposition(true, markerData.markers.length),
    });
  }

  entries.sort((a, b) => a.path.localeCompare(b.path));
  return { entries, missing: false };
}

function buildDoctrineConformance(
  docs: readonly PccGoverningDocVerification[],
  sourceIndex: readonly PccSourceFileIndexEntry[],
): PccDoctrineConformanceItem[] {
  const docPaths = docs.filter((d) => d.exists).map((d) => d.path);
  const out: PccDoctrineConformanceItem[] = [];

  for (const category of Object.keys(DOCTRINE_CATEGORY_CONFIG) as PccDoctrineCategory[]) {
    const cfg = DOCTRINE_CATEGORY_CONFIG[category];
    const matched = sourceIndex.filter((entry) =>
      cfg.markerHints.some(
        (hint) =>
          entry.detectedMarkers.some((m) => m.toLowerCase().includes(hint.toLowerCase())) ||
          entry.boundedSignalSnippets.some((s) => s.toLowerCase().includes(hint.toLowerCase())),
      ),
    );

    const observedSignals = Array.from(
      new Set(matched.flatMap((m) => [...m.detectedMarkers, ...m.boundedSignalSnippets])),
    )
      .slice(0, 12)
      .map(sanitizeText);

    const missingSignals = cfg.markerHints
      .filter(
        (hint) => !observedSignals.some((obs) => obs.toLowerCase().includes(hint.toLowerCase())),
      )
      .map(sanitizeText);

    out.push({
      category,
      relatedEvidenceIds: cfg.evRefs,
      supportingDocPaths: docPaths,
      supportingSourcePaths: matched.slice(0, 24).map((m) => sanitizeText(m.path)),
      observedSignals,
      missingSignals,
      expertReviewQuestions: cfg.questions.map(sanitizeText),
      reviewDisposition:
        observedSignals.length > 0
          ? 'expert-review-required'
          : missingSignals.length > 0
            ? 'not-observed'
            : 'operator-review-pending',
    });
  }

  return out;
}

function buildMoldBreakerReview(
  docs: readonly PccGoverningDocVerification[],
  sourceIndex: readonly PccSourceFileIndexEntry[],
): PccMoldBreakerReviewItem[] {
  const docPaths = docs.filter((d) => d.exists).map((d) => d.path);
  const areas = Array.from(new Set(sourceIndex.map((s) => s.sourceArea))).sort();

  const out: PccMoldBreakerReviewItem[] = [];
  for (const theme of Object.keys(MOLD_BREAKER_THEME_CONFIG) as PccMoldBreakerTheme[]) {
    const cfg = MOLD_BREAKER_THEME_CONFIG[theme];

    const observedSignals = Array.from(
      new Set(
        sourceIndex
          .flatMap((entry) => [...entry.detectedMarkers, ...entry.boundedSignalSnippets])
          .filter((sig) =>
            ['mold breaker', 'scorecard', 'source', 'read-only', 'preview', 'owner', 'hbi'].some(
              (k) => sig.toLowerCase().includes(k),
            ),
          ),
      ),
    )
      .slice(0, 16)
      .map(sanitizeText);

    out.push({
      theme,
      relatedEvidenceIds: cfg.evRefs,
      supportingDocPaths: docPaths,
      supportingSourceAreas: areas,
      observedSignals,
      incumbentFailureModeContrast: sanitizeText(cfg.contrast),
      expertReviewQuestions: cfg.questions.map(sanitizeText),
      reviewDisposition: 'expert-review-required',
    });
  }

  return out;
}

async function buildPackageVersionProof(
  repoRoot: string,
  sourceIndex: readonly PccSourceFileIndexEntry[],
): Promise<PccPackageVersionProof> {
  const candidates = [
    'apps/project-control-center/config/package-solution.json',
    'apps/project-control-center/package.json',
    'package.json',
  ];

  const manifestPaths: string[] = [];
  const detectedVersions = new Set<string>();
  const packageNameSignals = new Set<string>();
  const notes: string[] = [];

  let packageSolutionPath: string | undefined;

  for (const relPath of candidates) {
    const abs = path.join(repoRoot, relPath);
    const content = await readUtf8IfFile(abs);
    if (content == null) continue;

    manifestPaths.push(relPath);
    if (relPath.endsWith('package-solution.json')) packageSolutionPath = relPath;

    const versionMatches = content.match(/"version"\s*:\s*"([^"]+)"/g) ?? [];
    for (const match of versionMatches) {
      const parsed = match.match(/"version"\s*:\s*"([^"]+)"/);
      if (parsed?.[1]) detectedVersions.add(sanitizeText(parsed[1]));
    }

    const nameMatches = content.match(/"name"\s*:\s*"([^"]+)"/g) ?? [];
    for (const match of nameMatches) {
      const parsed = match.match(/"name"\s*:\s*"([^"]+)"/);
      if (parsed?.[1]) packageNameSignals.add(sanitizeText(parsed[1]));
    }
  }

  if (manifestPaths.length === 0) {
    notes.push('Package version source files not found in expected locations.');
  } else {
    notes.push('Package version signals collected for expert review only; no readiness claims.');
  }

  if (sourceIndex.length === 0) {
    notes.push('Source index empty; package version proof context may be incomplete.');
  }

  return {
    packageSolutionPath,
    manifestPaths: manifestPaths.map(sanitizeText),
    detectedVersions: Array.from(detectedVersions),
    packageNameSignals: Array.from(packageNameSignals),
    reviewDisposition:
      manifestPaths.length > 0 && detectedVersions.size > 0
        ? 'review-support'
        : manifestPaths.length > 0
          ? 'expert-review-required'
          : 'source-missing',
    notes: notes.map(sanitizeText),
  };
}

export interface CapturePccDoctrineSourceInput {
  repoRoot?: string;
  runId?: string;
  maxFilesPerSourceArea?: number;
  tenantSiteUrl?: string;
  repoRootLabel?: string;
}

export interface CapturePccDoctrineSourceResult extends Omit<
  PccDoctrineSourceEvidenceRun,
  'summary' | 'disclaimer'
> {}

export async function capturePccDoctrineSource(
  input: CapturePccDoctrineSourceInput = {},
): Promise<CapturePccDoctrineSourceResult> {
  const repoRoot = input.repoRoot ?? process.cwd();
  const fileCap = input.maxFilesPerSourceArea ?? 500;
  const warnings: string[] = [];
  const sourceIndex: PccSourceFileIndexEntry[] = [];

  const governingDocs = await verifyGoverningDocs(repoRoot);

  let missingSourceAreaCount = 0;
  for (const area of ALLOWED_SOURCE_AREAS) {
    const indexed = await indexSourceArea(repoRoot, area, fileCap);
    if (indexed.missing) {
      missingSourceAreaCount += 1;
      warnings.push(sanitizeText(`Source area missing: ${area}`));
      continue;
    }
    sourceIndex.push(...indexed.entries);
  }

  if (missingSourceAreaCount > 0) {
    warnings.push('One or more configured source areas were not found; expert review required.');
  }

  const doctrineConformance = buildDoctrineConformance(governingDocs, sourceIndex);
  const moldBreakerReview = buildMoldBreakerReview(governingDocs, sourceIndex);
  const packageVersionProof = await buildPackageVersionProof(repoRoot, sourceIndex);

  const evRefs = [...PCC_DOCTRINE_SOURCE_EVIDENCE_IDS] as readonly PccEvidenceId[];

  const runId = input.runId ?? `doctrine-source-${Date.now()}`;

  return {
    runId: sanitizeText(runId),
    generatedAtIso: new Date().toISOString(),
    tenantSiteUrl: sanitizeText(input.tenantSiteUrl ?? 'operator-review-pending'),
    repoRootLabel: sanitizeText(input.repoRootLabel ?? path.basename(repoRoot)),
    selfSkipped: false,
    runState: 'completed',
    evRefs,
    governingDocs,
    sourceIndex,
    doctrineConformance,
    moldBreakerReview,
    packageVersionProof,
    warnings: warnings.map(sanitizeText),
  };
}

export const PCC_DOCTRINE_SOURCE_ALLOWED_AREAS = ALLOWED_SOURCE_AREAS;
export const PCC_DOCTRINE_SOURCE_REQUIRED_DOCS = REQUIRED_GOVERNING_DOCS;
export const PCC_DOCTRINE_SOURCE_MARKERS = SOURCE_MARKERS;

export function buildDoctrineSourceSummary(
  run: CapturePccDoctrineSourceResult,
): PccDoctrineSourceEvidenceRun['summary'] {
  const expertReviewRequiredCount =
    run.doctrineConformance.filter((item) => item.reviewDisposition === 'expert-review-required')
      .length +
    run.moldBreakerReview.filter((item) => item.reviewDisposition === 'expert-review-required')
      .length +
    run.governingDocs.filter((doc) => doc.reviewDisposition === 'expert-review-required').length +
    (run.packageVersionProof.reviewDisposition === 'expert-review-required' ? 1 : 0);

  return {
    governingDocCount: run.governingDocs.length,
    missingGoverningDocCount: run.governingDocs.filter((doc) => !doc.exists).length,
    indexedSourceFileCount: run.sourceIndex.length,
    missingSourceAreaCount:
      ALLOWED_SOURCE_AREAS.length - new Set(run.sourceIndex.map((s) => s.sourceArea)).size,
    doctrineCategoryCount: run.doctrineConformance.length,
    moldBreakerThemeCount: run.moldBreakerReview.length,
    expertReviewRequiredCount,
    warningCount: run.warnings.length,
  };
}
