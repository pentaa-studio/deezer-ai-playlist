# Melo - Text to Playlist

Application Next.js 15 (App Router, TypeScript) avec Melo, votre agent IA qui crée des playlists Deezer sur mesure à partir de vos demandes textuelles.

## Fonctionnalités
- **Conversation avec Melo** : Agent IA musical conversationnel
- **Recherche musicale** : Intégration API Deezer pour rechercher artistes, titres, genres
- **Génération de playlists** : Création automatique basée sur vos goûts et contexte
- **Tendances musicales** : Découverte des hits du moment
- **Interface moderne** : UI resizable avec covers d'albums, lecteur audio
- **Function calling** : Utilisation intelligente des outils par l'IA
- **Optimisations** : Composant Image Next.js, troncature intelligente

## Stack
- **Next.js 15** (App Router, TypeScript)
- **Vercel AI SDK** (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`)
- **OpenAI GPT-4** (function calling)
- **API Deezer** (recherche musicale, covers)
- **Shadcn/UI** + **Tailwind CSS**
- **Lucide Icons** + **AppIcon** personnalisé

## Workflow de développement

### ⚠️ Important : Branches et Pull Requests

- **Branche principale** : `main` (protégée)
- **Branche de développement** : `dev`
- **Workflow** :
  1. Partir de la branche `dev` pour vos développements
  2. Créer une feature branch depuis `dev`
  3. Soumettre vos Pull Requests vers `dev`
  4. Seul **@jeemclr** peut valider et merger sur `main`

```bash
# Cloner et basculer sur dev
git clone <repo-url>
cd deezer-ai-playlist
git checkout dev

# Créer une feature branch
git checkout -b feature/ma-nouvelle-fonctionnalite

# Développer, commit, push
git add .
git commit -m "feat: ma nouvelle fonctionnalité"
git push origin feature/ma-nouvelle-fonctionnalite

# Créer une PR vers dev (pas main !)
```

## Lancer le projet localement

1. **Cloner depuis dev** :
   ```bash
   git clone <repo-url>
   cd deezer-ai-playlist
   git checkout dev
   ```

2. **Installer les dépendances** :
   ```bash
   pnpm install
   # ou npm install
   ```

3. **Configuration environnement** :
   ```bash
   cp .env.example .env.local
   # puis éditez .env.local avec votre clé OpenAI
   ```

4. **Démarrer le serveur** :
   ```bash
   pnpm dev
   # ou npm run dev
   ```

## Structure principale

### 🎯 Pages et API
- `/app/page.tsx` : Interface principale avec layout resizable
- `/app/api/chat/route.ts` : API conversationnelle avec function calling
- `/app/layout.tsx` : Configuration SEO et métadonnées

### 🧩 Composants
- `/components/DeezerPlayer.tsx` : Lecteur avec covers et liste optimisée
- `/components/AppIcon.tsx` : Icône personnalisée Melo (réutilisable)
- `/components/ui/` : Composants Shadcn/UI (resizable, input, button...)

### 🔧 Logique métier
- `/lib/deezer.ts` : Service API Deezer (recherche, tracks)
- `/lib/generator.ts` : Génération intelligente de playlists
- `/data/` : Données mock pour fallback

### ⚙️ Configuration
- `next.config.ts` : Configuration images Deezer
- `components.json` : Configuration Shadcn/UI

## Sécurité
- **Ne jamais commiter de clé API dans le dépôt.**
- Utilisez `.env.local` (privé) pour vos clés, et `.env.example` (public) comme référence.

## Fonctionnalités récentes

### ✅ Implémenté
- **Function calling** avec OpenAI (searchMusic, createPlaylist, getPopularTracks)
- **Interface resizable** avec panneaux ajustables
- **Covers d'albums** avec composant Image Next.js optimisé
- **Auto-focus intelligent** sur l'input après envoi
- **Suggestions cliquables** pour démarrer rapidement
- **Troncature intelligente** pour éviter les débordements
- **Icône personnalisée** Melo avec animations
- **SEO optimisé** avec métadonnées complètes

### 🚧 En cours / TODO
- Reconnaissance vocale
- Sauvegarde des playlists
- Partage social
- Mode sombre/clair
- Historique des conversations
