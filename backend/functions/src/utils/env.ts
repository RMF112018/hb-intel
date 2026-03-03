export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value !== undefined) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${key}`);
}

export function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}
