import {BLOCK_YEAR,ZELDA_YEAR,BLOCK_ARCS,ZELDA_ARCS,yearPhase} from './quest-year';
import {independentPuzzle,harvestPuzzle,type IndependentPuzzle} from './quest-puzzles';
import type {Chapter,Mission,Profile,Question} from './game';
import type {PuzzleSpec} from './adventures';
const uid=()=>crypto.randomUUID(),int=(a:number,b:number)=>a+Math.floor(Math.random()*(b-a+1));
const shuffled=<T,>(a:T[])=>[...a].sort(()=>Math.random()-.5);
const mission=(kind:Mission['kind'],title:string,prompt:string,x:Partial<Mission>={}):Mission=>({id:uid(),kind,title,prompt,solved:false,attempts:0,help:false,...x});
function mathMission(phase:number,title:string,resource:string,variation:number):Mission{
 let a=int(18,38),b=int(12,24),answer=a+b,calc=`${a} + ${b}`,prompt=`Tu reçois ${a} ${resource}, puis ${b}. Combien en as-tu ?`,hint='Réunis les dizaines puis les unités.',topic='add100',operation='+';
 if(phase===1){a=int(60,95);b=int(14,29);answer=a-b;calc=`${a} − ${b}`;prompt=`Tu as ${a} ${resource}. Le chantier en utilise ${b}. Combien en reste-t-il ?`;hint='Enlève les dizaines puis les unités, ou compte du nombre utilisé jusqu’au stock de départ.';topic='sub100';operation='−';}
 if(phase===2){a=int(12,18);b=variation%2?5:2;answer=a*b;calc=`${b} × ${a}`;prompt=`Chaque caisse contient ${a} ${resource}. Tu prépares ${b} caisses identiques. Combien faut-il en tout ?`;hint=`Tu peux additionner ${a}, ${b} fois. Deux groupes donnent un double ; cinq groupes donnent cinq fois la même quantité.`;topic='groups';operation='×';}
 if(phase===3){a=int(35,65);b=int(20,34);answer=a+b;calc=`${a} + ${b}`;prompt=`Le marchand demande ${a} pièces pour les matériaux et ${b} pour les outils. Combien faut-il de pièces au total ?`;hint='Additionne les deux prix. Garde les dizaines ensemble, puis ajoute les unités.';topic='money';}
 if(phase===4){a=int(120,240);b=int(25,68);answer=a+b;calc=`${a} + ${b}`;prompt=`La réserve contient ${a} ${resource}. Une livraison en ajoute ${b}. Quel est le nouveau total ?`;hint='Garde les centaines, ajoute les dizaines puis les unités. Une dizaine complète peut créer une retenue.';topic='around100';}
 if(phase===5){a=int(110,180);b=int(25,58);const used=int(30,65);answer=a+b-used;calc=`${a} + ${b} − ${used}`;prompt=`Tu as ${a} ${resource}. Tu en reçois ${b}, puis tu en utilises ${used}. Combien restent disponibles ?`;hint='Fais deux étapes : calcule le nouveau stock, puis retire la quantité utilisée.';topic='problems';operation='two-step';}
 const q:Question={id:uid(),topic,title,prompt,answer,hint,operator:operation,visual:{kind:operation==='×'?'groups':operation==='−'?'subtract':'add',a,b},attempts:0,help:false,solved:false,award:0};
 return mission('math',title,prompt,{question:q,calculation:calc+' = ?'});
}
function themedPuzzle(chapter:number,phase:number,world:'blocks'|'zelda',material:string):IndependentPuzzle{
 if(world==='blocks'&&BLOCK_YEAR[chapter].task==='harvest')return {spec:harvestPuzzle(material,phase),title:'Récolter les bons matériaux',prompt:`Récolte exactement ${Math.min(6,3+Math.floor(phase/2))} blocs de ${material}.`,hint:'Lis le nom de chaque filon. Compte seulement les blocs du matériau demandé.'};
 return independentPuzzle(7,chapter,world);
}
export function makeCE1YearChapter(world:'blocks'|'zelda',chapter:number,p:Profile,level=1):Chapter{
 const meta=(world==='blocks'?BLOCK_YEAR:ZELDA_YEAR)[chapter];if(!meta)throw new Error('Chapitre inconnu.');
 const phase=yearPhase(chapter),site=meta.site??'sanctuaire',material=meta.material??'pierre',hero=world==='blocks'?'Le renard bâtisseur':'Link',arc=(world==='blocks'?BLOCK_ARCS:ZELDA_ARCS)[phase],ms:Mission[]=[];
 const talk=(title:string,lines:string[])=>ms.push(mission('dialogue',title,lines.join('\n\n'),{speaker:hero,lines}));
 talk(meta.title,[`Notre aventure continue dans ${arc.toLowerCase()}. ${world==='blocks'?'Le renard ouvre le carnet de construction.':'Link et Zelda relisent les signes du royaume.'}`,`« Aujourd’hui, notre mission est de ${meta.goal[0].toLowerCase()+meta.goal.slice(1)}. ${meta.clue} Prépare ton carnet, nous allons chercher, écrire et construire ensemble. »`]);
 const phrases:Record<string,string>={grange:'Je construis la grange.',chemin:'Je suis le chemin.',pont:'Le pont est solide.',livre:'Je range les livres.',boutique:'La boutique est ouverte.',fête:'Je prépare la fête.',cabane:'Je construis la cabane.',moulin:'Le moulin tourne.',neige:'Le refuge est prêt.',tour:'La tour est grande.',port:'Le port est prêt.',phare:'Le phare brille.',gare:'Je prépare la gare.',jardin:'Le jardin est joli.',atelier:'Mon atelier est prêt.',musée:'Le musée est ouvert.',monde:'Notre monde grandit.',montagne:'Je découvre la montagne.',minerai:'Je trouve du minerai.',forge:'La forge est prête.',passerelle:'Le passage est ouvert.',gardien:'Le gardien nous attend.',pierre:'Je trouve une pierre.',bateau:'Le bateau arrive.',canal:'Je suis le canal.',poisson:'Le poisson nage.',porte:'La porte est ouverte.',rivière:'La rivière brille.',citadelle:'La citadelle est grande.',indice:'Je trouve un indice.',étoile:'Une étoile brille.',voyageur:'Le voyageur arrive.',sage:'Le sage nous écoute.',royaume:'Le royaume brille.'};
 const target=phase<3?meta.word:phrases[meta.word]??(meta.word.endsWith('.')?meta.word:'Je prépare le chantier.');
 ms.push(mission('write','Le carnet de notre mission',`Écris « ${target} » pour préparer la liste de l’équipe.`,{target,context:'La liste aide ton équipe à se préparer.'}));
 ms.push(mathMission(Math.min(5,phase+(level===2&&phase===0?1:0)),'Les ressources du chantier',world==='blocks'?'blocs':'unités de lumière',chapter));
 const game=themedPuzzle(chapter,phase,world,material),spec=game.spec;
 talk(spec.type==='harvest'?'Les ressources cachées':'Une pause pour réfléchir',[spec.type==='harvest'?`« Observe les filons. Nous cherchons ${spec.target} blocs de ${material}. Touche seulement ceux qui correspondent. »`:`« Un indice nous attend ici : ${game.title.toLowerCase()}. Ce jeu fait travailler tes idées et ton observation. ${game.prompt} »`]);
 ms.push(mission('puzzle',game.title,game.prompt,{puzzle:spec,draft:['harvest','maze','order'].includes(spec.type)?[]:{},hint:game.hint,...(spec.type==='harvest'&&world==='blocks'?{loot:{[material]:12+phase*3}}:{})}));
 ms.push(mathMission(phase,'Préparer la suite',world==='blocks'?'blocs':'éclats',chapter+1));
 if(world==='blocks'){
  const layer=['chambres','grange','tour','cabane'].some(t=>site.includes(t))?1:chapter%3===1?1:0;
  const targets=Array.from({length:12},(_,i)=>[1+i%4,1+Math.floor(i/4)]).filter(([x,y])=>layer===0||x===1||x===4||y===1||y===3).filter(([x,y])=>!(layer===1&&x===2&&y===1)).map(([x,y])=>`${x},${y},${layer}`);
  talk('Notre construction prend forme',[`« Très bien ! Pose les blocs de ${material} sur le plan de ${site}. Chaque bloc apparaîtra dans ton monde. Après cette mission, tu pourras aussi modifier tes constructions dans l’atelier libre. »`]);
  ms.push(mission('build',`Construire : ${site}`,`Suis le plan en pointillés, avec des blocs de ${material}.`,{construction:{site,layer,width:6,depth:5,targets,materials:[material],material,label:meta.title},draft:{},loot:{[material]:targets.length+10},hint:'Choisis le matériau et touche chaque case du plan en pointillés.'}));
 }else{
  talk('Le message des voyageurs',['« Ton idée a ouvert le passage. Écris maintenant la bonne nouvelle pour ceux qui arrivent derrière nous. »']);
  ms.push(mission('write','Un message pour le royaume',`Écris « Le passage est ouvert. »`,{target:'Le passage est ouvert.'}));
 }
 talk('Une nouvelle découverte',[`« ${meta.goal} : mission accomplie ! Tu as utilisé tes mots, tes calculs et tes idées. »`,chapter===35?'Le monde est prêt à accueillir tous nos amis. Tu peux continuer à construire, à revoir les chapitres et à inventer tes propres projets.':`Le prochain chapitre s’appelle « ${(world==='blocks'?BLOCK_YEAR:ZELDA_YEAR)[chapter+1].title} ». Rejoins les entraînements pour préparer la suite.`]);
 return {version:2,theme:world,chapter,index:0,complete:false,selections:{},missions:ms};
}
