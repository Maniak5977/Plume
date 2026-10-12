import type {Family} from './game';
export function actionReceipt(family:Family,id:string):Record<string,any>|null{
 if(!family.handled.includes(id))return null;
 return structuredClone(family.receipts?.[id]??{already:true});
}
export function rememberAction(family:Family,id:string,result:Record<string,any>){
 family.handled=[id,...family.handled.filter(x=>x!==id)].slice(0,160);
 family.receipts??={};family.receipts[id]=structuredClone(result);
 const retained=new Set(family.handled);for(const key of Object.keys(family.receipts))if(!retained.has(key))delete family.receipts[key];
}
