import { describe, it, expect } from 'vitest';
import {
  DOCUMENT_CONTROL_SOURCE_IDS,
  DOCUMENT_CONTROL_SOURCES,
  type IDocumentControlSource,
} from './DocumentControl.js';

const REQUIRED_HUB_SOURCES = ['sharepoint-drive', 'onedrive', 'procore-files'] as const;

const ALLOWED_KEYS: ReadonlyArray<keyof IDocumentControlSource> = [
  'id',
  'displayName',
  'posture',
  'linkBehavior',
  'notes',
];

describe('Document Control source registry', () => {
  it('models the unified access hub: sharepoint-drive, onedrive, procore-files', () => {
    for (const id of REQUIRED_HUB_SOURCES) {
      expect(DOCUMENT_CONTROL_SOURCE_IDS).toContain(id);
      expect(DOCUMENT_CONTROL_SOURCES[id]).toBeDefined();
    }
  });

  it('keys remain a strict subset of the allowed read-model shape', () => {
    for (const id of DOCUMENT_CONTROL_SOURCE_IDS) {
      const entry = DOCUMENT_CONTROL_SOURCES[id];
      for (const key of Object.keys(entry)) {
        expect(ALLOWED_KEYS).toContain(key as keyof IDocumentControlSource);
      }
    }
  });

  it('postures are restricted to the allowed literal set', () => {
    const allowed = ['mvp-required', 'mvp-optional', 'conditional'];
    for (const id of DOCUMENT_CONTROL_SOURCE_IDS) {
      expect(allowed).toContain(DOCUMENT_CONTROL_SOURCES[id].posture);
    }
  });

  it('link behaviors are restricted to the allowed literal set', () => {
    const allowed = ['browse-in-place', 'launch-link'];
    for (const id of DOCUMENT_CONTROL_SOURCE_IDS) {
      expect(allowed).toContain(DOCUMENT_CONTROL_SOURCES[id].linkBehavior);
    }
  });
});
