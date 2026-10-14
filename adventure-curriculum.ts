import {COLLEGE_TOPICS,GERMAN_BEGINNER_TOPICS,SUBJECTS,type Subject,type CollegeDifficulty} from './college-catalog';
import {makeCollegeQuestion} from './college-content';
import {yearPhase} from './quest-year';
import type {Profile} from './game';
import type {CollegeCoursePlan,AdventureCurriculum,CollegeQuestion} from './college-types';

const DEFAULTS:Record<Subject,string[][]>={
 maths:[['math-priorities','math-signed'],['math-fractions','math-proportion'],['math-geometry','math-coordinates'],['math-fractions','math-percent'],['math-algebra','math-statistics'],['math-priorities','math-signed','math-fractions','math-proportion','math-geometry','math-algebra']],
 francais:[['fr-verbs','fr-functions'],['fr-agreements','fr-classes'],['fr-functions','fr-reading'],['fr-verbs','fr-reading'],['fr-classes','fr-functions'],['fr-verbs','fr-functions','fr-reading']],
 anglais:[['en-present','en-questions'],['en-have','en-reading'],['en-present','en-reading'],['en-past','en-reading'],['en-questions','en-past'],['en-present','en-past','en-reading']],
 allemand:[['de-greetings','de-numbers'],['de-colors','de-vocab'],['de-sein','de-order'],['de-reading','de-vocab'],['de-numbers','de-reading'],['de-sein','de-reading']],
};
export function adventureCurriculum(p?:Profile,chapter=0):AdventureCurriculum{
 const plan=p?.college?.coursePlan,phase=yearPhase(chapter),levels:Record<Subject,CollegeDifficulty>={maths:'cinquieme',francais:'cinquieme',anglais:plan?.englishLevel??'cinquieme',allemand:plan?.germanLevel??'revision'};
 const topics={} as Record<Subject,string[]>;
 for(const {id:subject} of SUBJECTS){
  const allowed=COLLEGE_TOPICS.filter(t=>t.subject===subject&&(subject!=='allemand'||levels.allemand!=='revision'||GERMAN_BEGINNER_TOPICS.includes(t.id))).map(t=>t.id);
  const manual=plan?.mode==='manual'?plan.topics[subject]:undefined;
  const practiced=COLLEGE_TOPICS.filter(t=>t.subject===subject&&(p?.college?.stats[t.id]?.solved??0)>0).map(t=>t.id);
  const active=p?.college?.session?.subject===subject&&p.college.session.topic!=='mixed'?p.college.session.topic:null;
  const list=manual??(active?[active,...practiced]:practiced.length?practiced:DEFAULTS[subject][phase]);
  topics[subject]=Array.from(new Set(list.filter(t=>allowed.includes(t))));
  if(!topics[subject].length)topics[subject]=DEFAULTS[subject][phase].filter(t=>allowed.includes(t));
 }
 return {grade:'cinquieme',version:2,revision:p?.college?.courseRevision??0,phase,topics,levels};
}
export function parseCoursePlan(value:Record<string,any>):CollegeCoursePlan{
 if(value.mode!=='auto'&&value.mode!=='manual')throw new Error('Choisis le suivi des entraînements ou les notions vues en classe.');
 const englishLevel:CollegeDifficulty=value.englishLevel==='revision'?'revision':'cinquieme',germanLevel:CollegeDifficulty=value.germanLevel==='cinquieme'?'cinquieme':'revision';
 const topics={} as Record<Subject,string[]>;
 for(const {id:subject} of SUBJECTS){
  const list=value.topics?.[subject];
  if(value.mode==='manual'&&(!Array.isArray(list)||!list.length||list.length>COLLEGE_TOPICS.length))throw new Error('Choisis au moins une notion dans chaque matière.');
  const selection=Array.from(new Set(Array.isArray(list)?list:[]));
  if(selection.some(t=>typeof t!=='string'||!COLLEGE_TOPICS.some(c=>c.id===t&&c.subject===subject)||(subject==='allemand'&&germanLevel==='revision'&&!GERMAN_BEGINNER_TOPICS.includes(t))))throw new Error('Une notion ne correspond pas à cette matière ou au niveau de langue choisi.');
  topics[subject]=selection as string[];
 }
 return {mode:value.mode,topics,englishLevel,germanLevel};
}
export function courseQuestion(c:AdventureCurriculum,subject:Subject,offset:number,exclude:CollegeQuestion[]=[]):CollegeQuestion{
 const pool=c.topics[subject],topic=pool[Math.abs(offset)%pool.length];let q=makeCollegeQuestion(topic,c.levels[subject],c.phase);
 let attempts=0;while(exclude.some(x=>x.context===q.context&&x.prompt===q.prompt)&&attempts++<80)q=makeCollegeQuestion(topic,c.levels[subject],c.phase);
 return q;
}
export function curriculumNames(c:AdventureCurriculum){return SUBJECTS.map(s=>({subject:s.id,name:s.name,topics:c.topics[s.id].map(id=>COLLEGE_TOPICS.find(t=>t.id===id)?.name??id),level:c.levels[s.id]}));}
