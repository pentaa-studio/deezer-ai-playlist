# Text to Playlist

Prototype Next.js 15 (App Router, TypeScript) pour générer des playlists à partir d'un prompt textuel, enrichies par l'IA (Vercel AI SDK + OpenAI).

## Fonctionnalités
- Saisie d'un prompt (ex : "Playlist funk joyeuse pour l'été")
- Génération d'une playlist :
  - 40% morceaux familiers (`/data/favourites.json`)
  - 60% morceaux tendances (`/data/buzz_mock.json`)
- Description narrative générée par GPT
- UI moderne avec Shadcn/UI
- Données locales (pas de DB, pas d'auth)

## Stack
- Next.js 15 (App Router)
- TypeScript
- Shadcn/UI
- Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`)
- OpenAI (clé API requise)

## Lancer le projet localement

1. Installer les dépendances :
   ```bash
   pnpm install
   # ou npm install
   ```
2. Ajouter une clé OpenAI dans un fichier `.env.local` :
   ```env
   OPENAI_API_KEY=sk-...
   ```
3. Démarrer le serveur de dev :
   ```bash
   pnpm dev
   # ou npm run dev
   ```

## Structure principale
- `/app/page.tsx` : UI principale
- `/app/api/chat/route.ts` : API playlist + GPT
- `/lib/parser.ts` : extraction mood/style/genre
- `/lib/generator.ts` : génération playlist 40/60
- `/data/favourites.json` : 20 titres familiers
- `/data/buzz_mock.json` : 30 titres "buzz"
- `/components/PlaylistCard.tsx` : affichage morceau
- `/lib/useVoiceInput.ts` : hook vocal (préparé)

## TODO
- Améliorer parsing avec GPT (function calling)
- Ajouter la reconnaissance vocale
- UI/UX avancée
