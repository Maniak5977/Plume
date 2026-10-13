'use client';
import {useRef,useEffect,useState,useCallback, forwardRef,useImperativeHandle} from 'react';
import {RotateCcw, Undo2, Eraser, PenLine, Keyboard} from 'lucide-react';
type Point={x:number;y:number;p:number};type Stroke=Point[];
export type PadHandle={clear:()=>void};
export const ScratchPad=forwardRef<PadHandle,{label?:string;className?:string;storageKey?:string}>(({label='Mon brouillon',className='',storageKey},ref)=>{
 const canvas=useRef<HTMLCanvasElement>(null),strokes=useRef<Stroke[]>([]),active=useRef<Stroke|null>(null);
 const [mode,setMode]=useState<'ink'|'text'>('text'),[notes,setNotes]=useState(''),[restored,setRestored]=useState(false);
 useEffect(()=>{let saved:any=null;try{if(storageKey)saved=JSON.parse(sessionStorage.getItem(storageKey)??'null');}catch{}setNotes(saved?.notes??'');setMode(saved?.mode==='ink'||saved?.mode==='text'?saved.mode:window.matchMedia('(pointer: coarse) and (max-width: 680px)').matches?'text':'ink');setRestored(true);},[storageKey]);
 useEffect(()=>{if(!storageKey||!restored)return;try{sessionStorage.setItem(storageKey,JSON.stringify({notes,mode}));}catch{}},[notes,mode,storageKey,restored]);
 const redraw=useCallback(()=>{const el=canvas.current;if(!el)return;const rect=el.getBoundingClientRect();const dpr=window.devicePixelRatio||1;el.width=rect.width*dpr;el.height=rect.height*dpr;const ctx=el.getContext('2d')!;ctx.scale(dpr,dpr);ctx.strokeStyle='#ddd8c9';ctx.lineWidth=.7;for(let y=35;y<rect.height;y+=27){ctx.beginPath();ctx.moveTo(18,y);ctx.lineTo(rect.width-18,y);ctx.stroke();}
 for(const stroke of strokes.current){ctx.strokeStyle='#3b5779';ctx.lineWidth=2.1;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();stroke.forEach((p,i)=>i?ctx.lineTo(p.x*rect.width,p.y*rect.height):ctx.moveTo(p.x*rect.width,p.y*rect.height));ctx.stroke();}},[]);
 useEffect(()=>{if(mode!=='ink')return;redraw();const ob=new ResizeObserver(redraw);if(canvas.current)ob.observe(canvas.current);return()=>ob.disconnect();},[redraw,mode]);
 function clear(){strokes.current=[];active.current=null;setNotes('');redraw();if(storageKey)try{sessionStorage.removeItem(storageKey);}catch{}}
 useImperativeHandle(ref,()=>({clear}));
 function point(e:React.PointerEvent){const r=canvas.current!.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height,p:e.pressure||.5};}
 return <div className={'scratch '+className}><div className="scratch-head"><span>{label}</span><button className="icon-button" aria-label="Effacer le brouillon" onClick={clear}><Eraser size={18}/></button></div><div className="scratch-modes" role="group" aria-label="Mode du brouillon"><button type="button" aria-pressed={mode==='ink'} className={mode==='ink'?'active':''} onClick={()=>setMode('ink')}><PenLine size={16}/>Pencil / souris</button><button type="button" aria-pressed={mode==='text'} className={mode==='text'?'active':''} onClick={()=>setMode('text')}><Keyboard size={16}/>Clavier</button></div>{mode==='text'?<textarea aria-label={label+' au clavier'} value={notes} maxLength={4000} onChange={e=>setNotes(e.target.value)} autoCorrect="off" autoCapitalize="none" spellCheck={false} placeholder={'Écris tes calculs ici…\nEx. 24 × 3 = 72\n72 + 18 = 90'}/>:<canvas ref={canvas} onPointerDown={e=>{if(e.pointerType==='touch')return;e.currentTarget.setPointerCapture(e.pointerId);active.current=[point(e)];strokes.current.push(active.current);}} onPointerMove={e=>{if(active.current){active.current.push(point(e));redraw();}}} onPointerUp={()=>{active.current=null;redraw();}} onPointerCancel={()=>{active.current=null;}}/>}</div>;
});ScratchPad.displayName='ScratchPad';
export function WritingPad({target,mode,gap=14,onCounts}:{target:string;mode:string;gap?:number;onCounts:(c:number[])=>void}){
 const ref=useRef<HTMLCanvasElement>(null),strokes=useRef<Stroke[]>([]),active=useRef<Stroke|null>(null),rowStart=useRef(-1);
 const [ready,setReady]=useState(false),[animate,setAnimate]=useState(false),[step,setStep]=useState(0);
 // Same coordinate geometry and font-to-ruling ratio, enlarged physically by 20%.
 const width=1050/1.2,height=430;const bases=[181,284,387];
 const counts=useCallback(()=>{const c=[0,0,0];strokes.current.forEach(s=>{if(s.length<3)return;const y=s[0].y;const row=bases.findIndex(b=>y>=b-65&&y<=b+30);if(row>=0)c[row]++;});onCounts(c);},[onCounts]);
 const draw=useCallback(()=>{
  const el=ref.current;if(!el)return;const r=el.getBoundingClientRect(),dpr=window.devicePixelRatio||1;el.width=r.width*dpr;el.height=r.height*dpr;const ctx=el.getContext('2d')!;ctx.scale(r.width/width*dpr,r.width/width*dpr);
  ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,width,height);
  ctx.fillStyle='#7860b6';ctx.font='600 13px system-ui';ctx.fillText(mode==='letter'?'1  Je regarde le geste':'1  Je regarde les lettres qui se rejoignent',20,22);
  const size=gap*2.5;ctx.font=`${size}px BelleAllure`;ctx.textBaseline='alphabetic';
  if(mode==='letter'){
   // True stroke instructions for the first A / a are authored paths, not font-reveal guessed stroke order.
   if(target==='A'||target==='a'){
    for(let s=0;s<5;s++){
     const x=73+s*((width-95)/5);ctx.save();ctx.translate(x,36);ctx.scale(target==='A'?.82:1.08,target==='A'?.82:1.08);
     const paths=target==='A'?['M 0 54 C 10 54 16 30 20 8','M 20 8 C 23 -3 31 -2 31 13','M 31 13 C 31 41 33 58 47 53','M 9 28 L 39 28']:['M 25 10 C 7 4 -1 32 11 33 C 22 34 29 8 25 10','M 27 9 L 27 32 C 28 36 35 32 39 27'];
     ctx.lineCap='round';ctx.lineJoin='round';paths.forEach(path=>{ctx.strokeStyle='#e0d9ee';ctx.lineWidth=1.6;ctx.stroke(new Path2D(path));});paths.slice(0,s).forEach(path=>{ctx.strokeStyle='#7860b6';ctx.lineWidth=2.5;ctx.stroke(new Path2D(path));});ctx.fillStyle='#bd9749';ctx.beginPath();ctx.arc(target==='A'?0:25,target==='A'?54:10,2.8,0,Math.PI*2);ctx.fill();ctx.restore();
     ctx.font='12px system-ui';ctx.fillStyle='#697382';ctx.fillText(['Départ',target==='A'?'Je monte':'Je tourne',target==='A'?'Je tourne':'Je ferme',target==='A'?'Je descends':'Je repars','Je termine'][s],x+48,59);if(s<4){ctx.fillStyle='#b0a2cd';ctx.fillText('→',x+136,59);}
    }
   }else{
    ctx.font=`${size}px BelleAllure`;ctx.fillStyle='#7960bc';ctx.fillText(target,76,83);ctx.font='15px system-ui';ctx.fillStyle='#727b8b';ctx.fillText('Observe le modèle, puis prends ton temps pour le reproduire.',205,64);
   }
  }else{ctx.font=`${size}px BelleAllure`;ctx.fillStyle='#7960bc';ctx.fillText(target,76,78);}
  bases.forEach((base,i)=>{
   ctx.font='600 13px system-ui';ctx.fillStyle='#7860b6';ctx.fillText(['2  Je suis les repères','3  Je répète le geste','4  J’écris seul'][i],20,base-70);
   for(let j=-2;j<=4;j++){
    const y=base-j*gap;ctx.beginPath();ctx.strokeStyle=j===0?'#8e74ba':'#dcd3ec';ctx.lineWidth=j===0?1.1:.65;ctx.moveTo(25,y);ctx.lineTo(width-25,y);ctx.stroke();
   }
   ctx.beginPath();ctx.strokeStyle='#e6acb0';ctx.lineWidth=.9;ctx.moveTo(64,base-4*gap);ctx.lineTo(64,base+2*gap);ctx.stroke();
   if(i<2){ctx.font=`${size}px BelleAllure`;ctx.textBaseline='alphabetic';ctx.fillStyle=i===0?'#ac9bc1':'#beb3c8';const count=mode==='letter'?8:mode==='word'?3:1;const spacing=(width-110)/count;
    for(let j=0;j<count;j++){
     const x=87+j*spacing;ctx.fillText(target,x,base);if(i===0){ctx.fillStyle='#b390d1';ctx.beginPath();ctx.arc(x,base,2.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ac9bc1';}
    }
   }
  });
  // The same alphabetic baseline and 400-font-unit interline are shared by all ruled rows.
  for(const s of strokes.current){ctx.strokeStyle='#365675';ctx.lineWidth=1.89;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();s.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
  if(animate){const base=bases[0];ctx.font=`${size}px BelleAllure`;const tw=ctx.measureText(target).width;ctx.save();ctx.beginPath();ctx.rect(80,base-4*gap,tw*step/100+10,6*gap);ctx.clip();ctx.fillStyle='#7960bc';ctx.fillText(target,87,base);ctx.restore();}
 },[target,mode,gap,animate,step]);
 useEffect(()=>{let mounted=true;document.fonts.load('40px BelleAllure').then(()=>{if(mounted){setReady(true);draw();}});const observer=new ResizeObserver(draw);if(ref.current)observer.observe(ref.current);return()=>{mounted=false;observer.disconnect();};},[draw]);
 useEffect(()=>{draw();},[ready,draw]);
 useEffect(()=>{strokes.current=[];counts();setAnimate(false);},[target]);
 useEffect(()=>{if(!animate)return;const t=setInterval(()=>setStep(s=>s>=100?0:s+2),45);return()=>clearInterval(t);},[animate]);
 function point(e:React.PointerEvent){const r=ref.current!.getBoundingClientRect();return {x:(e.clientX-r.left)*width/r.width,y:(e.clientY-r.top)*width/r.width,p:e.pressure||.5};}
 return <div className="notebook"><div className="notebook-tools"><span>Mon cahier • {mode==='letter'?'8 lettres par ligne':'Je prends le temps d’écrire'}</span><div><button className="small-button" onClick={()=>{strokes.current.pop();counts();draw();}}><Undo2 size={15}/>Annuler</button><button className="small-button" onClick={()=>{strokes.current=[];counts();draw();}}><RotateCcw size={15}/>Effacer</button></div></div><canvas ref={ref} style={{aspectRatio:`${width}/${height}`}} aria-label={`Cahier d’écriture : ${target}`} onPointerDown={e=>{if(e.pointerType==='touch')return;const p=point(e);rowStart.current=bases.findIndex(b=>p.y>=b-65&&p.y<=b+30);if(rowStart.current<0)return;e.currentTarget.setPointerCapture(e.pointerId);active.current=[p];strokes.current.push(active.current);}} onPointerMove={e=>{if(active.current){const coalesced=e.nativeEvent.getCoalescedEvents?.();for(const event of (coalesced?.length?coalesced:[e.nativeEvent])){const r=ref.current!.getBoundingClientRect();active.current.push({x:(event.clientX-r.left)*width/r.width,y:(event.clientY-r.top)*width/r.width,p:event.pressure||.5});}draw();}}} onPointerUp={()=>{active.current=null;counts();draw();}} onPointerCancel={()=>{active.current=null;counts();}}/>
 </div>;
}
