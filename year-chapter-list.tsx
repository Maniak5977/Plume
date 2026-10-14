'use client';
import {useState} from 'react';
import {Check,ChevronRight,LockKeyhole} from 'lucide-react';
import {STORIES,type Theme} from '../lib/catalog';
import {BLOCK_ARCS,ZELDA_ARCS,yearPhase} from '../lib/quest-year';
import {adventureKey} from '../lib/adventures';
import type {Family,Profile} from '../lib/game';
export function YearChapterList({profile:p,family:f,theme,busy,onOpen}:{profile:Profile;family:Family;theme:Theme;busy:boolean;onOpen:(chapter:number)=>void}){
 const story=STORIES[theme],year=story.chapters.length>6,first=story.chapters.findIndex((_,i)=>!p.completedChapters.includes(adventureKey(theme,i))),[arc,setArc]=useState(yearPhase(first<0?35:first));
 const indices=year?Array.from({length:6},(_,i)=>arc*6+i):story.chapters.map((_,i)=>i),arcs=theme==='blocks'?BLOCK_ARCS:ZELDA_ARCS;
 return <>{year&&<><div className="ce1-act-tabs" role="group" aria-label="Choisir un acte">{arcs.map((name,i)=><button key={name} className={arc===i?'active':''} aria-pressed={arc===i} onClick={()=>setArc(i)}><span>{i+1}</span>{name}</button>)}</div><div className="ce1-act-title">ACTE {arc+1} / 6 · CP–CE1</div></>}<div className="chapter-list">{indices.map(i=>{const name=story.chapters[i],complete=p.completedChapters.includes(adventureKey(theme,i)),prev=i===0||p.test||p.completedChapters.includes(adventureKey(theme,i-1)),goal=f.settings.firstChapter+i*f.settings.nextChapter,open=(p.test||p.schoolStars>=goal&&p.plumeDone>0&&p.mathDone>0)&&prev,remaining=Math.max(0,goal-p.schoolStars);return <button key={name} className={'chapter-row '+(open?'open':'')} disabled={!open||busy} onClick={()=>onOpen(i)}><span className="chapter-number">{complete?<Check size={16}/>:open?i+1:<LockKeyhole size={15}/>}</span><span><strong>{name}</strong><small>{complete?'Rejouer':open?(p.adventures[adventureKey(theme,i)]?.index?'Reprendre l’histoire':'À toi de jouer'):!prev?'Termine le chapitre précédent':remaining?`Encore ${remaining} étoiles`:'Un exercice Plume et Boulier à valider'}</small></span>{open&&<ChevronRight size={18}/>}</button>;})}</div></>;
}
