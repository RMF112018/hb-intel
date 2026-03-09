import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { HbcAcknowledgmentModal } from '../HbcAcknowledgmentModal';

const meta: Meta<typeof HbcAcknowledgmentModal> = {
  title: 'Acknowledgment/HbcAcknowledgmentModal',
  component: HbcAcknowledgmentModal,
  args: {
    isOpen: true,
    onConfirm: fn(),
    onDecline: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof HbcAcknowledgmentModal>;

export const AcknowledgeSimple: Story = {
  args: {
    intent: 'acknowledge',
    promptMessage: 'Please confirm you have reviewed this document.',
    requireConfirmationPhrase: false,
  },
};

export const AcknowledgeWithPhrase: Story = {
  args: {
    intent: 'acknowledge',
    promptMessage: 'Please confirm you have reviewed this document.',
    requireConfirmationPhrase: true,
    confirmationPhrase: 'I CONFIRM',
  },
};

export const AcknowledgeCustomPhrase: Story = {
  args: {
    intent: 'acknowledge',
    promptMessage: 'Approve the bid package.',
    requireConfirmationPhrase: true,
    confirmationPhrase: 'APPROVED',
  },
};

export const DeclineFreeText: Story = {
  args: {
    intent: 'decline',
    promptMessage: '',
    allowDecline: true,
  },
};

export const DeclineWithCategories: Story = {
  args: {
    intent: 'decline',
    promptMessage: '',
    allowDecline: true,
    declineReasons: ['Incomplete', 'Incorrect', 'Other'],
  },
};
