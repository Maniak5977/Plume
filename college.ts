import {COLLEGE_TOPICS,COLLEGE_CHAPTERS,SUBJECTS,GERMAN_BEGINNER_TOPICS,type Subject,type CollegeDifficulty} from './college-catalog';
import {makeCollegeQuestion,storyQuestion,fraction,gcd,shuffle} from './college-content';
import type {Profile,Family} from './game';
import type {CollegeQuestion,CollegeSession,CollegeState,CollegeAdventure,CollegeMission,BaseBoard,BaseSpec,BaseModule} from './college-types';
import {makeZeldaCollegeAdventure} from './zelda-quest';
import {validatePuzzle} from './adventures';
import {adventureCurriculum,courseQuestion,parseCoursePlan} from './adventure-curriculum';
import {ZELDA_YEAR} from './quest-year';
export class CollegeError extends Error {}
const uid=()=>crypto.randomUUID();
const int=(a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;
export function newCollegeState():CollegeState{return {session:null,stats:{},recent:[],completedSessions:0,adventures:{},completedChapters:[],completedStories:[],rewardedMissions:[],base:{}};}
export function collegeState(p:Profile):CollegeState{return p.college??=newCollegeState();}
export function subjectSolved(p:Profile,subject:Subject):number{return COLLEGE_TOPICS.filter(t=>t.subject===subject).reduce((sum,t)=>sum+(p.college?.stats[t.id]?.solved??0),0);}
export function collegeUnlocked(f:Pick<Family,'settings'>,p:Profile,chapter:number,world:'oree'|'zelda'='oree'):boolean{
  const previous=world==='zelda'?p.college?.completedStories?.includes(`zelda:${chapter-1}`):p.college?.completedChapters.includes(chapter-1);
  return p.test||(p.schoolStars>=f.settings.firstChapter+chapter*f.settings.nextChapter&&SUBJECTS.every(s=>subjectSolved(p,s.id)>=2)&&(chapter===0||!!previous));
}
export function parseNumber(value:unknown):{n:number;d:number}|null{
  if(typeof value!=='string'&&typeof value!=='number')return null;
  const v=String(value).trim().replace(/−/g,'-').replace(/\s/g,'');
  const parts=v.match(/^([+-]?\d+)\/([+-]?\d+)$/);
  let n:number,d:number;
  if(parts){n=Number(parts[1]);d=Number(parts[2]);}
  else{const decimal=v.match(/^([+-]?)(\d+)(?:[.,](\d{1,6}))?$/);if(!decimal)return null;d=10**(decimal[3]?.length??0);n=(decimal[1]==='-'?-1:1)*(Number(decimal[2])*d+Number(decimal[3]??0));}
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(d)||d===0||Math.abs(n)>1e12||Math.abs(d)>1e6)return null;
  if(d<0){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};
}
function normal(value:string,strict=false):string{const s=value.normalize('NFC').trim().replace(/[’‘]/g,"'").replace(/\s+/g,' ').replace(/[.!?]+$/,'').trim();return strict?s:s.toLocaleLowerCase();}
export function checkCollegeAnswer(q:CollegeQuestion,value:unknown):boolean{
  if(q.kind==='order'){
    if(!Array.isArray(value)||value.length!==q.tokens?.length||value.some(x=>typeof x!=='string'))return false;
    const a=[...value].sort(),b=[...q.tokens!].sort();if(a.some((x,i)=>x!==b[i]))return false;
    return q.answers.some(ans=>normal(ans)===normal(value.join(' ')));
  }
  if(q.kind==='number'){
    const v=parseNumber(value);return !!v&&q.answers.some(a=>{const expected=parseNumber(a);return !!expected&&BigInt(v.n)*BigInt(expected.d)===BigInt(expected.n)*BigInt(v.d);});
  }
  if(typeof value!=='string')return false;
  return q.answers.some(a=>normal(a,q.strictCase)===normal(value,q.strictCase));
}
export function questionFingerprint(q:CollegeQuestion):string{return `${q.topic}|${q.context??''}|${q.prompt}|${q.audioOnly?q.audio?.text??'':''}|${q.diagram?JSON.stringify(q.diagram):''}|${q.tokens?JSON.stringify([...q.tokens].sort()):''}`;}
export function makeCollegeSession(subject:Subject,topic:string,difficulty:CollegeDifficulty,p:Profile):CollegeSession{
  const pool=COLLEGE_TOPICS.filter(t=>t.subject===subject&&(subject!=='allemand'||difficulty!=='revision'||GERMAN_BEGINNER_TOPICS.includes(t.id)));if(!pool.length||(topic!=='mixed'&&!pool.some(t=>t.id===topic)))throw new CollegeError('Choisis une notion de cette matière et de ce niveau.');
  const recent=p.college?.recent??[],qs:CollegeQuestion[]=[],rotation=shuffle(pool);
  for(let i=0;i<8;i++){
    const t=topic==='mixed'?rotation[i%rotation.length].id:topic;
    let q=makeCollegeQuestion(t,difficulty),attempts=0;
    while((qs.some(other=>questionFingerprint(other)===questionFingerprint(q))||recent.includes(questionFingerprint(q)))&&attempts++<100)q=makeCollegeQuestion(t,difficulty);
    // A finite bank may exhaust the recent history; never repeat within this session.
    while(qs.some(other=>questionFingerprint(other)===questionFingerprint(q))&&attempts++<300)q=makeCollegeQuestion(t,difficulty);
    if(qs.some(other=>questionFingerprint(other)===questionFingerprint(q)))throw new CollegeError('Cette série est momentanément indisponible. Choisis le parcours varié.');
    qs.push(q);
  }
  return {id:uid(),subject,topic,difficulty,questions:qs,index:0,points:0,finished:false,bonus:0,contentVersion:2};
}
export function upgradeGerman(p:Profile):boolean{
 const state=p.college;if(!state)return false;let changed=false;
 const s=state.session;
 if(s&&s.subject==='allemand'&&!s.finished&&s.contentVersion!==2){
  s.difficulty='revision';if(s.topic!=='mixed'&&!GERMAN_BEGINNER_TOPICS.includes(s.topic))s.topic='mixed';
  const used=new Set<string>();
  for(let i=s.index;i<s.questions.length;i++){
   if(s.questions[i].solved)continue;
   const topic=s.topic==='mixed'?GERMAN_BEGINNER_TOPICS[i%GERMAN_BEGINNER_TOPICS.length]:s.topic;
   let q=makeCollegeQuestion(topic,'revision');let tries=0;while(used.has(questionFingerprint(q))&&tries++<100)q=makeCollegeQuestion(topic,'revision');
   used.add(questionFingerprint(q));s.questions[i]=q;
  }
  s.contentVersion=2;changed=true;
 }
 for(const ch of Object.values(state.adventures))for(const m of ch.missions){
  const q=m.question;if(!q||q.subject!=='allemand'||q.germanVersion===2||m.solved)continue;
  if(q.kind==='order'){
   Object.assign(q,{context:'Léo te propose une réponse courte : « Nous sommes ici. »',prompt:'Construis la phrase avec les trois groupes.',tokens:shuffle(['Wir','sind','hier']),answers:['Wir sind hier'],support:{title:'Notre modèle',text:'Wir = nous · sind = sommes · hier = ici\nModèle : Wir sind hier.'},hint:'Place Wir, puis sind, puis hier.',explanation:'Wir sind hier. → Nous sommes ici.'});
  }else q.support={title:'Les nombres pour lire ce message',text:'eins = 1 · zwei = 2 · drei = 3 · vier = 4 · fünf = 5 · sechs = 6 · sieben = 7 · acht = 8 · neun = 9 · zehn = 10'};
  q.germanVersion=2;changed=true;
 }
 return changed;
}
const MODULES:BaseModule[]=['structure','couloir','radio','habitat','energie','labo','hangar'];
export function validBoard(spec:BaseSpec,value:unknown,complete=false):value is BaseBoard{
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const entries=Object.entries(value);if(entries.length>spec.width*spec.height)return false;
  if(entries.some(([key,v])=>!/^\d+$/.test(key)||String(Number(key))!==key||Number(key)<0||Number(key)>=spec.width*spec.height||!MODULES.includes(v as BaseModule)))return false;
  if(!complete)return true;
  const counts=Object.fromEntries(MODULES.map(m=>[m,entries.filter(([,x])=>x===m).length]));
  if(MODULES.some(m=>counts[m]!==Number(spec.required[m]??0))||!Object.hasOwn(value,String(spec.entrance)))return false;
  const occupied=new Set(entries.map(([k])=>Number(k))),seen=new Set([spec.entrance]),queue=[spec.entrance];
  while(queue.length){const current=queue.shift()!;for(const n of [current-1,current+1,current-spec.width,current+spec.width]){if(!occupied.has(n)||seen.has(n)||Math.abs(n%spec.width-current%spec.width)+Math.abs(Math.floor(n/spec.width)-Math.floor(current/spec.width))!==1)continue;seen.add(n);queue.push(n);}}
  return seen.size===occupied.size;
}
export function makeCollegeAdventure(chapter:number,p?:Profile):CollegeAdventure{
  const meta=COLLEGE_CHAPTERS[chapter];if(!meta)throw new CollegeError('Chapitre inconnu.');
  const missions:CollegeMission[]=[];
  const dialogue=(title:string,text:string[],speaker='Nora')=>missions.push({id:uid(),kind:'dialogue',title,text,speaker,solved:false,attempts:0,help:false,award:0});
  const exercise=(title:string,q:CollegeQuestion)=>missions.push({id:uid(),kind:'exercise',title,question:q,solved:false,attempts:0,help:false,award:0});
  dialogue(chapter===0?'Bienvenue dans l’équipe':meta.title,meta.intro);
  const unit=int(4,12),crates=int(3,7),wanted=int(8,15),total=unit*crates;
  exercise('Le registre des ressources',storyQuestion('math-proportion',{kind:'number',context:`Nora te confie le registre du module ${meta.room.toLowerCase()}. Les livraisons utilisent toutes les mêmes caisses.`,prompt:`${crates} caisses contiennent ${total} pièces au total. Combien de pièces contiennent ${wanted} caisses identiques ?`,answers:[String(unit*wanted)],hint:'Trouve le nombre de pièces d’une caisse, puis multiplie par le nombre de caisses.',explanation:`${total} ÷ ${crates} = ${unit} pièces par caisse ; ${unit} × ${wanted} = ${unit*wanted} pièces.`}));
  const plural=[['antennes','connecté','connectées'],['portes','solide','solides'],['batteries','chargé','chargées'],['analyses','terminé','terminées'],['équipes','prêt','prêtes']][chapter];
  exercise('Le rapport de Nora',storyQuestion('fr-agreements',{kind:'text',context:'Nora veut transmettre un rapport clair. Corrige l’accord avant l’envoi.',prompt:`Les ${plural[0]} sont ___ (${plural[1]}). Écris seulement l’adjectif accordé.`,answers:[plural[2]],hint:`« ${plural[0]} » est un nom féminin pluriel.`,explanation:`L’adjectif prend le féminin pluriel : « ${plural[2]} ».`}));
  dialogue('Deux équipes, deux langues',['Léo est responsable des communications. Il reçoit une consigne d’une équipe britannique, puis un relevé allemand. Les deux messages concernent votre chantier.','Écoute si tu le souhaites, relis les messages et repère les informations utiles.'], 'Léo');
  const locations=['radio room','habitat','power room','laboratory','hangar'],objects=['cables','doors','solar panels','samples','helmets'],count=int(4,12);
  const message=`Hello team! Please bring ${count} ${objects[chapter]} to the ${locations[chapter]}. We need them before six o’clock. Thank you!`;
  exercise('Le message britannique',storyQuestion('en-reading',{kind:'choice',context:message,audio:{text:message,lang:'en-GB'},prompt:'Avant quelle heure l’équipe doit-elle recevoir la livraison ?',answers:['18 h'],options:shuffle(['18 h','16 h','20 h','8 h']),hint:'Le message utilise l’expression « before six o’clock ». Il s’agit ici d’une livraison de l’après-midi.',explanation:'« Before six o’clock » signifie avant six heures ; dans ce contexte d’après-midi, avant 18 h.'}));
  const nums=['zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn'],n=int(2,10),noun=['Karten','Türen','Batterien','Bücher','Fahrkarten'][chapter],translation=['cartes','portes','batteries','livres','billets'][chapter];
  const german=`Hallo! Wir haben ${nums[n-2]} ${noun}. Wir sind bereit.`;
  exercise('Le relevé allemand',storyQuestion('de-reading',{kind:'number',context:german,audio:{text:german,lang:'de-DE'},prompt:`Combien de ${translation} l’équipe possède-t-elle ? Écris le nombre en chiffres.`,support:{title:'Un modèle pour comprendre',text:`${noun} = ${translation}\neins = 1 · zwei = 2 · drei = 3 · vier = 4 · fünf = 5 · sechs = 6 · sieben = 7 · acht = 8 · neun = 9 · zehn = 10`},answers:[String(n)],hint:`« ${noun} » signifie « ${translation} ». Repère le nombre allemand.`,explanation:`« ${nums[n-2]} » signifie ${n} : l’équipe possède ${n} ${translation}.`}));
  const denominator=[4,3,5,6,4][chapter],part=int(1,denominator-1),reserve=int(10,20)*denominator;
  exercise('La réserve à partager',storyQuestion('math-fractions',{kind:'number',context:`Nora réserve une partie des ressources pour le module ${meta.room.toLowerCase()}. Le reste sera conservé pour la suite.`,prompt:`La réserve contient ${reserve} unités. On en utilise ${part}/${denominator}. Combien d’unités restent disponibles ?`,answers:[String(reserve-reserve*part/denominator)],hint:'Calcule d’abord la quantité utilisée, puis soustrais-la à la réserve.',explanation:`${reserve} ÷ ${denominator} × ${part} = ${reserve*part/denominator} unités utilisées ; ${reserve} − ${reserve*part/denominator} = ${reserve-reserve*part/denominator} restantes.`}));
  exercise('La réponse à notre partenaire',storyQuestion('de-order',{kind:'order',context:'Léo te propose une première réponse simple : « Nous sommes ici. »',prompt:'Construis la phrase avec les trois groupes.',tokens:shuffle(['Wir','sind','hier']),answers:['Wir sind hier'],support:{title:'Le modèle reste avec toi',text:'Wir = nous · sind = sommes · hier = ici\nModèle : Wir sind hier.'},hint:'Commence par Wir, puis le verbe sind, puis hier.',explanation:'Wir sind hier. → Nous sommes ici.'}));
  const room=meta.icon==='zap'?'energie':meta.icon==='flask'?'labo':meta.icon==='rocket'?'hangar':meta.icon==='home'?'habitat':'radio';
  missions.push({id:uid(),kind:'build',title:`Construire le module ${meta.room}`,text:['Les ressources et les consignes sont vérifiées. Choisis les pièces, puis place-les sur le plan.','Pose exactement deux structures, trois couloirs et le module demandé. Toutes les cases occupées doivent se toucher par un côté, et l’une doit couvrir l’entrée marquée.'],spec:{width:5,height:4,entrance:10,required:{structure:2,couloir:3,[room]:1}},draft:{},solved:false,attempts:0,help:false,award:0});
  dialogue('Mission accomplie',[meta.outro,chapter<4?'Le chapitre suivant utilisera de nouvelles compétences. Entraîne-toi dans les matières pour préparer l’équipe.':'Tu peux revoir les chapitres et poursuivre tes entraînements. Les modules construits restent dans ton camp.']);
  const curriculum=adventureCurriculum(p,chapter);
  let offset=0;for(const m of missions)if(m.question){const subject=m.question.subject;m.text=[m.question.context??`L’équipe prépare le module ${meta.room}.`];m.question=courseQuestion(curriculum,subject,chapter+offset++,missions.filter(x=>x!==m&&x.question).map(x=>x.question!));}
  return {id:uid(),world:'oree',curriculum,chapter,index:0,complete:false,missions};
}
export function upgradeCollegeAdventures(p:Profile):boolean{
 const state=p.college;if(!state)return false;let changed=false;
 for(const old of Object.values(state.adventures)){
  if(old.complete)continue;
  const desired=adventureCurriculum(p,old.chapter);
  if(old.curriculum?.version===2&&old.curriculum.revision===(state.courseRevision??0)&&JSON.stringify(old.curriculum.topics)===JSON.stringify(desired.topics)&&JSON.stringify(old.curriculum.levels)===JSON.stringify(desired.levels))continue;
  const fresh=old.world==='zelda'?makeZeldaCollegeAdventure(old.chapter,p):makeCollegeAdventure(old.chapter,p);
  if(fresh.missions.length!==old.missions.length)continue;
  for(let i=old.index;i<old.missions.length;i++){
   const before=old.missions[i];if(before.solved)continue;
   const next=fresh.missions[i];
   // Keep a partially completed sanctuary and replace only its unfinished locks.
   if(before.sanctuary&&next.sanctuary)next.sanctuary=next.sanctuary.map((q,j)=>before.sanctuary![j]?.solved?before.sanctuary![j]:{...q,attempts:before.sanctuary![j]?.attempts??0,help:before.sanctuary![j]?.help??false});
   next.attempts=before.attempts;next.help=before.help;next.award=before.award;
   if(next.question){next.question.attempts=before.question?.attempts??before.attempts;next.question.help=before.question?.help??before.help;}
   if(before.kind==='build'&&next.kind==='build')next.draft=before.draft;
   old.missions[i]=next;
  }
  old.curriculum=fresh.curriculum;changed=true;
 }
 return changed;
}

type Reward=(stars:number,label:string,id:string,school:boolean)=>void;
export function performCollege(f:Family,p:Profile,body:Record<string,any>,reward:Reward):Record<string,any>{
  if(p.grade!=='cinquieme')throw new CollegeError('Choisis un profil de niveau 5e.');
  const state=collegeState(p),action=String(body.action);
  if(action==='collegeSetCurriculum'){
    try{state.coursePlan=parseCoursePlan(body);}catch(e){throw new CollegeError(e instanceof Error?e.message:'Vérifie les notions choisies.');}
    state.courseRevision=(state.courseRevision??0)+1;upgradeCollegeAdventures(p);return {saved:true};
  }
  if(action==='collegeStart'){
    if(state.session&&!state.session.finished&&!body.replace)return {resumed:true};
    if(!SUBJECTS.some(s=>s.id===body.subject))throw new CollegeError('Choisis une matière.');
    const difficulty:CollegeDifficulty=body.difficulty==='revision'||(body.subject==='allemand'&&body.difficulty!=='cinquieme')?'revision':'cinquieme';
    state.session=makeCollegeSession(body.subject,body.topic,difficulty,p);return {};
  }
  if(['collegeCheck','collegeHelp','collegeReveal','collegeNext'].includes(action)){
    const s=state.session;if(!s)throw new CollegeError('Commence une séance.');if(s.finished)return {finished:true};
    const q=s.questions[s.index];if(body.questionId!==q.id)throw new CollegeError('Ce défi a déjà changé. Rouvre la séance.');
    const stat=()=>state.stats[q.topic]??= {solved:0,errors:0,help:0,skipped:0};
    if(action==='collegeHelp'){if(!q.solved)q.help=true;return {hint:q.hint};}
    if(action==='collegeNext'){
      if(!q.solved)throw new CollegeError('Valide la réponse ou consulte la correction.');
      if(s.index===s.questions.length-1){s.finished=true;state.completedSessions++;s.bonus=s.questions.filter(q=>!q.skipped&&q.solved).length>=6?20:0;if(s.bonus)reward(s.bonus,`${SUBJECTS.find(x=>x.id===s.subject)!.name} : séance terminée`,s.id,true);return {finished:true};}
      s.index++;return {};
    }
    if(q.solved)return {correct:!q.skipped,points:q.award,already:true};
    if(action==='collegeReveal'){
      if(q.attempts<2&&!q.help)throw new CollegeError('Essaie d’abord ou ouvre un indice.');q.solved=true;q.skipped=true;stat().skipped++;return {correct:false,review:true,points:0};
    }
    if((typeof body.answer==='string'&&!body.answer.trim())||body.answer==null||(Array.isArray(body.answer)&&!body.answer.length))throw new CollegeError('Saisis ou choisis une réponse.');
    if(!checkCollegeAnswer(q,body.answer)){q.attempts++;stat().errors++;return {correct:false};}
    q.solved=true;q.award=q.help||q.attempts?8:10;s.points+=q.award;stat().solved++;if(q.help||q.attempts)stat().help++;
    state.recent=[questionFingerprint(q),...state.recent].slice(0,180);reward(q.award,`${SUBJECTS.find(x=>x.id===q.subject)!.name} : ${COLLEGE_TOPICS.find(x=>x.id===q.topic)!.name}`,q.id,true);return {correct:true,points:q.award};
  }
  if(action==='collegeStartMission'){
    const world=body.world==='zelda'?'zelda':'oree';
    const chapter=Number(body.chapter),max=world==='zelda'?ZELDA_YEAR.length:COLLEGE_CHAPTERS.length;if(!Number.isInteger(chapter)||chapter<0||chapter>=max)throw new CollegeError('Choisis un chapitre.');
    if(!collegeUnlocked(f,p,chapter,world))throw new CollegeError('Entraîne-toi dans les quatre matières et termine le chapitre précédent pour ouvrir cette mission.');
    upgradeCollegeAdventures(p);const key=world==='zelda'?`zelda:${chapter}`:String(chapter);if(!state.adventures[key]||state.adventures[key].complete)state.adventures[key]=world==='zelda'?makeZeldaCollegeAdventure(chapter,p):makeCollegeAdventure(chapter,p);return {key};
  }
  if(['collegeMissionCheck','collegeMissionHelp','collegeMissionNext','collegeMissionDraft'].includes(action)){
    const ch=state.adventures[String(body.key)];if(!ch)throw new CollegeError('Ouvre une mission.');if(ch.complete)return {finished:true};
    const m=ch.missions[ch.index];if(body.missionId!==m.id)throw new CollegeError('Cette étape a déjà changé.');
    if(action==='collegeMissionDraft'){
      if(m.solved)return {};
      if(m.kind==='build'){if(!m.spec||!validBoard(m.spec,body.draft))throw new CollegeError('Ce plan contient une case invalide.');}
      else if(m.kind==='puzzle'){if(!body.draft||typeof body.draft!=='object'||JSON.stringify(body.draft).length>10000)throw new CollegeError('Ce brouillon est trop grand.');}
      else return {};
      m.draft=body.draft;return {};
    }
    if(action==='collegeMissionHelp'){
      const lock=m.sanctuary?.find(q=>q.id===body.lockId);if(m.kind==='sanctuary'&&!lock)throw new CollegeError('Choisis un verrou de ce sanctuaire.');
      if(lock){if(!lock.solved)lock.help=true;return {hint:lock.hint};}
      if(!m.solved){m.help=true;if(m.question)m.question.help=true;}return {hint:m.question?.hint??m.hint??(m.kind==='puzzle'?'Observe chaque indice. Tu peux changer tes choix, recommencer le chemin ou vérifier les quantités avant de valider.':'Place les pièces en un seul ensemble relié à l’entrée. Compte chaque type de pièce.')};
    }
    if(action==='collegeMissionNext'){
      if(m.kind==='dialogue')m.solved=true;if(!m.solved)throw new CollegeError('Termine cette étape.');
      if(ch.index===ch.missions.length-1){ch.complete=true;if(ch.world==='zelda')state.completedStories=Array.from(new Set([...(state.completedStories??[]),`zelda:${ch.chapter}`]));else state.completedChapters=Array.from(new Set([...state.completedChapters,ch.chapter]));return {finished:true};}ch.index++;return {};
    }
    if(m.solved&&m.kind!=='sanctuary')return {correct:true,points:m.award,already:true};
    if(m.kind==='dialogue')throw new CollegeError('Continue avec le bouton de l’histoire.');
    if(m.kind==='sanctuary'){
      const index=m.sanctuary?.findIndex(q=>q.id===body.lockId)??-1;if(index<0)throw new CollegeError('Choisis un verrou de ce sanctuaire.');const q=m.sanctuary![index];
      if(q.solved)return {correct:true,points:q.award,already:true};
      if(!checkCollegeAnswer(q,body.answer)){q.attempts++;m.attempts++;return {correct:false};}
      q.solved=true;const base=`zelda:${ch.chapter}:${ch.index}`,key=`${base}:lock:${index}`;
      q.award=state.rewardedMissions.includes(base)||state.rewardedMissions.includes(key)?0:q.help||q.attempts?8:10;
      if(q.award){state.rewardedMissions.push(key);reward(q.award,`Sanctuaire : verrou ${index+1}`,q.id,false);}m.award+=q.award;m.solved=m.sanctuary!.every(x=>x.solved);return {correct:true,points:q.award};
    }
    const correct=m.kind==='build'?!!m.spec&&validBoard(m.spec,body.answer,true):m.kind==='puzzle'?!!m.puzzle&&validatePuzzle(m.puzzle,body.answer):!!m.question&&checkCollegeAnswer(m.question,body.answer);
    if(!correct){m.attempts++;if(m.question)m.question.attempts++;return {correct:false};}
    m.solved=true;if(m.question)m.question.solved=true;
    const key=`${ch.world==='zelda'?'zelda:':''}${ch.chapter}:${ch.index}`;m.award=state.rewardedMissions.includes(key)?0:m.help||m.attempts?8:10;
    if(m.award){state.rewardedMissions.push(key);reward(m.award,`${ch.world==='zelda'?'Forêt des échos':'Orée'} : ${m.title}`,m.id,false);}
    if(m.question)m.question.award=m.award;
    if(m.kind==='build'){m.draft=body.answer;state.base[String(ch.chapter)]=body.answer;}
    if(m.kind==='puzzle')m.draft=body.answer;
    return {correct:true,points:m.award};
  }
  throw new CollegeError('Cette activité n’existe pas.');
}

export function redactCollege(state:CollegeState):void{
  function hide(q:CollegeQuestion){delete (q as any).answers;if(!q.help)delete (q as any).hint;if(!q.solved)delete (q as any).explanation;}
  if(state.session)state.session.questions.forEach(hide);
  Object.values(state.adventures).forEach(ch=>ch.missions.forEach(m=>{if(!m.help)delete m.hint;if(m.question)hide(m.question);m.sanctuary?.forEach(hide);if(m.puzzle)delete m.puzzle.solution;}));
}
