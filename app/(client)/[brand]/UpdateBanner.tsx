'use client';

import { useEffect, useState } from 'react';
import { C } from '@/lib/disto';

type Props = {
  brandSlug: string;
  publishedAt: string | null;
};

const AUTO_DISMISS_MS = 10_000;

function storageKey(brandSlug: string) {
  return `disto:last_seen_published_at:${brandSlug}`;
}

export default function UpdateBanner({ brandSlug, publishedAt }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!publishedAt) return;

    const key = storageKey(brandSlug);
    let lastSeen: string | null = null;
    try {
      lastSeen = window.localStorage.getItem(key);
    } catch {
      // localStorage unavailable (private mode, etc.) — give up silently
      return;
    }

    // First visit: initialise without showing
    if (!lastSeen) {
      try { window.localStorage.setItem(key, publishedAt); } catch { /* ignore */ }
      return;
    }

    if (new Date(publishedAt).getTime() > new Date(lastSeen).getTime()) {
      setVisible(true);
      // Persist immediately so the banner won't reappear on the next navigation
      try { window.localStorage.setItem(key, publishedAt); } catch { /* ignore */ }
      const t = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
      return () => clearTimeout(t);
    }
  }, [brandSlug, publishedAt]);

  if (!visible) return null;

  return (
    <div
      role="status"
      style={{
        background: C.panel,
        color: C.bone,
        borderBottom: `1px solid ${C.line2}`,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 13,
      }}
    >
      <span aria-hidden style={{ color: C.cyan, fontWeight: 700 }}>ⓘ</span>
      <span style={{ flex: 1 }}>
        Votre stratégie a été mise à jour.
      </span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Fermer"
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: C.boneDim, fontSize: 18, lineHeight: 1, padding: 4,
        }}
      >
        ×
      </button>
    </div>
  );
}
