import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

(globalThis as typeof globalThis & { jest: typeof vi }).jest = vi;

beforeEach(() => {
  vi.clearAllMocks();
});