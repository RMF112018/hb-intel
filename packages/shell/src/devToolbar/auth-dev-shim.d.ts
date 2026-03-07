declare module '@hbc/auth/dev' {
  export interface IMockIdentity {
    userId: string;
    displayName: string;
    email: string;
    roles: string[];
    metadata: {
      loginTimestamp: number;
      deviceFingerprint: string;
      sessionId: string;
    };
    claims: {
      scopes: string[];
      aadObjectId?: string;
    };
  }

  export interface ISessionData {
    sessionId: string;
    userId: string;
    displayName: string;
    email: string;
    roles: string[];
    permissions: Record<string, boolean>;
    expiresAt: number;
    acquiredAt: number;
  }

  export interface IPersona {
    id: string;
    name: string;
    email: string;
    roles: string[];
    description: string;
  }

  export class DevAuthBypassAdapter {
    constructor(delayMs?: number);
    acquireIdentity(): Promise<IMockIdentity>;
    normalizeSession(rawIdentity: IMockIdentity): Promise<ISessionData>;
    restoreSession(): Promise<ISessionData | null>;
  }

  export const PERSONA_REGISTRY: {
    all(): IPersona[];
    getById(id: string): IPersona | undefined;
  };
}
