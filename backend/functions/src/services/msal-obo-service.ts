export interface IMsalOboService {
  acquireTokenOnBehalfOf(userToken: string, scopes: string[]): Promise<string>;
}

export class MockMsalOboService implements IMsalOboService {
  async acquireTokenOnBehalfOf(_userToken: string, _scopes: string[]): Promise<string> {
    const fakeToken = `mock-obo-token-${Date.now()}`;
    console.log(`[MockMSAL] Acquired OBO token: ${fakeToken.substring(0, 20)}...`);
    return fakeToken;
  }
}
