import { randomUUID } from 'node:crypto';

/**
 * Generates a secure random UUID (v4) using the built-in crypto module.
 * This is a cryptographically secure replacement for Math.random() based IDs.
 */
export function generateUUID(): string {
  return randomUUID();
}
