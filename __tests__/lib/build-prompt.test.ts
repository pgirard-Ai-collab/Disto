import { describe, it, expect } from 'vitest';
import {
  buildPromptBody,
  buildSystemPrompt,
  estimateTokens,
  SECTION_LABELS,
} from '@/lib/build-prompt';

const FULL_SECTIONS = {
  brand_identity:      'Une identité forte.',
  mission:             'Notre mission est de servir.',
  brand_intention:     'Intention claire.',
  archetype:           'Le Sage.',
  value_proposition:   'Valeur unique.',
  positioning:         'En haut du marché.',
  tone_of_voice:       'Posé et direct.',
  personas:            'Adultes urbains.',
  key_messages:        'Trois messages.',
  manifesto:           'Manifeste vibrant.',
  brand_values:        'Authenticité.',
  competitive_context: 'Différencié de Strom.',
  always_say:          'Dire « rituel ».',
  dont_say:            'Éviter « wellness ».',
};

describe('SECTION_LABELS', () => {
  it('expose un libellé pour chacune des 14 clés de structure', () => {
    expect(Object.keys(SECTION_LABELS)).toEqual([
      'brand_identity', 'mission', 'brand_intention', 'archetype',
      'value_proposition', 'positioning', 'tone_of_voice', 'personas',
      'key_messages', 'manifesto', 'brand_values', 'competitive_context',
      'always_say', 'dont_say',
    ]);
  });
});

describe('buildPromptBody', () => {
  it('inclut le nom de marque dans l\'intro', () => {
    const body = buildPromptBody('Sartiga', FULL_SECTIONS);
    expect(body).toContain('Tu es l\'assistant de marque de Sartiga.');
  });

  it('inclut toutes les sections renseignées avec leur heading', () => {
    const body = buildPromptBody('Sartiga', FULL_SECTIONS);
    expect(body).toContain('# Mission\nNotre mission est de servir.');
    expect(body).toContain('# Archétype\nLe Sage.');
    expect(body).toContain('# Cibles & Personas\nAdultes urbains.');
    expect(body).toContain('# Contexte concurrentiel\nDifférencié de Strom.');
    expect(body).toContain('# Ce que tu dois toujours faire\nDire « rituel ».');
    expect(body).toContain('# Ce que tu ne dois jamais faire\nÉviter « wellness ».');
  });

  it('omet les sections vides ou absentes', () => {
    const body = buildPromptBody('Sartiga', { mission: 'M', archetype: '   ' });
    expect(body).toContain('# Mission\nM');
    expect(body).not.toContain('# Archétype');
    expect(body).not.toContain('# Manifeste');
  });

  it('retourne uniquement l\'en-tête identité si aucune section n\'est renseignée', () => {
    const body = buildPromptBody('Sartiga', {});
    expect(body).toBe('# Identité de la marque\nTu es l\'assistant de marque de Sartiga.');
  });

  it('inclut brand_identity dans le bloc Identité si renseigné', () => {
    const body = buildPromptBody('Sartiga', { brand_identity: 'Une marque unique.' });
    expect(body).toContain('# Identité de la marque');
    expect(body).toContain('Tu es l\'assistant de marque de Sartiga.');
    expect(body).toContain('Une marque unique.');
  });

  it('gère un objet sections null-like sans crasher', () => {
    expect(() => buildPromptBody('Test', {})).not.toThrow();
  });

  it('produit un résultat stable pour les mêmes entrées', () => {
    const a = buildPromptBody('Sartiga', FULL_SECTIONS);
    const b = buildPromptBody('Sartiga', FULL_SECTIONS);
    expect(a).toBe(b);
  });
});

describe('buildSystemPrompt', () => {
  it('inclut le body complet', () => {
    const prompt = buildSystemPrompt('Sartiga', FULL_SECTIONS);
    expect(prompt).toContain('Tu es l\'assistant de marque de Sartiga.');
    expect(prompt).toContain('# Mission\nNotre mission est de servir.');
  });

  it('ajoute la section INSTRUCTIONS IMPORTANTES', () => {
    const prompt = buildSystemPrompt('Sartiga', FULL_SECTIONS);
    expect(prompt).toContain('INSTRUCTIONS IMPORTANTES');
  });

  it('demande au modèle de citer les sources sous le préfixe SOURCES:', () => {
    const prompt = buildSystemPrompt('Sartiga', FULL_SECTIONS);
    expect(prompt).toContain('"SOURCES:"');
  });

  it('liste les 14 libellés autorisés pour les sources', () => {
    const prompt = buildSystemPrompt('Sartiga', FULL_SECTIONS);
    for (const label of Object.values(SECTION_LABELS)) {
      expect(prompt).toContain(label);
    }
  });

  it('contraint le périmètre des réponses à la marque', () => {
    const prompt = buildSystemPrompt('Sartiga', FULL_SECTIONS);
    expect(prompt).toContain('périmètre de la marque');
    expect(prompt).toContain('Sartiga');
  });
});

describe('estimateTokens', () => {
  it('retourne 0 pour une chaîne vide', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('estime ~1 token pour 4 caractères', () => {
    expect(estimateTokens('abcd')).toBe(1);
    expect(estimateTokens('abcdefgh')).toBe(2);
  });

  it('arrondit le résultat à l\'entier le plus proche', () => {
    expect(estimateTokens('abc')).toBe(1);
    expect(estimateTokens('abcde')).toBe(1);
    expect(estimateTokens('abcdefg')).toBe(2);
  });
});
