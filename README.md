# Plume + Boulier — V6

Application éducative pour iPad / Apple Pencil et mobile : un parcours CP–CE1 et un campus de 5e avec maths, français, anglais et allemand.

## Ce qui fonctionne

- Compte parent ChatGPT privé, profils enfants séparés, profil « Papa — test » avec accès libre.
- Sauvegarde D1 par propriétaire avec contrôle de concurrence ; gains et achats vérifiés côté serveur.
- Plume : 52 niveaux A/a…Z/z, lignage commun basé sur les métriques BelleAllure, cahier agrandi de 20 %, huit modèles de lettres par ligne, trois lignes de pratique et validation dans un champ compatible Griffonner. Les majuscules ajoutées par Scribble sont acceptées ; les lettres, accents et ponctuation restent vérifiés. Décomposition pédagogique préparée pour A et a ; modèles complets pour les autres lettres. Mots et phrases après les lettres, ou accès direct dans le profil de test.
- Boulier : séances de dix exercices générés selon la notion, aides visuelles et audio, brouillon au stylet ou au clavier, avec notes temporaires par exercice sur cet appareil. Addition, soustraction, compléments à 10, doubles, suites, problèmes, quatre règles autour de 100, groupes identiques, prix, centaines et problèmes en deux étapes.
- Boutique : douze personnages, quatre gratuits, avec garde-robe et équipements propres à chaque avatar. L’achat d’une tenue ne débloque pas celle des autres personnages.
- Aventures : quatre univers, 82 chapitres en CP–CE1 (36 dans le monde des bâtisseurs, 36 dans le royaume de Zelda, cinq dinosaures et cinq au jardin). Dialogues, choix avec écriture du choix, calculs avec des dizaines dès le départ, construction interactive en blocs, ordre, labyrinthe, associations, symétrie, aménagement, quantités et mémoire. Les constructions et brouillons d’énigmes sont sauvegardés ; chaque mission validée fait avancer l’histoire.
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

Mise à jour des essais : garde-robe avec skins Aventurier (150 étoiles) et Cosmos (300 étoiles), achetés et équipés séparément pour chaque avatar ; thème et look accessibles depuis l’accueil et le bouton « Mon ambiance » visible sur mobile. Voile d’ambiance réduit à 60–70 %. Dans les aventures, illustration compacte pendant les calculs et brouillon côte à côte ; fiches des amis dinos avec portraits et lecture audio.

Le client distingue erreur de connexion et réponse d’exercice, ne parse plus une page HTML comme du JSON, réessaie les interruptions temporaires avec le même identifiant de requête. Les résultats originaux sont conservés dans des reçus privés pour éviter le double crédit et restaurer le bon retour. Les réponses et brouillons en cours ont un point de reprise temporaire dans la session de l’appareil ; les résultats validés restent dans D1.


## Campus 5e — quatre matières

À la création d'un profil, choisir « 6e → 5e ». Un profil existant peut changer
son niveau dans l'espace parent. Les profils historiques sans niveau explicite
continuent en CP–CE1. Les séances et les progrès de chaque parcours sont conservés.

- 34 notions : 11 en maths, 6 en français, 7 en anglais et 10 en allemand.
- Allemand « Je débute » : salutations, couleurs, nombres de 1 à 10, vocabulaire courant et petites phrases guidées. Modèles visibles, mini-lexique et audio facultatif. Les notions plus avancées restent dans « Je vais plus loin ».
- Séances de huit défis, par notion ou en parcours varié ; mode révision et mode
  découverte/consolidation. Les calculs et les phrases à compléter utilisent des
  paramètres variés. Les textes de compréhension français sont une banque rédigée.
- Réponses numériques comparées exactement (fractions équivalentes, virgule décimale,
  signe moins). L'orthographe conserve les accents ; le vocabulaire allemand vérifie
  la majuscule du nom et son article. Les groupes d'une phrase peuvent être réordonnés
  au toucher. Le repérage utilise un graphique gradué.
- Audio anglais `en-GB` et allemand `de-DE` par synthèse vocale de l'appareil ;
  transcription disponible via l'indice des exercices d'écoute.
- 10 étoiles sans aide ni erreur, 8 avec accompagnement. Une correction consultée
  permet d'avancer sans points. Le bonus de 20 étoiles exige six réussites sur huit.
- Expédition Orée : cinq chapitres, dialogues présentant Nora et Léo, messages dans
  les deux langues, calculs contextualisés et un plan interactif par module.
  Radio, habitat, énergie, laboratoire puis hangar ; quantités et connexion du plan
  sont vérifiées sur le serveur. Les constructions restent consultables au camp.
- La première mission exige le seuil d'entraînement et deux défis réussis dans
  chacune des quatre matières. Les chapitres suivants demandent aussi le précédent.
  Les récompenses d'aventure ne sont pas des étoiles d'entraînement ; rejouer ne
  crédite pas à nouveau. La boutique et les skins utilisent le solde du profil.
- Suivi parent par notion : réussites, essais incorrects, aides et corrections
  consultées. Ce suivi est descriptif, il ne certifie pas un niveau scolaire.

La version actuelle entraîne des compétences ciblées ; elle ne couvre pas toutes
les activités des programmes annuels. L'oral n'est pas noté automatiquement et
aucune rédaction libre n'est évaluée. Le modèle de connexion parent reste celui
fourni par Sites/ChatGPT ; cet ajout ne crée pas d'authentification indépendante.

### Références

Les contenus ont été calibrés avec les programmes applicables en 5e à la rentrée
2026. L'anglais vise un entraînement des bases A1 vers des tâches A2 ; l'allemand
commence désormais par des premières activités guidées, puis propose une consolidation à la demande. Les boutons de difficulté permettent de choisir le parcours.

- [Mathématiques au cycle 4](https://eduscol.education.gouv.fr/5736/ressources-d-accompagnement-du-programme-de-mathematiques-au-cycle-4)
- [Français au cycle 4](https://eduscol.education.gouv.fr/5733/ressources-d-accompagnement-du-programme-de-francais-au-cycle-4)
- [Langues vivantes au collège](https://eduscol.education.gouv.fr/4758/ressources-d-accompagnement-pour-les-langues-vivantes-etrangeres-et-regionales-au-college)

### Validation de cette mise à jour

TypeScript et 64 tests : domaines de
calcul, génération sans répétition dans chaque série, équivalence des fractions,
langues, récompenses, compatibilité CE1, redaction de l'API, progression des 82 chapitres CE1 et des 36 chapitres Zelda collège, conservation des récompenses et rendu de tous les types de pages. Compilation de production avant
publication. Lecture audio, ergonomie et comportement du Pencil à essayer sur iPad
physique ; aucun test de navigateur n'a été exécuté dans cet environnement.

Les champs `grade` et `college` sont optionnels dans le JSON de `families` ; la
migration SQL existante suffit. Les réponses et la correction en cours disposent
d'un point de reprise local temporaire, et les résultats validés sont stockés dans
D1 avec les mêmes reçus idempotents que le parcours CE1.


## Nouveautés V5 du 13 octobre 2026

Toutes les zones de réponse au Pencil sont agrandies, dans les deux parcours et les aventures. Le cahier conserve les proportions modèle/lignage en augmentant la taille de 20 % ; huit lettres par ligne laissent davantage de place. Scribble peut capitaliser une lettre ou un mot sans bloquer sa validation. Le modèle indique toujours la majuscule ou minuscule à travailler ; aucune note calligraphique n’est ajoutée.

L’allemand débutant et les étapes allemandes des aventures proposent des modèles visibles. Les séances allemandes en cours conservent les réponses déjà récompensées et allègent les défis futurs. La migration est sauvegardée avec contrôle de concurrence.

Chaque avatar mémorise sa tenue. Les anciennes tenues sont réparties une seule fois dans une garde-robe individuelle ; le Cosmos signalé par le parent reste attribué à l’explorateur de Léon. Les points et progrès sont conservés. Épée (100 étoiles) et arc (180 étoiles) peuvent être achetés et équipés pour les deux avatars compatibles du thème de forêt.

Une ambiance inspirée de Zelda complète les trois univers précédents. Ses avatars et illustrations sont des créations fantasy originales, pas des assets officiels. L’histoire originale « Link et les échos de la forêt » a cinq chapitres en CE1 et cinq au collège : dialogues, énigmes variées, compétences scolaires et collection d’éclats persistante. Au collège, Orée et la forêt suivent chacune leurs chapitres précédents et leurs récompenses. Les prompts et chemins des images ajoutées figurent dans [ASSETS_V5.md](ASSETS_V5.md).

Les notes du brouillon clavier restent dans la session de l’appareil et le bouton Mon ambiance apparaît en haut des écrans mobiles. Aucun navigateur ni iPad physique n’a été utilisé pour les contrôles ; Griffonner, l’audio et le confort réel restent à essayer sur vos appareils.

Consulte [GUIDE_GITHUB.md](GUIDE_GITHUB.md) pour importer cette version et retrouver les nouveautés.


## Nouveautés V6 — quêtes sur l’année et jeux de réflexion

Deux grandes quêtes comptent désormais 36 chapitres en six actes. Elles se parcourent au rythme de l’enfant, sans verrou de calendrier. Les seuils d’étoiles d’entraînement et le chapitre précédent restent nécessaires ; le profil de test permet de tout essayer.

### Les notions de chaque profil

Le parcours CP–CE1 conserve ses exercices d’écriture et ses calculs progressifs. Les nouveaux actes abordent addition/soustraction de dizaines, groupes de 2 et 5, prix, centaines et problèmes en deux étapes.

Le profil de 5e utilise ses notions de maths, français et anglais. L’allemand reste débutant avec des modèles visibles par défaut. Dans l’espace parent, « Les notions vues en classe » permet soit de suivre ses entraînements, soit de choisir les notions par matière. Les niveaux anglais et allemand sont indépendants du niveau de maths. Chaque profil garde sa propre sélection. Les nouveaux chapitres suivent ce choix ; les étapes encore à résoudre d’une aventure en cours sont actualisées en conservant les étapes déjà réussies et les verrous validés.

### Les six régions du royaume

Les 36 chapitres de Zelda présentent Link, Zelda et les compagnons dès le départ, puis suivent le village, la forêt, la montagne, le lac et la citadelle. Chaque chapitre possède un objectif, des indices, des dialogues et des tâches contextualisées. Au collège, cinq chapitres par acte proposent un jeu de réflexion indépendant des cours ; le dernier ouvre un sanctuaire à trois verrous scolaires, sauvegardés séparément.

Les casse-têtes alternent sudoku, mots cachés, devinettes, rébus et labyrinthes. Pour environ 7 ans : sudoku 4 × 4, quatre mots courts horizontaux/verticaux, devinettes simples et petit labyrinthe. Pour environ 12 ans : sudoku 9 × 9, six mots pouvant être diagonaux ou inversés, devinettes de logique et labyrinthe plus grand. Les sudokus sont générés avec une solution unique ; les grilles de mots et labyrinthes changent à chaque nouvelle partie. Les rébus sont illustrés par des pictogrammes et leurs sons peuvent être lus. Les réponses acceptent la casse ajoutée par Scribble ; pour ces jeux, les accents ne bloquent pas la découverte du mot. Aucun changement n’est apporté aux exigences orthographiques des cours de langue.

### Le monde des bâtisseurs

Maison, pièces, jardin, serre, ferme, mine, forge, village, bibliothèque, port, gare et musée : la quête CP–CE1 ajoute des constructions à des lieux conservés sur le profil. Les missions de mine font récolter charbon, fer et diamants. Les missions de construction apportent les blocs nécessaires au plan et des matériaux pour continuer.

« Mon monde en blocs », dans Aventures, ouvre un atelier libre : choix du lieu, quatre niveaux de construction, matériaux disponibles et gomme. Le monde et les stocks sont enregistrés dans le compte ; les blocs enlevés redeviennent disponibles. L’atelier ne donne pas d’étoiles. Les gains de mission et de minerais sont mémorisés une seule fois, même en rejouant. Les anciennes maisons sont reprises dans le nouvel atelier.

### Compatibilité et vérification

Les anciens achats, étoiles, constructions et chapitres validés restent conservés. Les cinq anciens chapitres conservent leur identité et leurs récompenses. Les champs supplémentaires sont optionnels dans le JSON : aucune nouvelle migration SQL n’est nécessaire.

Les 64 tests couvrent notamment toutes les quêtes jusqu’à leur fin, le stock entre les lieux, les doubles récompenses, les changements de cours, les anciens comptes, la solution unique des sudokus, la validation des nouveaux casse-têtes et le rendu des 396 étapes Zelda collège ainsi que de toutes les étapes CE1. TypeScript et la compilation de production sont requis avant publication. Le Pencil, la synthèse vocale et le rendu réel sur mobile restent à essayer sur vos appareils.
