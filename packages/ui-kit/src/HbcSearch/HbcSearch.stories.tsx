/**
 * HbcSearch — Storybook Stories
 * Phase 4.10 Navigation UI System
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcSearch } from './index.js';
import { hbcLightTheme, hbcFieldTheme } from '../theme/index.js';

export default {
  title: 'Navigation/HbcSearch',
  component: HbcSearch,
  decorators: [
    (Story: React.FC) => (
      <FluentProvider theme={hbcLightTheme}>
        <div style={{ maxWidth: 400 }}>
          <Story />
        </div>
      </FluentProvider>
    ),
  ],
};

export const Default = () => (
  <HbcSearch
    variant="local"
    value=""
    onSearch={(v) => console.log('Search:', v)}
    placeholder="Search..."
  />
);

export const AllVariants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Global variant</p>
      <div style={{ backgroundColor: '#1E1E1E', padding: 16 }}>
        <HbcSearch variant="global" onSearchOpen={() => console.log('opened')} />
      </div>
    </div>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Local (empty)</p>
      <HbcSearch variant="local" value="" onSearch={() => {}} placeholder="Filter items..." />
    </div>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Local (with value)</p>
      <HbcSearch variant="local" value="concrete pour" onSearch={() => {}} />
    </div>
  </div>
);

export const FieldMode = () => (
  <FluentProvider theme={hbcFieldTheme}>
    <div style={{ padding: 24, backgroundColor: '#0F1419' }}>
      <HbcSearch
        variant="local"
        value=""
        onSearch={(v) => console.log('Search:', v)}
        placeholder="Search field data..."
        isFieldMode
      />
    </div>
  </FluentProvider>
);

export const GlobalVariant = () => (
  <div style={{ backgroundColor: '#1E1E1E', padding: 16 }}>
    <HbcSearch
      variant="global"
      onSearchOpen={() => console.log('Global search opened')}
    />
  </div>
);

export const LocalEmpty = () => (
  <HbcSearch
    variant="local"
    value=""
    onSearch={(v) => console.log('Search:', v)}
    placeholder="Filter items..."
  />
);

export const LocalWithValue = () => (
  <HbcSearch
    variant="local"
    value="concrete pour"
    onSearch={(v) => console.log('Search:', v)}
  />
);

export const LocalDebounce = () => {
  const [value, setValue] = React.useState('');
  const [debounced, setDebounced] = React.useState('');
  return (
    <div>
      <HbcSearch
        variant="local"
        value={value}
        onSearch={(v) => { setValue(v); setDebounced(v); }}
        placeholder="Type to see debounce..."
      />
      <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 8 }}>
        Debounced value: &quot;{debounced}&quot;
      </p>
    </div>
  );
};

export const LocalFieldMode = () => (
  <FluentProvider theme={hbcFieldTheme}>
    <div style={{ padding: 24, backgroundColor: '#0F1419' }}>
      <HbcSearch
        variant="local"
        value=""
        onSearch={(v) => console.log('Search:', v)}
        placeholder="Search field data..."
        isFieldMode
      />
    </div>
  </FluentProvider>
);

export const A11yTest = () => (
  <HbcSearch
    variant="local"
    value="test query"
    onSearch={(v) => console.log('Search:', v)}
    placeholder="Accessible search"
  />
);
