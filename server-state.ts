import { env } from 'cloudflare:workers';
import {newFamily, perform, publicFamily, GameError, type Family} from './game';
import {getChatGPTUser} from '../app/chatgpt-auth';
import {actionReceipt,rememberAction} from './action-receipts';
import {upgradeNarrative} from './adventures';
import {upgradeWardrobe} from './wardrobe';
import {upgradeGerman} from './college';
export class AuthenticationError extends GameError {}
export async function authorized(req?:Request){
 const user=await getChatGPTUser();if(!user)throw new AuthenticationError('Connecte-toi au compte parent pour retrouver les profils.');
 if(req){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw new GameError('Cette demande ne vient pas de l’application.');}
 return user.userId;
}
export async function readFamily(userId:string){
 if(!env.DB)throw new Error('Database not bound');
 for(let attempt=0;attempt<5;attempt++){
 let row=await env.DB.prepare('SELECT state, revision FROM families WHERE user_id = ?').bind(userId).first<{state:string;revision:number}>();
 if(!row){const f=newFamily();await env.DB.prepare('INSERT OR IGNORE INTO families (user_id, state, revision, updated_at) VALUES (?, ?, 0, ?)').bind(userId,JSON.stringify(f),Date.now()).run();row=await env.DB.prepare('SELECT state, revision FROM families WHERE user_id = ?').bind(userId).first<{state:string;revision:number}>();}
 if(!row)throw new Error('Profile unavailable');const family=JSON.parse(row.state) as Family;let changed=false;
 for(const p of family.profiles){changed=upgradeWardrobe(p)||changed;changed=upgradeGerman(p)||changed;for(const ch of Object.values(p.adventures))upgradeNarrative(ch);}
 if(changed){
  const write=await env.DB.prepare('UPDATE families SET state = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?').bind(JSON.stringify(family),Date.now(),userId,row.revision).run();
  if(write.meta.changes!==1)continue;return {family,revision:row.revision+1};
 }
 return {family,revision:row.revision};
 }
 throw new GameError('La sauvegarde est occupée. Réessaie dans un instant.');
}
export async function mutate(userId:string,body:Record<string,any>){
 const db=env.DB;if(!db)throw new Error('Database not bound');
 for(let retry=0;retry<5;retry++){
  const {family,revision}=await readFamily(userId);
  // Retries of an already acknowledged request never award twice.
  if(typeof body.requestId!=='string'||body.requestId.length<12||body.requestId.length>100)throw new GameError('Recommence cette action.');
  const receipt=actionReceipt(family,body.requestId);if(receipt)return {family:publicFamily(family),result:receipt};
  const result=perform(family,body);rememberAction(family,body.requestId,result);
  const write=await db.prepare('UPDATE families SET state = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?').bind(JSON.stringify(family),Date.now(),userId,revision).run();
  if(write.meta.changes===1)return {family:publicFamily(family),result};
 }
 throw new GameError('La sauvegarde est occupée. Réessaie dans un instant.');
}
