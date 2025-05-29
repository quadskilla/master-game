(function(){
const screens = ['lobby','collection','deck','shop','battle','arena','admin'];
function showScreen(id){ screens.forEach(s=>document.getElementById(s).classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); if(id==='collection')renderCollection(); if(id==='deck')renderDeck(); if(id==='shop')renderShop(); if(id==='battle')renderLocations(); if(id==='arena')renderArenas(); if(id==='admin')renderAdmin(); }
window.showScreen=showScreen;
window.backToLobby=()=>showScreen('lobby');

let data = JSON.parse(localStorage.getItem('gameData')||'null');
if(!data){
  data={cards:[],packs:[],enemies:[],arenas:[],fields:[],decks:[[],[],[],[]],activeDeck:0,collection:{}};
  initDefaultData();
  save();
}
function save(){localStorage.setItem('gameData',JSON.stringify(data));}

function initDefaultData(){
  const hero={id:'hero1',name:'Starter Hero',type:'hero',rarity:'common',tags:['warrior'],img:'https://via.placeholder.com/100',info:'Hero'};
  data.cards.push(hero);
  addCopies(hero.id,1);
  const minionNames=['MinionA','MinionB','MinionC','MinionD'];
  minionNames.forEach((n,i)=>{let c={id:'m'+i,name:n,type:'minion',rarity:'common',tags:['pirate'],img:'https://via.placeholder.com/100',info:n};data.cards.push(c);addCopies(c.id,5);});
  const spell={id:'s1',name:'Fireball',type:'spell',rarity:'common',img:'https://via.placeholder.com/100',info:'spell'};data.cards.push(spell);addCopies(spell.id,5);
  const item={id:'i1',name:'Potion',type:'item',rarity:'common',img:'https://via.placeholder.com/100',info:'item'};data.cards.push(item);addCopies(item.id,5);
  data.decks[0]=['hero1','m0','m0','m1','m1','m2','m2','m3','m3','s1','i1'];
  while(data.decks[0].length<30) data.decks[0].push('m0');
  data.activeDeck=0;
  data.packs.push({id:'p1',name:'Starter Pack',price:10,cards:data.cards.map(c=>c.id)});
  data.enemies.push({id:'e1',name:'Dummy',deck:data.decks[0],reward:5});
  data.fields.push({id:'f1',name:'Default Field'});
  data.arenas.push({id:'a1',name:'Test Arena',enemies:['e1'],price:0});
}
function addCopies(id,qty){data.collection[id]=(data.collection[id]||0)+qty;}

function renderCollection(){const list=document.getElementById('cardList');list.innerHTML='';data.cards.forEach(c=>{const count=data.collection[c.id]||0;if(count>0){const div=document.createElement('div');div.className='card';div.innerHTML=`<img src="${c.img}"><div class="info">${c.name}<br>${c.info}<br>x${count}</div>`;list.appendChild(div);}});}

function renderDeck(){const deckTabs=document.getElementById('deckTabs');deckTabs.innerHTML='';for(let i=0;i<4;i++){const btn=document.createElement('button');btn.textContent='Deck '+(i+1);if(data.activeDeck===i)btn.style.fontWeight='bold';btn.onclick=()=>{data.activeDeck=i;save();renderDeck();};deckTabs.appendChild(btn);}const deckCards=document.getElementById('deckCards');deckCards.innerHTML='';data.decks[data.activeDeck].forEach(id=>{const c=data.cards.find(x=>x.id===id);if(c){const div=document.createElement('div');div.className='card';div.innerHTML=`<img src="${c.img}"><div class="info">${c.name}</div>`;deckCards.appendChild(div);}});const coll=document.getElementById('collectionCards');coll.innerHTML='';data.cards.forEach(c=>{const div=document.createElement('div');div.className='card';div.innerHTML=`<img src="${c.img}"><div class="info">${c.name}</div>`;div.onclick=()=>{if(countInDeck(c.id,data.activeDeck)<5 && data.decks[data.activeDeck].length<30){data.decks[data.activeDeck].push(c.id);save();renderDeck();}};coll.appendChild(div);});}
function countInDeck(id,d){return data.decks[d].filter(x=>x===id).length;}

function renderShop(){const div=document.getElementById('packs');div.innerHTML='';data.packs.forEach(p=>{const b=document.createElement('button');b.textContent=p.name+' - '+p.price+'g';b.onclick=()=>{openPack(p)};div.appendChild(b);});}
function openPack(p){const results=[];for(let i=0;i<5;i++){const cid=p.cards[Math.floor(Math.random()*p.cards.length)];results.push(cid);addCopies(cid,1);}save();alert('You got: '+results.join(', '));}

function renderLocations(){document.getElementById('board').classList.add('hidden');}
function startSimpleBattle(){const board=document.getElementById('board');board.innerHTML='';for(let y=0;y<12;y++){for(let x=0;x<12;x++){const cell=document.createElement('div');cell.className='cell';cell.dataset.x=x;cell.dataset.y=y;board.appendChild(cell);}}const hero=document.createElement('div');hero.className='cell hero';hero.textContent='H';board.children[0].replaceWith(hero);const enemy=document.createElement('div');enemy.className='cell enemy-hero';enemy.textContent='E';board.children[143].replaceWith(enemy);board.classList.remove('hidden');}

function renderArenas(){const div=document.getElementById('arenas');div.innerHTML='';data.arenas.forEach(a=>{const b=document.createElement('button');b.textContent=a.name;b.onclick=()=>alert('Start arena '+a.name);div.appendChild(b);});}

function renderAdmin(){const c=document.getElementById('adminContent');c.innerHTML='<p>Select a section</p>';}
window.showAdmin=section=>{const c=document.getElementById('adminContent');if(section==='cards'){renderAdminCards(c);} else c.textContent='TODO';};
function renderAdminCards(container){container.innerHTML='';const form=document.createElement('div');form.innerHTML='<h3>New Card</h3><input id="acName" placeholder="Name"><select id="acType"><option value="hero">Hero</option><option value="minion">Minion</option><option value="spell">Spell</option><option value="item">Item</option></select><button id="createCard">Create</button>';
container.appendChild(form);document.getElementById('createCard').onclick=()=>{const id='c'+Date.now();const name=document.getElementById('acName').value;const type=document.getElementById('acType').value;const card={id,name,type,rarity:'common',img:'https://via.placeholder.com/100',info:''};data.cards.push(card);addCopies(card.id,1);save();alert('Card created');};}
})();
