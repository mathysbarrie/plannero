// Plain HTML email templates (no React to avoid Next.js App Router issues)

interface BookingConfirmationData {
  clientName: string
  businessName: string
  businessLogo?: string | null
  serviceName: string
  date: string
  time: string
  duration: number
  totalPrice: number
  primaryColor?: string
}

interface BookingNotificationData {
  businessName: string
  clientName: string
  clientEmail: string
  clientPhone?: string | null
  serviceName: string
  date: string
  time: string
  duration: number
  totalPrice: number
  dashboardUrl: string
}

interface BookingReminderData {
  clientName: string
  businessName: string
  businessLogo?: string | null
  serviceName: string
  date: string
  time: string
  duration: number
  primaryColor?: string
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h${mins}` : `${hours}h`
}

const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f6f9fc; margin: 0; padding: 20px; }
  .container { background: #fff; max-width: 560px; margin: 0 auto; border-radius: 8px; padding: 40px 20px; }
  .logo { display: block; width: 60px; height: 60px; margin: 0 auto 20px; border-radius: 8px; }
  .heading { font-size: 24px; font-weight: 700; text-align: center; margin: 0 0 20px; }
  .text { font-size: 14px; line-height: 24px; color: #333; margin: 0 0 16px; }
  .details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 24px 0; }
  .details-title { font-size: 16px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px; }
  .details-row { font-size: 14px; color: #333; margin: 0 0 8px; }
  .total { font-size: 16px; color: #1a1a1a; text-align: right; margin-top: 16px; border-top: 1px solid #e6ebf1; padding-top: 16px; }
  .footer { color: #8898aa; font-size: 12px; text-align: center; margin-top: 24px; }
  .alert { background: #22c55e; color: #fff; text-align: center; padding: 12px; font-size: 12px; font-weight: 700; letter-spacing: 1px; }
  .reminder { background: #fef3c7; color: #92400e; display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; }
  .btn { display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; }
  a { color: #2563eb; }
`

export function bookingConfirmationHtml(data: BookingConfirmationData): string {
  const color = data.primaryColor || '#2563eb'
  return `<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
<div class="container">
  ${data.businessLogo ? `<img src="${data.businessLogo}" alt="${data.businessName}" class="logo">` : ''}
  <h1 class="heading" style="color: ${color}">Reservation confirmee</h1>
  <p class="text">Bonjour ${data.clientName},</p>
  <p class="text">Votre reservation chez <strong>${data.businessName}</strong> a bien ete enregistree.</p>
  <div class="details">
    <p class="details-title">Details de votre rendez-vous</p>
    <p class="details-row"><strong>Service :</strong> ${data.serviceName}</p>
    <p class="details-row"><strong>Date :</strong> ${data.date}</p>
    <p class="details-row"><strong>Heure :</strong> ${data.time}</p>
    <p class="details-row"><strong>Duree :</strong> ${formatDuration(data.duration)}</p>
    <p class="total"><strong>Total : ${data.totalPrice.toFixed(2)} EUR</strong></p>
  </div>
  <p class="text">Si vous avez des questions ou souhaitez modifier votre reservation, contactez directement ${data.businessName}.</p>
  <p class="footer">Cet email a ete envoye automatiquement par Plannero.</p>
</div>
</body>
</html>`
}

export function bookingNotificationHtml(data: BookingNotificationData): string {
  return `<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
<div class="container" style="padding: 0 0 40px;">
  <div class="alert">NOUVELLE RESERVATION</div>
  <div style="padding: 0 20px;">
    <h1 class="heading" style="margin-top: 24px;">${data.businessName}</h1>
    <p class="text">Vous avez recu une nouvelle reservation !</p>
    <div class="details">
      <p style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin: 0 0 12px;">Client</p>
      <p class="details-row"><strong>Nom :</strong> ${data.clientName}</p>
      <p class="details-row"><strong>Email :</strong> <a href="mailto:${data.clientEmail}">${data.clientEmail}</a></p>
      ${data.clientPhone ? `<p class="details-row"><strong>Telephone :</strong> <a href="tel:${data.clientPhone}">${data.clientPhone}</a></p>` : ''}
    </div>
    <div class="details">
      <p style="font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; margin: 0 0 12px;">Reservation</p>
      <p class="details-row"><strong>Service :</strong> ${data.serviceName}</p>
      <p class="details-row"><strong>Date :</strong> ${data.date}</p>
      <p class="details-row"><strong>Heure :</strong> ${data.time}</p>
      <p class="details-row"><strong>Duree :</strong> ${formatDuration(data.duration)}</p>
      <p class="total"><strong>Total : ${data.totalPrice.toFixed(2)} EUR</strong></p>
    </div>
    <p style="text-align: center; margin: 24px 0;"><a href="${data.dashboardUrl}" class="btn">Voir dans le dashboard</a></p>
    <p class="footer">Cet email a ete envoye automatiquement par Plannero.</p>
  </div>
</div>
</body>
</html>`
}

export function bookingReminderHtml(data: BookingReminderData): string {
  const color = data.primaryColor || '#2563eb'
  return `<!DOCTYPE html>
<html>
<head><style>${baseStyles}</style></head>
<body>
<div class="container">
  ${data.businessLogo ? `<img src="${data.businessLogo}" alt="${data.businessName}" class="logo">` : ''}
  <p style="text-align: center;"><span class="reminder">RAPPEL</span></p>
  <h1 class="heading" style="color: ${color}">Votre rendez-vous approche</h1>
  <p class="text">Bonjour ${data.clientName},</p>
  <p class="text">Nous vous rappelons votre rendez-vous demain chez <strong>${data.businessName}</strong>.</p>
  <div class="details">
    <p class="details-row"><strong>Service :</strong> ${data.serviceName}</p>
    <p class="details-row"><strong>Date :</strong> ${data.date}</p>
    <p class="details-row"><strong>Heure :</strong> ${data.time}</p>
    <p class="details-row"><strong>Duree :</strong> ${formatDuration(data.duration)}</p>
  </div>
  <p class="text">En cas d'imprevu, merci de contacter ${data.businessName} le plus rapidement possible.</p>
  <p class="footer">Cet email a ete envoye automatiquement par Plannero.</p>
</div>
</body>
</html>`
}
