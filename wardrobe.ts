import {AVATARS,SKINS,EQUIPMENT} from './catalog';
import type {Profile} from './game';

export function ownedSkins(p:Profile,avatar=p.avatar):string[]{return p.skinsByAvatar?.[avatar]??['classic'];}
export function equippedSkin(p:Profile,avatar=p.avatar):string{return p.equippedSkins?.[avatar]??(p.equippedSkins?'classic':avatar===p.avatar?p.skin??'classic':'classic');}
export function equippedEquipment(p:Profile,avatar=p.avatar):string{return p.equippedEquipment?.[avatar]??'none';}
export function avatarEquipment(avatar:string){return EQUIPMENT.filter(item=>item.avatars.includes(avatar));}

/** Convert the former profile-wide collection into purchases for a single avatar. */
export function upgradeWardrobe(p:Profile):boolean{
 let changed=false;
 if(!p.skinsByAvatar){
  p.skinsByAvatar={};p.equippedSkins={};
  for(const skin of p.skins??['classic']){
   if(skin==='classic'||!SKINS.some(s=>s.id===skin))continue;
   // The parent identified this V4 purchase as Cosmos for Léon's explorer.
   // V4 kept no purchase ledger; apply that repair only during the legacy migration.
   const owner=skin==='cosmos'&&p.name.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().trim()==='leon'?'explorer':p.avatar;
   p.skinsByAvatar[owner]??=['classic'];p.skinsByAvatar[owner].push(skin);
   if(skin===p.skin)p.equippedSkins[owner]=skin;
  }
  p.skin=p.equippedSkins[p.avatar]??'classic';
  // Retain this compatibility field only for the selected avatar.
  p.skins=ownedSkins(p);changed=true;
 }
 for(const avatar of AVATARS.filter(a=>a.price===0))if(!p.owned.includes(avatar.id)){p.owned.push(avatar.id);changed=true;}
 return changed;
}
