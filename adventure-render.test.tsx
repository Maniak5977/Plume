import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {AdventurePlay} from '../../components/adventure-play';
import {makeChapter} from '../../lib/adventures';
import {newProfile} from '../../lib/game';
import type {Theme} from '../../lib/catalog';
test('toutes les étapes des quinze chapitres produisent une interface complète',()=>{
 const p=newProfile('Papa',true);let count=0;
 for(const theme of ['blocks','dinos','snoopy'] as Theme[])for(let n=0;n<5;n++){
  const ch=makeChapter(theme,n,p);
  for(let i=0;i<ch.missions.length;i++){
   ch.index=i;const m=ch.missions[i];
   const html=renderToStaticMarkup(<AdventurePlay chapter={ch} profile={p} busy={false} onAction={async()=>({})} onBack={()=>{}} onNextChapter={()=>{}} say={()=>{}} mathHelp={()=>null}/>);
   assert.ok(html.includes('CHAPITRE'));assert.ok(html.includes('story-workspace'));assert.ok(!html.includes('undefined'));
   if(m.kind==='dialogue')assert.ok(html.includes('dialogue-card'));
   if(m.kind==='build')assert.ok(html.includes('block-inventory'));
   if(m.kind==='math'||m.kind==='write')assert.ok(html.includes('adventure-pencil'));if(m.kind==='math'){assert.ok(html.includes('math-layout'));assert.ok(html.includes('side-scratch'));assert.ok(!html.includes('story-scene-wrap'));}
   // A nested button would break browser parsing / hydration.
   let open=0;for(const token of html.match(/<\/?button\b[^>]*>/g)??[]){if(token.startsWith('</'))open--;else{assert.equal(open,0);open++;}}assert.equal(open,0);
   count++;
  }
  ch.complete=true;assert.ok(renderToStaticMarkup(<AdventurePlay chapter={ch} profile={p} busy={false} onAction={async()=>({})} onBack={()=>{}} onNextChapter={()=>{}} say={()=>{}} mathHelp={()=>null}/>).includes('CHAPITRE'));
 }
 assert.ok(count>=110);
});
