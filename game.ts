import {AVATARS, SKINS, EQUIPMENT, THEMES, LETTERS, WORDS, PHRASES, STORIES, type Theme} from './catalog';
import {makeChapter,applySelections,validatePuzzle,validateConstruction,adventureKey,ADVENTURE_VERSION,type PuzzleSpec,type ConstructionSpec} from './adventures';
import {performCollege,CollegeError,redactCollege} from './college';
import type {CollegeState} from './college-types';
import {upgradeWardrobe,ownedSkins,equippedSkin,avatarEquipment} from './wardrobe';
export {makeChapter} from './adventures';
export type Question={id:string;topic:string;title:string;prompt:string;answer:number;hint:string;visual?:{kind:string;a:number;b:number};attempts:number;help:boolean;solved:boolean;award:number};
export type MathSession={id:string;topic:string;rule:string;questions:Question[];index:number;points:number;finished:boolean;summary?:{points:number;bonus:number}};
export type Mission={id:string;kind:'dialogue'|'choice'|'write'|'math'|'puzzle'|'build';title:string;prompt:string;target?:string;question?:Question;sequence?:string[];options?:string[];solutions?:string[];solution?:string;solved:boolean;help:boolean;attempts:number;speaker?:string;lines?:string[];selectionKey?:string;freeWrite?:boolean;context?:string;calculation?:string;puzzle?:PuzzleSpec;construction?:ConstructionSpec;draft?:any;hint?:string;cast?:string[]};
export type Chapter={version?:number;theme:Theme;chapter:number;missions:Mission[];index:number;complete:boolean;selections?:Record<string,string>};
export type PlumeTask={id:string;mode:'letter'|'word'|'phrase';level:number;target:string;solved:boolean;points:number};
export type Profile={id:string;name:string;grade?:'ce1'|'cinquieme';college?:CollegeState;test:boolean;theme:Theme;avatar:string;skin?:string;skins?:string[];skinsByAvatar?:Record<string,string[]>;equippedSkins?:Record<string,string>;equipmentOwned?:Record<string,string[]>;equippedEquipment?:Record<string,string>;owned:string[];stars:number;earned:number;schoolStars:number;plumeDone:number;mathDone:number;letterLevel:number;wordLevel:number;phraseLevel:number;completedLetters:string[];topics:Record<string,{solved:number;help:number;errors:number}>;recent:string[];session:MathSession|null;plumeTask:PlumeTask|null;adventures:Record<string,Chapter>;adventureRewards:string[];completedChapters:string[];adventureChoices?:Partial<Record<Theme,Record<string,string>>>;houseBlocks?:Record<string,string>;history:{id:string;label:string;stars:number;at:number}[];createdAt:number};
export type Family={version:1;profiles:Profile[];settings:{firstChapter:number;nextChapter:number;lineGap:number;adventureDifficulty?:number};handled:string[];receipts?:Record<string,Record<string,any>>};
export class GameError extends Error {}
export function newProfile(name:string,test=false,theme:Theme='blocks',avatar='explorer',grade:'ce1'|'cinquieme'='ce1'):Profile{return {id:crypto.randomUUID(),name:name.trim().slice(0,24)||'Mon profil',grade,test,theme,avatar,skin:'classic',skins:['classic'],skinsByAvatar:{},equippedSkins:{},equipmentOwned:{},equippedEquipment:{},owned:AVATARS.filter(a=>a.price===0).map(a=>a.id),stars:test?600:0,earned:0,schoolStars:0,plumeDone:0,mathDone:0,letterLevel:0,wordLevel:0,phraseLevel:0,completedLetters:[],topics:{},recent:[],session:null,plumeTask:null,adventures:{},adventureRewards:[],completedChapters:[],history:[],createdAt:Date.now()};}
export function newFamily():Family{return {version:1,profiles:[newProfile('Papa — test',true)],settings:{firstChapter:100,nextChapter:150,lineGap:14},handled:[]};}
export function randint(lo:number,hi:number){return Math.floor(Math.random()*(hi-lo+1))+lo;}
const uid=()=>crypto.randomUUID();
export function makeQuestion(topic:string,rule='cross',step=0,experience=0):Question{
 let a=0,b=0,answer=0,title='',prompt='',hint='',visual:Question['visual'];
 if(topic==='journey'){
  const tracks=experience<30?['add10','sub10','complete10','add20','doubles']:['add20','numbers','complete10','around100','problems'];
  topic=tracks[Math.min(tracks.length-1,Math.floor(step/2))];
 }
 if(topic==='add10'||topic==='add20'){
  a=randint(topic==='add10'?1:6,topic==='add10'?8:9);b=randint(topic==='add10'?1:11-a,topic==='add10'?10-a:20-a);answer=a+b;title=topic==='add10'?'Petite addition':'Passe par 10';prompt=`${a} + ${b} = ?`;
  hint=topic==='add10'?`Prends ${a} jetons, puis ajoute ${b} jetons. Compte-les tous.`:`Il manque ${10-a} pour arriver à 10. Décompose ${b} en ${10-a} + ${b-(10-a)}, puis ajoute ce qui reste.`;
  visual={kind:'add',a,b};
 } else if(topic==='sub10'){
  a=randint(3,10);b=randint(1,a-1);answer=a-b;title='Petite soustraction';prompt=`${a} − ${b} = ?`;hint=`Prends ${a} jetons et enlèves-en ${b}. Compte ceux qui restent.`;visual={kind:'subtract',a,b};
 } else if(topic==='complete10'){
  a=randint(1,9);answer=10-a;b=answer;title='Les amis de 10';prompt=`${a} + ? = 10`;hint=`Compte de ${a} jusqu’à 10. Chaque pas ajoute 1.`;visual={kind:'complete',a,b};
 } else if(topic==='numbers'){
  a=randint(10,85);b=[1,2,5,10][randint(0,3)];answer=a+b;title='La suite des nombres';prompt=`${a},  ?,  ${a+b*2}`;hint=`On ajoute toujours ${b}. Cherche le nombre entre ${a} et ${a+b*2}.`;visual={kind:'sequence',a,b};
 } else if(topic==='doubles'){
  a=randint(1,10);b=a;answer=a*2;title='Le double';prompt=`${a} + ${a} = ?`;hint=`Deux groupes de ${a} : compte le total.`;visual={kind:'add',a,b};
 } else if(topic==='around100'){
  if(rule==='under'){a=randint(60,94);b=randint(1,99-a);answer=a+b;hint=`Ajoute d’abord les dizaines puis les unités de ${b}. Tu restes sous 100.`;}
  else if(rule==='reach'){a=randint(51,98);b=100-a;answer=b;hint=`Compte ce qui manque pour aller de ${a} à 100. Tu peux passer par la dizaine suivante.`;}
  else if(rule==='above'){a=randint(100,115);b=randint(1,24);answer=a+b;hint=`Garde la centaine et calcule ${a-100} + ${b}.`;} else {
   a=randint(85,99);b=randint(101-a,20);answer=a+b;hint=`Il manque ${100-a} pour arriver à 100. Décompose ${b} en ${100-a} + ${b-(100-a)}. Après 100, ajoute ${b-(100-a)}.`;
  }
  title=rule==='reach'?'Complète à 100':rule==='under'?'Reste sous 100':rule==='above'?'Après 100':'Franchis 100';prompt=rule==='reach'?`${a} + ? = 100`:`${a} + ${b} = ?`;visual={kind:'hundred',a,b};
 } else {
  a=randint(3,10);b=randint(1,7);const add=Math.random()>.5;answer=add?a+b:a-Math.min(b,a-1);b=add?b:Math.min(b,a-1);title='Une petite histoire';
  prompt=add?`Tu as ${a} cubes. Ton ami te donne ${b} cubes. Combien en as-tu maintenant ?`:`Il y a ${a} biscuits. Tu en donnes ${b}. Combien en reste-t-il ?`;
  hint=add?`Il faut réunir les deux groupes : ${a} + ${b}.`:`Il faut enlever les biscuits donnés : ${a} − ${b}.`;visual={kind:add?'add':'subtract',a,b};
 }
 return {id:uid(),topic,title,prompt,answer,hint,visual,attempts:0,help:false,solved:false,award:0};
}
export function makeSession(topic:string,rule:string,p:Profile):MathSession{
 const qs:Question[]=[];for(let i=0;i<10;i++) {let q=makeQuestion(topic,rule,i,p.mathDone);let tries=0;while((p.recent.includes(q.prompt)||qs.some(x=>x.prompt===q.prompt))&&tries++<60)q=makeQuestion(topic,rule,i,p.mathDone);qs.push(q);}
 return {id:uid(),topic,rule,questions:qs,index:0,points:0,finished:false};
}
export function threshold(f:Family,index:number){return f.settings.firstChapter+index*f.settings.nextChapter;}
export function unlocked(f:Family,p:Profile,index:number){return p.test||(p.schoolStars>=threshold(f,index)&&p.plumeDone>0&&p.mathDone>0);}
function reward(p:Profile,stars:number,label:string,id:string,school=false){p.stars+=stars;p.earned+=stars;if(school)p.schoolStars+=stars;p.history.unshift({id,label,stars,at:Date.now()});p.history=p.history.slice(0,70);}
function profile(f:Family,id:string){const p=f.profiles.find(x=>x.id===id);if(!p)throw new GameError('Choisis d’abord ton profil.');return p;}
const norm=(s:unknown)=>String(s??'').normalize('NFC').trim().replace(/\s+/g,' ');
export function perform(f:Family,body:Record<string,any>):Record<string,any>{
 const action=String(body.action??'');
 if(action==='createProfile'){
  if(f.profiles.length>=8)throw new GameError('Il y a déjà 8 profils.');
  const theme=body.theme as Theme;if(!THEMES.some(t=>t.id===theme))throw new GameError('Choisis une ambiance.');
  const a=AVATARS.find(x=>x.id===body.avatar&&x.price===0);if(!a)throw new GameError('Choisis un avatar gratuit.');
  const grade=body.grade??'ce1';if(grade!=='ce1'&&grade!=='cinquieme')throw new GameError('Choisis CP–CE1 ou 5e.');
  const p=newProfile(norm(body.name),false,theme,a.id,grade);f.profiles.push(p);return {profileId:p.id};
 }
 if(action==='settings'){
  for(const [key,min,max] of [['firstChapter',20,1000],['nextChapter',20,1000],['lineGap',10,22]] as const){const v=Number(body[key]);if(Number.isFinite(v))f.settings[key]=Math.min(max,Math.max(min,Math.round(v)));}if(body.adventureDifficulty===1||body.adventureDifficulty===2)f.settings.adventureDifficulty=body.adventureDifficulty;return {};
 }
 const p=profile(f,String(body.profileId));upgradeWardrobe(p);
 if(action==='setLevel'){if(body.grade!=='ce1'&&body.grade!=='cinquieme')throw new GameError('Choisis CP–CE1 ou 5e.');p.grade=body.grade;return {};}
 if(action.startsWith('college')){try{return performCollege(f,p,body,(stars,label,id,school)=>reward(p,stars,label,id,school));}catch(e){if(e instanceof CollegeError)throw new GameError(e.message);throw e;}}
 if(p.grade==='cinquieme'&&['startMath','mathHelp','checkMath','nextMath','startPlume','checkPlume','startAdventure','adventureHelp','checkAdventure','nextAdventure','saveAdventureDraft'].includes(action))throw new GameError('Cet exercice appartient au parcours CP–CE1. Choisis une matière du campus.');
 if(action==='appearance'){
  if(body.theme&&THEMES.some(t=>t.id===body.theme))p.theme=body.theme;
  if(body.avatar){if(!p.owned.includes(body.avatar))throw new GameError('Ce personnage est encore dans la boutique.');p.avatar=body.avatar;}
  if(body.skin){if(!ownedSkins(p).includes(body.skin))throw new GameError('Cette tenue appartient à un autre avatar ou reste dans la boutique.');p.equippedSkins??={};p.equippedSkins[p.avatar]=body.skin;}
  if(body.equipment){if(body.equipment!=='none'&&(!avatarEquipment(p.avatar).some(x=>x.id===body.equipment)||!p.equipmentOwned?.[p.avatar]?.includes(body.equipment)))throw new GameError('Cet équipement reste dans la boutique de ce personnage.');p.equippedEquipment??={};p.equippedEquipment[p.avatar]=body.equipment;}
  p.skin=equippedSkin(p);p.skins=[...ownedSkins(p)];return {};
 }
 if(action==='buySkin'){
  const skin=SKINS.find(x=>x.id===body.skin),avatar=String(body.avatar??p.avatar);if(!skin)throw new GameError('Tenue introuvable.');
  if(!p.owned.includes(avatar))throw new GameError('Choisis un personnage de ta collection.');
  if(ownedSkins(p,avatar).includes(skin.id))return {alreadyOwned:true};if(p.stars<skin.price)throw new GameError(`Il manque ${skin.price-p.stars} étoiles.`);
  p.skinsByAvatar??={};p.skinsByAvatar[avatar]??=['classic'];p.equippedSkins??={};
  p.stars-=skin.price;p.skinsByAvatar[avatar].push(skin.id);p.equippedSkins[avatar]=skin.id;
  if(avatar===p.avatar){p.skin=skin.id;p.skins=[...ownedSkins(p)];}return {bought:skin.id,avatar};
 }
 if(action==='buyEquipment'){
  const item=EQUIPMENT.find(x=>x.id===body.equipment),avatar=String(body.avatar??p.avatar);
  if(!item||!item.avatars.includes(avatar)||!p.owned.includes(avatar))throw new GameError('Cet équipement ne convient pas à ce personnage.');
  p.equipmentOwned??={};p.equipmentOwned[avatar]??=[];if(p.equipmentOwned[avatar].includes(item.id))return {alreadyOwned:true};
  if(p.stars<item.price)throw new GameError(`Il manque ${item.price-p.stars} étoiles.`);
  p.stars-=item.price;p.equipmentOwned[avatar].push(item.id);p.equippedEquipment??={};p.equippedEquipment[avatar]=item.id;return {bought:item.id,avatar};
 }
 if(action==='buy'){
  const a=AVATARS.find(x=>x.id===body.avatar);if(!a)throw new GameError('Personnage introuvable.');if(p.owned.includes(a.id))return {alreadyOwned:true};
  if(p.stars<a.price)throw new GameError(`Il manque ${a.price-p.stars} étoiles.`);p.stars-=a.price;p.owned.push(a.id);p.avatar=a.id;p.skin=equippedSkin(p);p.skins=[...ownedSkins(p)];return {bought:a.id};
 }
 if(action==='startMath'){
  if(p.session&&!p.session.finished&&!body.replace)return {resumed:true};
  const allowed=['journey','add10','sub10','complete10','add20','numbers','doubles','around100','problems'];if(!allowed.includes(body.topic))throw new GameError('Notion inconnue.');
  p.session=makeSession(body.topic,['under','reach','cross','above'].includes(body.rule)?body.rule:'cross',p);return {};
 }
 if(action==='mathHelp'||action==='checkMath'||action==='nextMath'){
  const s=p.session;if(!s)throw new GameError('Commence une séance.');const q=s.questions[s.index];
  if(s.finished)return {finished:true};
  if(body.questionId&&q.id!==body.questionId)throw new GameError('Ce calcul a déjà été terminé.');
  if(action==='mathHelp'){q.help=true;return {hint:q.hint,visual:q.visual};}
  if(action==='nextMath'){
   if(!q.solved)throw new GameError('Termine d’abord le calcul.');
   if(s.index===s.questions.length-1){s.finished=true;reward(p,20,'Séance de maths terminée',s.id,true);s.summary={points:s.points,bonus:20};return {finished:true};}
   s.index++;return {};
  }
  if(q.solved)return {correct:true,points:q.award,already:true};
  if(norm(body.answer)===''||!Number.isFinite(Number(body.answer)))throw new GameError('Écris un nombre dans la case.');
  if(Number(body.answer)!==q.answer){q.attempts++;const t=p.topics[q.topic]??{solved:0,help:0,errors:0};t.errors++;p.topics[q.topic]=t;return {correct:false};}
  q.solved=true;q.award=q.help||q.attempts>0?8:10;s.points+=q.award;p.mathDone++;
  const t=p.topics[q.topic]??{solved:0,help:0,errors:0};t.solved++;if(q.help||q.attempts)t.help++;p.topics[q.topic]=t;
  p.recent=[q.prompt,...p.recent].slice(0,60);reward(p,q.award,q.title,q.id,true);return {correct:true,points:q.award};
 }
 if(action==='startPlume'){
  const mode=body.mode==='word'?'word':body.mode==='phrase'?'phrase':'letter';
  const level=Number(body.level);if(!Number.isInteger(level)||level<0)throw new GameError('Niveau inconnu.');
  let target='';
  if(mode==='letter'){if(level>=52||(!p.test&&level>p.letterLevel))throw new GameError('Valide la lettre précédente.');target=LETTERS[level];}
  if(mode==='word'){if(!p.test&&p.letterLevel<52)throw new GameError('Termine les lettres pour découvrir les mots.');target=WORDS[p.theme][level];if(!target||(!p.test&&level>p.wordLevel))throw new GameError('Valide le mot précédent.');}
  if(mode==='phrase'){if(!p.test&&(p.letterLevel<52||p.wordLevel<WORDS[p.theme].length))throw new GameError('Termine les mots pour découvrir les phrases.');target=PHRASES[p.theme][level];if(!target||(!p.test&&level>p.phraseLevel))throw new GameError('Valide la phrase précédente.');}
  p.plumeTask={id:uid(),mode,level,target,solved:false,points:0};return {};
 }
 if(action==='checkPlume'){
  const t=p.plumeTask;if(!t||body.taskId!==t.id)throw new GameError('Ouvre le cahier de cette lettre.');if(t.solved)return {correct:true,points:t.points,already:true};
  const answer=norm(body.answer);if(!answer)throw new GameError('Écris dans la case de validation.');
  if(answer.toLocaleLowerCase('fr-FR')!==norm(t.target).toLocaleLowerCase('fr-FR'))return {correct:false};
  if(!p.test&&(!Array.isArray(body.strokes)||body.strokes.length!==3||body.strokes.some((x:any)=>Number(x)<(t.mode==='letter'?8:3))))throw new GameError('Prends le temps d’écrire sur les trois lignes avant de valider.');
  t.solved=true;t.points=10;p.plumeDone++;
  if(t.mode==='letter'){p.completedLetters=Array.from(new Set([...p.completedLetters,t.target]));if(t.level===p.letterLevel)p.letterLevel=Math.min(52,p.letterLevel+1);}
  if(t.mode==='word'&&t.level===p.wordLevel)p.wordLevel++;
  if(t.mode==='phrase'&&t.level===p.phraseLevel)p.phraseLevel++;
  reward(p,10,`Plume : ${t.target}`,t.id,true);return {correct:true,points:10};
 }
 if(action==='startAdventure'){
  const theme=body.theme as Theme;const index=Number(body.chapter);if(!STORIES[theme]||!Number.isInteger(index)||index<0||index>=STORIES[theme].chapters.length)throw new GameError('Chapitre inconnu.');
  if(!unlocked(f,p,index))throw new GameError('Gagne des étoiles avec Plume et Boulier pour ouvrir ce chapitre.');
  if(index>0&&!p.test&&!p.completedChapters.includes(adventureKey(theme,index-1)))throw new GameError('Termine d’abord le chapitre précédent.');
  const key=adventureKey(theme,index);
  if(!p.adventures[key]||p.adventures[key].complete){p.adventures[key]=makeChapter(theme,index,p,f.settings.adventureDifficulty??1);p.adventures[key].selections={...(p.adventureChoices?.[theme]??{})};applySelections(p.adventures[key]);}
  return {key};
 }
 if(action==='adventureHelp'||action==='checkAdventure'||action==='nextAdventure'||action==='saveAdventureDraft'){
  const key=String(body.key),ch=p.adventures[key];if(!ch||ch.version!==ADVENTURE_VERSION)throw new GameError('Rouvre cette aventure pour découvrir ses nouveaux chapitres.');const m=ch.missions[ch.index];if(ch.complete)return {finished:true};
  if(body.missionId&&body.missionId!==m.id)throw new GameError('Cette mission a déjà été terminée.');
  if(action==='adventureHelp'){m.help=true;return {hint:m.kind==='math'?m.question?.hint:m.kind==='write'?(m.freeWrite?'Choisis un nom court pour ta maison. Écris-le avec des lettres.':`Regarde bien le modèle : ${m.target}.`):m.kind==='choice'?'Écoute la consigne et choisis parmi les propositions.':m.hint??'Prends ton temps et observe les indices.'};}
  if(action==='saveAdventureDraft'){
   if(m.solved)return {};
   const draft=body.draft;if(!draft||typeof draft!=='object'||JSON.stringify(draft).length>10000)throw new GameError('Ce brouillon est trop grand.');
   m.draft=draft;return {};
  }
  if(action==='nextAdventure'){
   if(m.kind==='dialogue')m.solved=true;
   if(!m.solved)throw new GameError('Termine la mission.');
   if(ch.index===ch.missions.length-1){ch.complete=true;p.completedChapters=Array.from(new Set([...p.completedChapters,key]));return {finished:true};}
   ch.index++;applySelections(ch);return {};
  }
  if(m.solved)return {correct:true,points:0,already:true};
  if(m.kind==='dialogue')throw new GameError('Continue l’histoire avec le bouton.');
  const a=norm(body.answer);let correct=false;
  if(m.kind==='math')correct=a!==''&&Number(a)===m.question?.answer;
  if(m.kind==='write')correct=m.freeWrite?/^[\p{L}\p{M} ’'\-]{2,32}$/u.test(a):a.toLocaleLowerCase('fr-FR')===norm(m.target).toLocaleLowerCase('fr-FR');
  if(m.kind==='choice')correct=!!m.solutions?.includes(a);
  if(m.kind==='puzzle'&&m.puzzle)correct=validatePuzzle(m.puzzle,body.answer);
  if(m.kind==='build'&&m.construction)correct=validateConstruction(m.construction,body.answer);
  if(!correct){m.attempts++;return {correct:false};}
  m.solved=true;
  if((m.kind==='choice'||(m.kind==='write'&&m.freeWrite))&&m.selectionKey){ch.selections??={};ch.selections[m.selectionKey]=a;p.adventureChoices??={};p.adventureChoices[ch.theme]??={};p.adventureChoices[ch.theme]![m.selectionKey]=a;applySelections(ch);}
  if(m.kind==='build'){m.draft=body.answer;p.houseBlocks={...(p.houseBlocks??{}),...body.answer};}
  if(m.kind==='puzzle')m.draft=body.answer;
  const rewardKey=`${key}:${ch.index}`,pts=p.adventureRewards.includes(rewardKey)?0:m.help||m.attempts?8:10;
  if(pts){reward(p,pts,`Aventure : ${m.title}`,m.id,false);p.adventureRewards.push(rewardKey);}return {correct:true,points:pts};
 }
 throw new GameError('Cette action n’est pas disponible.');
}
export function publicFamily(f:Family):any{
 const out=structuredClone(f) as any;delete out.handled;delete out.receipts;
 for(const p of out.profiles){
  if(p.college)redactCollege(p.college);
  if(p.session)for(const q of p.session.questions){delete q.answer;if(!q.help)delete q.hint;}
  for(const ch of Object.values(p.adventures) as any[]){for(const m of ch.missions){delete m.solution;delete m.solutions;if(m.puzzle)delete m.puzzle.solution;if(m.question){delete m.question.answer;if(!m.help)delete m.question.hint;}}}
 }
 return out;
}
