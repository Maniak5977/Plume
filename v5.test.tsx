import test from 'node:test';
import {puzzleAnswer} from './quest-helpers';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {newFamily,newProfile,perform,publicFamily,GameError} from '../../lib/game';
import {ownedSkins,equippedSkin,equippedEquipment,upgradeWardrobe} from '../../lib/wardrobe';
import {makeCollegeSession,upgradeGerman,collegeUnlocked,newCollegeState} from '../../lib/college';
import {GERMAN_BEGINNER_TOPICS,SUBJECTS,COLLEGE_TOPICS} from '../../lib/college-catalog';
import {CollegeHub} from '../../components/college-hub';
import {ScratchPad} from '../../components/writing-pad';
import {AvatarArt} from '../../components/avatar-art';
import {type PuzzleSpec,validatePuzzle} from '../../lib/adventures';

function fixture(){const f=newFamily(),p=newProfile('Enfant');f.profiles.push(p);return {f,p,act:(action:string,args:Record<string,unknown>={})=>perform(f,{action,profileId:p.id,...args})};}
test('une tenue payée pour un avatar ne débloque pas celle d’un autre',()=>{
 const {f,p,act}=fixture();p.stars=1000;p.schoolStars=750;
 act('buySkin',{skin:'cosmos',avatar:'explorer'});assert.equal(p.stars,700);assert.equal(equippedSkin(p),'cosmos');
 act('appearance',{avatar:'snoopy'});assert.equal(equippedSkin(p),'classic');assert.deepEqual(ownedSkins(p),['classic']);
 assert.throws(()=>act('appearance',{skin:'cosmos'}),GameError);assert.equal(p.stars,700);
 act('buySkin',{skin:'cosmos',avatar:'snoopy'});assert.equal(p.stars,400);assert.equal(equippedSkin(p),'cosmos');
 act('buySkin',{skin:'cosmos',avatar:'snoopy'});assert.equal(p.stars,400);
 act('appearance',{avatar:'explorer'});assert.equal(equippedSkin(p),'cosmos');assert.equal(p.schoolStars,750);assert.equal(f.profiles[0].stars,600);
 assert.throws(()=>act('buySkin',{skin:'cosmos',avatar:'golem'}),GameError);
});
test('la migration corrige Cosmos de Léon sans retirer son achat ni ses progrès',()=>{
 const p=newProfile('Léon');delete p.skinsByAvatar;delete p.equippedSkins;p.owned=['explorer','snoopy','trex'];p.avatar='snoopy';p.skin='cosmos';p.skins=['classic','cosmos'];p.stars=37;p.letterLevel=12;
 assert.ok(upgradeWardrobe(p));assert.ok(ownedSkins(p,'explorer').includes('cosmos'));assert.ok(!ownedSkins(p,'snoopy').includes('cosmos'));assert.equal(equippedSkin(p),'classic');assert.equal(equippedSkin(p,'explorer'),'cosmos');assert.equal(p.stars,37);assert.equal(p.letterLevel,12);assert.ok(p.owned.includes('link'));assert.equal(upgradeWardrobe(p),false);
 const marius=newProfile('Marius');delete marius.skinsByAvatar;delete marius.equippedSkins;marius.avatar='trex';marius.skins=['classic','aventurier'];marius.skin='aventurier';upgradeWardrobe(marius);assert.equal(equippedSkin(marius),'aventurier');assert.ok(!ownedSkins(marius,'explorer').includes('aventurier'));
});
test('les équipements restent payants, propres à l’avatar et mémorisés au changement',()=>{
 const {p,act}=fixture();p.stars=900;act('appearance',{avatar:'link'});act('buyEquipment',{equipment:'sword'});assert.equal(p.stars,800);assert.equal(equippedEquipment(p),'sword');
 act('appearance',{avatar:'snoopy'});assert.equal(equippedEquipment(p),'none');assert.throws(()=>act('appearance',{equipment:'sword'}),GameError);assert.throws(()=>act('buyEquipment',{equipment:'bow'}),GameError);
 act('appearance',{avatar:'link'});assert.equal(equippedEquipment(p),'sword');act('appearance',{equipment:'none'});act('appearance',{equipment:'sword'});act('buyEquipment',{equipment:'sword'});assert.equal(p.stars,800);
});
test('Scribble peut capitaliser un mot sans rendre les accents facultatifs',()=>{
 const {p,act}=fixture();p.test=true;p.theme='snoopy';act('startPlume',{mode:'word',level:1});let id=p.plumeTask!.id;assert.equal(p.plumeTask!.target,'fête');assert.equal(act('checkPlume',{taskId:id,answer:'Fete'}).correct,false);assert.equal(act('checkPlume',{taskId:id,answer:'Fête'}).correct,true);
 p.theme='blocks';act('startAdventure',{theme:'blocks',chapter:0});const key='blocks:v2:0',ch=p.adventures[key];ch.index=3;assert.equal(act('checkAdventure',{key,missionId:ch.missions[3].id,answer:'Pierre'}).correct,true);
});
test('le parcours allemand débutant évite les verbes avancés et limite les nombres à dix',()=>{
 const p=newProfile('Collégien',false,'blocks','explorer','cinquieme');
 for(let i=0;i<30;i++){const s=makeCollegeSession('allemand','mixed','revision',p);assert.equal(s.questions.length,8);for(const q of s.questions){assert.ok(GERMAN_BEGINNER_TOPICS.includes(q.topic));assert.ok(q.support);assert.ok(!q.audioOnly);if(q.topic==='de-numbers')assert.ok(Number(q.answers[0])>=1&&Number(q.answers[0])<=10);if(q.kind==='order')assert.equal(q.tokens?.length,3);}}
 assert.throws(()=>makeCollegeSession('allemand','de-modal','revision',p));
});
test('la migration allemande préserve les réponses récompensées et allège les étapes restantes',()=>{
 const p=newProfile('Grand',false,'blocks','explorer','cinquieme');p.college=newCollegeState();const s=makeCollegeSession('allemand','de-modal','cinquieme',p);p.college.session=s;delete s.contentVersion;s.questions[0].solved=true;s.questions[0].award=10;s.points=10;s.index=1;p.stars=10;p.schoolStars=10;const first=structuredClone(s.questions[0]);
 assert.ok(upgradeGerman(p));assert.deepEqual(s.questions[0],first);assert.equal(s.difficulty,'revision');assert.equal(s.topic,'mixed');assert.ok(s.questions.slice(1).every(q=>!!q.support));assert.equal(s.points,10);assert.equal(p.stars,10);assert.equal(p.schoolStars,10);assert.equal(upgradeGerman(p),false);
});
const solve=puzzleAnswer;
function ordered(q:{answers:string[];tokens?:string[]}){let sentence=q.answers[0];const left=[...q.tokens!],out=[];while(left.length){const i=left.findIndex(t=>sentence===t||sentence.startsWith(t+' '));assert.ok(i>=0);const token=left.splice(i,1)[0];out.push(token);sentence=sentence.slice(token.length).trim();}return out;}
test('les cinq chapitres Zelda se terminent, gardent leurs éclats et ne paient pas deux fois',()=>{
 const {f,p,act}=fixture();p.grade='cinquieme';p.test=true;p.theme='zelda';let earned=0;
 for(let chapter=0;chapter<5;chapter++){const {key}=act('collegeStartMission',{chapter,world:'zelda'});const ch=p.college!.adventures[key];assert.equal(ch.missions[0].kind,'dialogue');assert.ok(ch.missions.length>=10);assert.ok(ch.missions.some(m=>m.puzzle));while(!ch.complete){const m=ch.missions[ch.index];if(m.kind==='exercise'){const q=m.question!;if(q.subject==='allemand')assert.ok(q.support);earned+=act('collegeMissionCheck',{key,missionId:m.id,answer:q.kind==='order'?ordered(q):q.answers[0]}).points;}else if(m.puzzle){const a=solve(m.puzzle);assert.ok(validatePuzzle(m.puzzle,a));earned+=act('collegeMissionCheck',{key,missionId:m.id,answer:a}).points;}act('collegeMissionNext',{key,missionId:m.id});}assert.ok(p.college!.completedStories?.includes(`zelda:${chapter}`));}
 assert.equal(earned,300);assert.equal(p.stars,300);assert.equal(p.schoolStars,0);assert.deepEqual(p.college!.completedChapters,[]);
 const {key}=act('collegeStartMission',{chapter:0,world:'zelda'}),ch=p.college!.adventures[key];while(!ch.complete){const m=ch.missions[ch.index];if(m.question)assert.equal(act('collegeMissionCheck',{key,missionId:m.id,answer:m.question.kind==='order'?ordered(m.question):m.question.answers[0]}).points,0);else if(m.puzzle)assert.equal(act('collegeMissionCheck',{key,missionId:m.id,answer:solve(m.puzzle)}).points,0);act('collegeMissionNext',{key,missionId:m.id});}assert.equal(p.stars,300);
 const out=publicFamily(f).profiles.find((x:any)=>x.id===p.id);for(const a of Object.values(out.college.adventures) as any[])for(const m of a.missions){if(m.puzzle)assert.ok(!('solution' in m.puzzle));if(m.question)assert.ok(!('answers' in m.question));}
});
test('les aventures Zelda et Orée suivent chacune leurs chapitres précédents',()=>{
 const {f,p,act}=fixture();p.grade='cinquieme';p.schoolStars=1000;p.college=newCollegeState();for(const s of SUBJECTS){const t=COLLEGE_TOPICS.find(t=>t.subject===s.id)!;p.college.stats[t.id]={solved:2,errors:0,help:0,skipped:0};}
 assert.ok(collegeUnlocked(f,p,0,'zelda'));assert.ok(!collegeUnlocked(f,p,1,'zelda'));p.college.completedChapters=[0];assert.ok(collegeUnlocked(f,p,1));assert.ok(!collegeUnlocked(f,p,1,'zelda'));p.college.completedStories=['zelda:0'];assert.ok(collegeUnlocked(f,p,1,'zelda'));act('collegeStartMission',{chapter:1,world:'zelda'});assert.ok(p.college.adventures['zelda:1']);
});
test('le brouillon offre un champ clavier et l’aventure Zelda rend toutes ses étapes',()=>{
 const scratch=renderToStaticMarkup(<ScratchPad/>);assert.ok(scratch.includes('<textarea'));assert.ok(scratch.includes('Clavier'));assert.ok(scratch.includes('Mode du brouillon'));
 const avatar=renderToStaticMarkup(<AvatarArt id="link" skin="cosmos" equipment="sword"/>);assert.ok(avatar.includes('zelda-avatars.png'));assert.ok(avatar.includes('avatar-equipment sword'));
 const {f,p,act}=fixture();p.grade='cinquieme';p.test=true;p.theme='zelda';const noop=()=>{},asyncNoop=async()=>null;
 const list=renderToStaticMarkup(<CollegeHub profile={p} family={f} page="adventures" busy={false} act={asyncNoop} go={noop} onLook={noop} onMissionKey={noop}/>);assert.ok(list.includes('zelda-map-pins'));
 for(let chapter=0;chapter<5;chapter++){const {key}=act('collegeStartMission',{chapter,world:'zelda'}),ch=p.college!.adventures[key];for(let index=0;index<ch.missions.length;index++){ch.index=index;const html=renderToStaticMarkup(<CollegeHub profile={p} family={f} page="story" activeMissionKey={key} busy={false} act={asyncNoop} go={noop} onLook={noop} onMissionKey={noop}/>);assert.ok(html.length>500);assert.ok(!html.includes('undefined'));let depth=0;for(const tag of html.match(/<\/?button\b[^>]*>/g)??[]){if(tag.startsWith('</'))depth--;else{assert.equal(depth,0);depth++;}}assert.equal(depth,0);}}
});
