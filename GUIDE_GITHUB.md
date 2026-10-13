# Plume + Boulier V5 — 13 octobre 2026

Site : https://plume-boulier.m-leporcher.chatgpt.site

## Mettre à jour ton dépôt existant

1. Décompresse `Plume-Boulier_GitHub_V5.zip`.
2. Ouvre le dossier local de ton dépôt déjà cloné avec GitHub Desktop.
3. Copie **le contenu** du dossier `Plume-Boulier` dans ce dépôt : fichiers et tous les sous-dossiers. Accepte le remplacement des anciens fichiers du projet. Conserve le dossier `.git` de ton dépôt existant.
4. Vérifie que `package.json`, `README.md`, `app/`, `components/`, `lib/`, `public/` et `scripts/` sont au même niveau. Ne crée pas un deuxième dossier `Plume-Boulier` à l’intérieur du dépôt.
5. Copie également `.openai/`, `.gitignore` et `.npmrc`. Le dossier `public/` entier est nécessaire : images et police.
6. Dans GitHub Desktop, saisis par exemple « V5 : Scribble, mobile, allemand débutant et aventure de forêt » comme Summary, puis clique Commit to… et Push origin.

GitHub conserve le code. Il ne republie pas automatiquement le site et ne copie pas les comptes ou progressions. Ces données restent dans la base en ligne. L’archive ne contient ni dépendances, ni caches, ni jetons, ni données de compte.

## Retrouver les nouveautés

- Actualise la page sur les appareils.
- **Marius / Plume** : cahier 20 % plus grand, huit lettres par ligne et case finale agrandie. Une majuscule ajoutée par Scribble ne bloque plus la validation. Le modèle indique toujours la casse à apprendre.
- Toutes les cases de réponse au Pencil sont agrandies, y compris Boulier, les aventures et les matières du collège.
- **Léon / skins** : un achat habille uniquement l’avatar concerné. Le Cosmos déjà payé est conservé pour son explorateur. Les autres avatars ont une garde-robe distincte et chacun retrouve sa dernière tenue.
- **Mobile** : « Mon ambiance » apparaît en haut de chaque écran. Le brouillon a deux modes : « Pencil / souris » et « Clavier ». Au clavier, il peut saisir plusieurs lignes de calculs.
- **Allemand** : « Je débute · avec des modèles » propose salutations, couleurs, premiers mots, nombres de 1 à 10 et petites phrases guidées. « Je vais plus loin » reste disponible. Les réussites déjà gagnées sont conservées.
- **Ambiance de forêt** : dans Mon ambiance, choisir « Zelda · la forêt des échos ». L’éclaireur est gratuit dans Ma collection ; la princesse et l’esprit des bois sont en boutique. Les tenues azur/Cosmos et l’épée/l’arc se trouvent dans Mon univers & mon look. Les compagnons sont des créations fantasy originales inspirées de cet univers.
- **Aventures 5e** : choisir Orée ou « Zelda · forêt des échos ». L’aventure de Link a cinq chapitres, avec dialogues, maths de 5e, français, anglais, allemand guidé et énigmes. Les éclats retrouvés restent visibles sur la carte.

Le profil « Papa — test » permet d’essayer les deux niveaux via l’espace parent, en conservant les achats et progrès. Les profils enfants suivent les seuils d’étoiles et les chapitres précédents ; le profil de test ouvre tout.

## Hébergement et essai local

Cette application utilise un serveur, la connexion parent fournie par ChatGPT/Sites et D1. GitHub Pages seul ne suffit pas. Un hébergement indépendant nécessite de configurer une base et d’adapter l’authentification. `.openai/hosting.json` conserve l’identité du site actuel sans clé secrète.

Prérequis : Node.js 22.13 ou plus récent et pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm exec wrangler d1 execute site-creator-d1 --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_round_nebula.sql
pnpm dev
```

Ouvre http://localhost:5173 et utilise la connexion locale proposée. Le compte d’exemple « Seedy » et sa base locale sont indépendants du compte parent en ligne. La migration SQL existante suffit.

Le README décrit les fonctions et limites. Les 51 tests, TypeScript et la compilation de production ont passé. Les essais physiques au Pencil, le rendu mobile réel et l’audio restent à vérifier sur vos appareils.
