import { describe, it, expect } from 'vitest';
import { validatePassword } from '@/lib/auth/validate-password';

describe('validatePassword', () => {
  it('retourne null pour des mots de passe valides identiques', () => {
    expect(validatePassword('monmotdepasse', 'monmotdepasse')).toBeNull();
  });

  it('retourne null pour exactement 8 caractères', () => {
    expect(validatePassword('12345678', '12345678')).toBeNull();
  });

  it('retourne mismatch si les mots de passe diffèrent', () => {
    expect(validatePassword('abcdefgh', 'abcdefgi')).toBe('mismatch');
  });

  it('retourne mismatch si le second est vide', () => {
    expect(validatePassword('abcdefgh', '')).toBe('mismatch');
  });

  it('retourne too_short si < 8 caractères', () => {
    expect(validatePassword('abc', 'abc')).toBe('too_short');
  });

  it('retourne too_short pour un mot de passe vide', () => {
    expect(validatePassword('', '')).toBe('too_short');
  });

  it('priorité : mismatch avant too_short', () => {
    // Les deux sont courts ET différents — mismatch doit être retourné en premier
    expect(validatePassword('ab', 'cd')).toBe('mismatch');
  });
});
