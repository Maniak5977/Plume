import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {newFamily,newProfile,perform,publicFamily,makeQuestion,makeSession,GameError,type Profile} from '../../lib/game';
import {STORIES,THEMES} from '../../lib/catalog';
import {adventureKey,makeChapter,validatePuzzle} from '../../lib/adventures';
import {adventureCurriculum,parseCoursePlan} from '../../lib/adventure-curriculum';
import {makeZeldaCollegeAdventure} from '../../lib/zelda-quest';
import {newCollegeState,upgradeCollegeAdventures,collegeUnlocked} from '../../lib/college';
import {ZELDA_YEAR,BLOCK_YEAR,yearPhase} from '../../lib/quest-year';
import {runePuzzle,sudokuSolutions,wordSearchPuzzle,wordPath,independentPuzzle,harvestPuzzle} from '../../lib/quest-puzzles';
import {ensureBlockWorld,availableBlocks,blockCounts,upgradeBlockWorld} from '../../lib/block-world';
import {CollegeHub} from '../../components/college-hub';
import {WorldWorkshop} from '../../components/world-workshop';
import {AdventureCourseSettings} from '../../components/adventure-courses';
import {YearChapterList} from '../../components/year-chapter-list';
import {puzzleAnswer,collegeAnswer,verifyMarkup} from './quest-helpers';

const noAction=async()=>null,noop=()=>{};
function fixture(grade:'ce1'|'cinquieme'='ce1',name='Enfant'){const f=newFamily(),p=newProfile(name,true,'blocks','explorer',grade);f.profiles.push(p);p.stars=0;return {f,p,act:(action:string,args:Record<string,unknown>={})=>perform(f,{action,profileId:p.id,...args})};}
const manual={mode:'manual',englishLevel:'cinquieme',germanLevel:'revision',topics:{maths:['math-fractions'],francais:['fr-functions'],anglais:['en-reading'],allemand:['de-colors']}};
function finishCE1(f:ReturnType<typeof newFamily>,p:Profile,key:string){const ch=p.adventures[key];let points=0;while(!ch.complete){const m=ch.missions[ch.index];if(m.kind!=='dialogue'){const answer=m.kind==='write'?m.target:m.kind==='choice'?m.solutions![0]:m.kind==='math'?m.question!.answer:m.kind==='build'?Object.fromEntries(m.construction!.targets.map(k=>[k,m.construction!.material])):puzzleAnswer(m.puzzle!);const r=perform(f,{action:'checkAdventure',profileId:p.id,key,missionId:m.id,answer});assert.equal(r.correct,true,`${ch.theme}:${ch.chapter}:${m.title}`);points+=r.points;perform(f,{action:'checkAdventure',profileId:p.id,key,missionId:m.id,answer});}perform(f,{action:'nextAdventure',profileId:p.id,key,missionId:m.id});}return points;}
function finishCollege(f:ReturnType<typeof newFamily>,p:Profile,key:string){const ch=p.college!.adventures[key];let points=0;while(!ch.complete){const m=ch.missions[ch.index];if(m.question){const r=perform(f,{action:'collegeMissionCheck',profileId:p.id,key,missionId:m.id,answer:collegeAnswer(m.question)});assert.equal(r.correct,true);points+=r.points;}else if(m.sanctuary){for(const q of m.sanctuary){const args={action:'collegeMissionCheck',profileId:p.id,key,missionId:m.id,lockId:q.id,answer:collegeAnswer(q)};const r=perform(f,args);assert.equal(r.correct,true);points+=r.points;const stars=p.stars;perform(f,args);assert.equal(p.stars,stars);}}else if(m.puzzle){const r=perform(f,{action:'collegeMissionCheck',profileId:p.id,key,missionId:m.id,answer:puzzleAnswer(m.puzzle)});assert.equal(r.correct,true,`${ch.chapter}:${m.puzzle.type}`);points+=r.points;}perform(f,{action:'collegeMissionNext',profileId:p.id,key,missionId:m.id});}return points;}

test('deux quêtes de 36 chapitres, six actes et une progression CE1 réelle',()=>{
 assert.equal(ZELDA_YEAR.length,36);assert.equal(BLOCK_YEAR.length,36);assert.equal(STORIES.zelda.chapters.length,36);assert.equal(STORIES.blocks.chapters.length,36);assert.equal(THEMES.reduce((n,t)=>n+STORIES[t.id].chapters.length,0),82);
 assert.equal(new Set(BLOCK_YEAR.map(c=>c.title)).size,36);assert.equal(new Set(ZELDA_YEAR.map(c=>c.title)).size,36);assert.equal(yearPhase(0),0);assert.equal(yearPhase(35),5);
 const p=newProfile('Marius'),early=makeChapter('blocks',5,p),groups=makeChapter('blocks',12,p),late=makeChapter('blocks',35,p);
 assert.equal(early.missions[0].kind,'dialogue');assert.ok(early.missions[0].prompt.includes('pièces'));assert.ok(groups.missions.some(m=>m.question?.operator==='×'));assert.ok(late.missions.some(m=>m.question?.operator==='two-step'));assert.ok(late.missions.some(m=>m.target==='Bienvenue chez nous.'));
});
test('les notions de classe et les niveaux de langues appartiennent à chaque profil',()=>{
 const {f,p,act}=fixture('cinquieme','Léon'),other=newProfile('Autre',true,'zelda','link','cinquieme');f.profiles.push(other);
 act('collegeSetCurriculum',manual);assert.equal(p.college!.courseRevision,1);assert.ok(!other.college?.coursePlan);
 for(const chapter of [0,5,21,35]){const ch=makeZeldaCollegeAdventure(chapter,p);assert.equal(ch.curriculum!.grade,'cinquieme');assert.equal(ch.curriculum!.levels.maths,'cinquieme');assert.equal(ch.curriculum!.levels.allemand,'revision');for(const m of ch.missions)for(const q of [...(m.question?[m.question]:[]),...(m.sanctuary??[])]){assert.ok(manual.topics[q.subject].includes(q.topic),`${q.subject}:${q.topic}`);if(q.subject==='allemand')assert.ok(q.support);}}
 assert.throws(()=>parseCoursePlan({...manual,topics:{...manual.topics,maths:['de-colors']}}));assert.throws(()=>parseCoursePlan({...manual,topics:{...manual.topics,anglais:[]}}));assert.throws(()=>parseCoursePlan({...manual,topics:{...manual.topics,allemand:['de-modal']}}));
 act('collegeSetCurriculum',{...manual,englishLevel:'revision'});assert.equal(adventureCurriculum(p).levels.anglais,'revision');assert.equal(adventureCurriculum(p).levels.maths,'cinquieme');
});
test('le mode automatique suit les entraînements, les phases et les parcours restent séparés',()=>{
 const {f,p,act}=fixture('cinquieme');p.college=newCollegeState();p.college.stats['math-geometry']={solved:3,errors:0,help:0,skipped:0};act('collegeStart',{subject:'maths',topic:'math-signed'});
 assert.deepEqual(adventureCurriculum(p).topics.maths,['math-signed','math-geometry']);act('collegeStartMission',{chapter:0,world:'zelda'});const quest=p.college!.adventures['zelda:0'];act('collegeStart',{subject:'maths',topic:'math-fractions',replace:true});assert.ok(upgradeCollegeAdventures(p));assert.equal(quest.missions[1].question!.topic,'math-fractions');const fresh=newProfile('Grand',false,'zelda','link','cinquieme');assert.notDeepEqual(adventureCurriculum(fresh,0).topics.maths,adventureCurriculum(fresh,30).topics.maths);
 assert.throws(()=>act('startAdventure',{theme:'zelda',chapter:0}),GameError);const ce1=newProfile('Marius',true);f.profiles.push(ce1);assert.throws(()=>perform(f,{action:'collegeStartMission',profileId:ce1.id,chapter:0,world:'zelda'}),GameError);
});
test('les sudokus faciles et moyens ont une seule solution et refusent cases fixes ou doublons',()=>{
 for(const age of [7,12] as const)for(const phase of [0,3,5])for(let i=0;i<8;i++){const spec=runePuzzle(age,phase),r=spec.runes!,answer=puzzleAnswer(spec);assert.equal(r.size,age===7?4:9);assert.equal(sudokuSolutions(r.givens,r.size,r.boxWidth,r.boxHeight),1);assert.ok(validatePuzzle(spec,answer));assert.ok(!validatePuzzle(spec,{}));const key=Object.keys(r.givens)[0];assert.ok(!validatePuzzle(spec,{...answer,[key]:r.givens[key]}));const changed={...answer},free=Object.keys(changed)[0],row=Math.floor(Number(free)/r.size),given=Object.keys(r.givens).find(k=>Math.floor(Number(k)/r.size)===row);if(given){changed[free]=r.givens[given];assert.ok(!validatePuzzle(spec,changed));}}
});
test('les mots cachés acceptent les vrais segments, y compris inversés, et rejettent les raccourcis',()=>{
 for(const age of [7,12] as const)for(const phase of [0,2,5])for(const world of ['blocks','zelda'] as const){const spec=wordSearchPuzzle(age,phase,world),answer=puzzleAnswer(spec);assert.equal(spec.words!.length,age===7?4:6);assert.ok(validatePuzzle(spec,answer));const word=spec.words![0];answer[word]=[...answer[word]].reverse();assert.ok(validatePuzzle(spec,answer));answer[word][1]=answer[word][0];assert.ok(!validatePuzzle(spec,answer));assert.ok(!validatePuzzle(spec,{}));}
 const spec=wordSearchPuzzle(7,0,'blocks');assert.deepEqual(wordPath(spec,0,10),[]);assert.deepEqual(wordPath(spec,0,3),[0,1,2,3]);assert.deepEqual(wordPath(spec,-1,2),[]);
});
test('devinettes, rébus et labyrinthes sont de vrais casse-têtes distincts des cours',()=>{
 for(const age of [7,12] as const)for(let chapter=0;chapter<36;chapter++){const g=independentPuzzle(age,chapter,'zelda');assert.ok(g.title&&g.prompt&&g.hint);assert.ok(validatePuzzle(g.spec,puzzleAnswer(g.spec)),`${age}:${chapter}:${g.spec.type}`);assert.ok(!validatePuzzle(g.spec,null));if(['riddle','rebus'].includes(g.spec.type)){assert.ok(validatePuzzle(g.spec,{guess:g.spec.solution[0].toUpperCase()}));assert.ok(!validatePuzzle(g.spec,{guess:'gribouillage'}));}}
 const spec=harvestPuzzle('fer',3),answer=puzzleAnswer(spec);assert.ok(validatePuzzle(spec,answer));assert.ok(!validatePuzzle(spec,[...answer.slice(1),answer[1]]));assert.ok(!validatePuzzle(spec,answer.map(()=>99)));
});
test('les 82 chapitres CE1 se terminent et les matériaux gagnés ne sont pas payés deux fois',()=>{
 const {f,p,act}=fixture();let earned=0;
 for(const theme of THEMES.map(t=>t.id))for(let chapter=0;chapter<STORIES[theme].chapters.length;chapter++){const {key}=act('startAdventure',{theme,chapter});earned+=finishCE1(f,p,key);assert.ok(p.completedChapters.includes(key));}
 assert.equal(p.completedChapters.length,82);assert.equal(p.stars,earned);assert.equal(p.schoolStars,0);const world=ensureBlockWorld(p);assert.ok(Object.keys(world.sites).length>=20);assert.ok(world.resources.fer>0);assert.ok(world.resources.diamant>0);const inventory=structuredClone(world.resources),stars=p.stars;
 const {key}=act('startAdventure',{theme:'blocks',chapter:14});assert.equal(finishCE1(f,p,key),0);assert.deepEqual(world.resources,inventory);assert.equal(p.stars,stars);assert.ok(Object.values(world.sites.mine).includes('fer'));
});
test('les 36 chapitres du collège se terminent, varient les jeux et gardent les sceaux',()=>{
 const {f,p,act}=fixture('cinquieme');let earned=0;const kinds=new Set<string>();
 for(let chapter=0;chapter<36;chapter++){const {key}=act('collegeStartMission',{world:'zelda',chapter});const ch=p.college!.adventures[key];assert.equal(ch.missions.length,11);for(const m of ch.missions){if(m.puzzle)kinds.add(m.puzzle.type);if(m.sanctuary)kinds.add('sanctuary');}earned+=finishCollege(f,p,key);}
 assert.deepEqual([...kinds].sort(),['maze','rebus','riddle','runes','sanctuary','wordsearch'].sort());assert.equal(p.college!.completedStories!.length,36);assert.equal(earned,2280);assert.equal(p.stars,earned);assert.equal(p.schoolStars,0);
 const before=p.stars,{key}=act('collegeStartMission',{world:'zelda',chapter:35});assert.equal(finishCollege(f,p,key),0);assert.equal(p.stars,before);
 assert.throws(()=>act('collegeStartMission',{world:'zelda',chapter:36}),GameError);p.test=false;p.schoolStars=10000;assert.ok(!collegeUnlocked(f,p,1,'oree'));
});
test('la migration conserve les réponses anciennes, les points et les verrous déjà ouverts',()=>{
 const {p,act}=fixture('cinquieme');act('collegeStartMission',{chapter:0,world:'zelda'});let ch=p.college!.adventures['zelda:0'];act('collegeMissionNext',{key:'zelda:0',missionId:ch.missions[0].id});const q=ch.missions[1].question!;act('collegeMissionCheck',{key:'zelda:0',missionId:ch.missions[1].id,answer:collegeAnswer(q)});act('collegeMissionNext',{key:'zelda:0',missionId:ch.missions[1].id});const previous=structuredClone(ch.missions.slice(0,2)),oldFuture=ch.missions[3].id,stars=p.stars;delete ch.curriculum;
 assert.ok(upgradeCollegeAdventures(p));assert.deepEqual(ch.missions.slice(0,2),previous);assert.notEqual(ch.missions[3].id,oldFuture);assert.equal(p.stars,stars);assert.equal(upgradeCollegeAdventures(p),false);
 act('collegeStartMission',{chapter:5,world:'zelda'});ch=p.college!.adventures['zelda:5'];ch.index=9;const first=ch.missions[9].sanctuary![0];act('collegeMissionCheck',{key:'zelda:5',missionId:ch.missions[9].id,lockId:first.id,answer:collegeAnswer(first)});const saved=structuredClone(first),before=p.stars;act('collegeSetCurriculum',manual);assert.deepEqual(ch.missions[9].sanctuary![0],saved);assert.equal(ch.missions[9].sanctuary![1].topic,'math-fractions');assert.equal(p.stars,before);
 // A V5 reward at this step also blocks the new individual-lock rewards on replay.
 p.college!.rewardedMissions.push('zelda:11:9');act('collegeStartMission',{chapter:11,world:'zelda'});ch=p.college!.adventures['zelda:11'];ch.index=9;for(const lock of ch.missions[9].sanctuary!)assert.equal(act('collegeMissionCheck',{key:'zelda:11',missionId:ch.missions[9].id,lockId:lock.id,answer:collegeAnswer(lock)}).points,0);
});
test('l’atelier garde les sites et stocks par profil, refuse les blocs impossibles et restitue les blocs effacés',()=>{
 const {f,p,act}=fixture(),other=newProfile('Autre',true);f.profiles.push(other);const world=ensureBlockWorld(p),board=Object.fromEntries(Array.from({length:10},(_,i)=>[`${i%6},${Math.floor(i/6)},0`,'bois']));
 act('saveBlockWorld',{site:'maison',board});assert.equal(availableBlocks(world).bois,70);act('saveBlockWorld',{site:'jardin',board});assert.equal(availableBlocks(world).bois,60);assert.ok(!other.blockWorld);assert.equal(p.stars,0);
 assert.throws(()=>act('saveBlockWorld',{site:'maison',board:{'6,0,0':'bois'}}),GameError);assert.throws(()=>act('saveBlockWorld',{site:'maison',board:{'0,0,0':'diamant'}}),GameError);assert.throws(()=>act('saveBlockWorld',{site:'secret',board:{}}),GameError);assert.throws(()=>act('saveBlockWorld',{site:'maison',board:{'0,0,0':'inconnu'}}),GameError);
 const excessive=Object.fromEntries(Array.from({length:81},(_,i)=>[`${i%6},${Math.floor(i/6)%5},${Math.floor(i/30)}`,'bois']));assert.throws(()=>act('saveBlockWorld',{site:'maison',board:excessive}),GameError);
 act('saveBlockWorld',{site:'maison',board:{}});assert.equal(availableBlocks(world).bois,70);assert.equal(blockCounts(world).bois,10);
 const legacy=newProfile('Ancien');legacy.houseBlocks={'1,1,0':'pierre','1,1,1':'bois'};legacy.stars=72;assert.ok(upgradeBlockWorld(legacy));assert.deepEqual(legacy.blockWorld!.sites.maison,legacy.houseBlocks);assert.equal(legacy.stars,72);assert.equal(upgradeBlockWorld(legacy),false);
});
test('les nouveaux domaines de maths CE1 produisent des séances distinctes et des résultats exacts',()=>{
 const p=newProfile('Marius');for(const topic of ['groups','money','hundreds','twoSteps']){const s=makeSession(topic,'cross',p);assert.equal(new Set(s.questions.map(q=>q.prompt)).size,10);for(let i=0;i<200;i++){const q=makeQuestion(topic),v=q.visual!,numbers=q.prompt.match(/\d+/g)!.map(Number);assert.ok(q.answer>=0&&Number.isInteger(q.answer));if(topic==='groups')assert.equal(q.answer,v.a*v.b);else if(topic==='twoSteps')assert.equal(q.answer,numbers[0]+numbers[1]-numbers[2]);else assert.equal(q.answer,v.a+v.b);if(topic==='hundreds')assert.ok(q.answer>=100&&q.answer<=300);}}
});
test('l’API masque aussi les réponses des sanctuaires et les solutions des nouveaux jeux',()=>{
 const {f,p,act}=fixture('cinquieme');for(let chapter=0;chapter<6;chapter++)act('collegeStartMission',{chapter,world:'zelda'});const child=newProfile('Marius',true);f.profiles.push(child);for(let chapter=6;chapter<11;chapter++)perform(f,{action:'startAdventure',profileId:child.id,theme:'blocks',chapter});const out=publicFamily(f);
 for(const person of out.profiles){for(const ch of Object.values(person.college?.adventures??{}) as any[])for(const m of ch.missions){if(m.puzzle)assert.ok(!('solution' in m.puzzle));if(m.question)assert.ok(!('answers' in m.question));for(const q of m.sanctuary??[])assert.ok(!('answers' in q));assert.ok(!('hint' in m));}for(const ch of Object.values(person.adventures) as any[])for(const m of ch.missions){if(m.puzzle)assert.ok(!('solution' in m.puzzle));assert.ok(!('hint' in m));}}
 assert.ok(p.college!.adventures['zelda:0'].missions[9].puzzle!.solution);
});
test('les cartes annuelles, l’atelier et les 396 étapes collège se rendent sans structure cassée',()=>{
 const {f,p}=fixture('cinquieme','Léon');p.theme='zelda';p.college=newCollegeState();verifyMarkup(renderToStaticMarkup(<AdventureCourseSettings profile={p} busy={false} act={noAction}/>));verifyMarkup(renderToStaticMarkup(<CollegeHub profile={p} family={f} page="adventures" busy={false} act={noAction} go={noop} onLook={noop} onMissionKey={noop}/>));
 for(let chapter=0;chapter<36;chapter++){const key=`zelda:${chapter}`,ch=makeZeldaCollegeAdventure(chapter,p);p.college.adventures[key]=ch;for(let index=0;index<ch.missions.length;index++){ch.index=index;const html=renderToStaticMarkup(<CollegeHub profile={p} family={f} page="story" activeMissionKey={key} busy={false} act={noAction} go={noop} onLook={noop} onMissionKey={noop}/>);verifyMarkup(html);assert.ok(html.includes('Léon'));assert.ok(html.includes('5e'));}}
 const marius=newProfile('Marius',true);verifyMarkup(renderToStaticMarkup(<WorldWorkshop profile={marius} busy={false} act={noAction} onBack={noop}/>));verifyMarkup(renderToStaticMarkup(<YearChapterList profile={marius} family={f} theme="blocks" busy={false} onOpen={noop}/>));
});
