(function(){
const screens = ['lobby','collection','deck','shop','battle','arena','admin'];
function showScreen(id){ screens.forEach(s=>document.getElementById(s).classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); if(id==='collection')renderCollection(); if(id==='deck')renderDeck(); if(id==='shop')renderShop(); if(id==='battle')renderLocations(); if(id==='arena')renderArenas(); if(id==='admin')renderAdmin(); }
window.showScreen=showScreen;
window.backToLobby=()=>showScreen('lobby');

let battleState = null;

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

function renderLocations(){
  document.getElementById('board').classList.add('hidden');
  document.getElementById('battleInfo').classList.add('hidden');
  document.getElementById('battleArea').classList.add('hidden');
  window.removeEventListener('keydown', handleBattleKey);
  battleState = null;
}

function startBattle(){
  const board = document.getElementById('board');
  const area = document.getElementById('battleArea');
  const info = document.getElementById('battleInfo');
  board.innerHTML='';
  for(let y=0;y<12;y++){
    for(let x=0;x<12;x++){
      const cell=document.createElement('div');
      cell.className='cell';
      cell.dataset.x=x;
      cell.dataset.y=y;
      cell.addEventListener('click',()=>cellClicked(cell));
      board.appendChild(cell);
    }
  }
  const deck=[...data.decks[data.activeDeck]];
  shuffle(deck);
  const enemyDeck=[...deck];
  battleState={
    hero:{x:0,y:0,hp:10,energy:0,deck,hand:[],units:[]},
    enemy:{x:11,y:11,hp:10,energy:0,deck:enemyDeck,hand:[],units:[]},
    turn:'player',actions:0,selected:null,selectingSummon:null
  };
  drawCards('hero',3);
  drawCards('enemy',3);
  placeUnit('hero');
  placeUnit('enemy');
  info.classList.remove('hidden');
  area.classList.remove('hidden');
  updatePanels();
  startTurn();
}

function shuffle(a){
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
}

function drawCards(role,n){
  const p=battleState[role];
  for(let i=0;i<n;i++){
    if(p.deck.length===0) break;
    const c=p.deck.shift();
    if(p.hand.length<6) p.hand.push(c);
  }
}

function startTurn(){
  if(battleState.turn==='player'){
    chooseStartOption();
  }else{
    enemyTurn();
  }
}

function chooseStartOption(){
  const actions=document.getElementById('actions');
  actions.innerHTML='';
  const opt1=document.createElement('button');opt1.textContent='Buy 2 Cards';
  const opt2=document.createElement('button');opt2.textContent='Buy 1 + 3 Energy';
  const opt3=document.createElement('button');opt3.textContent='Gain 6 Energy';
  actions.appendChild(opt1);actions.appendChild(opt2);actions.appendChild(opt3);
  opt1.onclick=()=>{drawCards('hero',2);beginActionPhase();};
  opt2.onclick=()=>{drawCards('hero',1);battleState.hero.energy+=3;beginActionPhase();};
  opt3.onclick=()=>{battleState.hero.energy+=6;beginActionPhase();};
}

function beginActionPhase(){
  battleState.actions=3;
  updatePanels();
  const actionsDiv=document.getElementById('actions');
  actionsDiv.innerHTML+= '<button id="endTurn">End Turn</button>';
  document.getElementById('endTurn').onclick=()=>{battleState.turn='enemy';startTurn();};
  window.addEventListener('keydown', handleBattleKey);
}

function enemyTurn(){
  window.removeEventListener('keydown', handleBattleKey);
  battleState.enemy.energy+=6;
  battleState.actions=3;
  while(battleState.actions>0){
    aiMoveTowardHero();
    battleState.actions--;checkCombat();
    if(!battleState) return;
  }
  battleState.turn='player';
  startTurn();
}

function aiMoveTowardHero(){
  const e=battleState.enemy;const h=battleState.hero;
  let dx=h.x>e.x?1:h.x<e.x?-1:0;
  let dy=h.y>e.y?1:h.y<e.y?-1:0;
  moveUnit('enemy',e.x+dx,e.y+dy);
  updatePanels();
}

function updatePanels(){
  document.getElementById('heroPanel').innerHTML=`<h3>Hero</h3><p>HP:${battleState.hero.hp}</p><p>Energy:${battleState.hero.energy}</p>`;
  document.getElementById('enemyPanel').innerHTML=`<h3>Enemy</h3><p>HP:${battleState.enemy.hp}</p>`;
  const hand=document.getElementById('hand');
  hand.innerHTML='';
  battleState.hero.hand.forEach((cid,idx)=>{
    const c=data.cards.find(x=>x.id===cid);
    const div=document.createElement('div');div.className='card';div.innerHTML=`<img src="${c.img}"><div class="info">${c.name}</div>`;
    div.onclick=()=>selectCard(idx);
    hand.appendChild(div);
  });
  const actionsDiv=document.getElementById('actions');
  actionsDiv.textContent=`Actions: ${battleState.actions} `;
  document.getElementById('battleInfo').textContent=`Hero HP: ${battleState.hero.hp} | Enemy HP: ${battleState.enemy.hp}`;
}

function selectCard(index){
  const cid=battleState.hero.hand[index];
  const card=data.cards.find(x=>x.id===cid);
  if(card.type==='minion'){
    battleState.selectingSummon={cardIndex:index};
    highlightSummon();
  }
}

function highlightSummon(){
  clearHighlights();
  const h=battleState.hero;
  for(let y=h.y-1;y<=h.y+1;y++){
    for(let x=h.x-1;x<=h.x+1;x++){
      if(x===h.x && y===h.y) continue;
      const cell=getCell(x,y);if(!cell) continue;
      if(!cell.textContent){cell.classList.add('highlight-move');}
    }
  }
}

function clearHighlights(){
  document.querySelectorAll('#board .cell').forEach(c=>{c.classList.remove('highlight-move','highlight-attack');});
}

function cellClicked(cell){
  if(battleState.selectingSummon){
    if(!cell.classList.contains('highlight-move')) return;
    const idx=battleState.selectingSummon.cardIndex;
    const cid=battleState.hero.hand.splice(idx,1)[0];
    const x=Number(cell.dataset.x);const y=Number(cell.dataset.y);
    const unit={owner:'hero',x,y};
    battleState.hero.units.push(unit);
    placeMinion(unit);
    clearHighlights();
    battleState.selectingSummon=null;
    updatePanels();
  }
}

function getCell(x,y){
  return document.querySelector(`#board .cell[data-x="${x}"][data-y="${y}"]`);
}

function placeUnit(role){
  const pos=battleState[role];
  const cell=getCell(pos.x,pos.y);
  cell.textContent=role==='hero'?'H':'E';
  cell.classList.add(role==='hero'?'hero':'enemy-hero');
}

function placeMinion(m){
  const cell=getCell(m.x,m.y);
  cell.textContent='M';
  cell.classList.add(m.owner==='hero'?'hero':'enemy-hero');
}

function moveUnit(role,nx,ny){
  const pos=battleState[role];
  if(nx<0||ny<0||nx>11||ny>11) return;
  const oldCell=getCell(pos.x,pos.y);
  oldCell.textContent='';
  oldCell.className='cell';
  pos.x=nx; pos.y=ny;
  placeUnit(role);
}

function handleBattleKey(e){
  if(!battleState) return;
  const h=battleState.hero;
  if(battleState.actions<=0) return;
  if(e.key==='ArrowUp') {moveUnit('hero',h.x,h.y-1);battleState.actions--;}
  else if(e.key==='ArrowDown') {moveUnit('hero',h.x,h.y+1);battleState.actions--;}
  else if(e.key==='ArrowLeft') {moveUnit('hero',h.x-1,h.y);battleState.actions--;}
  else if(e.key==='ArrowRight') {moveUnit('hero',h.x+1,h.y);battleState.actions--;}
  checkCombat();
  updatePanels();
}

function checkCombat(){
  const h=battleState.hero;
  const e=battleState.enemy;
  const dist=Math.abs(h.x-e.x)+Math.abs(h.y-e.y);
  if(dist<=1){
    e.hp--; h.hp--;
    updatePanels();
    if(e.hp<=0){
      alert('Enemy defeated!');
      renderLocations();
    } else if(h.hp<=0){
      alert('You were defeated!');
      renderLocations();
    }
  }
}


function renderArenas(){const div=document.getElementById('arenas');div.innerHTML='';data.arenas.forEach(a=>{const b=document.createElement('button');b.textContent=a.name;b.onclick=()=>alert('Start arena '+a.name);div.appendChild(b);});}

function renderAdmin(){const c=document.getElementById('adminContent');c.innerHTML='<p>Select a section</p>';}
window.showAdmin=section=>{const c=document.getElementById('adminContent');if(section==='cards'){renderAdminCards(c);} else c.textContent='TODO';};
function renderAdminCards(container){container.innerHTML='';const form=document.createElement('div');form.innerHTML='<h3>New Card</h3><input id="acName" placeholder="Name"><select id="acType"><option value="hero">Hero</option><option value="minion">Minion</option><option value="spell">Spell</option><option value="item">Item</option></select><button id="createCard">Create</button>';
container.appendChild(form);document.getElementById('createCard').onclick=()=>{const id='c'+Date.now();const name=document.getElementById('acName').value;const type=document.getElementById('acType').value;const card={id,name,type,rarity:'common',img:'https://via.placeholder.com/100',info:''};data.cards.push(card);addCopies(card.id,1);save();alert('Card created');};}
})();
