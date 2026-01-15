import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface BookingReminderProps {
  clientName: string
  businessName: string
  businessLogo?: string | null
  serviceName: string
  date: string
  time: string
  duration: number
  primaryColor?: string
}

export function BookingReminderEmail({
  clientName,
  businessName,
  businessLogo,
  serviceName,
  date,
  time,
  duration,
  primaryColor = '#2563eb',
}: BookingReminderProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`
  }

  return (
    <Html>
      <Head />
      <Preview>Rappel : Votre rendez-vous demain chez {businessName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {businessLogo && (
            <Img
              src={businessLogo}
              width="60"
              height="60"
              alt={businessName}
              style={logo}
            />
          )}

          <Section style={reminderBadge}>
            <Text style={reminderText}>RAPPEL</Text>
          </Section>

          <Heading style={{ ...heading, color: primaryColor }}>
            Votre rendez-vous approche
          </Heading>

          <Text style={text}>
            Bonjour {clientName},
          </Text>

          <Text style={text}>
            Nous vous rappelons votre rendez-vous demain chez <strong>{businessName}</strong>.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailsRow}>
              <strong>Service :</strong> {serviceName}
            </Text>
            <Text style={detailsRow}>
              <strong>Date :</strong> {date}
            </Text>
            <Text style={detailsRow}>
              <strong>Heure :</strong> {time}
            </Text>
            <Text style={detailsRow}>
              <strong>Duree :</strong> {formatDuration(duration)}
            </Text>
          </Section>

          <Text style={text}>
            En cas d&apos;imprevu, merci de contacter {businessName} le plus rapidement possible.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Cet email a ete envoye automatiquement par Plannero.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default BookingReminderEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '8px',
}

const logo = {
  margin: '0 auto 20px',
  borderRadius: '8px',
}

const reminderBadge = {
  textAlign: 'center' as const,
  marginBottom: '16px',
}

const reminderText = {
  backgroundColor: '#fef3c7',
  color: '#92400e',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1px',
  padding: '6px 12px',
  borderRadius: '4px',
  display: 'inline-block',
  margin: '0',
}

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 0 20px',
}

const text = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#333',
  margin: '0 0 16px',
}

const detailsBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const detailsRow = {
  fontSize: '14px',
  color: '#333',
  margin: '0 0 8px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '16px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '0',
  textAlign: 'center' as const,
}
