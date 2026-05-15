import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/slugify';

describe('slugify', () => {
  it('convertit en minuscules', () => {
    expect(slugify('MARQUE')).toBe('marque');
  });

  it('retire les accents', () => {
    expect(slugify('Café Renommé')).toBe('cafe-renomme');
  });

  it('remplace les espaces par des tirets', () => {
    expect(slugify('Ma Marque')).toBe('ma-marque');
  });

  it('fusionne les espaces multiples en un seul tiret', () => {
    expect(slugify('Ma   Marque')).toBe('ma-marque');
  });

  it('supprime les tirets en début et fin', () => {
    expect(slugify(' -marque- ')).toBe('marque');
  });

  it('retire les caractères spéciaux', () => {
    expect(slugify('Marque & Co.')).toBe('marque-co');
  });

  it('garde les chiffres', () => {
    expect(slugify('Studio 42')).toBe('studio-42');
  });

  it('retourne une chaîne vide pour une entrée vide', () => {
    expect(slugify('')).toBe('');
  });

  it('retourne une chaîne vide pour une chaîne de caractères spéciaux uniquement', () => {
    expect(slugify('!@#$%')).toBe('');
  });

  it('ne modifie pas un slug déjà valide', () => {
    expect(slugify('ma-marque')).toBe('ma-marque');
  });

  it('gère les caractères accentués composés (e + combining accent)', () => {
    expect(slugify('étude')).toBe('etude');
  });
});
