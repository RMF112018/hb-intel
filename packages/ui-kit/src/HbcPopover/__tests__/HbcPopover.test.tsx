import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcPopover } from '../index.js';

describe('HbcPopover', () => {
  it('renders trigger content', () => {
    render(
      <HbcPopover trigger={<span>Open popover</span>}>
        Popover content
      </HbcPopover>,
    );
    expect(screen.getByText('Open popover')).toBeInTheDocument();
  });

  it('popover not visible initially', () => {
    render(
      <HbcPopover trigger={<span>Trigger</span>}>
        Hidden content
      </HbcPopover>,
    );
    expect(document.querySelector('[data-hbc-ui="popover"]')).not.toBeInTheDocument();
  });

  it('click trigger opens popover (data-hbc-ui="popover" appears)', async () => {
    const user = userEvent.setup();
    render(
      <HbcPopover trigger={<span>Trigger</span>} triggerMode="click">
        Popover body
      </HbcPopover>,
    );
    await user.click(screen.getByText('Trigger'));
    expect(document.querySelector('[data-hbc-ui="popover"]')).toBeInTheDocument();
  });

  it('popover has role="tooltip"', async () => {
    const user = userEvent.setup();
    render(
      <HbcPopover trigger={<span>Trigger</span>} triggerMode="click">
        Content
      </HbcPopover>,
    );
    await user.click(screen.getByText('Trigger'));
    const popover = document.querySelector('[data-hbc-ui="popover"]');
    expect(popover).toHaveAttribute('role', 'tooltip');
  });

  it('wrapper has role="button" in click mode', () => {
    const { container } = render(
      <HbcPopover trigger={<span>Trigger</span>} triggerMode="click">
        Content
      </HbcPopover>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute('role', 'button');
  });

  it('wrapper has aria-expanded in click mode', () => {
    const { container } = render(
      <HbcPopover trigger={<span>Trigger</span>} triggerMode="click">
        Content
      </HbcPopover>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute('aria-expanded', 'false');
  });

  it('wrapper has tabIndex=0 in click mode', () => {
    const { container } = render(
      <HbcPopover trigger={<span>Trigger</span>} triggerMode="click">
        Content
      </HbcPopover>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute('tabindex', '0');
  });
});
