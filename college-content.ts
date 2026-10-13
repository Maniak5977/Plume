import {COLLEGE_TOPICS,GERMAN_BEGINNER_TOPICS,type CollegeDifficulty} from './college-catalog';
import type {CollegeQuestion} from './college-types';

const int=(a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=<T,>(a:T[]):T=>a[int(0,a.length-1)];
export const shuffle=<T,>(a:T[]):T[]=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=int(0,i);[b[i],b[j]]=[b[j],b[i]];}return b;};
export function gcd(a:number,b:number):number{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;}
export function fraction(n:number,d:number):string{if(d<0){n=-n;d=-d;}const g=gcd(n,d);return d/g===1?String(n/g):`${n/g}/${d/g}`;}
const signed=(n:number)=>n<0?`(${n})`:String(n);
type Payload=Pick<CollegeQuestion,'kind'|'prompt'|'answers'|'hint'|'explanation'> & Partial<CollegeQuestion>;
function question(topic:string,x:Payload):CollegeQuestion{
  const t=COLLEGE_TOPICS.find(t=>t.id===topic);if(!t)throw new Error('Unknown college topic');
  return {...x,id:crypto.randomUUID(),topic,subject:t.subject,...(t.subject==='allemand'?{germanVersion:2}:{}),solved:false,skipped:false,help:false,attempts:0,award:0};
}
const choice=(prompt:string,answer:string,wrong:string[],hint:string,explanation:string,rest:Partial<CollegeQuestion>={}):Payload=>({kind:'choice',prompt,answers:[answer],options:shuffle(Array.from(new Set([answer,...wrong])).slice(0,4)),hint,explanation,...rest});
const numeric=(prompt:string,n:number,d:number,hint:string,explanation:string):Payload=>({kind:'number',prompt,answers:[fraction(n,d)],hint,explanation});
const text=(prompt:string,answer:string,hint:string,explanation:string,rest:Partial<CollegeQuestion>={}):Payload=>({kind:'text',prompt,answers:[answer],hint,explanation,...rest});

const EN_WORDS:[string,string][]=[['une maison','a house'],['une école','a school'],['un ami','a friend'],['un frère','a brother'],['une sœur','a sister'],['une famille','a family'],['un livre','a book'],['une carte','a map'],['un jardin','a garden'],['une fenêtre','a window'],['une porte','a door'],['un chien','a dog'],['un chat','a cat'],['de l’eau','water'],['du pain','bread'],['du lait','milk'],['une pomme','an apple'],['une ville','a city'],['un village','a village'],['une rivière','a river'],['une montagne','a mountain'],['une gare','a station'],['un train','a train'],['un billet','a ticket'],['un vélo','a bike'],['une forêt','a forest'],['une équipe','a team'],['un joueur','a player'],['un match','a match'],['un musée','a museum'],['un château','a castle'],['un pont','a bridge'],['un voyage','a trip'],['une chambre','a bedroom'],['une cuisine','a kitchen'],['une table','a table'],['une chaise','a chair'],['un ordinateur','a computer'],['un message','a message'],['une question','a question']];
const DE_WORDS:[string,string][]=[['la maison','das Haus'],['l’école','die Schule'],['l’ami','der Freund'],['le frère','der Bruder'],['la sœur','die Schwester'],['la famille','die Familie'],['le livre','das Buch'],['la carte','die Karte'],['le jardin','der Garten'],['la fenêtre','das Fenster'],['la porte','die Tür'],['le chien','der Hund'],['le chat','die Katze'],['l’eau','das Wasser'],['le pain','das Brot'],['le lait','die Milch'],['la pomme','der Apfel'],['la ville','die Stadt'],['le village','das Dorf'],['la rivière','der Fluss'],['la montagne','der Berg'],['la gare','der Bahnhof'],['le train','der Zug'],['le billet','die Fahrkarte'],['le vélo','das Fahrrad'],['la forêt','der Wald'],['l’équipe','die Mannschaft'],['le joueur','der Spieler'],['le musée','das Museum'],['le château','das Schloss'],['le pont','die Brücke'],['le voyage','die Reise'],['la chambre','das Zimmer'],['la cuisine','die Küche'],['la table','der Tisch'],['la chaise','der Stuhl'],['l’ordinateur','der Computer'],['le message','die Nachricht'],['la question','die Frage'],['le cadeau','das Geschenk']];
const EN_SUBJECTS=['I','you','he','she','we','they'];
const DE_SUBJECTS=['ich','du','er','sie','wir','ihr'];
const DE_SUBJECT_LABELS=['ich (je)','du (tu)','er (il)','sie (elle)','wir (nous)','ihr (vous, plusieurs personnes)'];
const DE_NUMBERS=['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn'];
const DE_GREETINGS:[string,string][]=[['Hallo','bonjour'],['Tschüss','au revoir'],['Danke','merci'],['Bitte','s’il te plaît'],['Ja','oui'],['Nein','non'],['Guten Morgen','bonjour, le matin'],['Guten Abend','bonsoir'],['Gute Nacht','bonne nuit'],['Bis bald','à bientôt'],['Wie geht’s?','comment ça va ?'],['Gut','bien']];
const DE_COLORS:[string,string][]=[['rot','rouge'],['blau','bleu'],['grün','vert'],['gelb','jaune'],['weiß','blanc'],['schwarz','noir'],['orange','orange'],['rosa','rose'],['braun','marron'],['lila','violet']];
function germanBeginner(topicId:string):CollegeQuestion{
 let x:Payload;
 if(topicId==='de-greetings'||topicId==='de-colors'||topicId==='de-vocab'){
  const bank: [string,string][]=topicId==='de-greetings'?DE_GREETINGS:topicId==='de-colors'?DE_COLORS:DE_WORDS.slice(0,12).map(([fr,de])=>[de,fr]);
  const [word,meaning]=pick(bank),alternatives=shuffle(bank.filter(([w])=>w!==word)).slice(0,3),lexicon=shuffle([[word,meaning],...alternatives]);
  x=choice(`Que signifie « ${word} » ?`,meaning,alternatives.map(([,fr])=>fr),'Retrouve le mot allemand dans le mini-lexique.',`« ${word} » signifie « ${meaning} ».`,{audio:{text:word,lang:'de-DE'},support:{title:'J’apprends avant de jouer',text:lexicon.map(([de,fr])=>`${de} → ${fr}`).join('\n')}});
 }else if(topicId==='de-numbers'){
  const n=int(1,10),word=DE_NUMBERS[n];
  x=numeric(`Quel nombre reconnais-tu dans « ${word} » ? Écris-le en chiffres.`,n,1,'Lis le modèle et écoute le nombre.',`« ${word} » signifie ${n}.`);
  x.audio={text:word,lang:'de-DE'};x.support={title:'Mes dix premiers nombres',text:DE_NUMBERS.slice(1,11).map((w,i)=>`${i+1} = ${w}`).join(' · ')};
 }else if(topicId==='de-sein'){
  const s=int(0,3),form=['bin','bist','ist','ist'][s],tail=pick(['hier','da','bereit','müde']),translations:Record<string,string>={hier:'ici',da:'là',bereit:'prêt',müde:'fatigué'};
  x=choice(`Choisis le mot manquant : ${DE_SUBJECTS[s]} ___ ${tail}.`,form,['bin','bist','ist'].filter(v=>v!==form),'Cherche la ligne du modèle qui commence par le même pronom.',`${DE_SUBJECTS[s]} ${form} ${tail}.`,{support:{title:'Le modèle reste avec toi',text:`ich bin = je suis\ndu bist = tu es\ner ist = il est · sie ist = elle est\n${tail} = ${translations[tail]}`}});
 }else if(topicId==='de-order'){
  const name=pick(['Anna','Mia','Lukas','Jonas','Emma','Paul','Lena','Felix','Max','Nora','Leo','Sofia']);
  x={...text(`Présente ${name} : « Je m’appelle ${name}. »`, `Ich heiße ${name}`,'Commence par Ich, puis le mot qui signifie « m’appelle », puis le prénom.',`Ich heiße ${name}. → Je m’appelle ${name}.`),kind:'order',tokens:shuffle(['Ich','heiße',name]),support:{title:'Une phrase toute simple',text:'Ich = je · heiße = m’appelle\nModèle : Ich heiße Anna.'}};
 }else{
  const names=['Anna','Mia','Lukas','Jonas','Emma','Paul','Lena','Felix','Max','Nora','Leo','Sofia'],cities=['Berlin','Hamburg','Bremen','Köln','München','Leipzig'],name=pick(names),city=pick(cities),askCity=Math.random()<.5,passage=`Hallo! Ich heiße ${name}. Ich wohne in ${city}.`,ans=askCity?city:name;
  x=choice(askCity?'Dans quelle ville habite cette personne ?':'Comment s’appelle cette personne ?',ans,shuffle((askCity?cities:names).filter(v=>v!==ans)).slice(0,3),'Repère Ich heiße pour le prénom, Ich wohne in pour la ville.',askCity?`Ich wohne in ${city}. → J’habite à ${city}.`:`Ich heiße ${name}. → Je m’appelle ${name}.`,{context:passage,audio:{text:passage,lang:'de-DE'},support:{title:'Deux repères pour comprendre',text:'Hallo = bonjour\nIch heiße… = Je m’appelle…\nIch wohne in… = J’habite à…'}});
 }
 return question(topicId,x);
}
function germanNumber(n:number):string{if(n<20)return DE_NUMBERS[n];if(n===100)return 'hundert';const tens=['','','zwanzig','dreißig','vierzig','fünfzig','sechzig','siebzig','achtzig','neunzig'][Math.floor(n/10)];return n%10?(n%10===1?'ein':DE_NUMBERS[n%10])+'und'+tens:tens;}
const EN_ACTIONS:[string,string,string][]=[['play','plays','tennis'],['read','reads','books'],['visit','visits','museums'],['watch','watches','films'],['like','likes','music'],['go','goes','to school'],['study','studies','English'],['help','helps','friends'],['eat','eats','apples'],['take','takes','the train']];
const DE_ACTIONS:{inf:string;forms:string[];tail:string}[]=[
  {inf:'spielen',forms:['spiele','spielst','spielt','spielt','spielen','spielt'],tail:'Fußball'},
  {inf:'lernen',forms:['lerne','lernst','lernt','lernt','lernen','lernt'],tail:'Deutsch'},
  {inf:'wohnen',forms:['wohne','wohnst','wohnt','wohnt','wohnen','wohnt'],tail:'in Berlin'},
  {inf:'machen',forms:['mache','machst','macht','macht','machen','macht'],tail:'Sport'},
  {inf:'kaufen',forms:['kaufe','kaufst','kauft','kauft','kaufen','kauft'],tail:'Brot'},
  {inf:'kommen',forms:['komme','kommst','kommt','kommt','kommen','kommt'],tail:'aus Frankreich'},
  {inf:'lesen',forms:['lese','liest','liest','liest','lesen','lest'],tail:'ein Buch'},
  {inf:'fahren',forms:['fahre','fährst','fährt','fährt','fahren','fahrt'],tail:'nach Hamburg'},
];

const FR_AGREEMENTS:[string,string,string][]=[
 ['Les portes sont ___ (ouvert).','ouvertes','portes est féminin pluriel'],['Ces robots sont ___ (rapide).','rapides','robots est masculin pluriel'],['La lumière est ___ (bleu).','bleue','lumière est féminin singulier'],['Les exploratrices sont ___ (prudent).','prudentes','exploratrices est féminin pluriel'],['Ces chemins sont ___ (étroit).','étroits','chemins est masculin pluriel'],['Une montagne ___ (haut) se dresse devant nous.','haute','montagne est féminin singulier'],['Des oiseaux ___ (noir) traversent le ciel.','noirs','oiseaux est masculin pluriel'],['La salle est ___ (silencieux).','silencieuse','salle est féminin singulier'],['Les batteries sont ___ (plein).','pleines','batteries est féminin pluriel'],['Une équipe ___ (sportif) nous rejoint.','sportive','équipe est féminin singulier'],['Des ___ (animal) vivent dans cette forêt.','animaux','animal fait son pluriel en animaux'],['Ces ___ (journal) donnent les résultats.','journaux','journal fait son pluriel en journaux'],['De ___ (beau) plantes poussent ici.','belles','plantes est féminin pluriel'],['Les nouveaux abris sont ___ (solide).','solides','abris est masculin pluriel'],['Une idée ___ (original) nous aide.','originale','idée est féminin singulier'],['Ces ___ (cheval) courent dans le pré.','chevaux','cheval fait son pluriel en chevaux']];
const FR_HOMOPHONES:[string,string,string,string[]][]=[
 ['Léo ___ reçu un message.','a','On peut remplacer a par avait.',['à','as']],['Nora va ___ la station.','à','À introduit le lieu ; ce n’est pas le verbe avoir.',['a','as']],['Le hangar ___ fermé.','est','On peut remplacer est par était.',['et','es']],['Nora ___ Léo travaillent ensemble.','et','Et relie les deux noms.',['est','es']],['Les capteurs ___ prêts.','sont','On peut remplacer sont par étaient.',['son','sons']],['Léo range ___ carnet.','son','Son accompagne le nom carnet.',['sont','sons']],['___ habite Nora ?','Où','On demande un lieu.',['Ou','Ous']],['Tu choisis le train ___ le vélo ?','ou','On propose un choix.',['où','ont']],['Léo montre les batteries : « ___ batteries fonctionnent encore. » Choisis le déterminant démonstratif.','Ces','Ces désigne les batteries que l’on montre.',['Ses','C’est']],['Nora range ___ outils dans son sac. Choisis le déterminant possessif : les outils appartiennent à Nora.','ses','Les outils appartiennent à Nora.',['ces','c’est']],['___ sommes arrivés avant la nuit.','Nous','Nous est le sujet de sommes.',['On','Ont']],['Ils ___ trouvé une solution.','ont','On peut remplacer ont par avaient.',['on','ons']],['___ espère réussir la mission.','On','On est un pronom sujet.',['Ont','Ons']],['Ce matin, ___ soleil éclaire la vallée.','le','Le est le déterminant du nom soleil.',['les','la']]];
const FR_CLASS:[string,string,string][]=[['Le petit robot avance.','petit','adjectif'],['Nora lit rapidement.','rapidement','adverbe'],['Ils arrivent demain.','Ils','pronom'],['Ce carnet contient un plan.','Ce','déterminant'],['Léo prépare le repas.','prépare','verbe'],['La station est calme.','station','nom'],['Nora et Léo discutent.','et','conjonction de coordination'],['Le sac est sous la table.','sous','préposition'],['Cette lumière brille.','Cette','déterminant'],['Nous comprenons le message.','Nous','pronom'],['Une grande porte s’ouvre.','grande','adjectif'],['Léo marche lentement.','lentement','adverbe'],['Le train traverse la ville.','traverse','verbe'],['La carte indique un pont.','pont','nom'],['Nora attend devant le hangar.','devant','préposition'],['Il pleut mais nous avançons.','mais','conjonction de coordination']];
const FR_FUNCTIONS:[string,string,string,string][]=[
 ['Nora répare la radio.','Nora','sujet','Qui est-ce qui répare ? Nora.'],['Léo lit le message.','le message','COD','Léo lit quoi ? Le message.'],['Nous arriverons demain.','demain','complément circonstanciel de temps','Demain précise quand nous arriverons.'],['Les robots travaillent dans le hangar.','dans le hangar','complément circonstanciel de lieu','Ce groupe précise où les robots travaillent.'],['Le guide montre le chemin.','le chemin','COD','Le guide montre quoi ? Le chemin.'],['Les explorateurs préparent le départ.','Les explorateurs','sujet','Qui est-ce qui prépare ? Les explorateurs.'],['À midi, Nora ferme la porte.','À midi','complément circonstanciel de temps','À midi situe l’action dans le temps.'],['Nous attendons près du pont.','près du pont','complément circonstanciel de lieu','Ce groupe précise le lieu de l’attente.'],['Les capteurs mesurent la température.','la température','COD','Les capteurs mesurent quoi ? La température.'],['Une lumière clignote sur le tableau.','Une lumière','sujet','Qui est-ce qui clignote ? Une lumière.'],['Chaque soir, Léo écrit.','Chaque soir','complément circonstanciel de temps','Ce groupe répond à quand.'],['Le carnet repose sur la table.','sur la table','complément circonstanciel de lieu','Ce groupe répond à où.']];
const FR_READINGS:{text:string;prompt:string;answer:string;wrong:string[];why:string}[]=[
 {text:'Nora s’approcha du pont. Une planche céda sous son premier pas. Elle recula, sortit une corde de son sac et chercha un autre passage.',prompt:'Pourquoi Nora recule-t-elle ?',answer:'Le pont semble dangereux.',wrong:['Elle a oublié son sac.','Elle veut traverser plus vite.','Elle a terminé son voyage.'],why:'La planche qui cède révèle le danger ; Nora cherche ensuite un autre passage.'},
 {text:'Le message annonçait un départ à dix heures. Léo regarda sa montre : neuf heures cinquante. Il accéléra le pas vers la gare.',prompt:'Que peut-on déduire ?',answer:'Léo dispose de dix minutes avant le départ.',wrong:['Léo a déjà raté le train.','Le départ est dans une heure.','Léo arrive après dix heures.'],why:'De 9 h 50 à 10 h, il reste dix minutes.'},
 {text:'Le capteur affichait une température élevée. Pourtant, la salle était fraîche. Nora compara le résultat à celui d’un autre thermomètre avant de décider.',prompt:'Pourquoi Nora compare-t-elle les mesures ?',answer:'Elle veut vérifier une mesure étonnante.',wrong:['Elle veut réchauffer la salle.','Elle connaît déjà la réponse avec certitude.','Elle a oublié comment lire un nombre.'],why:'L’écart entre l’affichage et la fraîcheur de la salle justifie une vérification.'},
 {text:'Léo affirma que le hangar était vide. Nora aperçut pourtant des traces récentes et entendit un bruit derrière les caisses.',prompt:'Quels indices contredisent Léo ?',answer:'Les traces récentes et le bruit.',wrong:['La couleur des murs.','L’absence de fenêtre.','Le nom de Nora.'],why:'Ces deux observations suggèrent une présence dans le hangar.'},
 {text:'Nora savait que la radio fonctionnait hier. Elle remarqua un câble débranché, le reconnecta, puis lança un essai. Un signal retentit.',prompt:'Quel lien le texte suggère-t-il ?',answer:'Le câble débranché empêchait la radio de fonctionner.',wrong:['La radio n’a jamais fonctionné.','Le signal vient du jardin.','Nora a remplacé toute la station.'],why:'La remise en place du câble est suivie du retour du signal.'},
 {text:'Le guide demanda aux visiteurs de parler doucement et de ne pas toucher les objets. Dans les vitrines, des outils anciens racontaient la vie des explorateurs.',prompt:'Dans quel lieu la scène se déroule-t-elle probablement ?',answer:'Un musée.',wrong:['Une piscine.','Un stade.','Une boulangerie.'],why:'Les vitrines, les objets anciens et les consignes du guide sont des indices d’un musée.'},
 {text:'L’équipe voulait partir sans attendre. Mais le vent forçait et les nuages masquaient déjà les sommets. Nora proposa d’attendre au refuge.',prompt:'Quelle qualité sa décision montre-t-elle ?',answer:'La prudence.',wrong:['L’impatience.','L’indifférence.','La vantardise.'],why:'Elle prend en compte la météo pour éviter une situation dangereuse.'},
 {text:'La porte était bloquée. Nora examina la poignée pendant que Léo cherchait une autre entrée. Quelques minutes plus tard, ils se retrouvèrent à l’intérieur.',prompt:'Comment l’équipe cherche-t-elle une solution ?',answer:'Les deux membres essaient des approches différentes.',wrong:['Ils abandonnent immédiatement.','Ils attendent sans rien faire.','Ils se disputent.'],why:'Nora examine la poignée tandis que Léo cherche une autre entrée.'},
 {text:'Le carnet décrivait un arbre isolé près d’une rivière. Sur la carte, deux lieux correspondaient. Léo relut la dernière ligne : « Le pont est à l’ouest. »',prompt:'À quoi sert la dernière ligne ?',answer:'À départager deux lieux possibles.',wrong:['À changer l’heure du rendez-vous.','À annoncer un danger certain.','À décrire la couleur de l’arbre.'],why:'L’indication du pont donne un nouvel indice pour identifier le bon lieu.'},
 {text:'Une équipe britannique demanda les résultats en anglais. Léo prépara une traduction, puis la relut avec Nora pour vérifier les nombres et les horaires.',prompt:'Pourquoi relisent-ils ensemble ?',answer:'Pour rendre le message fiable.',wrong:['Pour supprimer tous les nombres.','Pour retarder volontairement le départ.','Pour modifier les résultats.'],why:'Ils vérifient les informations qui doivent rester exactes dans la traduction.'},
];
const FR_VERBS:{inf:string;present:string[];imperfect:string[];future:string[];past:string[]}[]=[
 {inf:'parler',present:['parle','parles','parle','parlons','parlez','parlent'],imperfect:['parlais','parlais','parlait','parlions','parliez','parlaient'],future:['parlerai','parleras','parlera','parlerons','parlerez','parleront'],past:['ai parlé','as parlé','a parlé','avons parlé','avez parlé','ont parlé']},
 {inf:'choisir',present:['choisis','choisis','choisit','choisissons','choisissez','choisissent'],imperfect:['choisissais','choisissais','choisissait','choisissions','choisissiez','choisissaient'],future:['choisirai','choisiras','choisira','choisirons','choisirez','choisiront'],past:['ai choisi','as choisi','a choisi','avons choisi','avez choisi','ont choisi']},
 {inf:'prendre',present:['prends','prends','prend','prenons','prenez','prennent'],imperfect:['prenais','prenais','prenait','prenions','preniez','prenaient'],future:['prendrai','prendras','prendra','prendrons','prendrez','prendront'],past:['ai pris','as pris','a pris','avons pris','avez pris','ont pris']},
 {inf:'faire',present:['fais','fais','fait','faisons','faites','font'],imperfect:['faisais','faisais','faisait','faisions','faisiez','faisaient'],future:['ferai','feras','fera','ferons','ferez','feront'],past:['ai fait','as fait','a fait','avons fait','avez fait','ont fait']},
];

export function makeCollegeQuestion(topicId:string,difficulty:CollegeDifficulty='cinquieme'):CollegeQuestion {
  if(difficulty==='revision'&&GERMAN_BEGINNER_TOPICS.includes(topicId))return germanBeginner(topicId);
  const base=difficulty==='revision';let x:Payload;
  const a=int(3,base?10:20),b=int(2,9),c=int(2,8);
  if(topicId==='math-priorities'){
    const par=!base&&Math.random()<.5,n=par?(a+b)*c:a+b*c;
    x=numeric(par?`(${a} + ${b}) × ${c} = ?`:`${a} + ${b} × ${c} = ?`,n,1,par?'Commence par la parenthèse.':'Effectue la multiplication avant l’addition.',par?`${a} + ${b} = ${a+b}, puis ${a+b} × ${c} = ${n}.`:`${b} × ${c} = ${b*c}, puis ${a} + ${b*c} = ${n}.`);
  }else if(topicId==='math-signed'){
    const u=-a,v=int(-12,18);
    x=base?choice(`Quel nombre est le plus grand : ${u} ou ${-b} ?`,String(Math.max(u,-b)),[String(Math.min(u,-b)),'Ils sont toujours égaux.'],'Le plus grand est le plus à droite sur la droite graduée.',`${Math.max(u,-b)} est plus grand que ${Math.min(u,-b)}.`):numeric(`${signed(u)} + ${signed(v)} = ?`,u+v,1,'Additionner un négatif déplace vers la gauche ; un positif vers la droite.',`En partant de ${u}, on se déplace de ${Math.abs(v)} vers la ${v<0?'gauche':'droite'} : on arrive à ${u+v}.`);
    if(base&&a===b)return makeCollegeQuestion(topicId,difficulty);
  }else if(topicId==='math-fractions'){
    const d1=pick([2,3,4,5,6,8]),d2=base?d1:pick([2,3,4,5,6,8]),n1=int(1,d1+2),n2=int(1,d2),minus=!base&&Math.random()<.35;
    const n=n1*d2+(minus?-1:1)*n2*d1,d=d1*d2;
    x=numeric(`${n1}/${d1} ${minus?'−':'+'} ${n2}/${d2} = ?`,n,d,'Mets les deux fractions au même dénominateur ; une fraction équivalente est acceptée.',`${n1}/${d1} = ${n1*d2}/${d} et ${n2}/${d2} = ${n2*d1}/${d}. Le résultat est ${fraction(n,d)}.`);
  }else if(topicId==='math-proportion'){
    const unit=int(3,12),qty=int(2,8),wanted=int(9,15);
    x=numeric(`${qty} billets coûtent ${qty*unit} €. Au même tarif, combien coûtent ${wanted} billets ? Réponds en euros.`,wanted*unit,1,'Trouve le prix d’un billet, puis multiplie par la quantité demandée.',`${qty*unit} ÷ ${qty} = ${unit} € par billet ; ${wanted} × ${unit} = ${wanted*unit} €.`);
  }else if(topicId==='math-percent'){
    const price=int(4,base?15:40)*10,pct=pick(base?[10,50]:[10,15,20,25,30,40,50]),discount=price*pct/100,final=!base&&Math.random()<.5;
    x=numeric(final?`Un équipement coûte ${price} €. Son prix baisse de ${pct} %. Quel est le nouveau prix en euros ?`:`Calcule ${pct} % de ${price}.`,final?price-discount:discount,1,'Calcule la part en multipliant par le pourcentage et en divisant par 100. Pour le prix final, soustrais ensuite cette part.',`${price} × ${pct} ÷ 100 = ${discount}.${final?` Le prix final est ${price} − ${discount} = ${price-discount} €.`:''}`);
  }else if(topicId==='math-powers'){
    const k=int(2,base?10:15),exp=base?2:pick([2,3]);
    x=numeric(`${k}${exp===2?'²':'³'} = ?`,k**exp,1,'Multiplie la base par elle-même autant de fois que l’indique l’exposant.',`${Array(exp).fill(k).join(' × ')} = ${k**exp}.`);
  }else if(topicId==='math-algebra'){
    const v=int(1,base?6:15),coef=int(2,base?4:8),offset=int(1,16);
    x=numeric(`Pour x = ${v}, calcule ${coef}x + ${offset}.`,coef*v+offset,1,`${coef}x signifie ${coef} × x. Remplace x par sa valeur.`,`${coef} × ${signed(v)} + ${offset} = ${coef*v} + ${offset} = ${coef*v+offset}.`);
  }else if(topicId==='math-geometry'){
    const which=int(0,base?1:3);
    if(which===0){const angle1=int(3,8)*10,angle2=int(2,7)*10;x=numeric(`Un triangle a deux angles de ${angle1}° et ${angle2}°. Combien mesure le troisième angle ? Réponds en degrés.`,180-angle1-angle2,1,'Les trois angles ont pour somme 180°.',`180 − ${angle1} − ${angle2} = ${180-angle1-angle2}°.`);}
    else if(which===1){const len=int(3,16),height=int(3,12);x=numeric(`Un triangle a une base de ${len} cm et une hauteur correspondante de ${height} cm. Quelle est son aire en cm² ?`,len*height,2,'Aire d’un triangle = base × hauteur ÷ 2.',`${len} × ${height} ÷ 2 = ${len*height/2} cm².`);}
    else if(which===2)x=numeric(`Un parallélogramme a une base de ${a} cm et une hauteur correspondante de ${b} cm. Quelle est son aire en cm² ?`,a*b,1,'Multiplie la base par la hauteur correspondante.',`${a} × ${b} = ${a*b} cm².`);
    else x=numeric(`Un pavé droit mesure ${a} cm × ${b} cm × ${c} cm. Quel est son volume en cm³ ?`,a*b*c,1,'Volume d’un pavé droit = longueur × largeur × hauteur.',`${a} × ${b} × ${c} = ${a*b*c} cm³.`);
  }else if(topicId==='math-coordinates'){
    const px=int(-4,4),py=int(-4,4);if(px===py)return makeCollegeQuestion(topicId,difficulty);
    x=choice('Quelles sont les coordonnées du point P ?',`(${px} ; ${py})`,[`(${py} ; ${px})`,`(${-px} ; ${-py})`,`(${px} ; ${-py})`,`(${-px} ; ${py})`],'Lis d’abord l’axe horizontal, puis l’axe vertical.',`L’abscisse est ${px} et l’ordonnée ${py} : P(${px} ; ${py}).`,{diagram:{type:'coordinates',x:px,y:py}});
  }else if(topicId==='math-statistics'){
    const center=int(7,16),delta=int(1,5),values=shuffle([center-delta,center,center+delta]);
    x=numeric(`Voici trois résultats : ${values.join(' ; ')}. Quelle est leur moyenne ?`,center,1,'Additionne les trois résultats et divise la somme par 3.',`(${values.join(' + ')}) ÷ 3 = ${center*3} ÷ 3 = ${center}.`);
  }else if(topicId==='math-probability'){
    const red=int(2,9),blue=int(2,9);x=numeric(`Un sac contient ${red} jetons rouges et ${blue} jetons bleus. On tire un jeton au hasard ; tous ont la même chance. Quelle est la probabilité de tirer un rouge ?`,red,red+blue,'Écris le nombre de jetons rouges sur le nombre total de jetons.',`${red} issues favorables sur ${red+blue} issues possibles : ${fraction(red,red+blue)}.`);
  }else if(topicId==='fr-agreements'){
    const [prompt,ans,rule]=pick(FR_AGREEMENTS);x=text(`Complète avec le mot correctement accordé : ${prompt}`,ans,'Repère le genre et le nombre du nom.',`${rule}. La forme attendue est « ${ans} ».`);
  }else if(topicId==='fr-homophones'){
    const [prompt,ans,why,wrong]=pick(FR_HOMOPHONES);x=choice(`Choisis le mot qui complète : ${prompt}`,ans,wrong,'Identifie le rôle du mot : verbe, pronom, déterminant ou mot de liaison.',why);
  }else if(topicId==='fr-classes'){
    const [sentence,word,ans]=pick(FR_CLASS),classes=['nom','verbe','adjectif','adverbe','pronom','déterminant','préposition','conjonction de coordination'];x=choice(`Quelle est la classe du mot « ${word} » ?`,ans,shuffle(classes.filter(x=>x!==ans)).slice(0,3),'Cherche ce qu’est le mot, plutôt que son rôle dans cette phrase.',`« ${word} » est ${ans==='adjectif'||ans==='adverbe'?'un':'un mot de la classe'} ${ans}.`,{context:sentence});
  }else if(topicId==='fr-functions'){
    const [sentence,group,ans,why]=pick(FR_FUNCTIONS);x=choice(`Quelle est la fonction de « ${group} » ?`,ans,['sujet','COD','complément circonstanciel de lieu','complément circonstanciel de temps'].filter(x=>x!==ans),'Cherche le rôle du groupe dans la phrase.',why,{context:sentence});
  }else if(topicId==='fr-verbs'){
    const verb=pick(FR_VERBS),s=int(0,5),time=pick(base?['present','imperfect'] as const:['present','imperfect','future','past'] as const),subjects=['Je','Tu','Il','Nous','Vous','Ils'],times={present:'présent',imperfect:'imparfait',future:'futur simple',past:'passé composé'};
    const full=s===0&&/^[aeiouéèêîïôùûü]/i.test(verb[time][s])?`J’${verb[time][s]}`:`${subjects[s]} ${verb[time][s]}`;
    x=text(`Conjugue ${verb.inf} au ${times[time]} pour le sujet « ${subjects[s]} ». Écris seulement la forme verbale.`,verb[time][s],`Repère le sujet « ${subjects[s]} » et le temps demandé.`,`${full} : ${times[time]} de ${verb.inf}.`);
  }else if(topicId==='fr-reading'){
    const r=pick(FR_READINGS);x=choice(r.prompt,r.answer,r.wrong,'Appuie ta réponse sur les indices du texte.',r.why,{context:r.text});
  }else if(topicId==='de-greetings'||topicId==='de-colors'){
    const bank=topicId==='de-greetings'?DE_GREETINGS:DE_COLORS,[word,meaning]=pick(bank);
    x=text(`Écris en allemand : ${meaning}.`,word,'Repense au mot que tu as appris dans les premiers pas.',`On écrit « ${word} ».`,{audio:{text:meaning,lang:'fr-FR'}});
  }else if(topicId==='en-vocab'||topicId==='de-vocab'){
    const de=topicId.startsWith('de'),bank=de?DE_WORDS:EN_WORDS,[fr,target]=pick(bank),lang=de?'de-DE':'en-GB';
    if(Math.random()<.45){const wrong=shuffle(bank.filter(x=>x[1]!==target)).slice(0,3).map(x=>x[0]);x=choice('Écoute le mot. Que signifie-t-il ?',fr,wrong,'Écoute une nouvelle fois et compare les propositions.',`« ${target} » signifie « ${fr} ».`,{audio:{text:target,lang},audioOnly:true});}
    else {x=text(`Écris en ${de?'allemand, avec l’article':'anglais, avec l’article si nécessaire'} : ${fr}.`,target,de?'Pense à l’article et à la majuscule du nom.':'Pense au nom et à son article si la consigne en contient un.',`On écrit « ${target} ».`,{strictCase:de});if(de)x.answers.push(target[0].toUpperCase()+target.slice(1));else {const variants:Record<string,string[]>={'a bike':['a bicycle'],'a city':['a town'],'a trip':['a journey'],'a bedroom':['a room']};x.answers.push(...(variants[target]??[]));}}
  }else if(topicId==='de-numbers'){
    const n=int(1,base?20:100),word=germanNumber(n);x=numeric(`Écris en chiffres le nombre allemand « ${word} ».`,n,1,'Les unités viennent avant les dizaines : zweiunddreißig = 32. Pour les premiers nombres, consulte le rappel de cours.',`« ${word} » signifie ${n}.`);x.audio={text:word,lang:'de-DE'};
  }else if(topicId==='en-be'||topicId==='en-have'){
    const s=int(0,5),isBe=topicId==='en-be',form=isBe?['am','are','is','is','are','are'][s]:['have','have','has','has','have','have'][s],tail=isBe?pick(['ready','happy','tired','at school','in London','near the station']):pick(['a map','a ticket','a book','a dog','a plan','a bike']);
    x=text(`Complète avec ${isBe?'be':'have'} : ${EN_SUBJECTS[s]} ___ ${tail}.`,form,'Repère le sujet : la troisième personne du singulier a sa propre forme.',`${EN_SUBJECTS[s]} ${form} ${tail}.`,{audio:{text:`${EN_SUBJECTS[s]} ... ${tail}.`,lang:'en-GB'}});
  }else if(topicId==='en-present'){
    const s=int(0,5),v=pick(EN_ACTIONS);x=text(`Conjugue ${v[0]} au présent simple : ${EN_SUBJECTS[s]} ___ ${v[2]}.`,s===2||s===3?v[1]:v[0],'He et she demandent généralement une terminaison particulière.',`${EN_SUBJECTS[s]} ${s===2||s===3?v[1]:v[0]} ${v[2]}.`);
  }else if(topicId==='en-questions'){
    const s=int(0,5),v=pick(EN_ACTIONS),ans=s===2||s===3?'Does':'Do';x=choice(`Complète la question : ___ ${EN_SUBJECTS[s]} ${v[0]} ${v[2]}?`,ans,['Do','Does','Is','Are'].filter(x=>x!==ans),'Au présent simple, choisis do ou does selon le sujet.',`${ans} ${EN_SUBJECTS[s]} ${v[0]} ${v[2]}? Le verbe reste à sa base après l’auxiliaire.`);
  }else if(topicId==='en-past'){
    const bank:[string,string,string][]=[['play','played','tennis'],['visit','visited','a museum'],['watch','watched','a film'],['help','helped','a friend'],['go','went','to London'],['see','saw','a castle'],['take','took','the train'],['eat','ate','an apple'],['make','made','a cake'],['have','had','a lesson']],v=pick(base?bank.slice(0,4):bank),s=pick(EN_SUBJECTS);
    x=text(`Conjugue ${v[0]} au past simple : Yesterday, ${s} ___ ${v[2]}.`,v[1],'Yesterday situe l’action dans le passé. Le verbe peut être régulier ou irrégulier.',`Yesterday, ${s} ${v[1]} ${v[2]}.`);
  }else if(topicId==='en-reading'){
    const names=['Maya','Leo','Anna','Oliver','Emily','Sam','Noah','Lily'],name=pick(names),city=pick(['London','Bristol','York','Oxford','Manchester','Bath']),hour=int(2,8),activity=pick(['visit a museum','play tennis','read a book','meet my friends']),past=!base;
    const passage=past?`Hi! I am ${name}. Last Saturday, I went to ${city} with my family. We visited a museum at ${hour} o’clock. Next weekend, I want to ${activity}.`:`My name is ${name}. I live in ${city}. I like to ${activity}. I meet my friends at ${hour} o’clock.`;
    const ask=int(0,2),ans=ask===0?name:ask===1?city:String(hour),wrong=ask===0?names.filter(x=>x!==name):ask===1?['London','Bristol','York','Oxford','Manchester','Bath'].filter(x=>x!==city):[String(hour+1),String(hour+2),String(hour-1)];
    x=choice(ask===0?'Comment s’appelle la personne ?':ask===1?past?'Dans quelle ville est-elle allée ?':'Dans quelle ville vit-elle ?':past?'À quelle heure a eu lieu la visite ?':'À quelle heure retrouve-t-elle ses amis ?',ans,shuffle(wrong).slice(0,3),'Repère le nom, le lieu ou l’heure dans le texte.',ask===0?`« I am ${name} » ou « My name is ${name} » présente la personne.`:ask===1?`Le texte nomme ${city}.`:`« at ${hour} o’clock » indique ${hour} heures.`,{context:passage,audio:{text:passage,lang:'en-GB'}});
  }else if(topicId==='de-sein'||topicId==='de-haben'||topicId==='de-modal'){
    const s=int(0,5),which=topicId==='de-sein'?'sein':topicId==='de-haben'?'haben':'können',form=which==='sein'?['bin','bist','ist','ist','sind','seid'][s]:which==='haben'?['habe','hast','hat','hat','haben','habt'][s]:['kann','kannst','kann','kann','können','könnt'][s],tail=which==='sein'?pick(['hier','bereit','müde','in Berlin','in der Schule','zu Hause']):which==='haben'?pick(['eine Karte','ein Buch','einen Hund','Zeit','ein Fahrrad','einen Plan']):pick(['morgen kommen','Deutsch lernen','Fußball spielen','Musik hören','nach Berlin fahren']);
    x=text(`Complète avec ${which}, pour ${DE_SUBJECT_LABELS[s]} : ${DE_SUBJECTS[s]} ___ ${tail}.`,form,'Choisis la forme qui correspond au sujet.',`${DE_SUBJECTS[s][0].toUpperCase()+DE_SUBJECTS[s].slice(1)} ${form} ${tail}.`);
  }else if(topicId==='de-present'){
    const s=int(0,5),v=pick(base?DE_ACTIONS.slice(0,6):DE_ACTIONS);x=text(`Conjugue ${v.inf} au présent pour ${DE_SUBJECT_LABELS[s]} : ${DE_SUBJECTS[s]} ___ ${v.tail}.`,v.forms[s],'Pars du radical puis choisis la terminaison. Attention aux verbes qui changent de voyelle.',`${DE_SUBJECTS[s][0].toUpperCase()+DE_SUBJECTS[s].slice(1)} ${v.forms[s]} ${v.tail}.`);
  }else if(topicId==='de-order'){
    const v=pick(DE_ACTIONS),starter=pick(['Heute','Morgen','Am Samstag']),s=base?pick([0,4]):int(0,5),sentence=`${starter} ${v.forms[s]} ${DE_SUBJECTS[s]} ${v.tail}`;
    x={...text(`Remets les groupes dans l’ordre en commençant par « ${starter} ».`,sentence,'Après le groupe de temps, place le verbe conjugué puis le sujet.',`${sentence}. Le verbe conjugué reste en deuxième position.`),kind:'order',tokens:shuffle([starter,v.forms[s],DE_SUBJECTS[s],v.tail])};
  }else if(topicId==='de-reading'){
    const names=['Anna','Lukas','Mia','Jonas','Emma','Paul','Lena','Felix'],cities=['Berlin','Hamburg','Bremen','Köln','München','Leipzig'],name=pick(names),city=pick(cities),age=int(11,15),hour=int(2,8),activity=pick(['Fußball','Tennis','Musik']);
    const passage=`Hallo! Ich heiße ${name}. Ich bin ${age} Jahre alt und wohne in ${city}. Ich mag ${activity}.${base?'':` Am Samstag treffe ich meine Freunde um ${hour} Uhr.`}`;
    const ask=int(0,base?2:3),ans=ask===0?name:ask===1?city:ask===2?String(age):String(hour),wrong=ask===0?names.filter(x=>x!==name):ask===1?cities.filter(x=>x!==city):[String(Number(ans)+1),String(Number(ans)+2),String(Number(ans)-1)];
    x=choice(ask===0?'Comment s’appelle la personne ?':ask===1?'Dans quelle ville vit-elle ?':ask===2?'Quel âge a-t-elle ?':'À quelle heure retrouve-t-elle ses amis le samedi ?',ans,shuffle(wrong).slice(0,3),'Ich heiße présente le prénom ; wohne indique la ville ; Jahre alt indique l’âge ; Uhr indique l’heure.',`Le texte indique ${ans}.${ask===3?` « um ${hour} Uhr » signifie « à ${hour} heures ».`:''}`,{context:passage,audio:{text:passage,lang:'de-DE'}});
  }else throw new Error('Unknown college generator');
  return question(topicId,x);
}

export function storyQuestion(topic:string,payload:Payload):CollegeQuestion{return question(topic,payload);}
