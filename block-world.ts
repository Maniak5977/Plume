import {BLOCK_YEAR} from './quest-year';
import type {Profile} from './game';
export const BLOCK_MATERIALS:Record<string,{name:string;color:string}>={bois:{name:'Bois',color:'#b88e5d'},pierre:{name:'Pierre',color:'#aaa89e'},brique:{name:'Brique',color:'#c67d60'},terre:{name:'Terre',color:'#92734d'},herbe:{name:'Herbe',color:'#82ad61'},verre:{name:'Verre',color:'#a9d2df'},rouge:{name:'Rouge',color:'#d58c79'},bleu:{name:'Bleu',color:'#86abc8'},jaune:{name:'Jaune',color:'#e3c067'},fleur:{name:'Fleurs',color:'#d898bc'},charbon:{name:'Charbon',color:'#525563'},fer:{name:'Fer',color:'#c8c6ca'},diamant:{name:'Diamant',color:'#64cad6'}};
export const BLOCK_SITES=Array.from(new Set(['maison','jardin','atelier','mine','village',...BLOCK_YEAR.map(c=>c.site!)]));
export type BlockWorld={sites:Record<string,Record<string,string>>;resources:Record<string,number>;loot:string[];activeSite?:string};
const INITIAL:Record<string,number>={bois:80,pierre:60,brique:30,terre:45,herbe:30,verre:20,rouge:30,bleu:30,jaune:25,fleur:25,charbon:0,fer:0,diamant:0};
export function previewBlockWorld(p:Profile):BlockWorld{return p.blockWorld??{sites:p.houseBlocks&&Object.keys(p.houseBlocks).length?{maison:{...p.houseBlocks}}:{},resources:{...INITIAL},loot:[]};}
export function ensureBlockWorld(p:Profile):BlockWorld{return p.blockWorld??=previewBlockWorld(p);}
export function blockCounts(world:BlockWorld,replaceSite?:string,board?:Record<string,string>):Record<string,number>{const counts:Record<string,number>={};const sites={...world.sites,...(replaceSite&&board?{[replaceSite]:board}:{})};for(const cells of Object.values(sites))for(const material of Object.values(cells))counts[material]=(counts[material]??0)+1;return counts;}
export function availableBlocks(world:BlockWorld,site?:string,board?:Record<string,string>){const used=blockCounts(world,site,board);return Object.fromEntries(Object.keys(BLOCK_MATERIALS).map(k=>[k,Math.max(0,(world.resources[k]??0)-(used[k]??0))]));}
export function validFreeBoard(board:unknown):board is Record<string,string>{
 if(!board||typeof board!=='object'||Array.isArray(board))return false;const entries=Object.entries(board);if(entries.length>120)return false;
 return entries.every(([key,value])=>/^([0-5]),([0-4]),([0-3])$/.test(key)&&typeof value==='string'&&Object.hasOwn(BLOCK_MATERIALS,value));
}
export function saveFreeBoard(p:Profile,site:unknown,board:unknown){
 if(typeof site!=='string'||!BLOCK_SITES.includes(site)||!validFreeBoard(board))throw new Error('Choisis un lieu et des blocs dans le plan.');
 const world=ensureBlockWorld(p),used=blockCounts(world,site,board);
 if(Object.entries(used).some(([k,n])=>n>(world.resources[k]??0)))throw new Error('Il manque des ressources. Poursuis les missions pour en récolter.');
 world.sites[site]={...board};world.activeSite=site;return {saved:true};
}
export function grantBlockLoot(p:Profile,key:string,loot:Record<string,number>){const world=ensureBlockWorld(p);if(world.loot.includes(key))return false;for(const [mat,count] of Object.entries(loot))if(Object.hasOwn(BLOCK_MATERIALS,mat)&&Number.isInteger(count)&&count>0&&count<=200)world.resources[mat]=(world.resources[mat]??0)+count;world.loot.push(key);return true;}
export function upgradeBlockWorld(p:Profile):boolean{
 if(p.blockWorld||!p.houseBlocks||!Object.keys(p.houseBlocks).length)return false;
 const world=ensureBlockWorld(p),used=blockCounts(world);for(const [mat,n] of Object.entries(used))world.resources[mat]=Math.max(world.resources[mat]??0,n);return true;
}
