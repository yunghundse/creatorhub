// Email trigger configurations
export const EMAIL_TRIGGERS = {
  TEAM_INVITE: 'team_invite',
  CONTENT_APPROVAL: 'content_approval',
  PASSWORD_CHANGED: 'password_changed',
  NEW_LOGIN: 'new_login',
  PAYMENT_SUCCESS: 'payment_success',
  CONTENT_COMMENT: 'content_comment',
}

// Queue an email notification (stores in Firestore for backend processing)
// In production, a Cloud Function would process these
export const queueEmailNotification = async (db, { trigger, recipientEmail, recipientName, data }) => {
  // Import dynamically to avoid circular deps
  const { collection, addDoc, serverTimestamp } = await import('firebase/firestore')

  try {
    await addDoc(collection(db, 'emailQueue'), {
      trigger,
      to: recipientEmail,
      recipientName,
      data,
      status: 'pending',
      createdAt: serverTimestamp(),
    })
    return true
  } catch (err) {
    console.error('Email queue error:', err)
    return false
  }
}

// HTML email template generator
export const generateEmailHTML = (trigger, data) => {
  const templates = {
    [EMAIL_TRIGGERS.TEAM_INVITE]: {
      subject: `Einladung zu ${data?.companyName || 'einem Team'} auf CreatorHub`,
      html: `
        <h2 style="font-size:20px;color:#2A2420;margin:0 0 16px;">Du wurdest eingeladen!</h2>
        <p style="font-size:15px;color:#5C5349;line-height:1.6;margin:0 0 12px;">
          Hallo <strong>${data?.recipientName || 'Creator'}</strong>,
        </p>
        <p style="font-size:15px;color:#5C5349;line-height:1.6;margin:0 0 20px;">
          <strong>${data?.inviterName || 'Ein Manager'}</strong> hat dich eingeladen, dem Team
          <strong>${data?.companyName || 'einem Unternehmen'}</strong> auf CreatorHub beizutreten.
          Als Teammitglied hast du Zugriff auf den gemeinsamen Kalender, Assets, Content-Freigaben und vieles mehr.
        </p>
        <div style="background:#FFFDF7;border:1px solid #E8DFD3;border-radius:12px;padding:20px;margin:0 0 24px;">
          <p style="font-size:13px;color:#A89B8C;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">
            Dein Einladungscode
          </p>
          <p style="font-size:28px;font-weight:800;color:#2A2420;letter-spacing:4px;margin:0;font-family:monospace;">
            ${data?.inviteCode || 'XXXXXX'}
          </p>
        </div>
        <p style="font-size:14px;color:#5C5349;line-height:1.6;margin:0 0 24px;">
          Öffne CreatorHub, gehe zu <strong>Einstellungen → Team & Firma</strong> und gib den Code oben ein, um dem Team beizutreten.
        </p>
        <a href="${data?.appUrl || 'https://creatorhub.app'}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#FF8FAB,#FF6B9D);color:white;text-decoration:none;border-radius:14px;font-weight:700;font-size:15px;">
          CreatorHub öffnen
        </a>
        <p style="font-size:12px;color:#A89B8C;margin:24px 0 0;line-height:1.5;">
          Falls du diese Einladung nicht erwartet hast, kannst du diese E-Mail ignorieren.
          Der Einladungscode ist 7 Tage lang gültig.
        </p>
      `,
    },

    [EMAIL_TRIGGERS.CONTENT_APPROVAL]: {
      subject: `Content "${data?.contentTitle || ''}" wurde freigegeben`,
      html: `
        <h2 style="font-size:20px;color:#2A2420;margin:0 0 16px;">Content freigegeben</h2>
        <p style="font-size:15px;color:#5C5349;line-height:1.6;margin:0 0 12px;">
          Hallo <strong>${data?.recipientName || 'Creator'}</strong>,
        </p>
        <p style="font-size:15px;color:#5C5349;line-height:1.6;margin:0 0 20px;">
          Gute Neuigkeiten! Dein Content wurde erfolgreich geprüft und freigegeben.
        </p>
        <div style="background:#FFFDF7;border:1px solid #E8DFD3;border-radius:12px;padding:20px;margin:0 0 24px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <div style="width:40px;height:40px;border-radius:10px;background:rgba(107,201,160,0.12);display:flex;align-items:center;justify-content:center;">
              <span style="font-size:20px;">✓</span>
            </div>
            <div>
              <p style="font-size:15px;font-weight:700;color:#2A2420;margin:0;">
                ${data?.contentTitle || 'Unbenannter Content'}
              </p>
              <p style="font-size:12px;color:#6BC9A0;font-weight:600;margin:4px 0 0;">Freigegeben</p>
            </div>
          </div>
          ${data?.approverName ? `
          <p style="font-size:13px;color:#7A6F62;margin:0;">
            Freigegeben von: <strong>${data.approverName}</strong>
          </p>` : ''}
          ${data?.approvalNote ? `
          <div style="margin-top:12px;padding:12px;background:rgba(255,255,255,0.8);border-radius:8px;border:1px solid #E8DFD3;">
            <p style="font-size:12px;color:#A89B8C;margin:0 0 4px;font-weight:600;">Anmerkung:</p>
            <p style="font-size:13px;color:#5C5349;margin:0;line-height:1.5;">${data.approvalNote}</p>
          </div>` : ''}
        </div>
        <a href="${data?.appUrl || 'https://creatorhub.app'}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#FF8FAB,#FF6B9D);color:white;text-decoration:none;border-radius:14px;font-weight:700;font-size:15px;">
          Content ansehen
        </a>
      `,
    },

    [EMAIL_TRIGGERS.PASSWORD_CHANGED]: {
      subject: 'Dein Passwort wurde geändert — CreatorHub',
      html: `
        <h2 style="font-size:20px;color:#2A2420;margin:0 0 16px;">Passwort geändert</h2>
        <p style="font-size:15px;color:#5C5349;line-height:1.6;margin:0 0 12px;">
          Hallo <strong>${data?.recipientName || 'Creator'}</strong>,
        </p>
        <p style="font-size:15px;color:#5C5349;line-height:1.6;margin:0 0 20px;">
          Dein Passwort für CreatorHub wurde soeben erfolgreich geändert.
        </p>
        <div style="background:rgba(245,197,99,0.06);border:1px solid rgba(245,197,99,0.2);border-radius:12px;padding:16px 20px;margin:0 0 24px;">
          <p style="font-size:14px;color:#5C5349;line-height:1.6;margin:0;">
            <strong style="color:#E8A940;">Warst du das nicht?</strong><br/>
            Falls du dein Passwort nicht selbst geändert hast, kontaktiere uns sofort unter
            <a href="mailto:kontakt@creatorhub.app" style="color:#FF6B9D;text-decoration:none;font-weight:600;">kontakt@creatorhub.app</a>
            oder setze dein Passwort über die Login-Seite zurück.
          </p>
        </div>
        <p style="font-size:13px;color:#A89B8C;line-height:1.5;margin:0;">
          Zeitpunkt: ${data?.changedAt || new Date().toLocaleString('de-DE')}<br/>
          Gerät: ${data?.deviceInfo || 'Unbekannt'}
        </p>
      `,
    },

    [EMAIL_TRIGGERS.NEW_LOGIN]: {
      subject: 'Neuer Login erkannt — CreatorHub',
      html: `
        <h2 style="font-size:20px;color:#2A2420;margin:0 0 16px;">Neuer Login erkannt</h2>
        <p style="font-size:15px;color:#5C5349;line-height:1.6;margin:0 0 12px;">
          Hallo <strong>${data?.recipientName || 'Creator'}</strong>,
        </p>
        <p style="font-size:15px;color:#5C5349;line-height:1.6;margin:0 0 20px;">
          Wir haben einen neuen Login in deinem CreatorHub-Konto festgestellt.
        </p>
        <div style="background:#FFFDF7;border:1px solid #E8DFD3;border-radius:12px;padding:20px;margin:0 0 24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#A89B8C;width:100px;">Gerät</td>
              <td style="padding:6px 0;font-size:13px;color:#2A2420;font-weight:600;">${data?.deviceInfo || 'Unbekannt'}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#A89B8C;">Browser</td>
              <td style="padding:6px 0;font-size:13px;color:#2A2420;font-weight:600;">${data?.browser || 'Unbekannt'}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#A89B8C;">Standort</td>
              <td style="padding:6px 0;font-size:13px;color:#2A2420;font-weight:600;">${data?.location || 'Unbekannt'}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#A89B8C;">Zeitpunkt</td>
              <td style="padding:6px 0;font-size:13px;color:#2A2420;font-weight:600;">${data?.loginTime || new Date().toLocaleString('de-DE')}</td>
            </tr>
          </table>
        </div>
        <div style="background:rgba(245,197,99,0.06);border:1px solid rgba(245,197,99,0.2);border-radius:12px;padding:16px 20px;margin:0 0 24px;">
          <p style="font-size:14px;color:#5C5349;line-height:1.6;margin:0;">
            <strong style="color:#E8A940;">Warst du das nicht?</strong><br/>
            Ändere umgehend dein Passwort und überprüfe deine aktiven Sitzungen in den Einstellungen.
          </p>
        </div>
        <a href="${data?.appUrl || 'https://creatorhub.app'}/einstellungen" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#FF8FAB,#FF6B9D);color:white;text-decoration:none;border-radius:14px;font-weight:700;font-size:15px;">
          Sitzungen überprüfen
        </a>
      `,
    },

    [EMAIL_TRIGGERS.PAYMENT_SUCCESS]: {
      subject: `Zahlung über ${data?.amount || '0,00'} EUR erhalten — CreatorHub`,
      html: `
        <h2 style="font-size:20px;color:#2A2420;margin:0 0 16px;">Zahlung eingegangen</h2>
        <p style="font-size:15px;color:#5C5349;line-height:1.6;margin:0 0 12px;">
          Hallo <strong>${data?.recipientName || 'Creator'}</strong>,
        </p>
        <p style="font-size:15px;color:#5C5349;line-height:1.6;margin:0 0 20px;">
          Eine neue Zahlung wurde deinem Konto gutgeschrieben.
        </p>
        <div style="background:#FFFDF7;border:1px solid #E8DFD3;border-radius:12px;padding:24px;margin:0 0 24px;text-align:center;">
          <p style="font-size:13px;color:#A89B8C;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
            Betrag
          </p>
          <p style="font-size:32px;font-weight:800;color:#2A2420;margin:0;">
            ${data?.amount || '0,00'} EUR
          </p>
          ${data?.dealTitle ? `
          <p style="font-size:13px;color:#7A6F62;margin:12px 0 0;">
            Für: <strong>${data.dealTitle}</strong>
          </p>` : ''}
          ${data?.payerName ? `
          <p style="font-size:13px;color:#7A6F62;margin:4px 0 0;">
            Von: ${data.payerName}
          </p>` : ''}
        </div>
        <a href="${data?.appUrl || 'https://creatorhub.app'}/finanzen" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#FF8FAB,#FF6B9D);color:white;text-decoration:none;border-radius:14px;font-weight:700;font-size:15px;">
          Finanzen ansehen
        </a>
        <p style="font-size:12px;color:#A89B8C;margin:24px 0 0;line-height:1.5;">
          Die Auszahlung erfolgt gemäß deiner hinterlegten Zahlungseinstellungen.
          Bei Fragen wende dich an kontakt@creatorhub.app.
        </p>
      `,
    },

    [EMAIL_TRIGGERS.CONTENT_COMMENT]: {
      subject: `Neuer Kommentar zu "${data?.contentTitle || 'deinem Content'}" — CreatorHub`,
      html: `
        <h2 style="font-size:20px;color:#2A2420;margin:0 0 16px;">Neuer Kommentar</h2>
        <p style="font-size:15px;color:#5C5349;line-height:1.6;margin:0 0 12px;">
          Hallo <strong>${data?.recipientName || 'Creator'}</strong>,
        </p>
        <p style="font-size:15px;color:#5C5349;line-height:1.6;margin:0 0 20px;">
          <strong>${data?.commenterName || 'Jemand'}</strong> hat einen Kommentar zu deinem Content hinterlassen.
        </p>
        <div style="background:#FFFDF7;border:1px solid #E8DFD3;border-radius:12px;padding:20px;margin:0 0 24px;">
          <p style="font-size:14px;font-weight:600;color:#2A2420;margin:0 0 12px;">
            ${data?.contentTitle || 'Content'}
          </p>
          <div style="padding:14px;background:rgba(255,255,255,0.8);border-radius:10px;border-left:3px solid #FF6B9D;">
            <p style="font-size:13px;color:#5C5349;line-height:1.6;margin:0;font-style:italic;">
              "${data?.commentText || 'Kein Kommentartext verfügbar.'}"
            </p>
            <p style="font-size:12px;color:#A89B8C;margin:8px 0 0;">
              — ${data?.commenterName || 'Unbekannt'}, ${data?.commentTime || 'gerade eben'}
            </p>
          </div>
        </div>
        <a href="${data?.appUrl || 'https://creatorhub.app'}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#FF8FAB,#FF6B9D);color:white;text-decoration:none;border-radius:14px;font-weight:700;font-size:15px;">
          Kommentar ansehen
        </a>
      `,
    },
  }

  const template = templates[trigger]
  if (!template) return null

  // Wrap in corporate design
  return {
    subject: template.subject,
    html: wrapInTemplate(template.html, data),
  }
}

const wrapInTemplate = (content, data) => {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#FFFDF7;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#FF8FAB,#FF6B9D);border-radius:14px;line-height:48px;font-size:24px;color:white;">✦</div>
      <h1 style="font-size:22px;color:#2A2420;margin:12px 0 0;">CreatorHub</h1>
    </div>
    <div style="background:white;border-radius:16px;padding:32px;border:1px solid #E8DFD3;">
      ${content}
    </div>
    <div style="text-align:center;margin-top:32px;">
      <p style="color:#A89B8C;font-size:12px;margin:0 0 8px;">
        Du erhältst diese E-Mail, weil du ein CreatorHub-Konto hast.
      </p>
      <p style="color:#C9BFAF;font-size:11px;margin:0;">
        © 2026 CreatorHub — kontakt@creatorhub.app
      </p>
    </div>
  </div>
</body>
</html>`
}
