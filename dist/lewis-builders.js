(()=>{
'use strict';
const resonanceCases=[
{name:'Carbonate',formula:'CO₃²⁻',center:'C',lp:0,charge:'2−',ends:['O','O','O'],sites:[0,1,2]},
{name:'Nitrate',formula:'NO₃⁻',center:'N',lp:0,charge:'−',ends:['O','O','O'],sites:[0,1,2]},
{name:'Nitrite',formula:'NO₂⁻',center:'N',lp:1,charge:'−',ends:['O','O'],sites:[0,1]},
{name:'Ozone',formula:'O₃',center:'O',lp:1,charge:'',ends:['O','O'],sites:[0,1]},
{name:'Ethanoate',formula:'CH₃COO⁻',center:'C',lp:0,charge:'−',ends:['O','O','CH₃'],sites:[0,1]}
];
class Resonance{
 constructor(){this.index=0;this.reset()}
 get molecule(){return resonanceCases[this.index]}
 reset(){this.structures=[0];this.source=null;this.solved=false;}
 setCase(i){this.index=i;this.reset()}
 add(){this.solved=false;if(this.structures.length<6)this.structures.push(0);this.source=null;}
 remove(i){this.solved=false;if(i>0)this.structures.splice(i,1);this.source=null;}
 move(i,site){this.solved=false;if(i===0||!this.molecule.sites.includes(site))return false;if(this.structures[i]===site){this.source=i;return false;}if(this.source!==i)return false;this.structures[i]=site;this.source=null;return true;}
 check(){this.solved=false;const sites=this.molecule.sites;if(this.structures.length!==sites.length)return {ok:false,text:'Check the number of structures, including the given structure.'};if(this.structures.some(p=>!sites.includes(p)))return {ok:false,text:'A π bond is in an invalid position.'};if(new Set(this.structures).size!==sites.length)return {ok:false,text:'Some structures repeat. Keep the atom positions fixed and put the π bond in a different allowed position in each drawing.'};this.solved=true;return {ok:true,text:'Correct — all '+sites.length+' distinct equivalent resonance contributors are present.'};}
}
const A=(symbol,lp=0)=>({symbol,lp});
const drawCases=[
{name:'Water',formula:'H₂O',charge:0,atoms:[A('O',2),A('H'),A('H')],edges:[[0,1,1],[0,2,1]]},
{name:'Ammonia',formula:'NH₃',charge:0,atoms:[A('N',1),A('H'),A('H'),A('H')],edges:[[0,1,1],[0,2,1],[0,3,1]]},
{name:'Methane',formula:'CH₄',charge:0,atoms:[A('C'),A('H'),A('H'),A('H'),A('H')],edges:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]},
{name:'Carbon dioxide',formula:'CO₂',charge:0,atoms:[A('C'),A('O',2),A('O',2)],edges:[[0,1,2],[0,2,2]]},
{name:'Hydrogen cyanide',formula:'HCN',charge:0,atoms:[A('C'),A('H'),A('N',1)],edges:[[0,1,1],[0,2,3]]},
{name:'Methanal',formula:'CH₂O',charge:0,atoms:[A('C'),A('O',2),A('H'),A('H')],edges:[[0,1,2],[0,2,1],[0,3,1]]},
{name:'Oxygen',formula:'O₂',charge:0,atoms:[A('O',2),A('O',2)],edges:[[0,1,2]]},
{name:'Nitrogen',formula:'N₂',charge:0,atoms:[A('N',1),A('N',1)],edges:[[0,1,3]]},
{name:'Hydrogen chloride',formula:'HCl',charge:0,atoms:[A('Cl',3),A('H')],edges:[[0,1,1]]},
{name:'Ammonium',formula:'NH₄⁺',charge:1,atoms:[A('N'),A('H'),A('H'),A('H'),A('H')],edges:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]},
{name:'Hydroxide',formula:'OH⁻',charge:-1,atoms:[A('O',3),A('H')],edges:[[0,1,1]]},
{name:'Boron trifluoride',formula:'BF₃',charge:0,atoms:[A('B'),A('F',3),A('F',3),A('F',3)],edges:[[0,1,1],[0,2,1],[0,3,1]]},
{name:'Ethene',formula:'C₂H₄',charge:0,atoms:[A('C'),A('C'),A('H'),A('H'),A('H'),A('H')],edges:[[0,1,2],[0,2,1],[0,3,1],[1,4,1],[1,5,1]]},
{name:'Ethyne',formula:'C₂H₂',charge:0,atoms:[A('C'),A('C'),A('H'),A('H')],edges:[[0,1,3],[0,2,1],[1,3,1]]},
{name:'Methanol',formula:'CH₃OH',charge:0,atoms:[A('C'),A('O',2),A('H'),A('H'),A('H'),A('H')],edges:[[0,1,1],[0,2,1],[0,3,1],[0,4,1],[1,5,1]]},
{name:'Carbonate',formula:'CO₃²⁻',charge:-2,atoms:[A('C'),A('O',2),A('O',3),A('O',3)],edges:[[0,1,2],[0,2,1],[0,3,1]]}
];
const valence={H:1,B:3,C:4,N:5,O:6,F:7,Cl:7};
const key=(a,b)=>a<b?a+','+b:b+','+a;
function matches(atoms,bonds,target){
 if(atoms.length!==target.atoms.length||Object.keys(bonds).length!==target.edges.length)return false;
 const ref={};for(const [a,b,n] of target.edges)ref[key(a,b)]=n;
 const mapping=[],used=new Set();
 function search(i){if(i===atoms.length)return true;for(let j=0;j<atoms.length;j++){if(used.has(j)||atoms[i].symbol!==target.atoms[j].symbol||atoms[i].lp!==target.atoms[j].lp)continue;let good=true;for(let p=0;p<i;p++)if((bonds[key(i,p)]||0)!==(ref[key(j,mapping[p])]||0)){good=false;break;}if(!good)continue;mapping[i]=j;used.add(j);if(search(i+1))return true;used.delete(j);}return false;}
 return search(0);
}
class Drawing{
 constructor(random=Math.random){this.random=random;this.bag=[];this.index=-1;this.next()}
 get molecule(){return drawCases[this.index]}
 reset(){this.slots=Array(15).fill(null);this.bonds={};this.selected=null;this.history=[];}
 next(){if(!this.bag.length){this.bag=drawCases.map((_,i)=>i);for(let i=this.bag.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}if(this.bag.at(-1)===this.index)[this.bag[0],this.bag[this.bag.length-1]]=[this.bag.at(-1),this.bag[0]];}this.index=this.bag.pop();this.reset();}
 save(){this.history.push(JSON.stringify({slots:this.slots,bonds:this.bonds}));}
 undo(){if(!this.history.length)return;const state=JSON.parse(this.history.pop());this.slots=state.slots;this.bonds=state.bonds;this.selected=null;}
 remaining(symbol){return this.molecule.atoms.filter(a=>a.symbol===symbol).length-this.slots.filter(a=>a&&a.symbol===symbol).length;}
 place(i,symbol){if(this.slots[i]||this.remaining(symbol)<=0)return false;this.save();this.slots[i]=A(symbol);return true;}
 bond(a,b,order){if(a===b||!this.slots[a]||!this.slots[b])return false;this.save();this.bonds[key(a,b)]=order;return true;}
 pair(i){if(!this.slots[i])return;this.save();this.slots[i].lp=(this.slots[i].lp+1)%5;}
 erase(i){if(!this.slots[i])return;this.save();this.slots[i]=null;for(const k of Object.keys(this.bonds))if(k.split(',').map(Number).includes(i))delete this.bonds[k];this.selected=null;}
 eraseBond(k){if(this.bonds[k]){this.save();delete this.bonds[k];}}
 check(){const occupied=this.slots.map((a,i)=>a?i:-1).filter(i=>i>=0),atoms=occupied.map(i=>this.slots[i]),bonds={};for(const [k,n] of Object.entries(this.bonds)){const [a,b]=k.split(',').map(Number);bonds[key(occupied.indexOf(a),occupied.indexOf(b))]=n;}
 if(atoms.length!==this.molecule.atoms.length)return {ok:false,text:'Use all the atoms in the bank.'};
 const electrons=atoms.reduce((s,a)=>s+2*a.lp,0)+Object.values(bonds).reduce((s,n)=>s+2*n,0);const total=this.molecule.atoms.reduce((s,a)=>s+valence[a.symbol],0)-this.molecule.charge;
 if(electrons!==total)return {ok:false,text:'Check your electron total: this drawing uses '+electrons+' of '+total+' valence electrons.'};
 if(!matches(atoms,bonds,this.molecule))return {ok:false,text:'Check which atoms are connected, the bond orders and the lone pairs. Rotations and equivalent atom positions are accepted.'};
 return {ok:true,text:'Correct — the bonds, lone pairs and electron total all match.'};}
}
if(typeof module!=='undefined'&&module.exports)module.exports={Resonance,resonanceCases,Drawing,drawCases,matches,key};
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);
const status=(id,result)=>{const e=$(id);e.hidden=!result;e.textContent=result?result.text:'';e.classList.toggle('success',!!result&&result.ok);};
const dotPair=(x,y,angle=0)=>[-1,1].map(sign=>`<circle cx="${x+sign*4*Math.cos(angle)}" cy="${y+sign*4*Math.sin(angle)}" r="2.7" class="lb-dot"/>`).join('');
function lines(x1,y1,x2,y2,order){const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;let s='';for(let n=0;n<order;n++){const off=(n-(order-1)/2)*7;s+=`<line x1="${x1+27*ux-off*uy}" y1="${y1+27*uy+off*ux}" x2="${x2-27*ux-off*uy}" y2="${y2-27*uy+off*ux}" class="lb-bond"/>`;}return s;}
function initResonance(){if(!$('rs-game'))return;const game=new Resonance();let hybridOpen=false;
function card(pi,index){const m=game.molecule,cx=180,cy=170,angles=m.ends.length===2?[0,180]:[0,120,240];let svg=`<title>${index===0?'Given structure':'Alternative '+index}</title>`;
angles.forEach((deg,j)=>{const a=deg*Math.PI/180,x=cx+104*Math.cos(a),y=cy+104*Math.sin(a),eligible=m.sites.includes(j),order=pi===j?2:1,selected=game.source===index&&pi===j;
svg+=`<g ${index&&eligible?`data-rs-card="${index}" data-rs-site="${j}" role="button" tabindex="0" aria-label="${pi===j?'Select π electron pair':'Move π bond to oxygen '+(j+1)}"`:''} class="rs-bond-target ${selected?'selected':''}"><line x1="${cx+28*Math.cos(a)}" y1="${cy+28*Math.sin(a)}" x2="${x-28*Math.cos(a)}" y2="${y-28*Math.sin(a)}" class="rs-hit"/>${lines(cx,cy,x,y,order)}${order===2?`<text x="${cx+56*Math.cos(a)-16*Math.sin(a)}" y="${cy+56*Math.sin(a)+16*Math.cos(a)}" class="rs-pi">π</text>`:''}</g>`;
svg+=`<text x="${x}" y="${y}" class="lb-atom">${m.ends[j]}</text>`;if(eligible){const pairs=order===2?2:3;for(let n=0;n<pairs;n++){const t=a+([90,-90,0][n])*Math.PI/180;svg+=dotPair(x+26*Math.cos(t),y+26*Math.sin(t),t+Math.PI/2);}if(order===1)svg+=`<text x="${x+17}" y="${y-17}" class="lb-charge">−</text>`;}});
svg+=`<text x="180" y="170" class="lb-atom lb-central">${m.center}</text>`;if(m.lp)svg+=dotPair(cx,cy-34);if(m.center==='N'&&m.ends.length===3||m.center==='O')svg+='<text x="197" y="150" class="lb-charge">+</text>';
if(m.charge)svg+=`<path d="M35 35 H23 V305 H35 M325 35 H337 V305 H325" class="lb-bracket"/><text x="344" y="39" class="lb-charge">${m.charge}</text>`;
return `<article class="rs-card"><div class="rs-card-heading"><strong>${index===0?'Given structure':'Alternative '+index}</strong>${index?`<button type="button" data-rs-remove="${index}" aria-label="Remove alternative ${index}">Remove</button>`:''}</div><svg viewBox="0 0 370 330" role="group" aria-label="${index===0?'Given':'Editable'} resonance structure">${svg}</svg></article>`;}
function hybrid(){const m=game.molecule,n=m.sites.length,charge=n===3?'−⅔':'−½',angles=m.ends.length===2?[0,180]:[0,120,240];let svg='<title>Resonance hybrid: equivalent bonds and delocalised charge</title>';
angles.forEach((deg,i)=>{const a=deg*Math.PI/180,x=180+104*Math.cos(a),y=170+104*Math.sin(a),eligible=m.sites.includes(i),ux=Math.cos(a),uy=Math.sin(a);svg+=lines(180,170,x,y,1);if(eligible)svg+=`<line x1="${180+30*ux-7*uy}" y1="${170+30*uy+7*ux}" x2="${x-30*ux-7*uy}" y2="${y-30*uy+7*ux}" class="rs-partial-bond"/>`;svg+=`<text x="${x}" y="${y}" class="lb-atom">${m.ends[i]}</text>`;if(eligible)svg+=`<text x="${x+17}" y="${y-19}" class="lb-charge">${charge}</text>`;});
svg+=`<text x="180" y="170" class="lb-atom lb-central">${m.center}</text>`;if(m.center==='N'&&m.ends.length===3||m.center==='O')svg+='<text x="197" y="150" class="lb-charge">+</text>';return svg;}
function render(){if(!game.solved)hybridOpen=false;$('rs-hybrid-toggle').hidden=!game.solved;$('rs-hybrid-toggle').textContent=hybridOpen?'Hide resonance hybrid':'Show resonance hybrid';$('rs-hybrid-toggle').setAttribute('aria-expanded',String(hybridOpen));$('rs-hybrid').hidden=!hybridOpen;if(hybridOpen){$('rs-hybrid-diagram').innerHTML=hybrid();$('rs-hybrid-order').textContent='Equivalent C–O / N–O / O–O bonds'.replace('C–O / N–O / O–O',game.molecule.center+'–O')+' · average bond order '+(game.molecule.sites.length===3?'1⅓':'1½');}$('rs-formula').textContent=game.molecule.formula;$('rs-cards').innerHTML=game.structures.map(card).join('');$('rs-count').textContent=game.structures.length+' structure'+(game.structures.length===1?'':'s')+' total';$('rs-add').disabled=game.structures.length>=6;}
$('rs-case').innerHTML=resonanceCases.map((m,i)=>`<option value="${i}">${m.name}</option>`).join('');
$('rs-case').addEventListener('change',e=>{game.setCase(Number(e.target.value));status('rs-feedback',null);render();});
$('rs-random').addEventListener('click',()=>{game.setCase((game.index+1+Math.floor(Math.random()*(resonanceCases.length-1)))%resonanceCases.length);$('rs-case').value=String(game.index);document.dispatchEvent(new Event('chemi-controls-sync'));status('rs-feedback',null);render();});
$('rs-add').addEventListener('click',()=>{game.add();status('rs-feedback',null);render();});
$('rs-check').addEventListener('click',()=>{status('rs-feedback',game.check());render();});
$('rs-hybrid-toggle').addEventListener('click',()=>{if(!game.solved)return;hybridOpen=!hybridOpen;render();});
$('rs-reset').addEventListener('click',()=>{game.reset();status('rs-feedback',null);render();});
function act(e){const remove=e.target.closest('[data-rs-remove]');if(remove){game.remove(Number(remove.dataset.rsRemove));status('rs-feedback',null);render();return;}const bond=e.target.closest('[data-rs-site]');if(!bond)return;const i=Number(bond.dataset.rsCard),j=Number(bond.dataset.rsSite);if(game.source!==i&&game.structures[i]!==j){status('rs-feedback',{ok:false,text:'Select the π pair on this structure’s double bond first, then choose another oxygen bond.'});return;}game.move(i,j);status('rs-feedback',null);render();if(e.type==='keydown')$('rs-cards').querySelector(`[data-rs-card="${i}"][data-rs-site="${j}"]`).focus();}
$('rs-cards').addEventListener('click',act);$('rs-cards').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.closest('[data-rs-site]')){e.preventDefault();act(e);}});render();}
function initDrawing(){if(!$('dl-game'))return;const game=new Drawing();let tool='atom',element=game.molecule.atoms[0].symbol;
const pos=i=>({x:90+(i%5)*145,y:80+Math.floor(i/5)*140});
function render(){const m=game.molecule;$('dl-title').textContent=m.name;$('dl-formula').textContent=m.formula;$('dl-undo').disabled=!game.history.length;
const elements=[...new Set(m.atoms.map(a=>a.symbol))];$('dl-atoms').innerHTML=elements.map(s=>`<button type="button" data-element="${s}" aria-pressed="${tool==='atom'&&element===s}" ${game.remaining(s)===0?'disabled':''}>${s} <span>×${game.remaining(s)}</span></button>`).join('');
for(const t of ['1','2','3','pair','erase'])$('dl-tool-'+t).setAttribute('aria-pressed',String(tool===t));
$('dl-active').textContent=tool==='atom'?'Place '+element:tool==='pair'?'Add lone pair':tool==='erase'?'Erase atom or bond':game.selected===null?'Select the first atom':'Select the second atom';
let svg='<title>Lewis structure drawing board</title>';
for(const [k,n] of Object.entries(game.bonds)){const [a,b]=k.split(',').map(Number),p=pos(a),q=pos(b);svg+=`<g data-edge="${k}" ${tool==='erase'?'role="button" tabindex="0" aria-label="Erase bond"':''}><line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" class="dl-edge-hit"/>${lines(p.x,p.y,q.x,q.y,n)}</g>`;}
for(let i=0;i<15;i++){const p=pos(i),atom=game.slots[i];svg+=`<g data-slot="${i}" role="button" tabindex="0" aria-label="${atom?atom.symbol+', '+atom.lp+' lone pairs':'Empty position '+(i+1)}" class="dl-slot ${game.selected===i?'selected':''}"><rect x="${p.x-43}" y="${p.y-44}" width="86" height="88" rx="14" class="dl-cell ${atom?'occupied':''}"/>`;if(atom){svg+=`<text x="${p.x}" y="${p.y}" class="lb-atom">${atom.symbol}</text>`;const occupied=Object.keys(game.bonds).filter(k=>k.split(',').map(Number).includes(i)).map(k=>{const j=k.split(',').map(Number).find(j=>j!==i),q=pos(j);return Math.atan2(q.y-p.y,q.x-p.x);});
// Place lone pairs away from bond directions wherever possible.
const dirs=[-Math.PI/2,0,Math.PI/2,Math.PI];dirs.sort((a,b)=>{const distance=t=>occupied.length?Math.min(...occupied.map(v=>Math.acos(Math.cos(t-v)))):0;return distance(b)-distance(a);});for(let j=0;j<atom.lp;j++){const a=dirs[j];svg+=dotPair(p.x+32*Math.cos(a),p.y+32*Math.sin(a),a+Math.PI/2);}}
else svg+=`<text x="${p.x}" y="${p.y}" class="dl-plus">+</text>`;svg+='</g>';}
$('dl-board').innerHTML=svg;
const used=game.slots.reduce((n,a)=>n+(a?2*a.lp:0),0)+Object.values(game.bonds).reduce((n,b)=>n+2*b,0);$('dl-electrons').textContent=used+' / '+(m.atoms.reduce((n,a)=>n+valence[a.symbol],0)-m.charge)+' valence electrons used';}
$('dl-atoms').addEventListener('click',e=>{const b=e.target.closest('[data-element]');if(!b||b.disabled)return;element=b.dataset.element;tool='atom';game.selected=null;render();});
for(const t of ['1','2','3','pair','erase'])$('dl-tool-'+t).addEventListener('click',()=>{tool=t;game.selected=null;render();});
function act(e){const slot=e.target.closest('[data-slot]'),edge=e.target.closest('[data-edge]');if(edge&&tool==='erase'){game.eraseBond(edge.dataset.edge);status('dl-feedback',null);render();return;}if(!slot)return;const i=Number(slot.dataset.slot);if(tool==='atom')game.place(i,element);else if(tool==='pair')game.pair(i);else if(tool==='erase')game.erase(i);else if(game.slots[i]){if(game.selected===null)game.selected=i;else{game.bond(game.selected,i,Number(tool));game.selected=null;}}status('dl-feedback',null);render();if(e.type==='keydown')$('dl-board').querySelector(`[data-slot="${i}"]`).focus();}
$('dl-board').addEventListener('click',act);$('dl-board').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();act(e);}});
$('dl-check').addEventListener('click',()=>status('dl-feedback',game.check()));$('dl-undo').addEventListener('click',()=>{game.undo();status('dl-feedback',null);render();});$('dl-reset').addEventListener('click',()=>{game.reset();status('dl-feedback',null);render();});$('dl-next').addEventListener('click',()=>{game.next();tool='atom';element=game.molecule.atoms[0].symbol;status('dl-feedback',null);render();});render();}
initResonance();initDrawing();
})();
