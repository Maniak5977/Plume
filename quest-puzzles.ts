import type {PuzzleSpec} from './adventures';
const shuffled=<T,>(array:T[])=>{const a=[...array];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export function runePuzzle(age:7|12,phase=0):PuzzleSpec{
 const size=age===7?4:9,boxWidth=age===7?2:3,boxHeight=boxWidth,symbols=shuffled(Array.from({length:size},(_,i)=>i+1));
 const rows=Array.from({length:size/boxHeight},(_,band)=>shuffled(Array.from({length:boxHeight},(_,r)=>band*boxHeight+r))).flat();
 const columns=Array.from({length:size/boxWidth},(_,band)=>shuffled(Array.from({length:boxWidth},(_,c)=>band*boxWidth+c))).flat();
 const complete=Object.fromEntries(rows.flatMap((r,ri)=>columns.map((c,ci)=>[String(ri*size+ci),symbols[((r%boxHeight)*boxWidth+Math.floor(r/boxHeight)+c)%size]])));
 // Remove a clue only when the grid still has exactly one solution.
 const givens={...complete},minimum=age===7?(phase<3?9:8):(phase<3?42:38);
 for(const cell of shuffled(Array.from({length:size*size},(_,i)=>i))){if(Object.keys(givens).length<=minimum)break;const value=givens[cell];delete givens[cell];if(sudokuSolutions(givens,size,boxWidth,boxHeight)!==1)givens[cell]=value;}
 const solution=Object.fromEntries(Object.entries(complete).filter(([k])=>!Object.hasOwn(givens,k)));
 return {type:'runes',width:size,height:size,runes:{size,boxWidth,boxHeight,givens},solution};
}
export function sudokuSolutions(givens:Record<string,number>,size:number,boxWidth:number,boxHeight:number):number{
 const board=Array.from({length:size*size},(_,i)=>givens[i]??0),full=(1<<size)-1,rows=Array(size).fill(0),cols=Array(size).fill(0),boxes=Array(size).fill(0);
 const box=(cell:number)=>Math.floor(Math.floor(cell/size)/boxHeight)*(size/boxWidth)+Math.floor(cell%size/boxWidth);
 for(let cell=0;cell<board.length;cell++){const v=board[cell];if(!v)continue;if(!Number.isInteger(v)||v<1||v>size)return 0;const r=Math.floor(cell/size),c=cell%size,b=box(cell),bit=1<<(v-1);if((rows[r]|cols[c]|boxes[b])&bit)return 0;rows[r]|=bit;cols[c]|=bit;boxes[b]|=bit;}
 let count=0,nodes=0;
 function visit(){if(count>=2)return;if(++nodes>12000){count=2;return;}let chosen=-1,mask=0,best=size+1;
  for(let cell=0;cell<board.length;cell++)if(!board[cell]){const bits=full&~(rows[Math.floor(cell/size)]|cols[cell%size]|boxes[box(cell)]);let n=0;for(let b=bits;b;b&=b-1)n++;if(!n)return;if(n<best){chosen=cell;mask=bits;best=n;if(n===1)break;}}
  if(chosen<0){count++;return;}const r=Math.floor(chosen/size),c=chosen%size,b=box(chosen);
  for(let bits=mask;bits&&count<2;bits&=bits-1){const bit=bits&-bits;board[chosen]=Math.log2(bit)+1;rows[r]|=bit;cols[c]|=bit;boxes[b]|=bit;visit();rows[r]&=~bit;cols[c]&=~bit;boxes[b]&=~bit;board[chosen]=0;}
 }
 visit();return count;
}
export function harvestPuzzle(material:string,phase:number):PuzzleSpec{
 const width=5,height=4,count=Math.min(6,3+Math.floor(phase/2)),all=['pierre','bois','terre','charbon','fer','diamant'],positions=shuffled(Array.from({length:width*height},(_,i)=>i));
 const wanted=new Set(positions.slice(0,count+2));
 return {type:'harvest',width,height,target:count,resource:material,nodes:Array.from({length:width*height},(_,cell)=>({cell,material:wanted.has(cell)?material:all.filter(m=>m!==material)[cell%5]}))};
}
export function validateRunes(spec:PuzzleSpec,answer:unknown):boolean{
 const r=spec.runes;if(!r||!answer||typeof answer!=='object'||Array.isArray(answer))return false;
 const entries=Object.entries(answer),expected=r.size*r.size-Object.keys(r.givens).length;
 if(entries.length!==expected||entries.some(([key,value])=>!/^\d+$/.test(key)||String(Number(key))!==key||Number(key)<0||Number(key)>=r.size*r.size||Object.hasOwn(r.givens,key)||!Number.isInteger(value)||Number(value)<1||Number(value)>r.size))return false;
 const values={...r.givens,...answer} as Record<string,number>,unique=(cells:number[])=>new Set(cells.map(i=>values[i])).size===r.size;
 for(let i=0;i<r.size;i++)if(!unique(Array.from({length:r.size},(_,n)=>i*r.size+n))||!unique(Array.from({length:r.size},(_,n)=>n*r.size+i)))return false;
 for(let y=0;y<r.size;y+=r.boxHeight)for(let x=0;x<r.size;x+=r.boxWidth)if(!unique(Array.from({length:r.size},(_,n)=>(y+Math.floor(n/r.boxWidth))*r.size+x+n%r.boxWidth)))return false;
 return true;
}

const wordKey=(word:string)=>word.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
const WORD_BANK={
 blocks:[['MAISON','BOIS','PORTE','LIT','JARDIN','BLOC'],['FLEUR','TERRE','GRAINE','ARBRE','EAU','SERRE'],['MINE','FER','PIERRE','DIAMANT','CHARBON','FORGE'],['VILLAGE','PONT','FERME','LIVRE','PLACE','MARCHE'],['NEIGE','PHARE','PORT','TOUR','MOULIN','CABANE'],['MUSEE','GARE','MONDE','ATELIER','REFUGE','JARDIN']],
 zelda:[['LINK','ZELDA','PONT','CLE','FORET','SCEAU'],['CARTE','VILLAGE','VOYAGE','GUIDE','RUBIS','CHEMIN'],['ARBRE','FORET','FLEUR','RACINE','ESPRIT','RIVIERE'],['MONTAGNE','FORGE','MINERAI','PIERRE','GARDIEN','VOLCAN'],['LAC','REFLET','BATEAU','RIVIERE','CANAL','POISSON'],['CITADELLE','PORTE','SAGE','ETOILE','INDICE','ROYAUME']]
};
export function wordSearchPuzzle(age:7|12,phase:number,world:'blocks'|'zelda'):PuzzleSpec{
 const width=age===7?8:10,height=width,words=WORD_BANK[world][Math.min(5,phase)].filter(w=>age===12||w.length<=7).slice(0,age===7?4:6),directions=age===7?[[1,0],[0,1]]:[[1,0],[0,1],[1,1],[-1,0],[0,-1],[-1,-1],[1,-1],[-1,1]];
 let letters:string[]=[],solution:Record<string,number[]>={};
 for(let attempt=0;attempt<30;attempt++){
  letters=Array(width*height).fill('');solution={};
  for(const word of [...words].sort((a,b)=>b.length-a.length)){
   const choices=shuffled(Array.from({length:width*height},(_,cell)=>cell).flatMap(cell=>directions.map(([dx,dy])=>({cell,dx,dy}))));
   const spot=choices.find(({cell,dx,dy})=>Array.from(word).every((letter,i)=>{const x=cell%width+dx*i,y=Math.floor(cell/width)+dy*i;return x>=0&&x<width&&y>=0&&y<height&&(!letters[y*width+x]||letters[y*width+x]===letter);}));
   if(!spot)break;const path=Array.from(word,(_,i)=>spot.cell+i*(spot.dy*width+spot.dx));path.forEach((cell,i)=>letters[cell]=word[i]);solution[word]=path;
  }
  if(Object.keys(solution).length===words.length)break;
 }
 if(Object.keys(solution).length!==words.length)throw new Error('La grille de mots ne peut pas être construite.');
 letters=letters.map(c=>c||'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random()*26)]);
 return {type:'wordsearch',width,height,letters,words,solution};
}
export function wordPath(spec:PuzzleSpec,start:number,end:number):number[]{
 const width=spec.width!,height=spec.height!;if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<0||start>=width*height||end>=width*height||start===end)return [];
 const x=end%width-start%width,y=Math.floor(end/width)-Math.floor(start/width);if(x!==0&&y!==0&&Math.abs(x)!==Math.abs(y))return [];
 const length=Math.max(Math.abs(x),Math.abs(y))+1;return Array.from({length},(_,i)=>start+i*(Math.sign(y)*width+Math.sign(x)));
}
export function validateWordSearch(spec:PuzzleSpec,answer:unknown):boolean{
 if(!answer||typeof answer!=='object'||Array.isArray(answer)||!spec.words?.length||!spec.letters)return false;const entries=Object.entries(answer);
 if(entries.length!==spec.words.length)return false;
 return spec.words.every(word=>{const path=(answer as Record<string,unknown>)[word];if(!Array.isArray(path)||path.length!==word.length||path.some(i=>!Number.isInteger(i)))return false;const line=wordPath(spec,path[0],path.at(-1));if(line.length!==path.length||line.some((cell,i)=>cell!==path[i]))return false;const text=path.map(cell=>spec.letters![cell]).join('');return text===wordKey(word)||text===Array.from(wordKey(word)).reverse().join('');});
}
const normalizeGuess=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ').replace(/[.!?,;:]/g,'').replace(/\s+/g,' ').trim();
export function validateGuess(spec:PuzzleSpec,answer:unknown):boolean{
 const guess=typeof answer==='string'?answer:answer&&typeof answer==='object'&&!Array.isArray(answer)?(answer as {guess?:unknown}).guess:null;
 return typeof guess==='string'&&guess.length<=150&&Array.isArray(spec.solution)&&spec.solution.some((s:unknown)=>typeof s==='string'&&normalizeGuess(s)===normalizeGuess(guess));
}
type Riddle={question:string;answers:string[];hint:string;choices:string[]};
const RIDDLES_7:Riddle[]=[
 {question:'J’ai des dents, mais je ne mords pas. J’ouvre une porte. Qui suis-je ?',answers:['clé','une clé','clef','une clef'],hint:'On me glisse dans une serrure.',choices:['Une clé','Une scie','Un loup','Une fourchette']},
 {question:'Je te suis au soleil et je disparais dans le noir. Qui suis-je ?',answers:['ombre','une ombre','mon ombre','l’ombre'],hint:'Regarde le sol quand tu es au soleil.',choices:['Une ombre','Une étoile','Un nuage','Une lampe']},
 {question:'Je porte ma maison sur mon dos et j’avance très lentement. Qui suis-je ?',answers:['escargot','un escargot','l’escargot'],hint:'Ma maison est une coquille.',choices:['Un escargot','Un renard','Un oiseau','Un papillon']},
 {question:'J’ai deux mains qui tournent, mais je ne peux pas applaudir. Je t’indique l’heure. Qui suis-je ?',answers:['horloge','une horloge','montre','une montre'],hint:'Mes mains sont appelées des aiguilles.',choices:['Une horloge','Un moulin','Une table','Un robot']},
 {question:'J’ai beaucoup de feuilles, mais je ne suis pas un arbre. On m’ouvre pour lire une histoire. Qui suis-je ?',answers:['livre','un livre','le livre'],hint:'Mes feuilles sont des pages.',choices:['Un livre','Une fleur','Une forêt','Une porte']},
 {question:'Plus on me creuse, plus je deviens grand. Qui suis-je ?',answers:['trou','un trou','le trou'],hint:'Une pelle permet de me faire dans le jardin.',choices:['Un trou','Un minerai','Un arbre','Une graine']}
];
const RIDDLES_12:Riddle[]=[
 {question:'Deux pères et deux fils trouvent trois rubis. Chacun reçoit un rubis. Combien de personnes y a-t-il vraiment ?',answers:['3','trois','3 personnes','trois personnes'],hint:'Un père peut aussi être le fils d’une autre personne.',choices:['3','4','5','6']},
 {question:'Pendant une course, tu dépasses la personne qui est deuxième. Quelle place occupes-tu ?',answers:['deuxième','second','seconde','2','2e','2ème','la deuxième place'],hint:'Tu prends la place de la personne que tu dépasses.',choices:['La première place','La deuxième place','La troisième place','Impossible à savoir']},
 {question:'Il t’appartient, mais les autres l’utilisent plus souvent que toi. De quoi s’agit-il ?',answers:['prénom','ton prénom','mon prénom','nom','ton nom','mon nom'],hint:'Les autres l’utilisent pour t’appeler.',choices:['Ton prénom','Ton secret','Ton argent','Ton reflet']},
 {question:'Je suis toujours devant toi. Tu peux me préparer, mais tu ne peux jamais me voir directement. Qui suis-je ?',answers:['avenir','l’avenir','futur','le futur'],hint:'Je n’ai pas encore eu lieu.',choices:['L’avenir','Le miroir','L’ombre','Le passé']},
 {question:'Je grandis quand on m’enlève quelque chose et je disparais si on me remplit. Qui suis-je ?',answers:['trou','un trou','le trou'],hint:'Imagine un tunnel que l’on creuse.',choices:['Un trou','Un arbre','Un sac','Un feu']},
 {question:'Un coffre pèse un kilogramme de plumes, l’autre un kilogramme de fer. Lequel est le plus lourd ?',answers:['aucun','le même poids','même poids','ils ont le même poids','les deux ont le même poids','égalité'],hint:'Compare les masses indiquées, pas les matériaux.',choices:['Le fer','Les plumes','Ils ont le même poids','Il faut compter les objets']}
];
const REBUS:{parts:{symbol:string;label:string}[];answers:string[];hint:string}[]=[
 {parts:[{symbol:'🐱',label:'chat'},{symbol:'🍯',label:'pot'}],answers:['chapeau','un chapeau'],hint:'Dis « chat », puis « pot », sans laisser de pause.'},
 {parts:[{symbol:'🪚',label:'scie'},{symbol:'🪵',label:'tronc'}],answers:['citron','un citron'],hint:'Le mot obtenu est un fruit jaune : scie + tronc.'},
 {parts:[{symbol:'🐀',label:'rat'},{symbol:'🧍',label:'dos'}],answers:['radeau','un radeau'],hint:'Le mot obtenu permet de traverser une rivière : rat + dos.'},
 {parts:[{symbol:'🪚',label:'scie'},{symbol:'👑',label:'reine'}],answers:['sirène','une sirène'],hint:'Dis scie + reine : le mot évoque un personnage de la mer.'},
 {parts:[{symbol:'🍚',label:'riz'},{symbol:'🧍',label:'dos'}],answers:['rideau','un rideau'],hint:'Le mot obtenu se trouve souvent devant une fenêtre.'},
 {parts:[{symbol:'🐱',label:'chat'},{symbol:'💬',label:'mot'}],answers:['chameau','un chameau'],hint:'Le mot obtenu est un animal à deux bosses : chat + mot.'}
];
export type IndependentPuzzle={spec:PuzzleSpec;title:string;prompt:string;hint:string};
export function independentPuzzle(age:7|12,chapter:number,world:'blocks'|'zelda'):IndependentPuzzle{
 const phase=Math.min(5,Math.floor(chapter/6)),kind=chapter%6;
 if(kind===0){const spec=runePuzzle(age,phase);return {spec,title:age===7?'Le petit sudoku des blocs':'Le sudoku du sanctuaire',prompt:`Complète la grille de ${spec.runes!.size} × ${spec.runes!.size}. Chaque nombre apparaît une seule fois par ligne, colonne et zone.`,hint:'Commence par une ligne ou une zone presque complète. Compare ensuite les nombres possibles avec ceux de la colonne.'};}
 if(kind===1){const spec=wordSearchPuzzle(age,phase,world);return {spec,title:'Les mots cachés de notre monde',prompt:age===7?'Retrouve les mots de la liste. Ils vont de gauche à droite ou de haut en bas.':'Retrouve les mots de la liste. Ils peuvent être horizontaux, verticaux, diagonaux et écrits à l’envers.',hint:'Cherche d’abord la première lettre du mot, puis regarde les lettres autour. Touche la première et la dernière case du mot.'};}
 if(kind===2){const r=(age===7?RIDDLES_7:RIDDLES_12)[phase];return {spec:{type:'riddle',question:r.question,options:shuffled(r.choices),solution:r.answers},title:'La devinette du gardien',prompt:r.question,hint:r.hint};}
 if(kind===3){const r=REBUS[(phase+(world==='blocks'?0:2))%REBUS.length];return {spec:{type:'rebus',rebus:r.parts,solution:r.answers},title:'Le message en rébus',prompt:'Prononce les images de gauche à droite. Assemble leurs sons pour découvrir un nouveau mot.',hint:r.hint};}
 if(kind===4){const width=age===12?9:phase<3?5:7,height=width,open=new Set([0]),seen=new Set([0]),stack=[0];
  while(stack.length){const cell=stack.at(-1)!,x=cell%width,y=Math.floor(cell/width),next=shuffled([[x+2,y],[x-2,y],[x,y+2],[x,y-2]]).find(([nx,ny])=>nx>=0&&nx<width&&ny>=0&&ny<height&&!seen.has(ny*width+nx));if(!next){stack.pop();continue;}const end=next[1]*width+next[0];seen.add(end);open.add((cell+end)/2);open.add(end);stack.push(end);}
  return {spec:{type:'maze',width,height,start:0,end:width*height-1,blocked:Array.from({length:width*height},(_,i)=>i).filter(i=>!open.has(i))},title:'Le labyrinthe du passage',prompt:'Trouve le chemin jusqu’au drapeau. Avance case par case sans traverser les rochers.',hint:'Repère les impasses. Tu peux revenir sur ton dernier pas pour essayer un autre passage.'};
 }
 return {spec:{type:'packing',width:5,height:4,blocked:[0,5],pieces:[{id:'coffre',label:'Le coffre',width:2,height:1,color:'bois'},{id:'table',label:'La table',width:2,height:2,color:'bleu'},{id:'lampe',label:'La lampe',width:1,height:1,color:'jaune'}]},title:'Le plan à aménager',prompt:'Place tous les objets sans les superposer et garde l’entrée libre.',hint:'Essaie de placer d’abord le plus grand objet, puis utilise les espaces qui restent.'};
}
