/**
 * File extensions that are always blocked regardless of user or context (D-10).
 * Executables, scripts, and other potentially harmful file types.
 */
export const BLOCKED_EXTENSIONS: ReadonlySet<string> = new Set([
  '.exe', '.bat', '.cmd', '.com', '.msi', '.dll', '.scr',
  '.ps1', '.psm1', '.psd1', '.ps1xml',
  '.sh', '.bash', '.zsh', '.fish',
  '.vbs', '.vbe', '.wsf', '.wsh',
  '.jar', '.class',
  '.js', '.mjs', '.cjs',  // raw JS files (not in archive) blocked as precaution
  '.ts',                   // raw TS files blocked as precaution
  '.py', '.rb', '.pl', '.php',
]);

/** MIME types that are always blocked. */
export const BLOCKED_MIME_TYPES: ReadonlySet<string> = new Set([
  'application/x-msdownload',
  'application/x-executable',
  'application/x-sh',
  'application/x-bat',
  'application/vnd.microsoft.portable-executable',
]);
