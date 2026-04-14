import { describe, expect, it } from 'vitest';
import {
  illegalTransitionMessage,
  inProgressMessage,
  lifecycleFailureMessage,
  lifecycleOutcomeMessage,
  publishDisabledReason,
  publishFailureMessage,
  publishSuccessMessage,
  transitionInProgressMessage,
} from './lifecycleMessaging.js';

describe('inProgressMessage', () => {
  it('speaks the mode in the present continuous', () => {
    expect(inProgressMessage('create')).toMatch(/Publishing/);
    expect(inProgressMessage('republish')).toMatch(/Republishing/);
    expect(inProgressMessage('preview')).toMatch(/preview/i);
  });
});

describe('publishSuccessMessage', () => {
  it('celebrates a brand-new publish and includes the page URL', () => {
    expect(
      publishSuccessMessage({ mode: 'create', action: 'create', pageUrl: 'https://x/y' }),
    ).toMatch(/Published/);
    expect(
      publishSuccessMessage({ mode: 'create', action: 'create', pageUrl: 'https://x/y' }),
    ).toContain('https://x/y');
  });

  it('describes an in-place republish preserving the binding', () => {
    const msg = publishSuccessMessage({ mode: 'republish', action: 'inPlaceUpdate' });
    expect(msg).toMatch(/Republished/);
    expect(msg).toMatch(/updated in place/);
  });

  it('describes a regeneration', () => {
    const msg = publishSuccessMessage({ mode: 'republish', action: 'regenerate' });
    expect(msg).toMatch(/fresh page/);
  });

  it('no-ops clearly', () => {
    const msg = publishSuccessMessage({ mode: 'republish', action: 'noOp' });
    expect(msg).toMatch(/Nothing changed/);
  });

  it('says blocked when validation blocked the run', () => {
    const msg = publishSuccessMessage({ mode: 'republish', action: 'blocked' });
    expect(msg).toMatch(/blocked/);
  });

  it('does not narrate action detail for preview', () => {
    expect(publishSuccessMessage({ mode: 'preview', action: 'create' })).toMatch(/up to date/);
  });
});

describe('publishFailureMessage', () => {
  it('uses the user-facing verb per mode and includes the stage', () => {
    expect(
      publishFailureMessage({ mode: 'create', stage: 'compose', message: 'boom' }),
    ).toMatch(/Publish didn.t complete — compose: boom/);
    expect(
      publishFailureMessage({ mode: 'republish', stage: 'write', message: 'err' }),
    ).toMatch(/Republish didn.t complete/);
  });
});

describe('transitionInProgressMessage', () => {
  it('has specific copy for archive, withdraw, and review transitions', () => {
    expect(transitionInProgressMessage('archived')).toMatch(/Archiving/);
    expect(transitionInProgressMessage('withdrawn')).toMatch(/Withdrawing/);
    expect(transitionInProgressMessage('review')).toMatch(/review/i);
  });

  it('falls back to a generic move message for unknown states', () => {
    expect(transitionInProgressMessage('draft')).toMatch(/draft/i);
  });
});

describe('lifecycleOutcomeMessage', () => {
  it('announces archive with binding-updated detail', () => {
    expect(
      lifecycleOutcomeMessage({ to: 'archived', bindingUpdated: true }),
    ).toMatch(/Archived\..*taken down/);
  });

  it('announces archive without a binding', () => {
    expect(
      lifecycleOutcomeMessage({ to: 'archived', bindingUpdated: false }),
    ).toMatch(/No live page/);
  });

  it('announces withdraw similarly', () => {
    expect(
      lifecycleOutcomeMessage({ to: 'withdrawn', bindingUpdated: true }),
    ).toMatch(/Withdrawn/);
  });
});

describe('lifecycleFailureMessage', () => {
  it('uses author-scoped verbs per destination state', () => {
    expect(
      lifecycleFailureMessage({ to: 'archived', stage: 'history', message: 'x' }),
    ).toMatch(/Archive didn.t complete/);
    expect(
      lifecycleFailureMessage({ to: 'withdrawn', stage: 'history', message: 'x' }),
    ).toMatch(/Withdraw didn.t complete/);
    expect(
      lifecycleFailureMessage({ to: 'approved', stage: 'history', message: 'x' }),
    ).toMatch(/Transition to approved didn.t complete/);
  });
});

describe('illegalTransitionMessage', () => {
  it('refuses the transition in plain English', () => {
    expect(illegalTransitionMessage('published', 'draft')).toBe(
      "Can't move published articles to draft directly.",
    );
  });
});

describe('publishDisabledReason', () => {
  it('prefers draft-missing over other reasons', () => {
    expect(
      publishDisabledReason({
        hasDraft: false,
        destinationSupported: false,
        validationBlocked: true,
        busy: true,
      }),
    ).toMatch(/Pick a draft/);
  });

  it('reports unsupported destination', () => {
    expect(
      publishDisabledReason({
        hasDraft: true,
        destinationSupported: false,
        validationBlocked: false,
        busy: false,
      }),
    ).toMatch(/destination/);
  });

  it('reports validation block ahead of busy', () => {
    expect(
      publishDisabledReason({
        hasDraft: true,
        destinationSupported: true,
        validationBlocked: true,
        busy: true,
      }),
    ).toMatch(/blocking issues/);
  });

  it('reports busy when nothing else is blocking', () => {
    expect(
      publishDisabledReason({
        hasDraft: true,
        destinationSupported: true,
        validationBlocked: false,
        busy: true,
      }),
    ).toMatch(/run is already in flight/);
  });

  it('returns undefined when publish is enabled', () => {
    expect(
      publishDisabledReason({
        hasDraft: true,
        destinationSupported: true,
        validationBlocked: false,
        busy: false,
      }),
    ).toBeUndefined();
  });
});
