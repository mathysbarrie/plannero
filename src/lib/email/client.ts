import { Resend } from 'resend'

// Use a placeholder key during build if not set (emails won't actually send)
const apiKey = process.env.RESEND_API_KEY || 're_placeholder_key'

export const resend = new Resend(apiKey)

// Use test email for development, real domain in production
export const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'

// Helper to check if emails are configured
export const isEmailConfigured = () => !!process.env.RESEND_API_KEY
