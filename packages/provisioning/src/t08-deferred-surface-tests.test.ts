/**
 * W0-G3-T08: Deferred surface test scaffolds.
 *
 * Contains it.todo() stubs for TC-* cases that require G4/G5 surface rendering
 * (UI components, hooks with providers, real DOM). These document what G4/G5
 * must implement but cannot be tested at the contract level.
 *
 * 11 it.todo stubs + 1 env-gated integration scaffold (TC-CLAR-05).
 */
import { describe, it } from 'vitest';

// ─── Deferred: Guided flow surface tests ─────────────────────────────────────

describe('TC-FLOW-05: Department change triggers step 4 reset (deferred to G4)', () => {
  it.todo(
    'changing department resets template-addons step status and re-filters available add-ons',
    // G4-T08 cross-ref: Remains deferred — requires step-wizard integration with live add-on filtering
  );
});

// ─── Deferred: Draft surface tests ───────────────────────────────────────────

describe('TC-DRAFT deferred surface tests (G4/G5)', () => {
  it.todo(
    'TC-DRAFT-02: auto-save fires at 1.5s debounce interval (requires useAutoSaveDraft hook integration)',
    // G4-T08 cross-ref: Partially covered by G4-T01-007 in apps/estimating/src/test/NewRequestPage.test.tsx
  );

  it.todo(
    'TC-DRAFT-03 / TC-FAIL-04: draft NOT cleared when API submission fails (requires surface + mocked API)',
    // G4-T08 cross-ref: Now covered by G4-T01-010 in apps/estimating/src/test/NewRequestPage.test.tsx
  );

  it.todo(
    'TC-DRAFT-04: draft cleared on successful API submission (requires surface + mocked API)',
    // G4-T08 cross-ref: Now covered by G4-T01-011 in apps/estimating/src/test/NewRequestPage.test.tsx
  );

  it.todo(
    'TC-DRAFT-07: draft-saved indicator appears in form header when draft exists (requires UI component)',
    // G4-T08 cross-ref: Now covered by G4-T01-008 in apps/estimating/src/test/NewRequestPage.test.tsx
  );

  it.todo(
    'TC-DRAFT-08: draft offline warning displays when connectivity lost (requires connectivity bar integration)',
    // G4-T08 cross-ref: Remains deferred — requires connectivity bar integration
  );
});

// ─── Deferred: Failure mode surface tests ────────────────────────────────────

describe('TC-FAIL deferred surface tests (G4/G5)', () => {
  it.todo(
    'TC-FAIL-01: null useDraft return does not crash form rendering (requires form surface)',
    // G4-T08 cross-ref: Now covered by G4-T01-001 in apps/estimating/src/test/NewRequestPage.test.tsx
  );

  it.todo(
    'TC-FAIL-02: null BIC owner does not crash HbcBicBadge rendering (requires badge component)',
    // G4-T08 cross-ref: Remains deferred — requires HbcBicBadge component integration
  );

  it.todo(
    'TC-FAIL-03: handoff pre-flight failure displays blocking reason in HbcHandoffComposer (requires composer component)',
    // G4-T08 cross-ref: Remains deferred — requires HbcHandoffComposer component integration
  );

  it.todo(
    'TC-FAIL-05: expired clarification draft shows recovery message (requires clarification form surface)',
    // G4-T08 cross-ref: Remains deferred — requires clarification form surface integration
  );
});

// ─── TC-CLAR-05: Integration-gated resubmission test ─────────────────────────

describe.skipIf(!process.env['SHAREPOINT_INTEGRATION_TEST_ENABLED'])(
  'TC-CLAR-05: Clarification resubmission transitions to Submitted (integration)',
  () => {
    it('resubmitting a clarification response transitions request state to Submitted', async () => {
      // Integration scaffold: when SHAREPOINT_INTEGRATION_TEST_ENABLED is set,
      // this test should:
      // 1. Create a test request in NeedsClarification state
      // 2. Build a clarification response payload
      // 3. Submit via ProjectSetupApi.resubmitClarification()
      // 4. Verify request state transitions to Submitted
      //
      // This requires a live SharePoint environment and is not run in CI by default.
      // Implementation deferred to G4/G5 integration testing phase.
    });
  },
);
