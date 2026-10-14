export type YearChapter={title:string;place:string;goal:string;clue:string;word:string;site?:string;material?:string;task?:'build'|'harvest'|'logic'};
export const ZELDA_ARCS=['Les premiers éclats','Le village des voyageurs','La forêt des Korogus','La montagne des forges','Le lac des reflets','La citadelle des sages'];
export const BLOCK_ARCS=['Une maison à nous','Un jardin vivant','Sous la montagne','Un village qui grandit','De nouveaux paysages','Notre grand monde'];
const z=(title:string,place:string,goal:string,clue:string,word:string):YearChapter=>({title,place,goal,clue,word});
export const ZELDA_YEAR:YearChapter[]=[
 z('L’appel de la clairière','Clairière','Retrouver le carnet des balises','Les traces fraîches conduisent vers une cache sous les racines.','carnet'),
 z('Le pont des anciens','Pont ancien','Rétablir le passage des voyageurs','Les pierres numérotées révèlent le plan du pont.','pont'),
 z('Le temple du miroir','Temple','Réveiller la mosaïque de lumière','Les signes se répondent de chaque côté du miroir.','miroir'),
 z('La tour des vents','Tour des vents','Relancer les lanternes du plateau','Trois verrous commandent les grandes roues de la tour.','vent'),
 z('La lumière du royaume','Première balise','Réunir les premiers éclats','Les lumières locales révèlent un chemin vers six régions oubliées.','lumière'),
 z('La carte des six régions','Observatoire','Compléter la carte du grand voyage','Zelda repère six constellations qui correspondent aux régions.','carte'),
 z('Bienvenue au village','Village','Comprendre les besoins des habitants','Chaque maison porte un signe et une demande différente.','village'),
 z('Le marché aux provisions','Marché','Préparer des réserves sans gaspiller','Les marchandises sont vendues par lots : compare les quantités.','provisions'),
 z('La roue du moulin','Moulin','Régler la roue qui alimente le village','Les pales tournent seulement si les trois réglages concordent.','moulin'),
 z('Les messagers du royaume','Poste','Acheminer les messages au bon destinataire','Une lettre, un horaire et un plan permettent de retrouver chaque adresse.','message'),
 z('L’atelier des lanternes','Atelier','Réparer les lanternes du village','Le carnet de l’artisan indique les pièces à récupérer et celles à conserver.','lanterne'),
 z('Le conseil des voyageurs','Place du village','Obtenir le sceau du village','Relie les indices des cinq missions pour préparer le départ.','conseil'),
 z('Les sentiers des Korogus','Lisière','Retrouver un sentier caché','Les Korogus ont marqué les chemins avec des runes de nombres.','sentier'),
 z('Le jardin des racines','Jardin secret','Faire circuler l’eau entre les arbres','Chaque rigole doit rejoindre la bonne racine.','racine'),
 z('Les graines de la forêt','Grand arbre','Partager les graines entre les clairières','Une partie des graines reste en réserve pour les prochains arbres.','graine'),
 z('La bibliothèque des feuilles','Bibliothèque','Déchiffrer le récit du gardien','Les mots du carnet précisent la cause et l’ordre des événements.','feuille'),
 z('Les ruines sous la mousse','Ruines','Identifier le mécanisme qui protège l’éclat','Un faux indice ne suffit pas : vérifie le calcul et le texte.','ruine'),
 z('Le serment de la forêt','Sanctuaire sylvestre','Réunir les trois sceaux de la forêt','Chaque sceau valide une partie du raisonnement.','forêt'),
 z('La route de la montagne','Col de pierre','Planifier la montée avec les réserves disponibles','Les relevés d’altitude contiennent des nombres signés.','montagne'),
 z('La mine des Gorons','Mine','Répartir les minerais pour la forge','Le registre distingue quantité brute, quantité utile et réserve.','minerai'),
 z('Les fours de la forge','Forge','Régler les fours sans manquer de combustible','Chaque four reçoit une part de la livraison.','forge'),
 z('La passerelle du cratère','Passerelle','Reconstruire une passerelle stable','Les angles et les dimensions figurent sur le plan.','passerelle'),
 z('Le carnet des gardiens','Refuge','Comparer les observations de deux équipes','Deux messages décrivent la même panne avec des indices complémentaires.','gardien'),
 z('Le cœur de la montagne','Sanctuaire minéral','Réactiver les sceaux de la montagne','La pierre centrale répond aux trois réglages corrects.','pierre'),
 z('Le port du lac','Port','Organiser le départ des bateaux','Les places et les provisions doivent être réparties entre les embarcations.','bateau'),
 z('Les canaux des reflets','Canaux','Ouvrir les bonnes vannes','Le plan distingue les directions, les distances et les intersections.','canal'),
 z('Les poissons du lagon','Lagon','Comprendre les relevés du lagon','Les gardiens ont noté plusieurs comptages à comparer.','poisson'),
 z('Le phare dans la brume','Phare','Retrouver le signal du phare','Un message britannique explique le signal attendu.','phare'),
 z('Le temple sous l’eau','Temple du lac','Déchiffrer les portes du temple','Les runes suivent des règles qu’il faut vérifier une par une.','porte'),
 z('L’accord des rivières','Sanctuaire du lac','Rassembler les sceaux des eaux','Les réserves et les messages révèlent la route vers la citadelle.','rivière'),
 z('Les portes de la citadelle','Citadelle','Préparer l’arrivée de l’équipe','Les derniers passages utilisent les notions rencontrées pendant le voyage.','citadelle'),
 z('Le laboratoire de Zelda','Laboratoire','Vérifier les hypothèses de Zelda','Une conclusion doit s’appuyer sur des données et des indices précis.','indice'),
 z('La salle des constellations','Observatoire royal','Relier les signes des six régions','Les groupes de runes forment une carte ordonnée.','étoile'),
 z('Le retour des voyageurs','Grande cour','Accueillir les équipes des six régions','Les messages anglais et allemands demandent une préparation différente.','voyageur'),
 z('Les trois sceaux des sages','Sanctuaire royal','Résoudre les derniers verrous','Plusieurs étapes de calcul et de lecture mènent à la solution.','sage'),
 z('Le royaume des découvertes','Salle des balises','Rallumer le réseau des six régions','Tes choix, tes calculs et tes lectures réunissent toutes les découvertes.','royaume'),
];
const b=(title:string,site:string,goal:string,word:string,material:string,task:'build'|'harvest'|'logic'='build'):YearChapter=>({title,place:site,site,goal,word,material,task,clue:`Le plan et la liste de ${word} indiquent ce qu’il faut préparer.`});
export const BLOCK_YEAR:YearChapter[]=[
 b('Un sol solide','maison','Poser les fondations','pierre','pierre'),b('L’atelier du bâtisseur','atelier','Préparer le chantier','bois','bois'),b('Les murs prennent forme','maison','Monter les murs','porte','bois'),b('Un toit avant la pluie','maison','Protéger la maison','toit','rouge'),b('Une maison à nous','maison','Nommer et aménager la maison','maison','fleur'),b('Une pièce pour chacun','chambres','Installer les pièces de la maison','chambre','bois'),
 b('Le potager de la clairière','jardin','Préparer les parcelles','terre','terre'),b('L’eau pour les graines','jardin','Construire les rigoles','eau','bleu'),b('Le verger des pommes','verger','Planter le verger','pomme','bois'),b('Une serre pour les pousses','serre','Protéger les jeunes pousses','verre','verre'),b('Les clôtures du jardin','jardin','Préparer les passages et clôtures','clôture','bois'),b('La première récolte','jardin','Réunir les provisions du jardin','récolte','terre','harvest'),
 b('Une entrée dans la montagne','mine','Préparer l’entrée de la mine','mine','pierre'),b('Des torches dans le tunnel','mine','Retrouver le charbon utile','charbon','charbon','harvest'),b('Le filon de fer','mine','Récolter le bon minerai','fer','fer','harvest'),b('Un atelier pour les outils','forge','Construire la forge','outil','brique'),b('Les pierres brillantes','mine','Identifier le filon de pierres précieuses','diamant','diamant','harvest'),b('La réserve de la mine','réserve','Organiser les minerais et les provisions','réserve','pierre'),
 b('La grange du village','ferme','Construire un abri pour les animaux','grange','bois'),b('Un chemin pour les voisins','village','Relier les maisons','chemin','pierre'),b('Le pont du ruisseau','pont','Construire un passage','pont','bois'),b('La bibliothèque des blocs','bibliothèque','Préparer les rayons et les panneaux','livre','bois'),b('Les boutiques de la place','marché','Organiser le marché','boutique','brique'),b('La fête des bâtisseurs','place','Aménager la place du village','fête','fleur'),
 b('La cabane de la forêt','cabane','Bâtir une cabane de voyage','cabane','bois'),b('Le moulin de la vallée','moulin','Préparer le moulin et ses réserves','moulin','pierre'),b('Un refuge dans la neige','refuge','Construire un refuge','neige','verre'),b('La tour de la montagne','tour','Élever une tour par étages','tour','pierre'),b('Un port près de la mer','port','Installer les quais','port','bois'),b('Le phare des voyageurs','phare','Allumer un phare','phare','jaune'),
 b('La gare des récoltes','gare','Relier les réserves du monde','gare','fer'),b('Les jardins du village','jardins','Créer des jardins pour les voisins','jardin','fleur'),b('Le grand atelier commun','atelier','Préparer un atelier pour tous','atelier','brique'),b('Un musée de nos découvertes','musée','Exposer les trouvailles de la mine','musée','verre'),b('La carte de notre monde','observatoire','Organiser les lieux du voyage','monde','bleu'),b('Bienvenue chez les bâtisseurs','place','Achever le village et choisir son nom','Bienvenue chez nous.','jaune'),
];
export const yearPhase=(chapter:number)=>Math.min(5,Math.max(0,Math.floor(chapter/6)));
