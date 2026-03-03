/**
 * Form input shape for creating or editing a PMP document.
 */
export interface IPmpFormData {
  /** Associated project identifier. */
  projectId: string;
  /** Current PMP status. */
  status: string;
}

/**
 * Form input shape for submitting a PMP signature.
 */
export interface IPmpSignatureFormData {
  /** PMP being signed. */
  pmpId: number;
  /** Name of the signer. */
  signerName: string;
  /** Role of the signer. */
  role: string;
}
