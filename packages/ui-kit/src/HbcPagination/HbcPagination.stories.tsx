/**
 * HbcPagination — Storybook Stories
 * Phase 4.10 Navigation UI System
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcPagination } from './index.js';
import { hbcLightTheme, hbcFieldTheme } from '../theme/index.js';
import type { PageSizeOption } from './types.js';

export default {
  title: 'Navigation/HbcPagination',
  component: HbcPagination,
  decorators: [
    (Story: React.FC) => (
      <FluentProvider theme={hbcLightTheme}>
        <div style={{ maxWidth: 800 }}>
          <Story />
        </div>
      </FluentProvider>
    ),
  ],
};

export const Default = () => {
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState<PageSizeOption>(25);
  return (
    <HbcPagination
      totalItems={127}
      currentPage={page}
      pageSize={size}
      onPageChange={setPage}
      onPageSizeChange={setSize}
    />
  );
};

export const HiddenSinglePage = () => (
  <div>
    <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: 8 }}>
      Pagination is hidden because totalItems (20) &lt;= pageSize (25):
    </p>
    <HbcPagination
      totalItems={20}
      currentPage={1}
      pageSize={25}
      onPageChange={() => {}}
    />
    <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: 8 }}>
      (Nothing rendered above this line)
    </p>
  </div>
);

export const LargePageCount = () => {
  const [page, setPage] = React.useState(15);
  return (
    <HbcPagination
      totalItems={2500}
      currentPage={page}
      pageSize={25}
      onPageChange={setPage}
    />
  );
};

export const PageSizeSelector = () => {
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState<PageSizeOption>(25);
  return (
    <HbcPagination
      totalItems={250}
      currentPage={page}
      pageSize={size}
      onPageChange={setPage}
      onPageSizeChange={(newSize) => { setSize(newSize); setPage(1); }}
    />
  );
};

export const FieldMode = () => {
  const [page, setPage] = React.useState(3);
  return (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: 24, backgroundColor: '#0F1419' }}>
        <HbcPagination
          totalItems={200}
          currentPage={page}
          pageSize={25}
          onPageChange={setPage}
          isFieldMode
        />
      </div>
    </FluentProvider>
  );
};

export const A11yTest = () => {
  const [page, setPage] = React.useState(1);
  return (
    <HbcPagination
      totalItems={75}
      currentPage={page}
      pageSize={25}
      onPageChange={setPage}
    />
  );
};
