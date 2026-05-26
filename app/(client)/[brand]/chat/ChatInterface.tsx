'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { C } from '@/lib/disto';
import Btn from '@/components/ui/Btn';
import Eyebrow from '@/components/ui/Eyebrow';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  copied?: boolean;
};

let msgCounter = 0;
function makeId(): string {
  msgCounter += 1;
  return `m_${Date.now().toString(36)}_${msgCounter}`;
}

type Props = { brand: string; brandSlug: string };

export default function ChatInterface({ brand, brandSlug }: Props) {
  const t = useTranslations('client.chat');
  const SUGGESTIONS = [
    t('suggestions.tone'),
    t('suggestions.bio'),
    t('suggestions.values'),
    t('suggestions.differentiate'),
  ];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  async function send(text?: string) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const userMsg: Message = { id: makeId(), role: 'user', content: question };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brandSlug,
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json() as { text: string; sources: string[] };
        const aiMsg: Message = {
          id: makeId(),
          role: 'assistant',
          content: data.text ?? '',
          sources: data.sources ?? [],
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const data = await res.json().catch(() => ({ error: t('unknownError') }));
        setMessages(prev => [...prev, {
          id: makeId(),
          role: 'assistant',
          content: data.error ?? t('genericError'),
          sources: [],
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: makeId(),
        role: 'assistant',
        content: t('networkError'),
        sources: [],
      }]);
    } finally {
      setLoading(false);
    }
  }

  function copyReply(id: string, content: string) {
    navigator.clipboard.writeText(content).catch(() => undefined);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, copied: true } : m));
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, copied: false } : m));
    }, 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function newThread() {
    if (loading) return;
    if (messages.length > 0) {
      const ok = window.confirm(t('newThreadConfirm'));
      if (!ok) return;
    }
    setMessages([]);
    setInput('');
  }

  const brandInitials = brand.slice(0, 2).toUpperCase();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.black, overflow: 'hidden' }}>
      <div style={{ padding: '12px 56px', borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'flex-end' }}>
        <Btn variant="ghost" size="sm" onDark onClick={newThread} disabled={messages.length === 0 && !loading}>
          {t('newThread')}
        </Btn>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '36px 56px 20px' }}>
        {messages.length === 0 && !loading && (
          <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', paddingTop: 48 }}>
            <div style={{ width: 48, height: 48, background: C.red, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 900, margin: '0 auto 24px' }}>
              {brandInitials}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.015em', marginBottom: 12, color: C.bone }}>
              {t('askBrand', { brand })}
            </div>
            <div style={{ fontSize: 14, color: C.fg3, lineHeight: 1.65 }}>
              {t('askIntro')}
            </div>
          </div>
        )}

        {messages.map(m => {
          if (m.role === 'user') {
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
                <div style={{
                  maxWidth: 540, padding: '16px 20px', background: C.panel,
                  border: `1px solid ${C.line}`, fontSize: 15, lineHeight: 1.55, color: C.bone,
                }}>
                  {m.content}
                </div>
              </div>
            );
          }

          return (
            <div key={m.id} style={{ marginBottom: 28, maxWidth: 720 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, background: C.red, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900 }}>
                  {brandInitials}
                </div>
                <Eyebrow color={C.fg3}>{t('brandAi', { brand })}</Eyebrow>
              </div>
              <div style={{ background: C.panel, border: `1px solid ${C.line}`, padding: '22px 26px' }}>
                <div style={{ fontSize: 15.5, lineHeight: 1.7, color: C.bone, marginBottom: 18, whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </div>
                <div style={{ paddingTop: 16, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  {m.sources && m.sources.length > 0 && (
                    <>
                      <Eyebrow color={C.muted} style={{ fontSize: 10 }}>{t('basedOn')}</Eyebrow>
                      {m.sources.map((s, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', border: `1px solid ${C.line2}`, color: C.bone, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>
                          {s}
                        </span>
                      ))}
                    </>
                  )}
                  <div style={{ marginLeft: 'auto' }}>
                    <Btn variant="ghost" size="sm" onDark onClick={() => copyReply(m.id, m.content)}>
                      {m.copied ? t('copied') : t('copy')}
                    </Btn>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ marginBottom: 28, maxWidth: 720 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, background: C.red, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900 }}>
                {brandInitials}
              </div>
              <Eyebrow color={C.fg3}>{t('brandAi', { brand })}</Eyebrow>
              <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.red }}>{t('typing')}</span>
            </div>
            <div style={{ background: C.panel, border: `1px solid ${C.line}`, padding: '22px 26px' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 8, height: 8, background: C.fg3, borderRadius: '50%',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 56px 28px', borderTop: `1px solid ${C.line}`, background: C.black }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <Eyebrow color={C.muted} style={{ fontSize: 10, display: 'flex', alignItems: 'center' }}>{t('suggestionsLabel')}</Eyebrow>
            {SUGGESTIONS.map(q => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                style={{
                  padding: '7px 12px', border: `1px solid ${C.line2}`,
                  fontSize: 12, fontWeight: 500, color: C.boneDim,
                  cursor: 'pointer', background: 'transparent', fontFamily: 'inherit',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div style={{ border: `1.5px solid ${C.lineStrong}`, padding: '12px 18px', display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('inputPlaceholder')}
            rows={1}
            aria-label={t('inputAria')}
            maxLength={4000}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: C.bone, fontSize: 15, fontFamily: 'inherit', resize: 'none',
              lineHeight: 1.5, maxHeight: 140, overflowY: 'auto',
            }}
          />
          <Btn variant="primary" size="sm" onClick={() => send()} disabled={!input.trim() || loading}>
            {t('send')}
          </Btn>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
