export type BrandSections = Record<string, string>;

export type PromptVariant = 'system' | 'export';

const SECTION_ORDER: { key: string; heading: string }[] = [
  { key: 'brand_identity',      heading: 'Identité de la marque' },
  { key: 'mission',             heading: 'Mission' },
  { key: 'brand_intention',     heading: 'Intention de marque' },
  { key: 'archetype',           heading: 'Archétype' },
  { key: 'value_proposition',   heading: 'Proposition de valeur' },
  { key: 'positioning',         heading: 'Positionnement' },
  { key: 'tone_of_voice',       heading: 'Ton & Personnalité' },
  { key: 'personas',            heading: 'Cibles & Personas' },
  { key: 'key_messages',        heading: 'Messages clés' },
  { key: 'manifesto',           heading: 'Manifeste' },
  { key: 'brand_values',        heading: 'Valeurs & Principes' },
  { key: 'competitive_context', heading: 'Contexte concurrentiel' },
  { key: 'always_say',          heading: 'Ce que tu dois toujours faire' },
  { key: 'dont_say',            heading: 'Ce que tu ne dois jamais faire' },
];

export const SECTION_LABELS = SECTION_ORDER.reduce<Record<string, string>>((acc, s) => {
  acc[s.key] = s.heading;
  return acc;
}, {});

/**
 * Build the marketing brand prompt body (sections only, no instructions).
 * Used by export (file download + preview) and as the base for the chat system prompt.
 */
export function buildPromptBody(brandName: string, sections: BrandSections): string {
  const intro = `Tu es l'assistant de marque de ${brandName}.`;
  const identityValue = (sections.brand_identity ?? '').trim();
  const identityBlock = identityValue
    ? `# Identité de la marque\n${intro}\n${identityValue}`
    : `# Identité de la marque\n${intro}`;

  const otherBlocks = SECTION_ORDER
    .filter(s => s.key !== 'brand_identity')
    .map(({ key, heading }) => {
      const value = (sections[key] ?? '').trim();
      return value ? `# ${heading}\n${value}` : null;
    })
    .filter((b): b is string => b !== null);

  return [identityBlock, ...otherBlocks].join('\n\n').trim();
}

/**
 * Build the full chat system prompt: brand body + behavioral instructions + source-citation rule.
 */
export function buildSystemPrompt(brandName: string, sections: BrandSections): string {
  const body = buildPromptBody(brandName, sections);
  const labels = SECTION_ORDER.map(s => s.heading).join(', ');

  return `${body}

---
INSTRUCTIONS IMPORTANTES :
- Réponds dans la même langue que la question (français par défaut).
- Reste dans le ton et les valeurs de la marque dans chaque réponse.
- Si la question dépasse le périmètre de la marque, réponds poliment que tu ne peux répondre qu'en lien avec ${brandName}.
- N'invente jamais d'information qui n'est pas dans les sections ci-dessus.
- À la TOUTE FIN de chaque réponse, ajoute une ligne séparée commençant exactement par "SOURCES:" suivie des noms des sections sur lesquelles tu t'es appuyé, séparés par des virgules. Utilise UNIQUEMENT ces noms : ${labels}.`;
}

export function estimateTokens(text: string): number {
  return Math.round(text.length / 4);
}
