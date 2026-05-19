import { describe, expect, it } from 'vitest';

import {
  MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
  MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS,
  MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE,
  MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_DESCRIPTOR,
  MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
  MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE,
} from '../adobe-sign-cache/cache-list-descriptors.js';
import {
  buildAdobeSignCacheListsSchemaReadinessReport,
  type AdobeSignCacheListFieldSnapshot,
} from '../adobe-sign-cache/cache-list-schema-readiness.js';

const NOW = '2026-05-19T00:00:00.000Z';

const TYPE_TO_LIVE_TYPE_AS_STRING: Record<string, string> = {
  Text: 'Text',
  Number: 'Number',
  Boolean: 'Boolean',
  DateTime: 'DateTime',
  Choice: 'Choice',
  MultiLineText: 'Note',
  URL: 'URL',
  User: 'User',
  Lookup: 'Lookup',
};

function liveSnapshotFor(listTitle: string): AdobeSignCacheListFieldSnapshot[] {
  const descriptor = MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS.find(
    (d) => d.title === listTitle,
  );
  if (!descriptor) throw new Error(`unknown list: ${listTitle}`);
  return descriptor.fields.map((field) => ({
    internalName: field.internalName,
    typeAsString: TYPE_TO_LIVE_TYPE_AS_STRING[field.type] ?? 'Text',
    enforceUniqueValues: field.unique === true,
  }));
}

function allReadySnapshots(): Record<string, AdobeSignCacheListFieldSnapshot[]> {
  const result: Record<string, AdobeSignCacheListFieldSnapshot[]> = {};
  for (const descriptor of MY_DASHBOARD_ADOBE_SIGN_CACHE_LIST_DESCRIPTORS) {
    result[descriptor.title] = liveSnapshotFor(descriptor.title);
  }
  return result;
}

describe('buildAdobeSignCacheListsSchemaReadinessReport', () => {
  it('returns ready=true when every list is fully live-verified', () => {
    const report = buildAdobeSignCacheListsSchemaReadinessReport({
      snapshots: allReadySnapshots(),
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(true);
    expect(report.generatedAtUtc).toBe(NOW);
    expect(report.targets).toHaveLength(4);
    expect(report.targets.map((t) => t.listName)).toEqual([
      MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
      MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
      MY_DASHBOARD_ADOBE_SIGN_WEBHOOK_SUBSCRIPTIONS_LIST_TITLE,
      MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE,
    ]);
    for (const target of report.targets) {
      expect(target.listFound).toBe(true);
      expect(target.ready).toBe(true);
      for (const entry of target.entries) {
        expect(entry.state).toBe('live-verified');
      }
    }
  });

  it('marks an undefined snapshot as listFound=false with every entry missing', () => {
    const snapshots = allReadySnapshots();
    delete (snapshots as Record<string, AdobeSignCacheListFieldSnapshot[]>)[
      MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE
    ];
    const report = buildAdobeSignCacheListsSchemaReadinessReport({
      snapshots,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const userCacheTarget = report.targets.find(
      (t) => t.listName === MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
    );
    expect(userCacheTarget?.listFound).toBe(false);
    expect(userCacheTarget?.ready).toBe(false);
    expect(userCacheTarget?.entries.length).toBe(
      MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_DESCRIPTOR.fields.length,
    );
    for (const entry of userCacheTarget?.entries ?? []) {
      expect(entry.state).toBe('missing');
      expect(entry.observedTypeAsString).toBeNull();
    }
  });

  it('marks an explicitly-null snapshot the same way as undefined (listFound=false)', () => {
    const snapshots: Record<string, AdobeSignCacheListFieldSnapshot[] | null> = {
      ...allReadySnapshots(),
      [MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE]: null,
    };
    const report = buildAdobeSignCacheListsSchemaReadinessReport({
      snapshots,
      generatedAtUtc: NOW,
    });
    const userCacheTarget = report.targets.find(
      (t) => t.listName === MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
    );
    expect(userCacheTarget?.listFound).toBe(false);
    expect(userCacheTarget?.ready).toBe(false);
  });

  it('classifies a missing column as state=missing on a present list', () => {
    const snapshots = allReadySnapshots();
    snapshots[MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE] = snapshots[
      MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE
    ]!.filter((f) => f.internalName !== 'FreshnessState');
    const report = buildAdobeSignCacheListsSchemaReadinessReport({
      snapshots,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const userCacheTarget = report.targets.find(
      (t) => t.listName === MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
    );
    expect(userCacheTarget?.listFound).toBe(true);
    expect(userCacheTarget?.ready).toBe(false);
    const entry = userCacheTarget?.entries.find((e) => e.internalName === 'FreshnessState');
    expect(entry?.state).toBe('missing');
  });

  it('classifies a wrong-type column as state=wrong-type', () => {
    const snapshots = allReadySnapshots();
    snapshots[MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE] = snapshots[
      MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE
    ]!.map((f) => (f.internalName === 'SortDateUtc' ? { ...f, typeAsString: 'Text' } : f));
    const report = buildAdobeSignCacheListsSchemaReadinessReport({
      snapshots,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const target = report.targets.find(
      (t) => t.listName === MY_DASHBOARD_ADOBE_SIGN_AGREEMENT_PROJECTION_CACHE_LIST_TITLE,
    );
    const entry = target?.entries.find((e) => e.internalName === 'SortDateUtc');
    expect(entry?.state).toBe('wrong-type');
    expect(entry?.expectedTypeAsString).toBe('DateTime');
    expect(entry?.observedTypeAsString).toBe('Text');
  });

  it('classifies a unique-enforcing field without EnforceUniqueValues as state=wrong-unique', () => {
    const snapshots = allReadySnapshots();
    snapshots[MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE] = snapshots[
      MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE
    ]!.map((f) =>
      f.internalName === 'AdobeActorKey' ? { ...f, enforceUniqueValues: false } : f,
    );
    const report = buildAdobeSignCacheListsSchemaReadinessReport({
      snapshots,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const target = report.targets.find(
      (t) => t.listName === MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE,
    );
    const entry = target?.entries.find((e) => e.internalName === 'AdobeActorKey');
    expect(entry?.state).toBe('wrong-unique');
    expect(entry?.expectedUnique).toBe(true);
    expect(entry?.observedUnique).toBe(false);
  });

  it('does not require non-unique fields to carry EnforceUniqueValues=true', () => {
    const snapshots = allReadySnapshots();
    snapshots[MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE] = snapshots[
      MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE
    ]!.map((f) =>
      f.internalName === 'UserPrincipalNameNormalized'
        ? { ...f, enforceUniqueValues: false }
        : f,
    );
    const report = buildAdobeSignCacheListsSchemaReadinessReport({
      snapshots,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(true);
  });

  it('ignores extra unknown columns present on a list snapshot', () => {
    const snapshots = allReadySnapshots();
    snapshots[MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE] = [
      ...snapshots[MY_DASHBOARD_ADOBE_SIGN_USER_CACHE_LIST_TITLE]!,
      { internalName: 'SomeOldColumn', typeAsString: 'Text' },
    ];
    const report = buildAdobeSignCacheListsSchemaReadinessReport({
      snapshots,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(true);
  });

  it('reports per-list readiness aggregated up to overall ready (any not-ready ⇒ false)', () => {
    const snapshots = allReadySnapshots();
    snapshots[MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE] = snapshots[
      MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE
    ]!.filter((f) => f.internalName !== 'RunId');
    const report = buildAdobeSignCacheListsSchemaReadinessReport({
      snapshots,
      generatedAtUtc: NOW,
    });
    expect(report.ready).toBe(false);
    const otherTargets = report.targets.filter(
      (t) => t.listName !== MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE,
    );
    for (const target of otherTargets) {
      expect(target.ready).toBe(true);
    }
  });
});
