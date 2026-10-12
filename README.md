# Plume + Boulier — Les petites aventures

Application éducative pour iPad / Apple Pencil, en français, pour consolider le CP et découvrir le CE1.

## Ce qui fonctionne

- Compte parent ChatGPT privé, profils enfants séparés, profil « Papa — test » avec accès libre.
- Sauvegarde D1 par propriétaire avec contrôle de concurrence ; gains et achats vérifiés côté serveur.
- Plume : 52 niveaux A/a…Z/z, lignage commun basé sur les métriques BelleAllure, 10 modèles par ligne, trois lignes de pratique et validation dans un champ compatible Griffonner. Décomposition pédagogique préparée pour A et a ; modèles complets pour les autres lettres. Mots et phrases après les lettres, ou accès direct dans le profil de test.
- Boulier : séances de dix exercices générés selon la notion, aides visuelles et audio, brouillon au stylet. Addition, soustraction, compléments à 10, doubles, suites, problèmes, quatre règles autour de 100.
- Boutique : neuf personnages, trois gratuits, récompenses à 100 / 250 / 500 étoiles.
- Aventures V2 : trois univers, cinq chapitres narratifs chacun. Dialogues, choix avec écriture du choix, calculs avec des dizaines dès le départ, construction interactive en blocs, ordre, labyrinthe, associations, symétrie, aménagement, quantités et mémoire. Les constructions et brouillons d’énigmes sont sauvegardés ; chaque mission validée fait avancer l’histoire.
- Étoiles d'entraînement indépendantes du solde de boutique. Déblocage à 100, 250, 400, 550 et 700 étoiles par défaut, au moins une activité Plume et Boulier ; seuils réglables.
- Lecture audio avec la synthèse vocale disponible sur l'appareil.

## Limites de cette première version

La reconnaissance est celle du système, dans un champ texte : pas de service OCR intégré, pas de note calligraphique. Fonctionnement de Griffonner, reconnaissance A/a et comportement du Pencil à vérifier sur iPad physique. Les traces du cahier / brouillon ne sont pas conservées après rechargement ; progression, séances de calcul, missions, points et achats sont persistés. Connexion nécessaire. Le verrou de l’espace parent est un garde-fou d’interface, pas une authentification supplémentaire. Les avatars et décors sont des concepts générés, pas une affiliation officielle.

## Vérification

`node node_modules/typescript/bin/tsc --noEmit`

Tests de domaine dans `scripts/tests/game.test.ts` (générateurs, récompenses, achats, isolation, casse, progression, absence de réponses dans l'API publique, relecture de chapitres). Compilation et publication avec les helpers Sites du projet.

## Données

`families` stocke l'état JSON par `oai-authenticated-user-id`. Mutation avec compare-and-swap sur `revision`, identifiant de requête et états « solved » pour éviter le double crédit. Ne jamais ajouter de secrets dans le client ou le dépôt.

Les chapitres V2 ont des clés `theme:v2:index` et gardent les points, achats et anciennes traces V1. Les récompenses des missions sont idempotentes ; une relecture ne crédite pas deux fois. Le niveau des aventures est réglable (début CE1 ou franchissement de la centaine), sans dépendre du nombre d’exercices déjà faits dans Boulier.

Mise à jour des essais : garde-robe avec skins Aventurier (150 étoiles) et Cosmos (300 étoiles), équipables sur tous les avatars possédés ; thème et look accessibles depuis l’accueil. Voile d’ambiance réduit à 60–70 %. Dans les aventures, illustration compacte pendant les calculs et brouillon côte à côte ; fiches des amis dinos avec portraits et lecture audio.

Le client distingue erreur de connexion et réponse d’exercice, ne parse plus une page HTML comme du JSON, réessaie les interruptions temporaires avec le même identifiant de requête. Les résultats originaux sont conservés dans des reçus privés pour éviter le double crédit et restaurer le bon retour. Les réponses et brouillons en cours ont un point de reprise temporaire dans la session de l’appareil ; les résultats validés restent dans D1.


## Export GitHub

Consulte [GUIDE_GITHUB.md](GUIDE_GITHUB.md) pour importer ce projet et le lancer en local. Cette application utilise un serveur et D1 ; GitHub Pages seul ne suffit pas.
