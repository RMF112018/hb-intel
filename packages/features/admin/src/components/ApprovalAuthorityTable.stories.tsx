/**
 * ApprovalAuthorityTable stories — approval mode × eligibility matrix
 * SF17-T08 — Testing Strategy
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ApprovalAuthorityTable } from './ApprovalAuthorityTable.js';
import { ApprovalRuleEditor } from './ApprovalRuleEditor.js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { APPROVAL_RULES_QUERY_KEY } from '../constants/index.js';
import { createMockApprovalAuthorityRule } from '../../testing/index.js';
import { fn } from '@storybook/test';

const meta: Meta<typeof ApprovalAuthorityTable> = {
  title: 'Admin Intelligence/ApprovalAuthorityTable',
  component: ApprovalAuthorityTable,
  args: {
    onEditRule: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ApprovalAuthorityTable>;

function createClient(rules: unknown[]): QueryClient {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  client.setQueryData(APPROVAL_RULES_QUERY_KEY, { rules });
  return client;
}

function Wrapper({ rules, children }: { rules: unknown[]; children: React.ReactNode }) {
  const [client] = React.useState(() => createClient(rules));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** Any-mode rule — eligible user (user-001 is in approverUserIds) */
export const AnyModeEligible: Story = {
  decorators: [
    (Story) => (
      <Wrapper
        rules={[
          createMockApprovalAuthorityRule({
            ruleId: 'rule-any-1',
            approvalMode: 'any',
            approverUserIds: ['user-001', 'user-002'],
            approverGroupIds: ['group-001'],
          }),
        ]}
      >
        <Story />
      </Wrapper>
    ),
  ],
};

/** Any-mode rule — not eligible (user-999 not in approverUserIds) */
export const AnyModeNotEligible: Story = {
  decorators: [
    (Story) => (
      <Wrapper
        rules={[
          createMockApprovalAuthorityRule({
            ruleId: 'rule-any-2',
            approvalMode: 'any',
            approverUserIds: ['user-001'],
            approverGroupIds: [],
          }),
        ]}
      >
        <Story />
      </Wrapper>
    ),
  ],
};

/** All-mode rule — eligible user */
export const AllModeEligible: Story = {
  decorators: [
    (Story) => (
      <Wrapper
        rules={[
          createMockApprovalAuthorityRule({
            ruleId: 'rule-all-1',
            approvalMode: 'all',
            approverUserIds: ['user-001', 'user-002', 'user-003'],
            approverGroupIds: ['group-001'],
          }),
        ]}
      >
        <Story />
      </Wrapper>
    ),
  ],
};

/** All-mode rule — not eligible */
export const AllModeNotEligible: Story = {
  decorators: [
    (Story) => (
      <Wrapper
        rules={[
          createMockApprovalAuthorityRule({
            ruleId: 'rule-all-2',
            approvalMode: 'all',
            approverUserIds: ['user-001'],
            approverGroupIds: ['group-001'],
          }),
        ]}
      >
        <Story />
      </Wrapper>
    ),
  ],
};

/** Composition: ApprovalRuleEditor with existing rule */
export const WithEditorComposition: Story = {
  render: () => {
    const rule = createMockApprovalAuthorityRule({
      ruleId: 'rule-edit-1',
      approvalMode: 'any',
      approverUserIds: ['user-001', 'user-002'],
      approverGroupIds: ['group-admin'],
    });
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h3>Table View</h3>
          <table role="table" aria-label="Approval authority rules">
            <thead>
              <tr>
                <th>Context</th>
                <th>Approver Users</th>
                <th>Approver Groups</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{rule.approvalContext}</td>
                <td>{rule.approverUserIds.join(', ')}</td>
                <td>{rule.approverGroupIds.join(', ')}</td>
                <td>{rule.approvalMode}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3>Editor View</h3>
          <ApprovalRuleEditor
            rule={rule}
            onSave={async () => {}}
            onCancel={() => {}}
          />
        </div>
      </div>
    );
  },
};

// TODO: Playwright e2e — approval rule change affects scorecard approval eligibility path
