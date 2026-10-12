export class ApiFailure extends Error{
 constructor(message:string,public reason:'auth'|'unavailable'|'application'|'unexpected',public retryable=false,public status=0){super(message);this.name='ApiFailure';}
}
export type ApiResult={family:any;result?:any};
export async function readApiResponse(response:Response):Promise<ApiResult>{
 if(response.type==='opaqueredirect'||(response.status>=300&&response.status<400))throw new ApiFailure('La connexion au compte parent doit être rétablie.','auth');
 const text=await response.text();let data:any;
 try{data=JSON.parse(text);}catch{
  if(response.status===401||response.status===403)throw new ApiFailure('La connexion au compte parent doit être rétablie.','auth',false,response.status);
  const temporary=[408,429,500,502,503,504].includes(response.status);
  throw new ApiFailure(temporary?'La sauvegarde est momentanément inaccessible. Tes réponses restent disponibles.':'La connexion n’a pas renvoyé la réponse attendue. Tes réponses restent disponibles.','unavailable',true,response.status);
 }
 if(!response.ok){
  if(response.status===401||data?.code==='AUTH_REQUIRED')throw new ApiFailure('La connexion au compte parent doit être rétablie.','auth',false,response.status);
  const retryable=[408,429,500,502,503,504].includes(response.status);
  throw new ApiFailure(typeof data?.error==='string'?data.error:'La sauvegarde n’a pas abouti. Réessaie.',retryable?'unavailable':'application',retryable,response.status);
 }
 if(!data?.family||!Array.isArray(data.family.profiles)||!data.family.settings)throw new ApiFailure('La sauvegarde n’a pas renvoyé les données attendues.','unexpected',true,response.status);
 return data;
}
export async function requestApi(path:string,init:RequestInit={},options:{attempts?:number;fetcher?:typeof fetch;wait?:(ms:number)=>Promise<void>}={}):Promise<ApiResult>{
 const fetcher=options.fetcher??fetch,wait=options.wait??(ms=>new Promise(r=>setTimeout(r,ms))),attempts=options.attempts??3;
 for(let n=0;n<attempts;n++){
  try {const response=await fetcher(path,{...init,credentials:'same-origin',redirect:'manual',cache:'no-store',headers:{Accept:'application/json',...init.headers}});return await readApiResponse(response);}
  catch(err){const failure=err instanceof ApiFailure?err:new ApiFailure('La connexion a été interrompue. Tes réponses restent disponibles.','unavailable',true);
   if(!failure.retryable||n===attempts-1)throw failure;
   await wait(n===0?700:1700);
  }
 }
 throw new ApiFailure('La sauvegarde n’a pas abouti.','unavailable');
}
