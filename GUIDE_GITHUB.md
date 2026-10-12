# Mettre Plume + Boulier sur GitHub

Cette archive contient le code de la V3 publiée le 12 octobre 2026 :
Plume, Boulier, les trois aventures, les avatars, les skins, les décors,
la police BelleAllure et les migrations de la base de données.

## Importer le projet

1. Décompresse `Plume-Boulier_GitHub_V3.zip`.
2. Ouvre le dossier `Plume-Boulier` obtenu après extraction.
3. Crée un dépôt GitHub dédié, par exemple `Plume-Boulier`.
4. Ajoute **le contenu du dossier à la racine du dépôt** : `package.json`,
   `README.md`, `app/`, `components/`, `lib/`, `public/`, etc. Le ZIP lui-même
   ne remplace pas les fichiers du projet.
5. Conserve aussi les fichiers et dossiers commençant par un point :
   `.gitignore`, `.npmrc` et `.openai/`. Si l'import dans le navigateur ne
   les affiche pas, utilise Git ou GitHub Desktop pour importer le dossier complet.
6. Enregistre ce premier ajout avec un message tel que « Import de Plume + Boulier V3 ».

Garde le dossier `public/` entier : il contient les illustrations, les skins
et la police d'écriture. Aucun dossier `node_modules/` ne doit être ajouté.

Si tu préfères la ligne de commande, dans le dossier extrait :

```sh
git init -b main
git add .
git commit -m "Import de Plume + Boulier V3"
git remote add origin URL_DU_DEPOT_GITHUB
git push -u origin main
```

Remplace `URL_DU_DEPOT_GITHUB` par l'URL de ton nouveau dépôt vide.
Ces commandes concernent un nouveau dépôt ; pour un dépôt existant, clone-le
d'abord et copie les fichiers dans ce clone avant de faire un commit.

## Le site déjà en ligne

Adresse actuelle : https://plume-boulier.m-leporcher.chatgpt.site

GitHub conserve le code source. Il ne copie pas les comptes, les points ni
les progressions : ces données restent dans la base D1 du site actuellement
hébergé. Importer le projet sur GitHub ne modifie pas le site en ligne et ne
relie pas automatiquement les futures modifications GitHub à sa publication.

Cette version contient un serveur, une connexion au compte parent et une
base de données. **GitHub Pages seul ne peut pas la faire fonctionner.**
Le fichier `.openai/hosting.json` conserve l'identité du site actuel ; cet
identifiant n'est pas une clé secrète et ne donne pas accès au compte.

Pour un hébergement indépendant, il faudra configurer une base Cloudflare D1
et adapter l'authentification : les en-têtes d'identité ChatGPT sont fournis
par l'hébergement actuel. Il ne suffit pas de publier les fichiers statiques.

## Développer en local

Prérequis : Node.js 22.13 ou plus récent, et pnpm 11.25.0
(version verrouillée dans `package.json`).

Dans le dossier extrait :

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm exec wrangler d1 execute site-creator-d1 --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_round_nebula.sql
pnpm dev
```

Ouvre http://localhost:5173 puis utilise le bouton de connexion affiché.
Le projet prévoit une identité de test locale sur `localhost` : elle est
indépendante du compte parent et de la base du site en ligne. Les migrations
ci-dessus initialisent uniquement la base locale. Le compte de test nommé
« Seedy » est un exemple du moteur de développement.

Les fichiers `.env*`, l'état local `.wrangler/`, les dépendances et les sorties
de compilation sont exclus du dépôt par `.gitignore`.

## Provenance et vérification

Source publiée : `f4c377d0372fd563373678ad58d6f5ecb951e77e`.
TypeScript, les 28 tests et la compilation de production ont passé avant
la publication. Le README et ce guide ont été complétés pour cet export ;
le code de l'application est inchangé. Le cache `tsconfig.tsbuildinfo` a
été omis, il est régénéré par TypeScript.

Cet export contient les sources et les ressources du projet, pas les
données des profils ni les traces d'écriture des utilisateurs.
