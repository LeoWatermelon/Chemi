(()=>{
'use strict';
const atom=(label,x,y,lp=0,charge='',incoming=false)=>({label,x,y,lp,charge,incoming});
function adduct(name,formula,reactants,donor,outer,acceptor='B'){
 const atoms=[atom(donor,285,215,donor==='O'?1:0,'+'),atom(acceptor,555,215,0,'−')],bonds=[[0,1]],angles=donor==='O'?[140,220]:[90,180,270];
 for(const d of angles){const a=d*Math.PI/180;atoms.push(atom('H',285+105*Math.cos(a),215+105*Math.sin(a)));bonds.push([0,atoms.length-1]);}
 for(const d of [-90,0,90]){const a=d*Math.PI/180;atoms.push(atom(outer,555+105*Math.cos(a),215+105*Math.sin(a),outer==='F'?3:0));bonds.push([1,atoms.length-1]);}
 return {name,formula,reactants,atoms,bonds,donations:[[0,1]],why:donor+' supplies a lone pair to '+acceptor+', which has an incomplete valence shell in the starting molecule.'};
}
const cases=[
{name:'Ammonium formation',formula:'NH₄⁺',reactants:'NH₃ + H⁺ → NH₄⁺',atoms:[atom('N',420,215,0,'+'),atom('H',420,100),atom('H',285,215),atom('H',420,330),atom('H',555,215,0,'',true)],bonds:[[0,1],[0,2],[0,3],[0,4]],donations:[[0,4]],incoming:true,why:'Nitrogen donates its lone pair to the incoming H⁺. Once NH₄⁺ forms, all four N–H bonds are equivalent; the star tracks the incoming hydrogen only.'},
{name:'Hydronium formation',formula:'H₃O⁺',reactants:'H₂O + H⁺ → H₃O⁺',atoms:[atom('O',420,215,1,'+'),atom('H',310,135),atom('H',310,295),atom('H',555,215,0,'',true)],bonds:[[0,1],[0,2],[0,3]],donations:[[0,3]],incoming:true,why:'Oxygen donates one lone pair to the incoming H⁺. The star records that hydrogen’s origin; the resulting O–H bonds are not permanently different bond types.'},
adduct('Ammonia–boron trifluoride','H₃N·BF₃','NH₃ + BF₃ → H₃N·BF₃','N','F'),
adduct('Ammonia–borane','H₃N·BH₃','NH₃ + BH₃ → H₃N·BH₃','N','H'),
adduct('Water–boron trifluoride','H₂O·BF₃','H₂O + BF₃ → H₂O·BF₃','O','F'),
{name:'Diamminesilver(I)',formula:'[Ag(NH₃)₂]⁺',reactants:'2 NH₃ + Ag⁺ → [Ag(NH₃)₂]⁺',atoms:[atom('Ag',420,215),atom('N',260,215),atom('N',580,215),atom('H',260,110),atom('H',155,215),atom('H',260,320),atom('H',580,110),atom('H',685,215),atom('H',580,320)],bonds:[[0,1],[0,2],[1,3],[1,4],[1,5],[2,6],[2,7],[2,8]],donations:[[1,0],[2,0]],charge:'+',why:'Each ammonia ligand donates a nitrogen lone pair to Ag⁺. Either N → Ag bond is a correct answer.'}
];
const key=(a,b)=>a<b?a+','+b:b+','+a;
class Dative{
 constructor(random=Math.random){this.random=random;this.index=-1;this.bag=[];this.next();}
 get current(){return cases[this.index]}
 next(){if(!this.bag.length){this.bag=cases.map((_,i)=>i);for(let i=this.bag.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}if(this.bag.at(-1)===this.index)[this.bag[0],this.bag[this.bag.length-1]]=[this.bag.at(-1),this.bag[0]];}this.index=this.bag.pop();this.selected=null;this.direction=null;this.correct=false;}
 select(i){if(!this.current.bonds[i])return;this.selected=i;this.direction=null;this.correct=false;}
 choose(d){if(this.selected===null||![0,1].includes(d))return;this.direction=d;this.correct=false;}
 check(){if(this.selected===null||this.direction===null)return {ok:false,text:'Select a bond and a donation direction.'};const bond=this.current.bonds[this.selected],valid=this.current.donations.find(([a,b])=>key(a,b)===key(...bond));if(!valid)return {ok:false,text:'That bond was already present in the starting molecule. Select a bond formed when the donor and acceptor combine.'};const from=bond[this.direction],to=bond[1-this.direction];this.correct=from===valid[0]&&to===valid[1];return this.correct?{ok:true,text:'Correct. '+this.current.why}:{ok:false,text:'Reverse the direction: the arrow starts at the atom donating both electrons and points towards the acceptor.'};}
}
if(typeof module!=='undefined'&&module.exports)module.exports={Dative,cases};if(typeof document==='undefined')return;
const $=id=>document.getElementById('db-'+id);if(!$('game'))return;const game=new Dative();const label=i=>game.current.atoms[i].label+(game.current.atoms[i].incoming?'*':'');
function feedback(r){$('feedback').hidden=!r;$('feedback').textContent=r?r.text:'';$('feedback').classList.toggle('success',!!r&&r.ok);}
function diagram(){const m=game.current;let svg='<title>'+m.name+': select a bond in the product Lewis structure</title><defs><marker id="db-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L7 4 L0 8 Z" fill="#b17c2d"/></marker></defs>';
if(m.charge)svg+=`<path d="M115 65 H95 V365 H115 M725 65 H745 V365 H725" class="db-bracket"/><text x="760" y="70" class="db-charge">${m.charge}</text>`;
m.bonds.forEach(([ai,bi],i)=>{const a=m.atoms[ai],b=m.atoms[bi],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;let x1=a.x+28*ux,y1=a.y+28*uy,x2=b.x-28*ux,y2=b.y-28*uy;const selected=game.selected===i;if(selected&&game.direction===1)[x1,y1,x2,y2]=[x2,y2,x1,y1];svg+=`<g class="db-bond-target ${selected?'selected':''}" data-bond="${i}" role="button" tabindex="0" aria-pressed="${selected}" aria-label="Bond ${i+1}: ${label(ai)} to ${label(bi)}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="db-hit"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="db-bond" ${selected&&game.direction!==null?'marker-end="url(#db-arrow)"':''}/></g>`;});
m.atoms.forEach((a,i)=>{svg+=`<text x="${a.x}" y="${a.y}" class="db-atom ${a.incoming?'db-incoming':''}">${label(i)}</text>`;if(a.charge)svg+=`<text x="${a.x+18}" y="${a.y-18}" class="db-charge">${a.charge}</text>`;
if(a.lp){const neighbours=m.bonds.filter(b=>b.includes(i)).map(b=>m.atoms[b.find(j=>j!==i)]);const dirs=[-Math.PI/2,0,Math.PI/2,Math.PI];const score=t=>Math.min(...neighbours.map(b=>Math.acos(Math.cos(t-Math.atan2(b.y-a.y,b.x-a.x)))));dirs.sort((x,y)=>score(y)-score(x));for(let n=0;n<a.lp;n++){const t=dirs[n];for(const side of [-1,1])svg+=`<circle cx="${a.x+33*Math.cos(t)-side*4*Math.sin(t)}" cy="${a.y+33*Math.sin(t)+side*4*Math.cos(t)}" r="2.8" class="db-dot"/>`;}}});
return svg;}
function render(){const m=game.current;$('name').textContent=m.name;$('formula').textContent=m.formula;$('reactants').textContent=m.reactants;$('incoming').hidden=!m.incoming;$('diagram').innerHTML=diagram();$('direction').disabled=game.selected===null;$('check').disabled=game.direction===null;$('selected').textContent=game.selected===null?'Select a bond':label(m.bonds[game.selected][0])+' — '+label(m.bonds[game.selected][1]);for(let d=0;d<2;d++){const e=$('direction-'+d);e.textContent=game.selected===null?(d===0?'First atom → second atom':'Second atom → first atom'):label(m.bonds[game.selected][d])+' → '+label(m.bonds[game.selected][1-d]);e.setAttribute('aria-pressed',String(game.direction===d));}}
function select(e){const b=e.target.closest('[data-bond]');if(!b)return;const i=Number(b.dataset.bond);game.select(i);feedback(null);render();if(e.type==='keydown')$('diagram').querySelector('[data-bond="'+i+'"]').focus();}
$('diagram').addEventListener('click',select);$('diagram').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select(e);}});
for(let d=0;d<2;d++)$('direction-'+d).addEventListener('click',()=>{game.choose(d);feedback(null);render();});$('check').addEventListener('click',()=>{feedback(game.check());render();});$('next').addEventListener('click',()=>{game.next();feedback(null);render();});render();
})();
