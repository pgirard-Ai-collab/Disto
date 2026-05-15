import { describe, it, expect } from 'vitest';
import { parseLlmJson, REQUIRED_KEYS } from '@/lib/parse-llm-json';

function makeValidJson(overrides: Record<string, unknown> = {}): string {
  const base: Record<string, string> = {};
  for (const k of REQUIRED_KEYS) base[k] = `valeur ${k}`;
  return JSON.stringify({ ...base, ...overrides });
}

describe('parseLlmJson', () => {
  it('parse un JSON brut valide avec les 14 clés', () => {
    const result = parseLlmJson(makeValidJson());
    expect(Object.keys(result)).toHaveLength(14);
    expect(result.brand_identity).toBe('valeur brand_identity');
    expect(result.dont_say).toBe('valeur dont_say');
  });

  it('extrait le JSON entouré de fences ```json ... ```', () => {
    const json = makeValidJson();
    const result = parseLlmJson(`Voici la structure :\n\`\`\`json\n${json}\n\`\`\`\nMerci.`);
    expect(result.mission).toBe('valeur mission');
  });

  it('extrait le JSON entouré de fences ``` sans langue', () => {
    const json = makeValidJson();
    const result = parseLlmJson(`\`\`\`\n${json}\n\`\`\``);
    expect(result.mission).toBe('valeur mission');
  });

  it('extrait le JSON entouré de prose (fallback indexOf)', () => {
    const json = makeValidJson();
    const result = parseLlmJson(`Voici le résultat : ${json} Fin.`);
    expect(result.archetype).toBe('valeur archetype');
  });

  it('retourne une chaîne vide pour une clé absente', () => {
    const obj: Record<string, string> = {};
    for (const k of REQUIRED_KEYS) obj[k] = `v`;
    delete obj['manifesto'];
    const result = parseLlmJson(JSON.stringify(obj));
    expect(result.manifesto).toBe('');
  });

  it('retourne une chaîne vide si la valeur n\'est pas une string', () => {
    const result = parseLlmJson(makeValidJson({ brand_values: 42, personas: null }));
    expect(result.brand_values).toBe('');
    expect(result.personas).toBe('');
  });

  it('ignore les clés supplémentaires non listées dans REQUIRED_KEYS', () => {
    const result = parseLlmJson(makeValidJson({ extra_key: 'should be ignored' }));
    expect('extra_key' in result).toBe(false);
    expect(Object.keys(result)).toHaveLength(14);
  });

  it('lève une erreur sur un JSON malformé', () => {
    expect(() => parseLlmJson('{invalid json')).toThrow();
  });

  it('lève une erreur si aucun JSON trouvé', () => {
    expect(() => parseLlmJson('Aucun JSON ici.')).toThrow();
  });
});
