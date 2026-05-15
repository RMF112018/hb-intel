import {
  DefaultAzureCredential,
  EnvironmentCredential,
  ManagedIdentityCredential,
  AzureCliCredential,
  AzurePowerShellCredential,
  AzureDeveloperCliCredential,
} from '@azure/identity';

const scope = 'https://hedrickbrotherscom.sharepoint.com/.default';

async function probe(name: string, credential: { getToken: (scope: string) => Promise<unknown> }) {
  try {
    await credential.getToken(scope);
    console.log(`${name}: SUCCESS`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const firstLine = message.split('\n')[0];
    console.log(`${name}: FAIL — ${firstLine}`);
  }
}

async function main() {
  await probe('EnvironmentCredential', new EnvironmentCredential());
  await probe('ManagedIdentityCredential', new ManagedIdentityCredential());
  await probe('AzureCliCredential', new AzureCliCredential());
  await probe('AzurePowerShellCredential', new AzurePowerShellCredential());
  await probe('AzureDeveloperCliCredential', new AzureDeveloperCliCredential());
  await probe('DefaultAzureCredential', new DefaultAzureCredential());
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
