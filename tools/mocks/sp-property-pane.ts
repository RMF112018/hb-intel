// D-PH7-BW-10: SPFx SDK mock — PropertyPane stubs for jsdom test environment
export const PropertyPaneTextField = (key: string, config: Record<string, unknown>) => ({
  key, ...config,
});
export type IPropertyPaneConfiguration = Record<string, unknown>;
