import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface BookingNotificationProps {
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

export function BookingNotificationEmail({
  businessName,
  clientName,
  clientEmail,
  clientPhone,
  serviceName,
  date,
  time,
  duration,
  totalPrice,
  dashboardUrl,
}: BookingNotificationProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`
  }

  return (
    <Html>
      <Head />
      <Preview>Nouvelle reservation - {clientName} pour {serviceName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={alertBanner}>
            <Text style={alertText}>NOUVELLE RESERVATION</Text>
          </Section>

          <Heading style={heading}>
            {businessName}
          </Heading>

          <Text style={text}>
            Vous avez recu une nouvelle reservation !
          </Text>

          <Section style={detailsBox}>
            <Text style={sectionTitle}>Client</Text>
            <Text style={detailsRow}>
              <strong>Nom :</strong> {clientName}
            </Text>
            <Text style={detailsRow}>
              <strong>Email :</strong>{' '}
              <Link href={`mailto:${clientEmail}`} style={link}>
                {clientEmail}
              </Link>
            </Text>
            {clientPhone && (
              <Text style={detailsRow}>
                <strong>Telephone :</strong>{' '}
                <Link href={`tel:${clientPhone}`} style={link}>
                  {clientPhone}
                </Link>
              </Text>
            )}
          </Section>

          <Section style={detailsBox}>
            <Text style={sectionTitle}>Reservation</Text>
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
            <Hr style={hr} />
            <Text style={totalRow}>
              <strong>Total : {totalPrice.toFixed(2)} EUR</strong>
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Link href={dashboardUrl} style={button}>
              Voir dans le dashboard
            </Link>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Cet email a ete envoye automatiquement par Plannero.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default BookingNotificationEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0 0 40px',
  maxWidth: '560px',
  borderRadius: '8px',
  overflow: 'hidden' as const,
}

const alertBanner = {
  backgroundColor: '#22c55e',
  padding: '12px 20px',
}

const alertText = {
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '1px',
  margin: '0',
  textAlign: 'center' as const,
}

const heading = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#1a1a1a',
  textAlign: 'center' as const,
  margin: '24px 0 16px',
  padding: '0 20px',
}

const text = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#333',
  margin: '0 0 16px',
  padding: '0 20px',
}

const detailsBox = {
  backgroundColor: '#f8fafc',
  padding: '16px 20px',
  margin: '16px 20px',
  borderRadius: '8px',
}

const sectionTitle = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 12px',
}

const detailsRow = {
  fontSize: '14px',
  color: '#333',
  margin: '0 0 8px',
}

const link = {
  color: '#2563eb',
  textDecoration: 'none',
}

const totalRow = {
  fontSize: '16px',
  color: '#1a1a1a',
  margin: '0',
  textAlign: 'right' as const,
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '16px 20px',
}

const ctaSection = {
  textAlign: 'center' as const,
  padding: '8px 20px',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '0',
  textAlign: 'center' as const,
  padding: '0 20px',
}
