import {AVATARS,SKINS,EQUIPMENT} from '../lib/catalog';

export function AvatarArt({id,size=110,className='',skin='classic',equipment='none'}:{id:string;size?:number;className?:string;skin?:string;equipment?:string}){
 const a=AVATARS.find(a=>a.id===id)??AVATARS[0],look=SKINS.find(s=>s.id===skin)??SKINS[0];
 const zelda=a.theme==='zelda',row=zelda?SKINS.indexOf(look):a.row;
 const item=EQUIPMENT.find(e=>e.id===equipment&&e.avatars.includes(a.id));
 return <div className={'avatar-art '+(zelda?'zelda-avatar ':'')+className} style={{width:size,height:size,backgroundImage:`url(${zelda?'/art/zelda-avatars.png':look.image})`,backgroundPosition:`${a.col*50}% ${zelda?[2.5,52,100][row]:a.row===0?look.top:a.row*50}%`}} role="img" aria-label={`${a.name} · ${look.name}${item?' · '+item.name:''}`}>
  {item&&<span className={'avatar-equipment '+item.id} aria-hidden="true" style={{backgroundImage:'url(/art/zelda-equipment.png)',backgroundPosition:`${item.col*100}% 50%`}}/>}
 </div>;
}
