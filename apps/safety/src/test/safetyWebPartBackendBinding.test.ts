import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const WEBPART_SOURCE = readFileSync(
  resolve(import.meta.dirname, '../webparts/safety/SafetyWebPart.tsx'),
  'utf-8',
);

describe('SafetyWebPart backend binding source proof', () => {
  it('passes functionAppUrl and apiAudience into mount config', () => {
    expect(WEBPART_SOURCE).toContain('functionAppUrl: this.properties.functionAppUrl');
    expect(WEBPART_SOURCE).toContain('apiAudience: this.properties.apiAudience');
  });

  it('exposes functionAppUrl and apiAudience in property pane', () => {
    expect(WEBPART_SOURCE).toContain("PropertyPaneTextField('functionAppUrl'");
    expect(WEBPART_SOURCE).toContain("PropertyPaneTextField('apiAudience'");
  });
});
