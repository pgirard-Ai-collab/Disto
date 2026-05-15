export const REQUIRED_KEYS = [
  'brand_identity', 'mission', 'brand_intention', 'archetype',
  'value_proposition', 'positioning', 'tone_of_voice', 'personas',
  'key_messages', 'manifesto', 'competitive_context', 'brand_values',
  'always_say', 'dont_say',
] as const;

export function parseLlmJson(raw: string): Record<string, string> {
  let s = raw.trim();
  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) s = fenced[1].trim();
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    s = s.slice(firstBrace, lastBrace + 1);
  }
  const parsed = JSON.parse(s) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const k of REQUIRED_KEYS) {
    const v = parsed[k];
    out[k] = typeof v === 'string' ? v : '';
  }
  return out;
}
