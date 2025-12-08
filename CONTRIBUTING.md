# Contributing to xBase

Thanks for helping improve the xBase public template. This repo is meant to be safe to fork, clone, and remix without leaking private infrastructure. Please keep secrets out of the codebase and use the patterns below.

## Local setup
- Prerequisites: Node 20+, pnpm 9+, Git. Optional: Supabase CLI (`npm i -g supabase`) and Docker (for local Supabase or container builds).
- Fork this repo, then clone your fork: `git clone https://github.com/<you>/xBase_v1_public.git && cd xBase_v1_public`.
- Install deps: `pnpm install`.
- Env files: copy `env.example` to `.env.local` and `env.deploy.example` to `.env.deploy` if you plan to build Docker images. Fill with your values; never commit real secrets.
- (Optional) Local Supabase: install the Supabase CLI and run `supabase start` in another terminal, or follow `supabase/README.md` and `scripts/setup-supabase.sh` to link and deploy Edge Functions.

## Running and testing
- Dev server: `pnpm dev` (defaults to `http://localhost:3000`).
- Lint: `pnpm lint`.
- Production build check: `pnpm build`.
- Docker (optional): `pnpm docker:build` then `pnpm docker:run --env-file .env.local`.

## Code style and expectations
- Use TypeScript and keep imports typed; prefer the existing utility functions in `lib/` and `components/ui/`.
- Tailwind CSS v4 is enabled; favor utility classes over bespoke CSS when possible.
- Keep secrets in Supabase Vault/Edge Function secrets—never in Git. Keep `.env*` files gitignored.
- Update docs when behavior changes (`README.md`, `GETTING_STARTED.md`, `DEPLOYMENT.md`).
- If you touch Supabase schemas or Edge Functions, include updated migration/function files under `supabase/`.

## Pull requests
- Create feature branches from `main`; keep commits scoped and descriptive.
- Include a short summary of changes and testing done.
- Run `pnpm lint` and `pnpm build` locally before opening a PR. If a check needs special env vars, document what you used.
- For security-impacting changes, add a short note about threat model considerations (e.g., auth flows, webhook verification).

## Security
- Report vulnerabilities privately (see `SECURITY.md`); do not open public issues for exploitable bugs.
- Strip any tokens/keys before pushing; run secret scans locally if you have them available.
