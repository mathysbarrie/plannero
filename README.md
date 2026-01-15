# Plannero

Plateforme de réservation pour les entreprises de nettoyage.

## Stack

- **Frontend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS

## Setup

### 1. Créer un projet Supabase

1. Va sur [supabase.com](https://supabase.com) et crée un nouveau projet
2. Copie l'URL et la clé anon depuis les paramètres du projet

### 2. Configuration locale

```bash
# Copier le fichier d'environnement
cp .env.local.example .env.local

# Editer .env.local avec tes credentials Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 3. Appliquer les migrations

Dans le dashboard Supabase, va dans **SQL Editor** et exécute le contenu de :
```
supabase/migrations/20250114000000_initial_schema.sql
```

### 4. Lancer le projet

```bash
npm install
npm run dev
```

Le projet tourne sur [http://localhost:3000](http://localhost:3000)

## Structure

```
src/
├── app/
│   ├── (auth)/          # Pages d'authentification
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (dashboard)/     # Dashboard protégé
│   │   └── dashboard/
│   ├── (public)/        # Pages publiques (booking)
│   │   └── book/[slug]/
│   └── auth/callback/   # Callback OAuth
├── components/
│   ├── ui/              # Composants UI réutilisables
│   ├── auth/            # Composants auth
│   └── dashboard/       # Composants dashboard
├── lib/
│   └── supabase/        # Config Supabase
└── types/               # Types TypeScript
```

## Features (MVP)

- [x] Authentification (email/password)
- [x] Dashboard avec stats business
- [ ] Gestion des prestations
- [ ] Page de réservation personnalisée
- [ ] Flux de réservation
- [ ] Upsells
- [ ] Intégration Google Calendar
