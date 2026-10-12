import {authorized, readFamily} from '../../../lib/server-state';
import {publicFamily} from '../../../lib/game';
export const dynamic='force-dynamic';
export async function GET(){try {const userId=await authorized();const {family}=await readFamily(userId);return Response.json({family:publicFamily(family)},{headers:{'Cache-Control':'no-store'}});}catch(e){const message=e instanceof Error?e.message:'';return Response.json({error:message.startsWith('Connecte')?message:'La sauvegarde est momentanément indisponible. Réessaie.'},{status:message.startsWith('Connecte')?401:503});}}
