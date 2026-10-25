(()=>{
'use strict';
// Localised valence-bond model: C–C sigma overlap and perpendicular p–p pi overlaps.
const molecules=[{name:'Ethane',formula:'C₂H₆',hybrid:'sp³',pi:0},{name:'Ethene',formula:'C₂H₄',hybrid:'sp²',pi:1},{name:'Ethyne',formula:'C₂H₂',hybrid:'sp',pi:2}];
class BondBuilder{
 constructor(){this.molecule=1;this.reset()}
 get atom(){return molecules[this.molecule]}get orbitals(){return ['hybrid',...['py','pz'].slice(0,this.atom.pi)]}get complete(){return this.formed.length===1+this.atom.pi}
 reset(){this.gap=230;this.left=null;this.right=null;this.formed=[]}
 setMolecule(i){if(Number.isInteger(i)&&i>=0&&i<3){this.molecule=i;this.reset()}}
 select(side,id){if(['left','right'].includes(side)&&this.orbitals.includes(id)&&!this.formed.includes(id))this[side]=this[side]===id?null:id}
 move(gap){if(!this.formed.length&&Number.isFinite(gap))this.gap=Math.max(170,Math.min(420,gap))}
 overlap(){
  if(!this.left||!this.right)return {ok:false,text:'Select an orbital on each carbon.'};
  if(this.left!==this.right)return {ok:false,text:'These orbitals do not form the intended overlap. Match the hybrid orbitals, or choose parallel p orbitals.'};
  if(this.formed.includes(this.left))return {ok:false,text:'That orbital pair is already bonded.'};
  const id=this.left;this.formed.push(id);this.gap=230;this.left=null;this.right=null;
  return {ok:true,text:this.complete?'✓ '+this.atom.hybrid+' carbons: 1 σ'+(this.atom.pi?' + '+this.atom.pi+' π':'')+' bond'+(this.atom.pi?'s':'')+'.':id==='hybrid'?'σ bond formed by end-on overlap.':'π bond formed by sideways overlap.'};
 }
}
if(typeof module!=='undefined'&&module.exports)module.exports={BondBuilder,molecules};if(typeof document==='undefined')return;
const root=document.getElementById('sigma-pi-builder-game');if(!root)return;const game=new BondBuilder(),el=id=>document.getElementById('bp-'+id);
const label=id=>id==='hybrid'?game.atom.hybrid:id==='py'?'2pᵧ':'2p_z';
function feedback(r){el('feedback').hidden=!r;if(r){el('feedback').textContent=r.text;el('feedback').className='of-feedback'+(r.ok?' success':'')}}
function bank(side){el(side+'-orbitals').innerHTML=game.orbitals.map(id=>`<button type="button" data-side="${side}" data-orbital="${id}" aria-pressed="${game[side]===id}" ${game.formed.includes(id)?'disabled':''}><span class="bp-swatch ${id}"></span>${id==='pz'?'2p<sub>z</sub>':label(id)}${game.formed.includes(id)?'<span class="bp-used">✓</span>':''}</button>`).join('')}
function diagram(){const l=450-game.gap/2,r=450+game.gap/2,y=250;let s='<title>Sigma and pi bond builder</title><desc>Two carbon atoms with fixed orbital orientations. Select corresponding orbitals on the two carbons to form bonds. Orbitals for bonds to hydrogen are omitted.</desc>';
 // Each pair of coloured bridges represents ONE pi bond, with density on both sides of the bond axis.
 for(const id of game.formed){if(id==='hybrid')s+=`<ellipse cx="450" cy="250" rx="${game.gap/2+20}" ry="27" class="bp-sigma-density"/><line x1="${l}" y1="250" x2="${r}" y2="250" class="bp-sigma-line"/>`;
 else for(const sign of [-1,1]){const shift=id==='pz'?sign*49:0,yy=y+sign*(id==='py'?96:57);s+=`<path d="M ${l+shift} ${yy-26} Q 450 ${yy-46} ${r+shift} ${yy-26} L ${r+shift} ${yy+26} Q 450 ${yy+46} ${l+shift} ${yy+26} Z" class="bp-pi-density ${id}"/>`}}
 for(const [side,x,facing] of [['left',l,1],['right',r,-1]]){
  for(const id of game.orbitals){const selected=game[side]===id,bonded=game.formed.includes(id),opacity=bonded?.23:selected?.83:.38;
   s+=`<g data-side="${side}" data-orbital="${id}" role="button" tabindex="${bonded?-1:0}" aria-label="${side} carbon ${label(id)} orbital" aria-pressed="${selected}" aria-disabled="${bonded}" class="bp-orbital ${id}${selected?' selected':''}" opacity="${opacity}">`;
   if(id==='hybrid'){s+=`<path d="M ${x} ${y} C ${x+facing*45} ${y-45},${x+facing*118} ${y-36},${x+facing*127} ${y} C ${x+facing*118} ${y+36},${x+facing*45} ${y+45},${x} ${y} Z"/><ellipse cx="${x-facing*22}" cy="${y}" rx="22" ry="14"/>`}
   else{const dx=id==='py'?0:61,dy=id==='py'?133:83;for(const sign of [-1,1]){const vx=sign*dx,vy=sign*dy,len=Math.hypot(dx,dy),px=-vy/len*43,py=vx/len*43;s+=`<path d="M ${x} ${y} C ${x+vx*.48+px} ${y+vy*.48+py},${x+vx+px} ${y+vy+py},${x+vx} ${y+vy} C ${x+vx-px} ${y+vy-py},${x+vx*.48-px} ${y+vy*.48-py},${x} ${y} Z"/>`}}
   s+='</g>';
  }
  s+=`<g class="bp-carbon"><circle cx="${x}" cy="${y}" r="23" class="bp-nucleus"/><text x="${x}" y="${y+8}" text-anchor="middle">C</text></g>`;
 }
 s+='<text x="450" y="455" text-anchor="middle" class="bp-model-label">Carbon–carbon overlap · fixed orbital orientation</text>';el('diagram').innerHTML=s;
}
function render(){el('title').textContent='Two '+game.atom.hybrid+' carbon atoms';el('hybrid').textContent=game.atom.pi+' unhybridised p orbital'+(game.atom.pi===1?'':'s')+' per carbon';bank('left');bank('right');
 el('sigma').textContent=game.formed.includes('hybrid')?'1 σ':'0 σ';el('pi').textContent=game.formed.filter(id=>id!=='hybrid').length+' π';el('bond-kind').textContent=game.complete?['Single bond','Double bond','Triple bond'][game.molecule]:'Bond in progress';el('result').classList.toggle('complete',game.complete);diagram()}
function choose(side,id){
 if(game.formed.includes(id)||!game.orbitals.includes(id))return;
 game.select(side,id);feedback(null);
 if(game.left&&game.right)feedback(game.overlap());
 render();
}
for(const side of ['left','right'])el(side+'-orbitals').addEventListener('click',e=>{const b=e.target.closest('[data-orbital]');if(!b||b.disabled)return;choose(side,b.dataset.orbital);const next=el(side+'-orbitals').querySelector('button:not(:disabled)');if(next)next.focus();else el('reset').focus()});
el('molecule').addEventListener('change',e=>{game.setMolecule(Number(e.target.value));feedback(null);render()});
el('reset').addEventListener('click',()=>{game.reset();feedback(null);render()});
const svg=el('diagram');
svg.addEventListener('click',e=>{const target=e.target.closest('[data-orbital]');if(target)choose(target.dataset.side,target.dataset.orbital)});
svg.addEventListener('keydown',e=>{if(!['Enter',' '].includes(e.key))return;const target=e.target.closest('[data-orbital]');if(!target)return;e.preventDefault();const side=target.dataset.side;choose(side,target.dataset.orbital);const next=svg.querySelector('[data-side="'+side+'"][aria-disabled="false"]');if(next)next.focus();else el('reset').focus()});
render();
})();
