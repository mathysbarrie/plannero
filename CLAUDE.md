# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Plannero is a booking platform for cleaning businesses (French: "Plateforme de réservation pour les entreprises de nettoyage"). It allows businesses to manage services, receive bookings from clients, and track business metrics.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database/Auth**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Architecture

### Supabase Client Pattern

Two Supabase client factories exist in `src/lib/supabase/`:
- `client.ts` - Browser client using `createBrowserClient` for client components
- `server.ts` - Server client using `createServerClient` with cookie handling for server components/actions

Always use the appropriate client based on context. Import from `@/lib/supabase/client` or `@/lib/supabase/server`.

### Authentication Flow

- Middleware (`src/middleware.ts`) handles session refresh and route protection via `src/lib/supabase/middleware.ts`
- Auth pages (`/login`, `/signup`, `/reset-password`) redirect authenticated users to `/dashboard`
- Dashboard routes (`/dashboard/*`) redirect unauthenticated users to `/login`
- OAuth callback handled at `/auth/callback`

### Route Groups

The app uses Next.js route groups for organization:
- `(auth)/` - Authentication pages (login, signup, reset-password)
- `(dashboard)/` - Protected dashboard pages with shared layout and nav
- `(public)/` - Public booking pages (e.g., `/book/[slug]`)

### Database Schema

Core tables defined in `src/types/database.types.ts`:
- `businesses` - Business profiles with slug for public booking URLs, includes availability settings (timezone, buffer_minutes, min_notice_hours, slot_duration_minutes)
- `categories` - Service categories with display_order
- `category_questions` - Qualification questions per category (text, number, select types)
- `services` - Services offered by businesses (price, duration), linked to a category
- `options` - Add-on options/upsells for services
- `business_hours` - Weekly schedule per business (day_of_week, start_time, end_time, is_open)
- `bookings` - Client bookings with status tracking and end_time for overlap prevention
- `booking_options` - Junction table for booking add-ons
- `booking_answers` - Customer responses to category questions

Booking statuses: `pending`, `confirmed`, `completed`, `cancelled`, `no_show`

### Database Migrations

SQL migrations are in `supabase/migrations/`. Apply them via Supabase SQL Editor.

Key migrations:
- `20250114000001_initial.sql` - Core tables (businesses, services, options, bookings)
- `20250114000002_business_hours.sql` - Business hours table
- `20250114000003_categories.sql` - Categories table and service category_id FK
- `20250114000004_category_questions.sql` - Category questions and booking answers
- `20250115000001_booking_availability.sql` - Availability system with anti-overlap DB trigger

### Anti-Double-Booking System

The booking system uses a PostgreSQL trigger (`check_booking_overlap`) that:
1. Calculates `end_time` from `time + duration`
2. Checks for overlapping bookings before INSERT/UPDATE
3. Raises exception if overlap detected

This ensures no double bookings even with concurrent requests.

### API Routes

- `GET /api/availability` - Returns available time slots for a given business, date, and service duration. Considers:
  - Business hours (defaults to Mon-Fri 9h-18h if not configured)
  - Existing bookings (pending/confirmed)
  - Buffer time between appointments
  - Minimum notice hours

- `POST /api/email/send-confirmation` - Sends booking confirmation emails (client + business owner)
- `GET /api/cron/send-reminders` - Cron endpoint for 24h reminder emails (Vercel Cron)

### Email Notifications

Uses **Resend** with React Email templates in `src/lib/email/`:
- `client.ts` - Resend client initialization
- `templates/booking-confirmation.tsx` - Client confirmation email
- `templates/booking-notification.tsx` - Business owner notification
- `templates/booking-reminder.tsx` - 24h reminder email

Emails are sent fire-and-forget after booking creation. Cron runs daily at 8am (configurable in `vercel.json`).

### Public Booking Flow

The multi-step booking wizard at `/book/[slug]` follows this flow:
1. **Service Selection** - Choose a service from available categories
2. **Questions** - Answer category-specific qualification questions (skipped if none)
3. **DateTime** - Select date and available time slot
4. **Options** - Add optional upsells
5. **Contact** - Enter client details and confirm booking

State is managed via URL query params for shareable/bookmarkable progress.

### Dashboard Pages

- `/dashboard` - Overview with stats
- `/dashboard/categories` - Manage categories and qualification questions
- `/dashboard/services` - Manage services (requires category)
- `/dashboard/bookings` - View and manage bookings
- `/dashboard/booking-page` - Preview public booking page
- `/dashboard/settings` - Business profile, logo upload, availability settings

## Environment Variables

Required in `.env.local`:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # For admin operations (email sender)

# Email (Resend)
RESEND_API_KEY=re_xxx
EMAIL_FROM=onboarding@resend.dev  # Use your domain in production

# Cron
CRON_SECRET=xxx  # Random secret for cron endpoint auth

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For email links
```

## MCP Gemini Design

**Gemini is your frontend developer.** For all UI/design work, use this MCP. Tool descriptions contain all necessary instructions.

### Before writing any UI code, ask yourself:

- Is it a NEW visual component (popup, card, section, etc.)? → `snippet_frontend` or `create_frontend`
- Is it a REDESIGN of an existing element? → `modify_frontend`
- Is it just text/logic, or a trivial change? → Do it yourself

### Critical rules:

1. **If UI already exists and you need to redesign/restyle it** → use `modify_frontend`, NOT snippet_frontend.
2. **Tasks can be mixed** (logic + UI). Mentally separate them. Do the logic yourself, delegate the UI to Gemini.
