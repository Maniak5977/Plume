import assert from 'node:assert/strict';
import type {PuzzleSpec} from '../../lib/adventures';
import type {CollegeQuestion} from '../../lib/college-types';

export function puzzleAnswer(spec:PuzzleSpec):any{
 if(['order','match','symmetry','runes','wordsearch'].includes(spec.type))return structuredClone(spec.solution);
 if(spec.type==='riddle'||spec.type==='rebus')return {guess:spec.solution[0]};
 if(spec.type==='harvest')return spec.nodes!.filter(n=>n.material===spec.resource).slice(0,spec.target).map(n=>n.cell);
 if(spec.type==='maze'){
  const queue=[[spec.start!]],seen=new Set([spec.start!]);
  while(queue.length){const path=queue.shift()!,last=path.at(-1)!;if(last===spec.end)return path;for(const n of [last-1,last+1,last-spec.width!,last+spec.width!])if(n>=0&&n<spec.width!*spec.height!&&!seen.has(n)&&!spec.blocked?.includes(n)&&Math.abs(n%spec.width!-last%spec.width!)+Math.abs(Math.floor(n/spec.width!)-Math.floor(last/spec.width!))===1){seen.add(n);queue.push([...path,n]);}}
 }
 if(spec.type==='packing'){
  function place(i:number,used:Set<number>,result:Record<string,number>):Record<string,number>|null{
   if(i===spec.pieces!.length)return result;const p=spec.pieces![i],w=spec.width!,h=spec.height!;
   for(let y=0;y<=h-p.height;y++)for(let x=0;x<=w-p.width;x++){const cells=Array.from({length:p.width*p.height},(_,j)=>(y+Math.floor(j/p.width))*w+x+j%p.width);if(cells.some(c=>used.has(c)||spec.blocked?.includes(c)))continue;const r=place(i+1,new Set([...used,...cells]),{...result,[p.id]:y*w+x});if(r)return r;}return null;
  }
  const answer=place(0,new Set(),{});if(answer)return answer;
 }
 if(spec.type==='balance'){for(let i=0;i<spec.items!.length;i++)for(let j=i+1;j<spec.items!.length;j++)if(spec.items![i].value! + spec.items![j].value! === spec.target)return [spec.items![i].id,spec.items![j].id];}
 if(spec.type==='memory'){const seen:Record<string,number>={},pairs:number[][]=[];spec.cards!.forEach((v,i)=>{if(v in seen)pairs.push([seen[v],i]);else seen[v]=i;});return pairs;}
 throw new Error(`No solution for ${spec.type}`);
}
export function collegeAnswer(q:CollegeQuestion):string|string[]{
 if(q.kind!=='order')return q.answers[0];let remaining=q.answers[0];const tokens=[...q.tokens!],ordered:string[]=[];
 while(tokens.length){const i=tokens.findIndex(t=>remaining===t||remaining.startsWith(t+' '));assert.ok(i>=0,remaining);const t=tokens.splice(i,1)[0];ordered.push(t);remaining=remaining.slice(t.length).trim();}assert.equal(remaining,'');return ordered;
}
export function verifyMarkup(html:string){
 assert.ok(html.length>200);assert.ok(!html.includes('undefined'));let depth=0;
 for(const tag of html.match(/<\/?button\b[^>]*>/g)??[]){if(tag.startsWith('</'))depth--;else{assert.equal(depth,0,'nested button');depth++;}}assert.equal(depth,0);
}
