'use client';

import { useState } from 'react';
import { C } from '@/lib/disto';
import Btn from '@/components/ui/Btn';
import Eyebrow from '@/components/ui/Eyebrow';

type ExportFormat = 'chatgpt_custom_gpt' | 'claude_project' | 'claude_skill' | 'gemini_gem' | 'universal_txt';

const EXPORT_TARGETS: { format: ExportFormat; tag: string; mark: string; color: string; ext: string; instructions: string }[] = [
  {
    format: 'chatgpt_custom_gpt',
    tag: 'ChatGPT — Custom GPT',
    mark: 'OA',
    color: '#EBE8E6',
    ext: '.txt',
    instructions: `1. Allez sur platform.openai.com → « My GPTs » → « Create a GPT »\n2. Dans l'onglet « Configure », collez le contenu dans le champ « Instructions »\n3. Donnez un nom à votre GPT (ex. « Assistant Marque ») et cliquez « Save »\n4. Partagez le lien avec votre équipe`,
  },
  {
    format: 'claude_project',
    tag: 'Claude — Project',
    mark: 'AN',
    color: '#F02D14',
    ext: '.md',
    instructions: `1. Allez sur claude.ai → « Projects » → « New Project »\n2. Cliquez sur « Set project instructions » et collez le contenu du fichier .md\n3. Nommez le projet (ex. « Marque ») et invitez vos collaborateurs\n4. Toutes les conversations du projet hériteront du system prompt`,
  },
  {
    format: 'claude_skill',
    tag: 'Claude — Skill',
    mark: 'SK',
    color: '#F02D14',
    ext: '.zip',
    instructions: `CLAUDE.AI :\n1. Allez sur claude.ai → Settings → Capabilities → Skills\n2. Cliquez « Upload skill » et sélectionnez le fichier .zip téléchargé\n3. Activez le skill — Claude l'invoquera automatiquement quand pertinent\n\nCLAUDE CODE CLI :\n1. Déballez le fichier .zip dans ~/.claude/skills/ (créez le dossier si nécessaire)\n2. Vous obtenez ~/.claude/skills/<marque>/SKILL.md\n3. Redémarrez Claude Code — le skill apparaît dans la liste des skills disponibles`,
  },
  {
    format: 'gemini_gem',
    tag: 'Gemini — Gem',
    mark: 'GO',
    color: '#199BB9',
    ext: '.txt',
    instructions: `1. Allez sur gemini.google.com → « Gems » → « Create a Gem »\n2. Collez le contenu dans le champ « Instructions »\n3. Activez la mémoire longue dans les paramètres avancés\n4. Sauvegardez et partagez avec votre équipe`,
  },
  {
    format: 'universal_txt',
    tag: 'Universel — .txt',
    mark: 'TX',
    color: '#D4D1CC',
    ext: '.txt',
    instructions: `Format texte brut sans balises.\nCopiez le contenu et collez-le au début de n'importe quelle conversation IA (Mistral, Llama, Perplexity, etc.).\nCe format fonctionne avec tout modèle qui accepte un system prompt ou un message initial.`,
  },
];

type Props = {
  brand: string;
  brandSlug: string;
  promptPreview: string;
  generatedAt: string;
  tokenEstimate: number;
  hasStructure: boolean;
};

export default function ExportPanel({ brand, brandSlug, promptPreview, generatedAt, tokenEstimate, hasStructure }: Props) {
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(format: ExportFormat) {
    if (!hasStructure) return;
    setDownloading(format);
    setError(null);
    try {
      const res = await fetch(`/api/export?brand=${encodeURIComponent(brandSlug)}&format=${format}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Échec du téléchargement.' }));
        setError(data.error ?? 'Échec du téléchargement.');
        return;
      }

      // Extract filename from Content-Disposition (server is the source of truth)
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match ? match[1] : `${brandSlug}-${format}.txt`;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setDownloading(null);
    }
  }

  function copyAll() {
    if (!hasStructure) return;
    navigator.clipboard.writeText(promptPreview).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="panel-split" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* LEFT — prompt preview */}
      <div style={{ flex: 1.4, padding: 'clamp(20px, 3vw, 48px)', overflowY: 'auto', borderRight: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <span style={{ color: C.red, fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', fontVariantNumeric: 'tabular-nums' }}>04 /</span>
          <Eyebrow color={C.fg3}>Portail marque · Export</Eyebrow>
        </div>

        <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 0.96, marginBottom: 10 }}>
          System Prompt.
        </div>
        <div style={{ fontSize: 15, color: C.boneDim, maxWidth: 560, lineHeight: 1.55, marginBottom: 28 }}>
          Un prompt compilé à partir de votre structure de marque. Collez-le au début d&apos;une nouvelle conversation — chaque modèle parlera comme votre marque.
        </div>

        {!hasStructure && (
          <div role="status" style={{
            padding: '16px 20px', marginBottom: 24,
            background: 'rgba(245,230,25,0.10)', border: `1px solid ${C.yellowDark}`,
            color: C.bone, fontSize: 13, lineHeight: 1.6,
          }}>
            <Eyebrow color={C.yellowDark} style={{ marginBottom: 6 }}>Structure non publiée</Eyebrow>
            L&apos;agence doit publier la stratégie de marque avant que l&apos;export ne soit disponible.
          </div>
        )}

        {/* Meta strip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, padding: '14px 18px', background: C.panel, border: `1px solid ${C.line}`, marginBottom: 20 }}>
          {[
            { k: 'Tokens estimés', v: `≈ ${tokenEstimate.toLocaleString('fr-CA')}` },
            { k: 'Généré le',      v: generatedAt },
          ].map(m => (
            <div key={m.k}>
              <Eyebrow color={C.muted} style={{ fontSize: 10, marginBottom: 4 }}>{m.k}</Eyebrow>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.bone }}>{m.v}</div>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="sm" onDark onClick={copyAll} disabled={!hasStructure}>
              {copied ? 'Copié !' : 'Copier tout'}
            </Btn>
          </div>
        </div>

        {/* Prompt body */}
        <div style={{
          background: C.ink, border: `1px solid ${C.line}`,
          padding: '28px 32px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12.5, lineHeight: 1.75, color: C.boneDim,
          maxHeight: 460, overflowY: 'auto',
          whiteSpace: 'pre-wrap',
        }}>
          <div style={{ color: C.red, fontWeight: 700, marginBottom: 14 }}># SYSTEM PROMPT · {brand.toUpperCase()}</div>
          {promptPreview || <span style={{ color: C.muted, fontStyle: 'italic' }}>Aucun contenu — la structure n&apos;est pas publiée.</span>}
        </div>
      </div>

      {/* RIGHT — export targets */}
      <div className="panel-right-fixed" style={{ width: 460, padding: 'clamp(20px, 3vw, 40px)', overflowY: 'auto', background: C.ink }}>
        <Eyebrow color={C.fg3} style={{ marginBottom: 12 }}>Destinations · 04</Eyebrow>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 28 }}>
          Où l&apos;installer ?
        </div>

        {error && (
          <div role="alert" style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(240,45,20,0.12)', border: `1px solid ${C.red}`, color: C.red, fontSize: 13 }}>
            {error}
          </div>
        )}

        {EXPORT_TARGETS.map(e => (
          <div key={e.format} style={{ background: C.panel, border: `1px solid ${C.line}`, padding: '20px 22px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40,
                background: C.ink, border: `1.5px solid ${e.color}`, color: e.color,
                display: 'grid', placeItems: 'center',
                fontSize: 12, fontWeight: 900, letterSpacing: '0.08em',
              }}>{e.mark}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.bone }}>{e.tag}</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted, marginTop: 2 }}>
                  Format {e.ext}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleExport(e.format)}
                disabled={downloading === e.format || !hasStructure}
                style={{
                  padding: '8px 14px',
                  background: e.format === 'chatgpt_custom_gpt' && hasStructure ? C.red : 'transparent',
                  color: e.format === 'chatgpt_custom_gpt' && hasStructure ? '#fff' : C.bone,
                  border: e.format === 'chatgpt_custom_gpt' && hasStructure ? 'none' : `1.5px solid ${C.lineStrong}`,
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                  cursor: hasStructure ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                  opacity: (downloading === e.format || !hasStructure) ? 0.5 : 1,
                }}
              >
                {downloading === e.format ? '…' : 'Télécharger'}
              </button>
            </div>

            {/* Instructions accordion */}
            <div>
              <button
                type="button"
                onClick={() => setExpanded(expanded === e.format ? null : e.format)}
                aria-expanded={expanded === e.format}
                style={{
                  background: 'none', border: 'none', color: C.fg3, cursor: 'pointer',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {expanded === e.format ? '▲' : '▼'} Instructions d&apos;installation
              </button>
              {expanded === e.format && (
                <div style={{ marginTop: 10, padding: '12px 14px', background: C.ink, fontSize: 12, color: C.boneDim, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {e.instructions}
                </div>
              )}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 10, padding: '16px 18px', background: 'transparent', border: `1px dashed ${C.line2}`, fontSize: 12, color: C.fg3, lineHeight: 1.55 }}>
          <Eyebrow color={C.red} style={{ fontSize: 10, marginBottom: 8 }}>Conseil d&apos;agence</Eyebrow>
          Recompilez le prompt après chaque publication majeure. Les modèles gardent en mémoire la dernière version collée — pas celle du portail.
        </div>
      </div>
    </div>
  );
}
