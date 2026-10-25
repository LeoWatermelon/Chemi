(()=>{
'use strict';
const group=[['H','Hydrogen',1,1],['Li','Lithium',3,2],['Na','Sodium',11,3],['K','Potassium',19,4],['Rb','Rubidium',37,5],['Cs','Caesium',55,6],['Fr','Francium',87,7]];
const periods={2:[['Li','Lithium',3,2],['Be','Beryllium',4,2],['B','Boron',5,2],['C','Carbon',6,2],['N','Nitrogen',7,2],['O','Oxygen',8,2],['F','Fluorine',9,2],['Ne','Neon',10,2]],3:[['Na','Sodium',11,3],['Mg','Magnesium',12,3],['Al','Aluminium',13,3],['Si','Silicon',14,3],['P','Phosphorus',15,3],['S','Sulfur',16,3],['Cl','Chlorine',17,3],['Ar','Argon',18,3]]};
class RadiusPlay{
 constructor(){this.mode='group';this.period=3;this.selected=[1,5];this.active=0;this.info=false}
 get list(){return this.mode==='group'?group:periods[this.period]}
 atom(slot){return this.list[this.selected[slot]]}
 radius(slot){return this.mode==='group'?46+(this.atom(slot)[3]-1)*20:(this.period===3?155:132)-this.selected[slot]*7}
 choose(i){if(Number.isInteger(i)&&i>=0&&i<this.list.length)this.selected[this.active]=i}
 setMode(mode){this.mode=mode;this.selected=mode==='group'?[1,5]:[0,7]}
}
if(typeof module!=='undefined'&&module.exports)module.exports={RadiusPlay,group,periods};if(typeof document==='undefined')return;const root=document.getElementById('atomic-radius-game');if(!root)return;const game=new RadiusPlay(),el=id=>document.getElementById('ar-'+id);
function render(){el('period-label').hidden=game.mode!=='period';el('bank-title').textContent=game.mode==='group'?'Group 1':'Period '+game.period;el('info').setAttribute('aria-pressed',String(game.info));el('info').textContent=game.info?'Hide data':'Show data';el('details').hidden=!game.info;
 for(let i=0;i<2;i++){el(i?'b':'a').textContent='Atom '+(i?'B':'A')+' · '+game.atom(i)[0];el(i?'b':'a').setAttribute('aria-pressed',String(game.active===i))}
 el('elements').innerHTML=game.list.map((a,i)=>`<button type="button" data-element="${i}" class="ar-element" aria-label="${a[1]}, atomic number ${a[2]}" aria-pressed="${game.selected[game.active]===i}"><small>${a[2]}</small><strong>${a[0]}</strong><span>${game.selected.map((n,slot)=>n===i?(slot?'B':'A'):'').filter(Boolean).join(' · ')||'&nbsp;'}</span></button>`).join('');
 let svg='<title>Atomic radius comparison</title><desc>Shell diagrams illustrate periodic trends, not measured radii.</desc>';
 for(let slot=0;slot<2;slot++){const a=game.atom(slot),r=game.radius(slot),cx=slot?610:210,cy=235,n=a[3],strength=game.mode==='period'?game.selected[slot]/7:.3;svg+=`<text x="${cx}" y="32" text-anchor="middle" class="ar-atom-title">${a[0]}</text><text x="${cx}" y="56" text-anchor="middle" class="ar-atom-name">${a[1]}</text><circle cx="${cx}" cy="${cy}" r="${r}" fill="${slot?'#eaf0e2':'#e5efdb'}" fill-opacity=".55"/>`;
 for(let shell=1;shell<=n;shell++){const sr=r*shell/n;svg+=`<circle cx="${cx}" cy="${cy}" r="${sr}" class="ar-shell${shell===n?' outer':''}"/>`}
 svg+=`<circle cx="${cx}" cy="${cy}" r="28" fill="#6c944e" opacity="${.10+strength*.2}"/><circle cx="${cx}" cy="${cy}" r="21" fill="${game.mode==='period'?`hsl(98 28% ${83-strength*24}%)`:'#d2e2c2'}" stroke="#7a9868"/><text x="${cx}" y="${cy+5}" text-anchor="middle" class="ar-protons">${a[2]} p⁺</text><text x="${cx}" y="438" text-anchor="middle" class="ar-shell-count">${n} ${n===1?'shell':'shells'}</text>`;
 if(game.mode==='period'){svg+=`<text x="${cx}" y="470" text-anchor="middle" class="ar-attraction-label">Nuclear attraction</text><rect x="${cx-65}" y="483" width="130" height="8" rx="4" fill="#e1e9d8"/><rect x="${cx-65}" y="483" width="${35+strength*95}" height="8" rx="4" fill="#60844e"/>`}}
 el('diagram').innerHTML=svg;el('details-text').textContent=game.mode==='group'?'Moving down Group 1 adds occupied electron shells. The outer shell is farther from the nucleus, and inner electrons provide more shielding. Hydrogen is shown in Group 1 but is not an alkali metal.':'Across this period, the occupied shell count stays the same while proton number increases. Shielding changes relatively little, so the stronger effective nuclear attraction draws the outer electron cloud closer.';
}
el('mode').addEventListener('change',e=>{game.setMode(e.target.value);render()});el('period').addEventListener('change',e=>{game.period=Number(e.target.value);game.selected=[0,7];render()});el('a').addEventListener('click',()=>{game.active=0;render()});el('b').addEventListener('click',()=>{game.active=1;render()});el('elements').addEventListener('click',e=>{const b=e.target.closest('[data-element]');if(b){game.choose(Number(b.dataset.element));render();el('elements').querySelector('[data-element="'+b.dataset.element+'"]').focus()}});el('swap').addEventListener('click',()=>{game.selected.reverse();render()});el('info').addEventListener('click',()=>{game.info=!game.info;render()});render();
})();
