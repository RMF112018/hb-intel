import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MyWorkBentoGrid } from './MyWorkBentoGrid.js';
import { MyWorkCard } from './MyWorkCard.js';

afterEach(() => {
  cleanup();
});

function renderInGrid(card: React.ReactElement, mode: Parameters<typeof MyWorkBentoGrid>[0]['mode'] = 'desktop') {
  return render(<MyWorkBentoGrid mode={mode}>{card}</MyWorkBentoGrid>);
}

function getCard(container: HTMLElement) {
  return container.querySelector('[data-my-work-card]') as HTMLElement;
}

describe('MyWorkCard — data attributes', () => {
  it('emits the canonical role + footprint + mode + span markers', () => {
    const { container } = renderInGrid(
      <MyWorkCard role="work-summary" footprint="standard" title="Work summary">
        body
      </MyWorkCard>,
    );
    const card = getCard(container);
    expect(card.tagName).toBe('ARTICLE');
    expect(card.getAttribute('data-my-work-card-role')).toBe('work-summary');
    expect(card.getAttribute('data-my-work-card-footprint')).toBe('standard');
    expect(card.getAttribute('data-my-work-mode')).toBe('desktop');
    expect(card.getAttribute('data-my-work-column-span')).toBe('4');
    expect(card.getAttribute('data-my-work-span-source')).toBe('footprint');
  });

  it('marks span source as override and includes the override mode when applicable', () => {
    const { container } = renderInGrid(
      <MyWorkCard
        role="x"
        footprint="standard"
        title="Override"
        spanOverrides={{ desktop: 6 }}
      >
        body
      </MyWorkCard>,
    );
    const card = getCard(container);
    expect(card.getAttribute('data-my-work-span-source')).toBe('override');
    expect(card.getAttribute('data-my-work-span-override-mode')).toBe('desktop');
    expect(card.getAttribute('data-my-work-column-span')).toBe('6');
  });

  it('inline gridColumn style mirrors the resolved column span', () => {
    const { container } = renderInGrid(
      <MyWorkCard role="x" footprint="wide" title="Wide">
        body
      </MyWorkCard>,
    );
    const card = getCard(container);
    expect(card.style.gridColumn).toBe('span 8');
  });

  it('applies the module marker when provided', () => {
    const { container } = renderInGrid(
      <MyWorkCard
        role="x"
        footprint="standard"
        title="Module"
        module="adobe-sign-action-queue"
      >
        body
      </MyWorkCard>,
    );
    const card = getCard(container);
    expect(card.getAttribute('data-my-work-module')).toBe('adobe-sign-action-queue');
  });

  it('spreads extraDataAttributes onto the card root', () => {
    const { container } = renderInGrid(
      <MyWorkCard
        role="x"
        footprint="standard"
        title="Extra"
        extraDataAttributes={{ 'data-my-work-adobe-sign-queue': '' }}
      >
        body
      </MyWorkCard>,
    );
    const card = getCard(container);
    expect(card.hasAttribute('data-my-work-adobe-sign-queue')).toBe(true);
  });
});

describe('MyWorkCard — heading semantics', () => {
  it('renders a heading whose id is referenced by aria-labelledby', () => {
    const { container } = renderInGrid(
      <MyWorkCard role="x" footprint="standard" title="Hello" eyebrow="Today">
        body
      </MyWorkCard>,
    );
    const card = getCard(container);
    const labelledBy = card.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    // React 18 `useId()` emits ids containing ':' which are invalid CSS selectors;
    // use getElementById which accepts the literal value.
    const heading = document.getElementById(labelledBy!);
    expect(heading).not.toBeNull();
    expect(heading!.tagName).toBe('H3');
    expect(heading!.textContent).toBe('Hello');
  });

  it('honors a custom headingLevel', () => {
    const { container } = renderInGrid(
      <MyWorkCard role="x" footprint="standard" title="H2" headingLevel={2}>
        body
      </MyWorkCard>,
    );
    const card = getCard(container);
    const labelledBy = card.getAttribute('aria-labelledby')!;
    expect(document.getElementById(labelledBy)?.tagName).toBe('H2');
  });
});

describe('MyWorkCard — phone clamping via the footprint table', () => {
  it('clamps wide span to 1 on phone', () => {
    const { container } = renderInGrid(
      <MyWorkCard role="x" footprint="wide" title="Wide">
        body
      </MyWorkCard>,
      'phone',
    );
    const card = getCard(container);
    expect(card.getAttribute('data-my-work-column-span')).toBe('1');
    expect(card.style.gridColumn).toBe('span 1');
  });
});
