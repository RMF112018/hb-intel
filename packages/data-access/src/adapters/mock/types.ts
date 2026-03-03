/** Configuration options for mock adapters. */
export interface MockAdapterConfig {
  /** Simulated async delay in milliseconds (default: 0). */
  delay?: number;
  /** Probability (0–1) of simulating a random error (default: 0). */
  errorProbability?: number;
}
