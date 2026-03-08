// D-PH7-BW-10: SPFx SDK mock — BaseClientSideWebPart stub for jsdom test environment
export class BaseClientSideWebPart<TProperties> {
  public context: Record<string, unknown> = {};
  public domElement: HTMLElement = document.createElement('div');
  public properties: TProperties = {} as TProperties;
  protected async onInit(): Promise<void> { /* no-op */ }
  public render(): void { /* no-op */ }
  protected onDispose(): void { /* no-op */ }
}

export type WebPartContext = Record<string, unknown>;
