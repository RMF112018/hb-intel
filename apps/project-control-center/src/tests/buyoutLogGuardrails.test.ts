/**
 * Wave 13 / Prompt 07 — Buyout Log final hardening guardrail tests.
 *
 * Source-file scans run against stripped (comments-removed) text so
 * legitimate boundary copy in module-level docblocks does not trip
 * affirmative-claim guards. Structural assertions complement substring
 * scans where copy could otherwise produce false positives.
 *
 * The four scanned sources are exactly the Buyout Log surface files;
 * other PCC sources (Project Readiness, shared APIs) are out of scope
 * for this guard pass.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccBuyoutLogRegions } from '../surfaces/buyoutLog/PccBuyoutLogRegions';
import type {
  IPccBuyoutLogReadModelClient,
  IPccBuyoutLogViewModel,
} from '../surfaces/buyoutLog/buyoutLogViewModel';

// ---------------------------------------------------------------------------
// Source files in scope for the scans
// ---------------------------------------------------------------------------

const BL_SOURCE_FILES = [
  '../surfaces/buyoutLog/buyoutLogViewModel.ts',
  '../surfaces/buyoutLog/buyoutLogAdapter.ts',
  '../surfaces/buyoutLog/useBuyoutLogReadModel.ts',
  '../surfaces/buyoutLog/PccBuyoutLogRegions.tsx',
] as const;

function loadSource(file: string): string {
  const path = fileURLToPath(new URL(file, import.meta.url));
  return readFileSync(path, 'utf-8');
}

function stripCommentsOnly(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      out += ch;
      i += 1;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') {
          out += src[i];
          out += src[i + 1] ?? '';
          i += 2;
          continue;
        }
        out += src[i];
        i += 1;
      }
      if (i < src.length) {
        out += src[i];
        i += 1;
      }
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1) No live URLs in stripped Buyout Log source files
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — no live URLs in source', () => {
  const URL_RE = /\bhttps?:\/\/[^\s'"`<>]+/g;

  for (const file of BL_SOURCE_FILES) {
    it(`source ${file} contains no http(s):// URL after comment stripping`, () => {
      const stripped = stripCommentsOnly(loadSource(file));
      const matches = stripped.match(URL_RE) ?? [];
      expect(matches, `${file} should not embed live URLs: ${matches.join(', ')}`).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// 2) No write-verb identifiers (anchored to identifier start)
//
// Per feedback_anchored_identifier_regex_for_vendor_tokens, vendor tokens
// inside reference field names are allowed; only verb-anchored identifiers
// are rejected. The regex scans for `<verb><CapitalLetter>` patterns at
// the start of an identifier (preceded by non-word) so reference field
// names like `procoreCommitmentCreated` are NOT flagged (they don't start
// with a write verb), while a hypothetical `createProcoreCommitment`
// would be flagged.
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — no write-verb identifiers', () => {
  const FORBIDDEN_VERB_PATTERNS: readonly RegExp[] = [
    /\bcreate[A-Z]\w*/g,
    /\bpost[A-Z]\w*/g,
    /\bput[A-Z]\w*/g,
    /\bdelete[A-Z]\w*/g,
    /\bwriteBack[A-Z]?\w*/g,
    /\bsendTo[A-Z]\w*/g,
    /\bsyncTo[A-Z]\w*/g,
    /\bupload[A-Z]\w*/g,
    /\bsubmitTo[A-Z]\w*/g,
    /\bmutate[A-Z]\w*/g,
  ];

  for (const file of BL_SOURCE_FILES) {
    it(`source ${file} contains no write-verb identifiers`, () => {
      const stripped = stripCommentsOnly(loadSource(file));
      const offenders: string[] = [];
      for (const re of FORBIDDEN_VERB_PATTERNS) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(stripped))) offenders.push(m[0]);
      }
      expect(
        offenders,
        `${file} should not declare write-verb identifiers: ${offenders.join(', ')}`,
      ).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// 3) No HBI source-of-truth claims (qualified-pattern blocklist)
//
// Per feedback_source_truth_language_scan_allowlist, bare `source of truth`
// is allowed (legitimately appears in disclaimer copy); only qualified
// claim patterns are rejected.
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — no HBI source-of-truth claim copy', () => {
  const FORBIDDEN_CLAIMS: readonly RegExp[] = [
    /\bHBI\s+is\s+the\s+source\s+of\s+truth\b/gi,
    /\bHBI\s+is\s+the\s+system\s+of\s+record\b/gi,
    /\breplaces\s+Procore\b/gi,
    /\breplaces\s+Sage\b/gi,
    /\breplaces\s+Microsoft\s+Graph\b/gi,
    /\breplaces\s+SharePoint\b/gi,
  ];

  for (const file of BL_SOURCE_FILES) {
    it(`source ${file} contains no HBI source-of-truth claim copy`, () => {
      const stripped = stripCommentsOnly(loadSource(file));
      const offenders: string[] = [];
      for (const re of FORBIDDEN_CLAIMS) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(stripped))) offenders.push(m[0]);
      }
      expect(
        offenders,
        `${file} should not include HBI source-of-truth claim copy: ${offenders.join(' | ')}`,
      ).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// 4) No affirmative legal / claim / accounting determination claims
//
// Boundary copy in the buyout-log surface uses the negation form
// ("No legal determination is performed", "compensability ... is not
// enabled here"). These guard regexes target the AFFIRMATIVE form only,
// so the existing reference-only captions remain valid.
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — no affirmative legal/claim/accounting determination claims', () => {
  const FORBIDDEN_AFFIRMATIVES: readonly RegExp[] = [
    /\blegal\s+determination\s+is\s+made\b/gi,
    /\bclaim\s+entitlement\s+is\s+determined\b/gi,
    /\bcompensability\s+is\s+determined\b/gi,
    /\bdelay\s+damages\s+are\s+calculated\b/gi,
    /\bforensic\s+schedule\s+analysis\s+is\s+performed\b/gi,
    /\baccounting\s+determination\s+is\s+made\b/gi,
    /\bpayment\s+is\s+authorized\b/gi,
  ];

  for (const file of BL_SOURCE_FILES) {
    it(`source ${file} contains no affirmative determination claims`, () => {
      const stripped = stripCommentsOnly(loadSource(file));
      const offenders: string[] = [];
      for (const re of FORBIDDEN_AFFIRMATIVES) {
        re.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(stripped))) offenders.push(m[0]);
      }
      expect(
        offenders,
        `${file} should not affirm legal/claim/accounting determinations: ${offenders.join(' | ')}`,
      ).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// 5) IPccBuyoutLogReadModelClient only exposes getBuyoutLog
//
// Type-level assertion + runtime mock check.
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — narrow client interface surface', () => {
  it('IPccBuyoutLogReadModelClient keys are exactly { getBuyoutLog } at the type level', () => {
    type ExpectedKeys = 'getBuyoutLog';
    type ActualKeys = keyof IPccBuyoutLogReadModelClient;
    // Bidirectional assignability proves the key sets are equal.
    type AssertA = ActualKeys extends ExpectedKeys ? true : false;
    type AssertB = ExpectedKeys extends ActualKeys ? true : false;
    const a: AssertA = true;
    const b: AssertB = true;
    expect(a && b).toBe(true);
  });

  it('a runtime mock satisfying IPccBuyoutLogReadModelClient exposes only getBuyoutLog', () => {
    const mock: IPccBuyoutLogReadModelClient = {
      getBuyoutLog: async () => {
        throw new Error('not used');
      },
    };
    const keys = Object.keys(mock).sort();
    expect(keys).toEqual(['getBuyoutLog']);
  });
});

// ---------------------------------------------------------------------------
// 6 + 7) Loading and error degraded states expose canonical a11y attributes
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — degraded state accessibility', () => {
  function renderWithViewModel(vm: IPccBuyoutLogViewModel): HTMLElement {
    const { container } = render(
      createElement(PccBentoGrid, {
        forceMode: 'desktop',
        children: createElement(PccBuyoutLogRegions, { viewModel: vm }),
      }),
    );
    return container;
  }

  it('loading view-model surfaces aria-busy="true" via PccPreviewState', () => {
    const container = renderWithViewModel({ status: 'loading' });
    const busy = container.querySelector('[aria-busy="true"]');
    expect(busy).not.toBeNull();
  });

  it('error view-model surfaces role="alert" via PccPreviewState', () => {
    const container = renderWithViewModel({ status: 'error' });
    const alert = container.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 8 + 9) No standalone shell-route or mounted active-surface marker
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — no shell-route or active-surface marker', () => {
  it('the rendered PccApp tree has no [data-pcc-tab-id="buyout-log"] node', () => {
    const { container } = render(createElement(PccApp, { forceMode: 'desktop' }));
    expect(container.querySelector('[data-pcc-tab-id="buyout-log"]')).toBeNull();
  });

  it('the rendered PccApp tree has no [data-pcc-active-surface-panel="buyout-log"] node', () => {
    const { container } = render(createElement(PccApp, { forceMode: 'desktop' }));
    expect(container.querySelector('[data-pcc-active-surface-panel="buyout-log"]')).toBeNull();
  });
});
