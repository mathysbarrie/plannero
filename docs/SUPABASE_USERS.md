# Gestion des utilisateurs Supabase

## Creer un utilisateur manuellement

### Methode 1 : Dashboard Supabase (recommande)

1. Aller sur https://supabase.com/dashboard
2. Selectionner le projet Plannero
3. Aller dans **Authentication** > **Users**
4. Cliquer sur **Add user** > **Create new user**
5. Entrer email + mot de passe
6. Cocher "Auto Confirm User" si besoin

### Methode 2 : SQL Editor

```sql
-- Activer pgcrypto (une seule fois)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Creer un utilisateur
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'email@example.com',  -- Changer
  crypt('motdepasse123', gen_salt('bf')),  -- Changer
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  'authenticated',
  'authenticated'
);
```

---

## Comptes de test

| Email            | Mot de passe | Role | Notes       |
|------------------|--------------|------|-------------|
| test@example.com | password123  | test | Compte test |

---

## Notes

- Les utilisateurs crees doivent ensuite creer un "business" dans l'app pour acceder au dashboard
- L'onboarding se fait automatiquement a la premiere connexion
