import type {Chapter,Mission,Profile,Question} from './game';
import type {Theme} from './catalog';
export const ADVENTURE_VERSION=2;
export const adventureKey=(theme:Theme,index:number)=>`${theme}:v${ADVENTURE_VERSION}:${index}`;
const id=()=>crypto.randomUUID();const pick=(a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;
export type PuzzleSpec={type:'order'|'maze'|'match'|'symmetry'|'balance'|'memory'|'packing';items?:{id:string;label:string;icon?:string;value?:number}[];width?:number;height?:number;blocked?:number[];start?:number;end?:number;given?:{cell:number;color:string}[];colors?:string[];target?:number;noun?:string;pieces?:{id:string;label:string;color:string;width:number;height:number}[];cards?:string[];pairs?:{left:string;right:string}[];labels?:Record<string,string>;solution?:any};
export type ConstructionSpec={layer:number;width:number;depth:number;targets:string[];materials:string[];material:string;selectionKey?:string;label:string};
const mission=(kind:Mission['kind'],title:string,prompt:string,extra:Partial<Mission>={}):Mission=>({id:id(),kind,title,prompt,solved:false,help:false,attempts:0,...extra});
const talk=(speaker:string,title:string,lines:string[],cast:string[]=[])=>mission('dialogue',title,lines.join('\n\n'),{speaker,lines,cast});
const choose=(title:string,prompt:string,options:string[],solutions:string[],selectionKey:string)=>mission('choice',title,prompt,{options,solutions,selectionKey});
const write=(title:string,target:string,context:string,selectionKey?:string,freeWrite=false)=>mission('write',title,`${context} Écris « ${target} » dans la case.`,{target,selectionKey,freeWrite,context});
function math(title:string,units:string,operation:'add'|'sub'|'missing'|'double'|'cross',intro:string,idx:number,level:number):Mission{
 let a:number,b:number,answer:number,hint:string,calculation:string,description:string;
 if(level===2&&operation==='add')operation='cross';
 if(operation==='add'){a=pick(18,32);b=pick(12,27);answer=a+b;calculation=`${a} + ${b}`;description=`${intro} Il y a ${a} ${units} dans une caisse et ${b} dans l’autre. Combien en as-tu au total ?`;hint=`Décompose les nombres : ${Math.floor(a/10)*10} + ${Math.floor(b/10)*10} pour les dizaines, puis ${a%10} + ${b%10} pour les unités.`;}
 else if(operation==='sub'){a=pick(43,76);b=pick(14,28);answer=a-b;calculation=`${a} − ${b}`;description=`${intro} Tu as ${a} ${units}. Tu en utilises ${b}. Combien en reste-t-il ?`;hint=`Tu peux enlever d’abord ${Math.floor(b/10)*10}, puis ${b%10}. Tu peux aussi compter de ${b} jusqu’à ${a}.`;}
 else if(operation==='missing'){a=pick(21,39);b=pick(5,9)*10;answer=b-a;calculation=`${a} + ? = ${b}`;description=`${intro} Il faut ${b} ${units}, mais tu n’en as que ${a}. Combien en manque-t-il ?`;hint=`Cherche ce qu’il faut ajouter à ${a} pour atteindre ${b}. Passe par la dizaine suivante.`;}
 else if(operation==='double'){a=pick(12,19);b=a;answer=a*2;calculation=`${a} + ${a}`;description=`${intro} Il faut préparer deux groupes de ${a} ${units}. Combien faut-il en tout ?`;hint=`Additionne ${a} avec lui-même. Réunis les dizaines puis les unités.`;}
 else{a=pick(level===2?88:94,99);b=pick(101-a,18);answer=a+b;calculation=`${a} + ${b}`;description=`${intro} Tu as déjà ${a} ${units} et tu en ajoutes ${b}. Quel est le nouveau total ?`;hint=`Il manque ${100-a} pour atteindre 100. Sépare ${b} en ${100-a} + ${b-(100-a)}, puis ajoute la partie restante après 100.`;}
 const q:Question={id:id(),topic:operation==='cross'?'around100':operation==='double'?'doubles':operation==='sub'?'sub100':'add100',title,prompt:description,answer,hint,visual:{kind:operation==='cross'?'hundred':operation==='sub'?'subtract':'add',a,b},attempts:0,help:false,solved:false,award:0};
 return mission('math',title,description,{question:q,calculation:operation==='missing'?calculation:`${calculation} = ?`});
}
function puzzle(title:string,prompt:string,spec:PuzzleSpec,hint:string){return mission('puzzle',title,prompt,{puzzle:spec,hint});}
function order(title:string,prompt:string,labels:string[],hint:string){const correct=labels.map((_,i)=>`s${i}`);return puzzle(title,prompt,{type:'order',items:labels.map((label,i)=>({id:`s${i}`,label})).sort(()=>Math.random()-.5),solution:correct},hint);}
function maze(title:string,prompt:string,variant:number){const blocked=[[2,7,11,12,16,18],[1,6,8,13,16,18,21],[3,7,8,11,13,18]][variant%3];return puzzle(title,prompt,{type:'maze',width:5,height:5,blocked,start:0,end:24},'Avance d’une case à la fois, vers le haut, le bas, la gauche ou la droite. Les obstacles ne se traversent pas.');}
function matching(title:string,prompt:string,pairs:{left:string;right:string}[]){return puzzle(title,prompt,{type:'match',pairs,items:pairs.map((p,i)=>({id:String(i),label:p.right})).sort(()=>Math.random()-.5),solution:Object.fromEntries(pairs.map((p,i)=>[p.left,String(i)]))},'Lis ou écoute chaque carte. Cherche la réponse qui lui correspond. Tu peux changer une association.');}
function symmetry(title:string,prompt:string){
 const colors=['rouge','bleu','jaune'];const indices=[0,4,8,12,5,9];const given=indices.map((cell,i)=>({cell,color:colors[i<3?i:pick(0,2)]}));
 const solution=Object.fromEntries(given.map(({cell,color})=>[Math.floor(cell/4)*4+(3-cell%4),color]));
 return puzzle(title,prompt,{type:'symmetry',width:4,height:4,given,colors,solution},'Imagine un miroir au milieu. Une case à gauche se retrouve à la même hauteur, à la même distance, à droite.');
}
function balance(title:string,prompt:string){const a=pick(12,19),b=pick(13,21),noun=title.includes('plateaux')?'plateaux':'paniers',label=noun==='plateaux'?'Plateau':'Panier';return puzzle(title,prompt,{type:'balance',target:a+b,noun,items:[{id:'a',label:label+' A',value:a},{id:'b',label:label+' B',value:b},{id:'c',label:label+' C',value:a+4},{id:'d',label:label+' D',value:b-3}],solution:['a','b']},`Essaie deux ${noun}, additionne leurs quantités et compare avec le total demandé. Il faut exactement deux ${noun}.`);}
function memory(title:string,prompt:string,cards:string[],labels:Record<string,string>){const deck=[...cards,...cards].sort(()=>Math.random()-.5);return puzzle(title,prompt,{type:'memory',cards:deck,labels},'Retourne deux cartes. Si elles sont différentes, essaie de retenir leur position. Retrouve les trois paires.');}
function packing(title:string,prompt:string,kind:'house'|'party'){return puzzle(title,prompt,{type:'packing',width:5,height:4,blocked:[0,5],pieces:kind==='house'?[{id:'lit',label:'Le lit',width:2,height:1,color:'bleu'},{id:'table',label:'La table',width:2,height:2,color:'bois'},{id:'coffre',label:'Le coffre',width:1,height:1,color:'jaune'}]:[{id:'table',label:'La grande table',width:3,height:2,color:'bois'},{id:'cadeaux',label:'Les cadeaux',width:2,height:1,color:'rouge'},{id:'gouter',label:'Le buffet',width:1,height:2,color:'bleu'}]},'Choisis un objet, puis touche sa case de départ. Il occupe plusieurs cases. Les objets ne doivent pas se chevaucher et l’entrée doit rester libre.');}
function build(title:string,prompt:string,layer:number,targets:string[],material:string,materials:string[],label:string,selectionKey?:string){return mission('build',title,prompt,{construction:{layer,width:6,depth:5,targets,material,materials,label,selectionKey},draft:{},hint:'Choisis ton matériau puis touche les cases du plan en pointillés. Le bouton gomme enlève un bloc. Les cases vertes restent libres.'});}
const foundation=Array.from({length:12},(_,i)=>`${1+i%4},${1+Math.floor(i/4)},0`);
const walls=Array.from({length:12},(_,i)=>[1+i%4,1+Math.floor(i/4)]).filter(([x,y])=>x===1||x===4||y===1||y===3).filter(([x,y])=>!(x===2&&y===1)).map(([x,y])=>`${x},${y},1`);
const roof=Array.from({length:12},(_,i)=>`${1+i%4},${1+Math.floor(i/4)},2`);
const garden=['0,0,0','1,0,0','3,0,0','4,0,0','5,1,0','5,2,0'];
export function makeChapter(theme:Theme,index:number,p:Profile,level=1):Chapter{
 let ms:Mission[]=[];const advanced=level===2||index===4;
 if(theme==='blocks'){
  const hero='Le renard bâtisseur';
  if(index===0)ms=[
   talk(hero,'Une maison pour l’hiver',['Tu arrives dans une clairière. Le renard habite sous un arbre, mais la pluie traverse les branches.','« Tu veux m’aider à construire une vraie maison ? Avant les murs et le toit, il faut préparer un sol solide : les fondations. »']),
   choose('Un matériau solide','La maison sera près du ruisseau. Choisis de la pierre ou de la brique pour ses fondations.',['pierre','brique','verre'],['pierre','brique'],'foundation'),
   talk(hero,'La liste du chantier',['« Bonne idée ! Je vais chercher le matériau que tu as choisi. Écris son nom sur notre liste pour ne pas nous tromper. »']),
   write('Le nom du matériau','pierre','Prépare la liste du chantier.','foundation'),
   math('La livraison du chantier','blocs','add','Deux caisses viennent d’arriver.',0,level),
  ];
  // Explicitly authored, story-specific sequences keep each chapter distinct.
  if(index===0){ms[4]=math('La livraison du chantier','blocs','add','Le marchand dépose deux caisses devant la clairière.',index,level);ms.push(
   talk(hero,'On commence les fondations',['« Très bien, nous avons assez de blocs ! Notre maison fera 4 blocs de long et 3 blocs de large. Suis le plan et pose-les un par un. »']),
   build('Les premières pierres','Pose tes 12 blocs sur le rectangle en pointillés. Choisis ton matériau dans l’inventaire.',0,foundation,'pierre',['pierre','brique'],'Fondations','foundation'),
   order('Dans quel ordre construire ?','Prépare la suite du chantier : touche les cartes dans le bon ordre.',['Préparer le terrain','Poser les fondations','Monter les murs','Poser le toit'],'Les murs ont besoin d’un sol solide, et le toit a besoin des murs.'),
   talk(hero,'Le chantier est lancé !',['« Regarde, la maison commence à exister ! Au prochain chapitre, nous allons préparer l’atelier et le bois des murs. »']));}
  if(index===1)ms=[
   talk(hero,'Un atelier dans la clairière',['Les fondations sont bien droites. Le renard arrive avec une brouette et une grande caisse d’outils.','« Avant de monter les murs, préparons notre atelier. Il nous faut un chemin pour transporter le bois sans nous cogner aux rochers. »']),
   maze('Le chemin de la brouette','Trace un chemin de l’atelier au chantier, sans passer sur les rochers.',0),
   talk(hero,'Les matériaux des murs',['« La brouette peut passer ! Pour nos murs, tu préfères le bois chaleureux ou les briques rouges ? »']),
   choose('À quoi ressembleront les murs ?','Choisis le matériau de ta maison.',['bois','brique'],['bois','brique'],'wall'),
   write('L’étiquette de l’atelier','bois','Écris le nom du matériau choisi.','wall'),
   math('Les réserves de l’atelier','planches','sub','Une partie du stock sert à construire la brouette.',index,level),
   math('La commande à compléter','clous','missing','Le renard vérifie le matériel pour la prochaine étape.',index,level),
   talk(hero,'Tout est prêt',['« Le chemin est dégagé et les matériaux sont rangés. Au prochain chapitre, tu pourras monter les murs ! »'])];
  if(index===2)ms=[
   talk(hero,'La maison prend de la hauteur',['Aujourd’hui, tu vas donner une forme à la maison. Le renard regarde le plan avec attention.','« On garde une ouverture devant pour la porte. Puis on pose les murs autour des fondations. À toi de construire ! »']),
   math('Les blocs pour les murs','blocs','add','Les matériaux arrivent en deux livraisons.',index,level),
   build('Monte les murs','Pose les blocs sur le contour du plan. L’ouverture de la porte reste libre.',1,walls,'bois',['bois','brique'],'Murs','wall'),
   talk(hero,'De la lumière dans la maison',['« Les murs sont superbes ! Sans fenêtres, il ferait bien sombre. Cherchons maintenant les bons matériaux pour chaque partie de la maison. »']),
   matching('Chaque matériau a son rôle','Associe chaque partie de la maison au bon matériau.',[{left:'Une fenêtre transparente',right:'verre'},{left:'Une fondation solide',right:'pierre'},{left:'Une porte en planches',right:'bois'}]),
   write('La porte d’entrée','porte','Le menuisier veut savoir ce que tu commandes.'),
   math('Les blocs restant au sol','blocs','sub','Tu nettoies le chantier après avoir construit les murs.',index,level),
   talk(hero,'Bienvenue à l’intérieur',['« Nous avons enfin des murs ! Il nous manque un toit pour protéger notre maison de la pluie. »'])];
  if(index===3)ms=[
   talk(hero,'Un abri avant la pluie',['Quelques nuages arrivent au-dessus de la clairière. Le renard lève la tête.','« Pas de panique, on a le temps ! Pose un toit sur la maison, puis préparons une décoration bien équilibrée. »']),
   choose('La couleur du toit','Choisis un toit rouge ou un toit bleu.',['rouge','bleu'],['rouge','bleu'],'roof'),
   write('La note du couvreur','rouge','Écris la couleur que tu as choisie.','roof'),
   math('Deux piles de tuiles','tuiles','double','Le couvreur prépare une pile pour chaque côté du toit.',index,level),
   build('Pose le toit','Couvre les 12 cases du toit avec la couleur choisie. Les murs sont déjà en place.',2,roof,'rouge',['rouge','bleu'],'Toit','roof'),
   symmetry('Un motif en miroir','Complète la moitié droite pour qu’elle soit le reflet de la moitié gauche.'),
   talk(hero,'Au sec !',['« Écoute la pluie sur le toit… Nous sommes à l’abri ! Demain, nous aménagerons l’intérieur et nous planterons le jardin. »'])];
  if(index===4)ms=[
   talk(hero,'Une maison qui te ressemble',['Le soleil revient. La maison tient debout, mais il reste encore de la place pour tes idées.','« Installons nos meubles sans bloquer l’entrée. Puis tu pourras nommer notre maison et fleurir le jardin ! »']),
   packing('Aménage l’intérieur','Place le lit, la table et le coffre. Laisse l’entrée libre et ne superpose pas les meubles.','house'),
   math('Les graines du jardin','graines',advanced?'cross':'add','Le jardinier te confie ses réserves.',index,level),
   build('Plante ton petit jardin','Pose les blocs de fleurs sur les six cases du jardin. Choisis une couleur pour chaque case.',0,garden,'fleur',['fleur','jaune'],'Jardin'),
   talk(hero,'Le nom de la maison',['« Cette maison, on l’a construite ensemble ! Quel nom voudrais-tu écrire sur la pancarte ? Tu peux choisir “Ma cabane” ou inventer le tien. »']),
   write('La pancarte de chez toi','Ma cabane','Écris le nom de ta maison.', 'houseName',true),
   math('Les provisions de l’hiver','pommes','sub','On range quelques provisions dans le coffre.',index,level),
   talk(hero,'Notre maison est terminée !',['« Merci ! Tu as choisi, écrit, calculé et construit. Viens quand tu veux : cette maison sera toujours la nôtre. »'])];
 }
 if(theme==='dinos'){
  const hero='Téo le T-rex';
  if(index===0)ms=[
   talk(hero,'Le refuge du lagon',['Au loin, le volcan gronde. Les familles ont rejoint le lagon, où elles sont en sécurité. Mais, pendant le trajet, quelques petits ont suivi un autre chemin.','Téo te rejoint : « Personne n’est en danger ici. Aide-moi à préparer un refuge, puis nous partirons chercher leurs parents. »']),
   choose('Où installer le refuge ?','Choisis un endroit loin du volcan : la plage du lagon ou la colline près du lagon.',['plage','colline','volcan'],['plage','colline'],'refuge'),
   write('Le panneau du refuge','plage','Indique aux familles où nous les attendons.','refuge'),
   math('Les fruits du refuge','fruits','add','Trix a apporté deux paniers pour nourrir les petits.',index,level),
   talk(hero,'Qui manque à l’appel ?',['« Avant de partir, je te présente mes amis ! Voici Trix, une tricératops courageuse : elle prépare les provisions et accompagne les petits. »','« Et voici Pico, notre ami ptérosaure. Avec ses ailes, il repère les chemins depuis le ciel. »','« Maintenant que tu nous connais, retrouvons les familles qui attendent leurs petits. »'],['trix','pico']),
   matching('Les premières familles','Relie chaque petit au parent qui le cherche.',[{left:'Téo cherche sa maman',right:'La famille de Téo'},{left:'Trix cherche son papa',right:'La famille de Trix'},{left:'Pico cherche sa maman',right:'La famille de Pico'}]),
   math('La réserve de fruits','fruits','sub','Les petits mangent avant le départ.',index,level),
   talk(hero,'En route, ensemble',['« Maintenant, nous savons qui chercher. Suivons les empreintes vers la forêt ! »'])];
  if(index===1)ms=[
   talk(hero,'Des traces entre les fougères',['Sur le sable, tu découvres une piste. Elle traverse les fougères et mène vers un petit pont.','« Les rochers barrent certains passages. Choisis un chemin calme pour accompagner le petit jusqu’au lagon. »']),
   maze('Le chemin des fougères','Guide le petit du départ au lagon. Tu peux avancer seulement d’une case à la fois.',1),
   write('Le carnet de la piste','piste','Note ce que tu viens de suivre dans le carnet.'),
   math('Les pierres du petit pont','pierres','missing','Pour franchir le ruisseau, le pont doit être complété.',index,level),
   talk(hero,'Le pont est réparé',['« Bien joué ! Il reste assez de temps pour préparer le retour. Comptons les provisions que chacun transporte. »']),
   math('Deux sacs pour le voyage','fruits','double','Un petit et son parent portent chacun un sac identique.',index,level),
   talk(hero,'Une silhouette près de la rivière',['« Regarde là-bas ! Quelqu’un nous attend. Au prochain chapitre, nous découvrirons de quelle famille il s’agit. »'])];
  if(index===2)ms=[
   talk(hero,'La rivière et les grandes empreintes',['Pico a repéré plusieurs panneaux près de la rivière. Ils indiquent les endroits où les familles se sont arrêtées.','« Mettons-les dans l’ordre pour comprendre le trajet. Puis nous ramènerons tout le monde au refuge. »']),
   order('Remets le trajet dans l’ordre','Les panneaux sont numérotés. Touche-les du plus petit numéro au plus grand.',['Panneau 24','Panneau 36','Panneau 48','Panneau 60'],'Compare d’abord les dizaines : 2, puis 3, puis 4, puis 6.'),
   math('Les feuilles pour le repas','feuilles','add','Une famille a trouvé de la nourriture de chaque côté de la rivière.',index,level),
   write('Une famille retrouvée','famille','Ajoute cette découverte dans ton carnet.'),
   talk(hero,'Un petit appel au loin',['« Une famille est réunie ! Mais Trix a entendu un appel derrière les arbres. Faisons une réserve pour l’accompagner. »']),
   math('Les provisions à partager','fruits','sub','Tu prépares les sacs de retour au refuge.',index,level),
   talk(hero,'On ne laisse personne derrière',['« Trix nous attend près de la grande clairière. Préparons juste ce qu’il faut : ni trop, ni trop peu. »'])];
  if(index===3)ms=[
   talk(hero,'Le pique-nique des retrouvailles',['Le petit Trix a retrouvé son papa ! Ils veulent maintenant accompagner une autre famille sur le chemin du refuge.','« Pour le pique-nique, nous devons choisir deux paniers qui donnent exactement la bonne quantité. »']),
   balance('Les bons paniers','Choisis deux paniers pour obtenir exactement le total indiqué.'),
   write('Le nom de ton nouvel ami','Trix','Ajoute son nom dans le carnet des retrouvailles.'),
   math('La réserve à compléter','fruits','missing','Les familles préparent un repas au refuge.',index,level),
   talk(hero,'Un coup d’aile de Pico',['« Pico arrive avec une bonne nouvelle : les derniers parents sont sur la plage ! Retrouvons leurs petits. »']),
   math('Les feuilles pour demain','feuilles','add','Pico apporte un nouveau sac au refuge.',index,level),
   talk(hero,'Presque tous ensemble',['« Une dernière petite recherche nous attend. Garde les portraits des familles en mémoire ! »'])];
  if(index===4)ms=[
   talk(hero,'Tous au refuge',['Le lagon est calme. Les petits attendent de voir apparaître leurs parents entre les arbres.','« Retrouvons chaque paire de portraits. Ensuite, nous pourrons compter nos réserves et organiser une grande journée ensemble. »']),
   memory('Les portraits des familles','Retrouve les trois paires de portraits pour réunir les dernières familles.',['trex','trix','pico'],{trex:'La famille de Téo',trix:'La famille de Trix',pico:'La famille de Pico'}),
   math('Les provisions du refuge','fruits','cross','Le refuge reçoit une dernière livraison.',index,level),
   write('Le message des retrouvailles','Les familles sont réunies.','Écris la bonne nouvelle dans le carnet.'),
   math('Les provisions après le repas','fruits','sub','Tout le monde déjeune ensemble au lagon.',index,level),
   talk(hero,'Une île pleine d’amis',['« Merci ! Les petits ont retrouvé leurs parents. Tu nous as aidés avec tes mots, tes calculs et tes idées. Maintenant, place aux jeux au bord du lagon ! »'])];
 }
 if(theme==='snoopy'){
  const hero='Snoopy et Woodstock';
  if(index===0)ms=[
   talk(hero,'Une surprise dans le jardin',['Woodstock a trouvé une petite enveloppe sous la niche rouge. À l’intérieur, Snoopy a dessiné une fête avec tous ses amis.','« Et si nous préparions cette fête ensemble ? Commençons par les invitations : il faut choisir un invité, écrire son nom et préparer les enveloppes. »']),
   choose('Qui invites-tu en premier ?','Choisis le premier prénom à écrire sur une invitation.',['Léo','Mia','Noé'],['Léo','Mia','Noé'],'guest'),
   write('La première invitation','Léo','Écris le prénom que tu viens de choisir.','guest'),
   math('Les enveloppes de la fête','enveloppes','add','Snoopy retrouve deux boîtes dans son placard.',index,level),
   talk(hero,'Comment envoyer une invitation ?',['« Le prénom est bien écrit. Mais nos cartes sont encore mélangées ! Retrouvons l’ordre des étapes pour que les invitations arrivent chez nos amis. »']),
   order('L’invitation, étape par étape','Touche les cartes dans l’ordre pour préparer une invitation.',['Écrire le prénom','Glisser la carte dans l’enveloppe','Fermer l’enveloppe','Déposer dans la boîte aux lettres'],'On écrit la carte avant de l’enfermer. La boîte aux lettres est la dernière étape.'),
   math('Les enveloppes restantes','enveloppes','sub','Les premières invitations sont prêtes à partir.',index,level),
   talk(hero,'Les amis vont venir !',['« Les invitations sont envoyées ! Au prochain chapitre, nous allons organiser le jardin pour que chacun ait de la place. »'])];
  if(index===1)ms=[
   talk(hero,'Une grande table sous l’arbre',['Les réponses des invités arrivent. Snoopy déplie une nappe et Woodstock fait le tour du jardin.','« Il faut une table, un buffet et un coin cadeaux. Mais personne ne doit bloquer le passage ! À toi d’organiser le jardin. »']),
   packing('Organise la fête','Place la table, le buffet et les cadeaux sans les superposer. L’entrée doit rester libre.','party'),
   math('Les verres des invités','verres','missing','Snoopy vérifie la vaisselle avant de dresser la table.',index,level),
   write('L’étiquette de la vaisselle','verres','Écris ce qu’il faut apporter dans le jardin.'),
   talk(hero,'Une place pour chacun',['« La table est prête ! Comptons aussi les serviettes, pour que personne n’en manque. »']),
   math('Les deux piles de serviettes','serviettes','add','Tu trouves une pile dans la cuisine et une autre près du buffet.',index,level),
   talk(hero,'Le jardin s’organise',['« Tout le monde pourra s’installer. Maintenant, préparons le goûter ! »'])];
  if(index===2)ms=[
   talk(hero,'Le goûter des amis',['Une bonne odeur sort de la cuisine. Snoopy a préparé des biscuits et Woodstock vérifie la liste.','« Choisis deux plateaux pour obtenir exactement la quantité demandée. Après, nous préparerons les assiettes. »']),
   balance('Les deux bons plateaux','Choisis deux plateaux dont les quantités donnent le total indiqué.'),
   write('La liste du goûter','biscuits','Note le goûter sur la liste des fournitures.'),
   math('Les assiettes à préparer','assiettes','double','Il faut préparer deux tables avec la même quantité d’assiettes.',index,level),
   talk(hero,'On garde une réserve',['« Tout est prêt sur les plateaux. Voyons ce qu’il restera pour les invités qui arrivent un peu plus tard. »']),
   math('Les biscuits en réserve','biscuits','sub','Une partie des biscuits est déjà posée sur la table.',index,level),
   talk(hero,'La touche de couleur',['« Le goûter est prêt. Il manque juste des décorations pour rendre le jardin encore plus beau ! »'])];
  if(index===3)ms=[
   talk(hero,'Des couleurs entre les branches',['Snoopy tend une guirlande sous l’arbre. Woodstock apporte des décorations rouges, bleues et jaunes.','« Complète ce motif comme dans un miroir, puis choisissons la couleur des ballons. »']),
   symmetry('Le motif de la guirlande','Complète la partie droite avec les mêmes couleurs, en miroir.'),
   choose('La couleur des ballons','Quelle couleur veux-tu mettre à l’honneur ?',['rouge','bleu','jaune'],['rouge','bleu','jaune'],'balloon'),
   write('L’étiquette des ballons','rouge','Écris la couleur choisie sur la boîte.','balloon'),
   math('Les décorations livrées','décorations','add','Tu reçois deux boîtes pour décorer le jardin.',index,level),
   talk(hero,'Un jardin tout joyeux',['« Quelle belle couleur ! Les invités vont bientôt arriver. Préparons leurs surprises. »']),
   math('Les rubans à garder','rubans','sub','Tu accroches les premières décorations aux branches.',index,level),
   talk(hero,'La fête approche',['« Les cadeaux sont encore mélangés. Un dernier jeu de mémoire nous aidera à les retrouver ! »'])];
  if(index===4)ms=[
   talk(hero,'Les invités arrivent',['On entend des pas derrière le portail. Snoopy sourit et Woodstock vole au-dessus de la table.','« Retrouvons les cadeaux qui vont ensemble, écrivons notre message de bienvenue… et que la fête commence ! »']),
   memory('Les cadeaux des amis','Retrouve les trois paires avant de distribuer les surprises.',['cadeau','ballon','gateau'],{cadeau:'Un cadeau',ballon:'Un ballon',gateau:'Un gâteau'}),
   math('La dernière boîte de biscuits','biscuits','cross','Un ami apporte une dernière boîte pour le goûter.',index,level),
   write('Le message de bienvenue','Bienvenue à la fête !','Prépare la pancarte pour accueillir les invités.'),
   math('Le goûter des derniers invités','biscuits','sub','Les premiers invités se sont servis.',index,level),
   talk(hero,'Que la fête commence !',['« Merci ! Les invitations, le goûter et les décorations sont prêts grâce à toi. Installe-toi : aujourd’hui, on fête toutes tes découvertes ! »'])];
 }
 if(theme==='zelda'){
  if(index===0)ms=[
   talk('Link','Un appel dans la clairière',['Link explore les chemins de la forêt. Son amie Zelda lit les anciens signes. Un petit Korogu, l’esprit des bois, connaît les passages cachés.','Ce matin, les lumières qui guidaient les voyageurs se sont éteintes. « Cinq éclats peuvent les rallumer », explique Zelda. « Tu viens chercher le premier avec nous ? »']),
   choose('Le sac du voyage','Link prépare son sac. Choisis une lampe pour voir les ruines ou une corde pour passer les obstacles.',['lampe','corde','ballon'],['lampe','corde'],'travelItem'),
   talk('Link','Une liste pour ne rien oublier',['« Bon choix ! Écris le nom de ton objet sur notre liste. Ensuite, nous compterons les provisions. »']),
   write('La liste de Link','lampe','Note l’objet que tu as choisi.','travelItem'),
   math('Les provisions du chemin','pommes','add','Zelda réunit les provisions de l’équipe.',index,level),
   talk('Zelda','Le carnet des éclats',['« Nous avons assez de provisions. Le Korogu a retrouvé ces cartes du voyage. Remettons-les dans le bon ordre pour trouver le premier éclat. »']),
   order('Les étapes du voyage','Touche les cartes dans l’ordre.',['Préparer le sac','Lire le carnet','Suivre le chemin','Trouver l’éclat'],'Prépare ton sac avant de partir. Lis les indices avant de suivre le chemin.'),
   talk('Link','Le premier éclat',['Une lumière verte apparaît sous les feuilles. « Tu as trouvé l’éclat de la clairière ! », dit Link.','Une balise se rallume. Elle indique maintenant le pont ancien. Nous irons l’explorer au prochain chapitre.'])];
  if(index===1)ms=[
   talk('Link','Le pont des anciens',['Le chemin mène à un vieux pont. Certains passages sont bloqués par des rochers. Zelda a trouvé un plan pour atteindre l’autre rive.','« On va compter les planches, puis choisir un chemin sûr », te propose Link.']),
   math('Les planches du pont','planches','missing','Le charpentier a commencé la réparation.',index,level),
   write('Le panneau du passage','pont','Écris le lieu que tu viens de découvrir.'),
   talk('Zelda','Un chemin entre les rochers',['« Le panneau est prêt. Sur le plan, pars de la case D et rejoins le drapeau. Tu avances d’une case à la fois. »']),
   maze('Le passage de la rivière','Trace le chemin vers l’autre rive, sans traverser les rochers.',0),
   math('Les planches en réserve','planches','sub','Une partie des planches a servi au pont.',index,level),
   talk('Link','De l’autre côté',['Le passage est libre. Un éclat bleu brille au bord de la rivière. « Deux éclats retrouvés ! Le temple nous attend maintenant. »'])];
  if(index===2)ms=[
   talk('Zelda','Le temple du miroir',['Dans le temple, une mosaïque brille sur le mur. Sa moitié droite est incomplète. « Les deux côtés doivent se refléter comme dans un miroir », explique Zelda.','Link a trouvé de petites lanternes pour éclairer la salle. Préparons-les avant de compléter les couleurs.']),
   math('Deux rangées de lanternes','lanternes','double','Link dispose la même quantité de chaque côté de la salle.',index,level),
   write('Le carnet du temple','miroir','Note l’indice de Zelda dans le carnet.'),
   talk('Zelda','Les couleurs se répondent',['« Regarde la ligne au milieu. Une case bleue à gauche doit trouver une case bleue à droite, à la même hauteur et à la même distance. »']),
   symmetry('La mosaïque du temple','Complète la moitié droite avec les couleurs en miroir.'),
   math('La réserve de lanternes','lanternes','sub','Tu allumes les lanternes du temple.',index,level),
   talk('Link','Le temple s’illumine',['Les mosaïques brillent ensemble. L’éclat du miroir apparaît. « Notre troisième éclat ! Regarde, une lumière nous montre la tour au sommet de la colline. »'])];
  if(index===3)ms=[
   talk('Link','La tour des vents',['Au sommet de la colline, des roues tournent avec le vent. Quatre paniers attendent près du mécanisme.','« Pour rallumer la tour, deux paniers doivent donner exactement la quantité indiquée », explique Zelda. « Prenons le temps de compter. »']),
   balance('Les paniers de la tour','Choisis exactement deux paniers pour obtenir le total indiqué.'),
   write('Le message du gardien','lumière','Écris ce que l’équipe veut retrouver.'),
   math('Les pierres du mécanisme','pierres','add','Le Korogu apporte deux sacs.',index,level),
   talk('Zelda','Presque au bout du voyage',['La roue se remet à tourner. Une fenêtre s’ouvre et laisse apparaître un éclat doré. « Comptons les réserves pour la dernière étape. »']),
   math('Les provisions du retour','pommes','sub','Une partie du sac sert au repas de l’équipe.',index,level),
   talk('Link','La dernière balise',['« Quatre éclats ! Le dernier est au château. Les signes que nous avons appris nous aideront à le retrouver. »'])];
  if(index===4)ms=[
   talk('Zelda','La lumière du royaume',['Vous arrivez dans la salle des balises du château. Link pose les quatre premiers éclats. Un cinquième emplacement reste sombre.','« Ces cartes portent les indices du voyage. Relions chaque lieu à ce que nous y avons découvert », propose Zelda.']),
   matching('Les souvenirs du voyage','Relie chaque lieu à son indice.',[{left:'La clairière',right:'Le carnet'},{left:'Le pont',right:'La rivière'},{left:'Le temple',right:'Le miroir'},{left:'La tour',right:'Le vent'}]),
   math('La dernière réserve','unités de lumière','cross','Le château reçoit une nouvelle livraison.',index,level),
   write('La bonne nouvelle','La forêt brille.','Écris le message pour les voyageurs.'),
   talk('Link','Tous les éclats réunis',['Zelda déchiffre le dernier signe. Une lumière blanche apparaît dans le cinquième emplacement.','« Tu as compris les indices ! Il reste à préparer les provisions pour les voyageurs qui reviennent. »']),
   math('Le repas des voyageurs','pommes','add','Le Korogu apporte les derniers paniers.',index,level),
   talk('Zelda','Merci, aventurier !',['Les cinq balises brillent au-dessus de la forêt. Link et le Korogu montrent le chemin aux voyageurs.','« Tes mots, tes calculs et tes idées nous ont aidés à rallumer le royaume. Tous les éclats resteront dans ton aventure. »'])];
 }
 return {version:ADVENTURE_VERSION,theme,chapter:index,index:0,complete:false,selections:{},missions:ms};
}
export function applySelections(ch:Chapter){for(const m of ch.missions){if(m.kind==='write'&&m.selectionKey&&ch.selections?.[m.selectionKey]){m.target=ch.selections[m.selectionKey];m.prompt=m.freeWrite?'Écris le nom que tu veux donner à ta maison.':`${m.context??''} Écris « ${m.target} » dans la case.`;}if(m.construction?.selectionKey&&ch.selections?.[m.construction.selectionKey])m.construction.material=ch.selections[m.construction.selectionKey];}}
export function validatePuzzle(spec:PuzzleSpec,answer:any):boolean{
 if(spec.type==='order')return Array.isArray(answer)&&JSON.stringify(answer)===JSON.stringify(spec.solution);
 if(spec.type==='maze'){if(!Array.isArray(answer)||answer.length<2||answer.length>100||answer[0]!==spec.start||answer.at(-1)!==spec.end)return false;const w=spec.width!,h=spec.height!;return answer.every((v,i)=>Number.isInteger(v)&&v>=0&&v<w*h&&!spec.blocked?.includes(v)&&(i===0||Math.abs(v%w-answer[i-1]%w)+Math.abs(Math.floor(v/w)-Math.floor(answer[i-1]/w))===1));}
 if(spec.type==='match'||spec.type==='symmetry'){if(!answer||typeof answer!=='object'||Array.isArray(answer))return false;const keys=Object.keys(spec.solution);return Object.keys(answer).length===keys.length&&keys.every(k=>answer[k]===spec.solution[k]);}
 if(spec.type==='balance'){if(!Array.isArray(answer)||answer.length!==2||new Set(answer).size!==2)return false;const vals=answer.map(k=>spec.items?.find(i=>i.id===k)?.value);return vals.every(v=>typeof v==='number')&&vals.reduce((a,b)=>a!+b!,0)===spec.target;}
 if(spec.type==='memory'){if(!Array.isArray(answer)||answer.length!==spec.cards!.length/2)return false;const flat=answer.flat();return new Set(flat).size===spec.cards!.length&&answer.every(pair=>Array.isArray(pair)&&pair.length===2&&Number.isInteger(pair[0])&&Number.isInteger(pair[1])&&pair[0]>=0&&pair[1]<spec.cards!.length&&pair[1]>=0&&pair[0]<spec.cards!.length&&pair[0]!==pair[1]&&spec.cards![pair[0]]===spec.cards![pair[1]]);}
 if(spec.type==='packing'){if(!answer||typeof answer!=='object'||Array.isArray(answer)||Object.keys(answer).length!==spec.pieces!.length)return false;const occupied=new Set<number>();return spec.pieces!.every(piece=>{const anchor=answer[piece.id];if(!Number.isInteger(anchor)||anchor<0||anchor>=spec.width!*spec.height!)return false;const x=anchor%spec.width!,y=Math.floor(anchor/spec.width!);if(x+piece.width>spec.width!||y+piece.height>spec.height!)return false;for(let dy=0;dy<piece.height;dy++)for(let dx=0;dx<piece.width;dx++){const cell=(y+dy)*spec.width!+x+dx;if(spec.blocked?.includes(cell)||occupied.has(cell))return false;occupied.add(cell);}return true;});}
 return false;
}
export function validateConstruction(spec:ConstructionSpec,answer:any):boolean{if(!answer||typeof answer!=='object'||Array.isArray(answer))return false;return Object.keys(answer).length===spec.targets.length&&spec.targets.every(k=>typeof answer[k]==='string'&&spec.materials.includes(answer[k])&&(spec.material==='fleur'?true:answer[k]===spec.material));}

export function upgradeNarrative(ch:Chapter){
 if(ch.version!==ADVENTURE_VERSION||ch.theme!=='dinos'||ch.chapter!==0)return;
 const m=ch.missions.find(x=>x.kind==='dialogue'&&x.title==='Qui manque à l’appel ?');
 if(m&&!m.cast?.length){m.cast=['trix','pico'];m.lines=['Avant de partir, Téo te présente ses amis : Trix, une tricératops courageuse, prépare les provisions et accompagne les petits.','Pico est leur ami ptérosaure. Avec ses ailes, il repère les chemins depuis le ciel.','Maintenant que tu les connais, aide-les à retrouver les familles.'];m.prompt=m.lines.join('\n\n');}
}
