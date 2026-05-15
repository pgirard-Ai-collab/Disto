'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { C } from '@/lib/disto';
import Btn from '@/components/ui/Btn';
import { createClientRecord, checkSlugAvailable, type ClientEmailInvite } from '@/app/actions/clients';
import { slugify } from '@/lib/slugify';

type EmailRow = { email: string; role: 'admin' | 'reader' };

export default function NewClientModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [fields, setFields] = useState({ org_name: '', brand_name: '', slug: '' });
  const [emails, setEmails] = useState<EmailRow[]>([{ email: '', role: 'admin' }]);

  function handleBrandChange(val: string) {
    setFields(f => ({
      ...f,
      brand_name: val,
      slug: slugEdited ? f.slug : slugify(val),
    }));
    setSlugError(null);
  }

  async function handleSlugBlur() {
    const s = fields.slug;
    if (!s) return;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) {
      setSlugError('Lettres minuscules, chiffres et tirets seulement.');
      return;
    }
    const available = await checkSlugAvailable(s);
    if (!available) setSlugError('Ce slug est déjà utilisé.');
    else setSlugError(null);
  }

  function handleLogoChange(file: File | null) {
    setLogoError(null);
    if (!file) { setLogoFile(null); return; }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Le logo dépasse 2 MB.');
      return;
    }
    if (!['image/png', 'image/svg+xml'].includes(file.type)) {
      setLogoError('PNG ou SVG uniquement.');
      return;
    }
    setLogoFile(file);
  }

  function addEmail() { setEmails(e => [...e, { email: '', role: 'reader' }]); }
  function removeEmail(i: number) { setEmails(e => e.filter((_, idx) => idx !== i)); }
  function updateEmail(i: number, patch: Partial<EmailRow>) {
    setEmails(prev => prev.map((row, idx) => idx === i ? { ...row, ...patch } : row));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (slugError) return;

    const validEmails = emails.filter(r => r.email.trim());
    if (validEmails.length === 0) {
      setServerError('Au moins un email admin client est requis.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const r of validEmails) {
      if (!emailRegex.test(r.email)) {
        setServerError(`Email invalide : ${r.email}`);
        return;
      }
    }

    setServerError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.append('org_name', fields.org_name);
      fd.append('brand_name', fields.brand_name);
      fd.append('slug', fields.slug);
      if (logoFile) fd.append('logo', logoFile);

      const invites: ClientEmailInvite[] = validEmails;
      fd.append('invites', JSON.stringify(invites));

      const result = await createClientRecord(fd);
      if (!result.success) { setServerError(result.error); return; }
      onClose();
      router.push(`/clients/${result.clientId}/import`);
    });
  }

  const inputStyle = {
    width: '100%', border: `1px solid ${C.border2}`, background: C.white,
    padding: '10px 14px', fontSize: 14, outline: 'none', color: C.black,
    boxSizing: 'border-box' as const,
  };
  const labelStyle = {
    display: 'block', fontSize: 10, fontWeight: 700 as const,
    letterSpacing: '0.16em', textTransform: 'uppercase' as const,
    color: C.muted, marginBottom: 6,
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, overflowY: 'auto',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.bone, width: '100%', maxWidth: 560, padding: '36px 40px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.015em' }}>Nouveau client</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.muted }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label htmlFor="org_name" style={labelStyle}>Nom de l&apos;organisation *</label>
            <input
              id="org_name" name="org_name" required
              value={fields.org_name}
              onChange={e => setFields(f => ({ ...f, org_name: e.target.value }))}
              placeholder="Ex. : Sartiga Inc."
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="brand_name" style={labelStyle}>Nom de la marque *</label>
            <input
              id="brand_name" name="brand_name" required
              value={fields.brand_name}
              onChange={e => handleBrandChange(e.target.value)}
              placeholder="Ex. : SARTIGA"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="slug" style={labelStyle}>Slug URL *</label>
            <input
              id="slug" name="slug" required
              value={fields.slug}
              onChange={e => { setSlugEdited(true); setFields(f => ({ ...f, slug: e.target.value })); setSlugError(null); }}
              onBlur={handleSlugBlur}
              placeholder="ex. sartiga"
              style={{ ...inputStyle, borderColor: slugError ? C.red : C.border2 }}
            />
            {slugError
              ? <div style={{ marginTop: 4, fontSize: 11, color: C.red }}>{slugError}</div>
              : <div style={{ marginTop: 4, fontSize: 11, color: C.muted }}>Utilisé dans l&apos;URL du portail client.</div>
            }
          </div>

          <div>
            <label style={labelStyle}>Logo (optionnel)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                ref={logoInputRef} type="file" accept="image/png,image/svg+xml"
                style={{ display: 'none' }}
                onChange={e => handleLogoChange(e.target.files?.[0] ?? null)}
              />
              <button type="button" onClick={() => logoInputRef.current?.click()}
                style={{ ...inputStyle, width: 'auto', padding: '10px 18px', cursor: 'pointer', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {logoFile ? 'Changer' : 'Choisir'}
              </button>
              <span style={{ fontSize: 12, color: C.muted }}>
                {logoFile ? `${logoFile.name} · ${(logoFile.size / 1024).toFixed(0)} Ko` : 'PNG ou SVG · max 2 MB'}
              </span>
            </div>
            {logoError && <div style={{ marginTop: 4, fontSize: 11, color: C.red }}>{logoError}</div>}
          </div>

          <div>
            <label style={labelStyle}>Email(s) admin client *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {emails.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="email"
                    value={row.email}
                    onChange={e => updateEmail(i, { email: e.target.value })}
                    placeholder="prenom.nom@marque.co"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <select
                    value={row.role}
                    onChange={e => updateEmail(i, { role: e.target.value as 'admin' | 'reader' })}
                    style={{ ...inputStyle, width: 130 }}
                  >
                    <option value="admin">Admin</option>
                    <option value="reader">Lecteur</option>
                  </select>
                  {emails.length > 1 && (
                    <button type="button" onClick={() => removeEmail(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 18, padding: '0 8px' }}>×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addEmail}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'left', padding: 0, alignSelf: 'flex-start' }}>
                + Ajouter un email
              </button>
            </div>
          </div>

          {serverError && (
            <div style={{ padding: '10px 14px', background: 'rgba(240,45,20,0.08)', color: C.red, fontSize: 13 }}>
              {serverError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Btn variant="ghost" size="sm" onClick={onClose}>Annuler</Btn>
            <Btn variant="primary" size="sm" disabled={isPending || !!slugError}>
              {isPending ? 'Création…' : 'Créer le client'}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
