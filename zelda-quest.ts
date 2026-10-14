import {STORIES} from './catalog';
import {storyQuestion} from './college-content';
import {adventureCurriculum,courseQuestion} from './adventure-curriculum';
import {ZELDA_YEAR,ZELDA_ARCS,yearPhase} from './quest-year';
import {independentPuzzle} from './quest-puzzles';
import type {Profile} from './game';
import type {CollegeAdventure,CollegeMission,CollegeQuestion,AdventureCurriculum} from './college-types';

export const ZELDA_RELICS=ZELDA_YEAR.map((c,i)=>i<5?['Éclat de la clairière','Éclat du passage','Éclat du miroir','Éclat du vent','Éclat du royaume'][i]:`Sceau de ${c.place.toLowerCase()}`);
export const ZELDA_PLACES=ZELDA_YEAR.map(c=>c.place);
export const ZELDA_INTROS=ZELDA_YEAR.map((c,i)=>i===0?[
 'Link explore les chemins du royaume. Zelda déchiffre les anciens signes. Un Korogu, esprit de la forêt, connaît les passages cachés. Les balises qui guidaient les voyageurs viennent de s’éteindre.',
 'Tu rejoins leur équipe pour une grande quête : six régions et 36 chapitres. Chaque région possède des sceaux à retrouver. Tes apprentissages, tes calculs et tes décisions aideront le royaume à retrouver ses chemins.'
]:[`L’équipe rejoint ${c.place.toLowerCase()}, dans ${ZELDA_ARCS[yearPhase(i)].toLowerCase()}. La carte indique une nouvelle étape : ${c.goal[0].toLowerCase()+c.goal.slice(1)}.`,c.clue]);

export function contextualQuestion(c:AdventureCurriculum,subject:CollegeQuestion['subject'],offset:number,chapter:number,exclude:CollegeQuestion[]=[]):CollegeQuestion{
 let q=courseQuestion(c,subject,offset,exclude);const meta=ZELDA_YEAR[chapter];
 if(subject==='maths'){
  const descriptions:Record<string,string>={
   'math-priorities':'Les runes du mécanisme forment une expression : les priorités indiquent comment calculer le bon réglage.',
   'math-signed':'Le relevé de la balise utilise des nombres positifs et négatifs. Lis les signes avant de régler le compteur.',
   'math-fractions':'Les réserves de lumière sont mesurées en parts. Calcule la part indiquée par les runes.',
   'math-proportion':'Le marchand prépare des lots identiques de minerai. Son tarif est indiqué sur le registre.',
   'math-percent':'Un artisan propose un équipement à Link. Vérifie la part ou la réduction demandée.',
   'math-powers':'Le mécanisme organise ses éléments en carrés ou en cubes. Calcule la quantité demandée.',
   'math-algebra':'Zelda utilise x pour représenter une quantité variable. Remplace x par la valeur du relevé.',
   'math-geometry':'Le plan du sanctuaire indique les angles ou les dimensions de ses pièces. Vérifie la mesure manquante.',
   'math-coordinates':'Sur le plan des ruines, le point P indique un emplacement. Lis son abscisse puis son ordonnée.',
   'math-statistics':'Les gardiens ont relevé plusieurs résultats. Calcule la moyenne pour régler la balise.',
   'math-probability':'Un sac de runes contient plusieurs couleurs. Évalue la probabilité demandée avant de choisir un signal.',
  };
  q.context=descriptions[q.topic];
  if(q.topic==='math-proportion')for(const key of ['prompt','hint','explanation'] as const)q[key]=q[key].replace(/billets/g,'lots de minerai').replace(/billet/g,'lot de minerai').replace(/€/g,'rubis').replace(/euros/g,'rubis');
 }else if(subject==='francais'){
  for(const key of ['prompt','context','hint','explanation'] as const)if(q[key])q[key]=q[key]!.replace(/Nora/g,'Zelda').replace(/Léo/g,'Link');
  q.answers=q.answers.map(a=>a.replace(/Nora/g,'Zelda').replace(/Léo/g,'Link'));
  q.options=q.options?.map(a=>a.replace(/Nora/g,'Zelda').replace(/Léo/g,'Link'));
 }else if(subject==='anglais'&&q.topic==='en-reading'){
  const base=c.levels.anglais==='revision';
  const passage=base?`The team is near the ${['forest','bridge','temple','tower','castle','village'][chapter%6]}. The old path is closed. We must use the new path.`:`Yesterday, our team found an old map near the ${['forest','bridge','temple','tower','castle','village'][chapter%6]}. It showed two routes. We followed the eastern route because the bridge on the western route was broken. Tonight, we are staying with a village guide. Tomorrow, we will carry the supplies to the next tower.`;
  q=storyQuestion('en-reading',{kind:'choice',context:passage,audio:{text:passage,lang:'en-GB'},prompt:base?'Quel passage l’équipe doit-elle utiliser ?':'Pourquoi l’équipe a-t-elle suivi la route de l’est ?',answers:[base?'Le nouveau passage.':'Le pont de la route de l’ouest était cassé.'],options:base?['Le nouveau passage.','L’ancien passage.','Aucun passage.']:['Le pont de la route de l’ouest était cassé.','L’équipe avait perdu toutes ses provisions.','Le guide attendait sur le pont de l’ouest.','Les deux routes étaient fermées.'],hint:base?'Repère « must use » : c’est le passage à utiliser.':'Repère because et la différence entre eastern et western.',explanation:base?'« We must use the new path » signifie que l’équipe doit utiliser le nouveau passage.':'Because introduit la cause : le pont de la route de l’ouest était cassé.'});
 }
 return q;
}
export function makeZeldaCollegeAdventure(chapter:number,p?:Profile):CollegeAdventure{
 if(!Number.isInteger(chapter)||chapter<0||chapter>=ZELDA_YEAR.length)throw new Error('Unknown Zelda chapter');
 const meta=ZELDA_YEAR[chapter],curriculum=adventureCurriculum(p,chapter),ms:CollegeMission[]=[],uid=()=>crypto.randomUUID();
 const talk=(title:string,text:string[],speaker='Link')=>ms.push({id:uid(),kind:'dialogue',title,text,speaker,solved:false,attempts:0,help:false,award:0});
 const exercise=(title:string,subject:CollegeQuestion['subject'],offset:number,text:string)=>{const q=contextualQuestion(curriculum,subject,offset,chapter,ms.flatMap(m=>m.question?[m.question]:[]));ms.push({id:uid(),kind:'exercise',title,text:[text],question:q,solved:false,attempts:0,help:false,award:0});};
 talk(meta.title,ZELDA_INTROS[chapter]);
 exercise('Le réglage des ressources','maths',chapter*2,`Pour ${meta.goal[0].toLowerCase()+meta.goal.slice(1)}, Link doit vérifier le relevé de ${meta.place.toLowerCase()}. Le calcul que tu résous détermine le réglage du mécanisme.`);
 talk('Le carnet de Zelda',[`Le réglage est vérifié. Zelda retrouve un document lié à ${meta.place.toLowerCase()}. « Avant de continuer, vérifions ce que dit vraiment cette note. »`],'Zelda');
 exercise('Lire et transmettre la bonne information','francais',chapter,`Zelda prépare le rapport de votre découverte : ${meta.clue} Utilise la notion de français indiquée pour vérifier le document.`);
 exercise('Le message des éclaireurs','anglais',chapter,`Une équipe anglophone participe à la recherche près de ${meta.place.toLowerCase()}. Lis son message ou complète la phrase pour préparer la réponse de Link.`);
 talk('Une rencontre sur le chemin',['Anna, une voyageuse germanophone, rejoint votre équipe. Elle te propose un petit échange en allemand. Le niveau de cette langue suit tes propres entraînements.','« Le modèle t’aide pour les premiers mots », précise Zelda. « Chaque langue progresse à son rythme. »'],'Zelda');
 exercise('L’échange avec Anna','allemand',chapter,'Écoute ou lis le message d’Anna, puis utilise les mots que tu apprends en allemand.');
 exercise('Vérifier avant d’agir','maths',chapter*2+1,`Le premier relevé ne suffit pas. Zelda demande une deuxième vérification avant d’activer ${meta.place.toLowerCase()}.`);
 const game=independentPuzzle(12,chapter,'zelda');
 talk('L’énigme du sanctuaire',[`Vous atteignez le mécanisme qui protège le sceau. ${meta.clue}`,chapter%6===5?'Trois verrous protègent le passage. Chacun utilise les notions de tes cours. Un verrou résolu reste ouvert pendant que tu cherches la suite.':`Le gardien propose un vrai casse-tête : ${game.title.toLowerCase()}. Observe, essaie et prends ton temps : tes idées ouvriront ce passage.`],'Zelda');
 if(chapter%6!==5)ms.push({id:uid(),kind:'puzzle',title:game.title,text:[game.prompt],puzzle:game.spec,hint:game.hint,draft:game.spec.type==='maze'?[]:{},solved:false,attempts:0,help:false,award:0});
 else{
  const locks:CollegeQuestion[]=[];for(let i=0;i<3;i++)locks.push(contextualQuestion(curriculum,'maths',chapter*2+i,chapter,locks));
  ms.push({id:uid(),kind:'sanctuary',title:'Les trois verrous du passage',text:[`Active les trois sceaux de ${meta.place.toLowerCase()}. Chaque verrou résolu fait avancer le mécanisme.`],sanctuary:locks,solved:false,attempts:0,help:false,award:0});
 }
 talk('Le sceau rejoint ta collection',[`« ${ZELDA_RELICS[chapter]} ! » Le mécanisme répond et la carte révèle une nouvelle partie du royaume.`,chapter===35?'Les six régions sont reliées. Zelda ouvre la salle des balises et Link accueille les voyageurs. Tes calculs, tes lectures et tes décisions ont mené l’équipe au bout de cette grande quête.':`La suite du voyage mène à « ${ZELDA_YEAR[chapter+1].title} ». Les apprentissages que tu travailles dans tes cours prépareront ce prochain chapitre.`]);
 return {id:uid(),world:'zelda',curriculum,chapter,index:0,complete:false,missions:ms};
}
