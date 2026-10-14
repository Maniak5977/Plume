import {BLOCK_YEAR,ZELDA_YEAR} from './quest-year';
export type Theme = 'blocks' | 'dinos' | 'snoopy' | 'zelda';
export const THEMES = [
 {id:'blocks' as Theme,name:'Aventure en blocs',subtitle:'Construis ton petit monde',color:'#558b64',image:'/art/voxel-scene.png'},
 {id:'dinos' as Theme,name:'L’île des dinosaures',subtitle:'À la rencontre des géants',color:'#c38642',image:'/art/dino-scene.png'},
 {id:'snoopy' as Theme,name:'Le jardin de Snoopy',subtitle:'Un jardin plein de surprises',color:'#537da4',image:'/art/snoopy-scene.png'},
 {id:'zelda' as Theme,name:'Zelda · la forêt des échos',subtitle:'Explore avec Link et Zelda',color:'#4f8063',image:'/art/zelda-scene.png'},
];
export const AVATARS = [
 {id:'explorer',name:'L’explorateur',theme:'blocks',price:0,row:0,col:0,blurb:'Toujours prêt à découvrir un nouveau chemin.'},
 {id:'fox',name:'Le renard',theme:'blocks',price:100,row:0,col:1,blurb:'Curieux, malin et fidèle à son ami.'},
 {id:'golem',name:'Le golem',theme:'blocks',price:500,row:0,col:2,blurb:'Un grand cœur sous une armure de pierre.'},
 {id:'trex',name:'Téo le T-rex',theme:'dinos',price:0,row:1,col:0,blurb:'De petites pattes, une grande aventure.'},
 {id:'trix',name:'Trix le tricératops',theme:'dinos',price:250,row:1,col:1,blurb:'Le courage tranquille de ton équipe.'},
 {id:'pico',name:'Pico le ptérosaure',theme:'dinos',price:500,row:1,col:2,blurb:'Prends de la hauteur avec Pico !'},
 {id:'snoopy',name:'Snoopy & Woodstock',theme:'snoopy',price:0,row:2,col:0,blurb:'Deux amis pour rêver et jouer.'},
 {id:'pilot',name:'Snoopy aviateur',theme:'snoopy',price:250,row:2,col:1,blurb:'Un compagnon qui vise toujours plus haut.'},
 {id:'space',name:'Snoopy astronaute',theme:'snoopy',price:500,row:2,col:2,blurb:'En route vers les étoiles !'},
 {id:'link',name:'L’éclaireur de la forêt',theme:'zelda',price:0,row:0,col:0,blurb:'Un compagnon original en cape verte, prêt à explorer les ruines.'},
 {id:'zelda',name:'La princesse des échos',theme:'zelda',price:350,row:0,col:1,blurb:'Une princesse originale aux tenues de voyage et aux détails fleuris.'},
 {id:'korogu',name:'Sylve, l’esprit des bois',theme:'zelda',price:180,row:0,col:2,blurb:'Un petit esprit de la forêt qui connaît bien des secrets.'},
];
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').flatMap(x=>[x,x.toLowerCase()]);
export const WORDS: Record<Theme,string[]> = {
 blocks:['cube','bloc','mine','bois','porte','maison'],
 dinos:['œuf','patte','piste','petit','famille','dinosaure'],
 snoopy:['ami','fête','ballon','jardin','gâteau','invité'],
 zelda:['arc','épée','fée','forêt','temple','royaume'],
};
export const PHRASES: Record<Theme,string[]> = {
 blocks:['Je pose un bloc.','Je construis une cabane.','Ma maison a une porte.'],
 dinos:['Le petit suit sa maman.','Je trouve une empreinte.','Les dinosaures sont réunis.'],
 snoopy:['Snoopy invite ses amis.','Je prépare la fête.','Le jardin est très joli.'],
 zelda:['Link suit la fée.','Je retrouve le chemin.','La forêt retrouve sa lumière.'],
};
export const TOPICS = [
 {id:'journey',title:'Mon parcours',sub:'Des réussites, puis une découverte',icon:'sparkles',level:'À ton rythme'},
 {id:'add10',title:'Petites additions',sub:'Ajouter jusqu’à 10',icon:'plus',level:'Je prends confiance'},
 {id:'sub10',title:'Petites soustractions',sub:'Enlever jusqu’à 10',icon:'minus',level:'Je prends confiance'},
 {id:'complete10',title:'Les amis de 10',sub:'Trouver ce qui manque',icon:'circle',level:'Je consolide'},
 {id:'add20',title:'Passer par 10',sub:'Additionner jusqu’à 20',icon:'plus',level:'Je consolide'},
 {id:'numbers',title:'Les nombres',sub:'Suites et nombres manquants',icon:'hash',level:'J’explore'},
 {id:'doubles',title:'Les doubles',sub:'Deux fois la même quantité',icon:'copy',level:'Je consolide'},
 {id:'around100',title:'Autour de 100',sub:'Atteindre et franchir la centaine',icon:'mountain',level:'Je découvre'},
 {id:'problems',title:'Petits problèmes',sub:'Des histoires à résoudre',icon:'book',level:'J’explore'},
 {id:'groups',title:'Les groupes identiques',sub:'Compter par 2, 5 et 10',icon:'copy',level:'Je découvre'},
 {id:'money',title:'Prix et monnaie',sub:'Réunir les prix en euros',icon:'book',level:'Je consolide'},
 {id:'hundreds',title:'Les centaines',sub:'Calculer jusqu’à 300',icon:'hash',level:'Je découvre'},
 {id:'twoSteps',title:'Deux étapes pour trouver',sub:'Ajouter puis retirer',icon:'book',level:'Je progresse'},
];
export const HUNDRED_RULES = [
 {id:'under',name:'Rester sous 100',example:'83 + 6'},
 {id:'reach',name:'Compléter à 100',example:'84 + ? = 100'},
 {id:'cross',name:'Franchir 100',example:'96 + 7'},
 {id:'above',name:'Après 100',example:'105 + 12'},
];
export const STORIES:Record<Theme,{title:string;intro:string;chapters:string[];victory:string[]}> = {
 blocks:{title:'Le monde des bâtisseurs',intro:'Une maison devient un jardin, une mine puis un village. Avec le renard, écris les plans, prépare les ressources et construis ton monde, chapitre après chapitre.',chapters:BLOCK_YEAR.map(c=>c.title),victory:BLOCK_YEAR.map((c,i)=>i<5?['Les fondations sont posées !','L’atelier est prêt !','Les murs sont construits !','La maison est à l’abri !','Bienvenue dans ta maison !'][i]:c.title+' : mission accomplie !')},
 dinos:{title:'Le grand refuge des dinos',intro:'Après le réveil du volcan, les familles sont en sécurité au lagon. Mais certains petits ont perdu leurs parents de vue. Prépare un refuge et pars à leur rencontre.',chapters:['Le refuge du lagon','La piste des fougères','Les traces de la rivière','Le pique-nique des retrouvailles','Tous ensemble au refuge'],victory:['Le refuge est prêt !','La piste est retrouvée !','Une première famille est réunie !','Trix a retrouvé son papa !','Toutes les familles sont réunies !']},
 snoopy:{title:'La grande fête du jardin',intro:'Une invitation secrète, un jardin à préparer et des amis à accueillir… Aide Snoopy et Woodstock à organiser une fête pleine de surprises.',chapters:['Une invitation secrète','Une place pour chacun','Le goûter des amis','Des couleurs dans les branches','Bienvenue à la fête !'],victory:['Les invitations sont envoyées !','Le jardin est organisé !','Le goûter est prêt !','Les décorations sont installées !','Que la fête commence !']},
 zelda:{title:'Link et les échos du royaume',intro:'Six régions, 36 chapitres et un réseau de balises à réveiller. Rejoins Link et Zelda : tes apprentissages, tes choix et tes énigmes font avancer une grande quête.',chapters:ZELDA_YEAR.map(c=>c.title),victory:ZELDA_YEAR.map((c,i)=>i===35?'Le royaume des découvertes s’illumine !':c.title+' : sceau retrouvé !')},
};
export const SKINS = [
 {id:'classic',name:'Style original',price:0,image:'/art/avatars.png',top:2,description:'Le look de départ de chaque compagnon.'},
 {id:'aventurier',name:'Aventurier',price:150,image:'/art/skins-aventurier.png',top:2.5,description:'Veste, foulard, sac et accessoires pour explorer ton monde.'},
 {id:'cosmos',name:'Cosmos',price:300,image:'/art/skins-cosmos.png',top:2.5,description:'Un look spatial avec des détails lumineux et des touches dorées.'},
];
export const EQUIPMENT:{id:string;name:string;price:number;col:number;avatars:string[];description:string}[]=[
 {id:'sword',name:'L’épée des échos',price:100,col:0,avatars:['link','zelda'],description:'Une lame argentée et une garde bleue pour ton héros.'},
 {id:'bow',name:'L’arc de la forêt',price:180,col:1,avatars:['link','zelda'],description:'Un arc en bois et son carquois pour explorer les sentiers.'},
];
export const DINO_FRIENDS = [
 {id:'trex',name:'Téo le T-rex',description:'Ton guide au refuge. Il t’aide à retrouver les familles.'},
 {id:'trix',name:'Trix le tricératops',description:'L’amie de Téo. Elle prépare les provisions et cherche les petits.'},
 {id:'pico',name:'Pico le ptérosaure',description:'Leur ami volant. Il explore les chemins depuis le ciel.'},
];
