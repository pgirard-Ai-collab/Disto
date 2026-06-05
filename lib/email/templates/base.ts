const black   = '#000000';
const panel   = '#141414';
const bone    = '#EBE8E6';
const fg3     = '#9A958C';
const red     = '#F02D14';

export function baseEmailHtml(params: {
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  actionLink: string;
  footnote?: string;
}): string {
  const { eyebrow, heading, body, ctaLabel, actionLink, footnote } = params;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:${black};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${black};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:${panel};max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:40px 48px 32px;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${fg3};margin-bottom:20px;">${eyebrow}</div>
              <div style="font-size:28px;font-weight:700;letter-spacing:-0.02em;color:${red};line-height:1;">DISTO.</div>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;"><div style="height:1px;background:rgba(235,232,230,0.12);"></div></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 48px 32px;">
              <div style="font-size:22px;font-weight:700;letter-spacing:-0.02em;color:${bone};margin-bottom:14px;">${heading}</div>
              <div style="font-size:14px;color:${fg3};line-height:1.65;margin-bottom:36px;">${body}</div>
              <a href="${actionLink}" style="display:inline-block;background:${red};color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:14px 28px;">${ctaLabel}</a>
            </td>
          </tr>

          ${footnote ? `
          <!-- Footnote -->
          <tr>
            <td style="padding:0 48px 28px;">
              <div style="font-size:11px;color:${fg3};line-height:1.55;">${footnote}</div>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px 40px;border-top:1px solid rgba(235,232,230,0.12);">
              <div style="font-size:11px;color:${fg3};">© betula / Disto — <a href="https://disto.app" style="color:${fg3};text-decoration:none;">disto.app</a></div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
