import { vi } from 'vitest';
import fr from '../messages/fr.json';

function resolveKey(namespace: string, key: string): string {
  const path = namespace ? `${namespace}.${key}`.split('.') : key.split('.');
  let node: unknown = fr;
  for (const segment of path) {
    if (node && typeof node === 'object' && segment in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[segment];
    } else {
      return path.join('.');
    }
  }
  return typeof node === 'string' ? node : path.join('.');
}

vi.mock('next-intl/server', () => ({
  getTranslations: async (namespace: string = '') => {
    return (key: string) => resolveKey(namespace, key);
  },
  getLocale: async () => 'fr',
  getMessages: async () => fr,
  getNow: async () => new Date(),
  getTimeZone: async () => 'UTC',
}));
