(()=>{
'use strict';
// First IE in kJ/mol: RSC Periodic Table atomic data (Period 3);
// University of Lethbridge CHEM1000, lecture 16, alkali metals (Group 1).
const group=[
 {s:'Li',z:3,shells:[2,1],ie:520.2},{s:'Na',z:11,shells:[2,8,1],ie:495.8},
 {s:'K',z:19,shells:[2,8,8,1],ie:418.8},{s:'Rb',z:37,shells:[2,8,18,8,1],ie:403},
 {s:'Cs',z:55,shells:[2,8,18,18,8,1],ie:375.7}
];
const period=['Na','Mg','Al','Si','P','S','Cl','Ar'].map((s,i)=>({s,z:11+i,shells:[2,8,i+1],ie:[495.845,737.75,577.539,786.518,1011.812,999.589,1251.186,1520.571][i]}));
// Aufbau/Hund order for the Period 3 valence orbitals; the last entry is removed first.
const filling=[[0,0],[0,1],[1,0],[2,0],[3,0],[1,1],[2,1],[3,1]];
function valenceOrbitals(index,removed=false){const boxes=Array.from({length:4},()=>[false,false]);filling.slice(0,index+1-(removed?1:0)).forEach(([box,spin])=>boxes[box][spin]=true);return boxes}
class Shielding{
 constructor(){this.mode='group';this.selected=0;this.hand=true;this.reset()}
 get list(){return this.mode==='group'?group:period}get atom(){return this.list[this.selected]}
 get shells(){return this.atom.shells.length}
 get radius(){return this.mode==='group'?42+this.shells*22:140-this.selected*5}
 get resistance(){return this.mode==='group'?(this.atom.ie-375.7)/(520.2-375.7):(this.atom.ie-495.845)/(1520.571-495.845)}
 get attraction(){return this.mode==='group'?this.resistance:this.selected/7}
 get threshold(){return 55+this.resistance*245}get response(){return .95-this.resistance*.87}
 setMode(mode){if(!['group','period'].includes(mode))return;this.mode=mode;this.selected=0;this.reset()}
 choose(i){if(Number.isInteger(i)&&i>=0&&i<this.list.length){this.selected=i;this.reset()}}
 reset(){this.removed=false;this.progress=0;this.pull=0}
 stretch(distance){if(this.removed)return;this.pull=Math.max(0,distance);this.progress=Math.min(1,this.pull/this.threshold);if(this.progress===1)this.removed=true}
 release(){if(!this.removed){this.pull=0;this.progress=0}return this.removed}
}
if(typeof module!=='undefined'&&module.exports)module.exports={Shielding,group,period,valenceOrbitals};if(typeof document==='undefined')return;const root=document.getElementById('shielding-game');if(!root)return;const game=new Shielding(),el=id=>document.getElementById('sh-'+id);let drag=null,keyboardPull=0,electronX=0,electronY=265;
function meter(){el('progress').style.width=(game.progress*100)+'%';el('progressbar').setAttribute('aria-valuenow',String(Math.round(game.progress*100)));el('status').textContent=game.removed?'Electron removed':game.progress>0?'Pulling…':'';el('status').classList.toggle('sh-success',game.removed);orbitals()}
function orbitals(){
 const visible=game.mode==='period';el('orbitals-panel').hidden=!visible;el('chart-panel').hidden=!visible;if(!visible)return;
 const boxes=valenceOrbitals(game.selected,game.removed),target=filling[game.selected];
 const box=(b)=>`<div class="sh-orbital-box" role="img" aria-label="${b===0?'3s':'3p orbital '+b}: ${boxes[b].filter(Boolean).length} electrons">${boxes[b].map((occupied,spin)=>`<span class="${b===target[0]&&spin===target[1]?'sh-target-electron':''}${!occupied?' sh-vacant':''}" aria-label="${b===target[0]&&spin===target[1]?(game.removed?'Removed electron':'Electron to remove'):occupied?(spin?'Spin down':'Spin up'):'Empty'}">${occupied?(spin?'↓':'↑'):'&nbsp;'}</span>`).join('')}</div>`;
 el('orbitals').innerHTML=`<div class="sh-s-orbital"><span>3s</span>${box(0)}</div><div class="sh-p-orbitals"><span>3p</span><div>${[1,2,3].map(box).join('')}</div></div>`;
 el('orbital-key').textContent=game.removed?'Highlighted space: electron removed':'Highlighted arrow: electron to remove';
 el('exception').textContent=game.selected===2?'Mg → Al: the electron removed from Al is in the higher-energy 3p subshell, so less energy is needed.':game.selected===5?'P → S: pairing in a 3p orbital adds electron–electron repulsion, making one of the paired electrons easier to remove.':'';
 el('exception').hidden=!el('exception').textContent;
}
function chart(){if(game.mode!=='period')return;const x=i=>80+i*80,y=v=>258-v/1600*208;
 let s='<title>Period 3 first ionisation energies</title><desc>Select an element to explore its orbitals. The dips from magnesium to aluminium and phosphorus to sulfur are highlighted.</desc>';
 for(let v=0;v<=1600;v+=400)s+=`<line x1="65" x2="660" y1="${y(v)}" y2="${y(v)}" class="sh-chart-grid"/><text x="56" y="${y(v)+5}" text-anchor="end">${v}</text>`;
 s+='<text x="65" y="23">First IE / kJ mol⁻¹</text><text x="360" y="325" text-anchor="middle">Element</text>';
 period.forEach((a,i)=>{if(i)s+=`<line x1="${x(i-1)}" y1="${y(period[i-1].ie)}" x2="${x(i)}" y2="${y(a.ie)}" class="sh-chart-line${i===2||i===5?' sh-dip':''}"/>`;
 if(i===2||i===5)s+=`<text x="${(x(i)+x(i-1))/2}" y="${Math.min(y(a.ie),y(period[i-1].ie))-16}" text-anchor="middle" class="sh-dip-label">${i===2?'Mg → Al':'P → S'}</text>`;
 s+=`<g class="sh-chart-choice${game.selected===i?' selected':''}" role="button" tabindex="0" data-chart-element="${i}" aria-pressed="${game.selected===i}" aria-label="${a.s}: ${Math.round(a.ie)} kilojoules per mole"><circle cx="${x(i)}" cy="${y(a.ie)}" r="22" fill="transparent"/><circle cx="${x(i)}" cy="${y(a.ie)}" r="${game.selected===i?8:5}" class="sh-chart-dot"/><text x="${x(i)}" y="286" text-anchor="middle">${a.s}</text></g>`});el('chart').innerHTML=s;
}
function render(){const r=game.radius,a=game.atom;
 el('bank-title').textContent=game.mode==='group'?'Group 1':'Period 3';
 el('elements').innerHTML=game.list.map((a,i)=>`<button type="button" data-element="${i}" aria-label="${a.s}, ${a.z} protons" aria-pressed="${i===game.selected}"><small>${a.z}</small><strong>${a.s}</strong></button>`).join('');
 el('energy').textContent=a.s+(game.removed?'⁺':'')+' · '+Math.round(a.ie).toLocaleString('en')+' kJ mol⁻¹';
 el('strength').textContent=game.attraction>.66?'Strong':game.attraction>.33?'Medium':'Weak';el('strength-fill').style.width=(25+game.attraction*75)+'%';
 let s='<title>First ionisation energy</title><desc>Schematic '+a.s+' atom with '+game.shells+' shells and '+a.z+' protons. Pull the highlighted electron outward. Distances and drag resistance illustrate trends, not physical scales.</desc>';
 for(let i=1;i<=game.shells;i++){const ri=r*i/game.shells;s+=`<circle cx="260" cy="265" r="${ri}" class="sh-shell${i===game.shells?' outer':''}"/>`;const count=a.shells[i-1];for(let j=0;j<count;j++){if(i===game.shells&&j===0)continue;const angle=j*2*Math.PI/count;s+=`<circle cx="${260+ri*Math.cos(angle)}" cy="${265+ri*Math.sin(angle)}" r="4" class="sh-inner"/>`}}
 s+=`<circle cx="260" cy="265" r="25" class="sh-nucleus"/><text x="260" y="271" text-anchor="middle" class="sh-protons">${a.z} p⁺</text><path id="sh-tether" d="M ${260+r} 265 L ${260+r} 265" class="sh-tether"/><g id="sh-electron" transform="translate(${260+r} 265)" role="button" tabindex="0" aria-label="Outer electron. Drag outward to remove and back to the shell to replace. Right arrow pulls; Escape replaces." class="sh-electron ready"><circle r="28" class="sh-hit"/><circle r="15" class="sh-dot"/><text y="6" text-anchor="middle">−</text></g>`;
 el('diagram').innerHTML=s;electronX=260+r;electronY=265;meter();chart();
}
function drawPull(dx,dy){const distance=Math.hypot(dx,dy);game.stretch(distance);el('energy').textContent=game.atom.s+(game.removed?'⁺':'')+' · '+Math.round(game.atom.ie).toLocaleString('en')+' kJ mol⁻¹';const ratio=game.removed?1:game.response;const x=Math.max(28,Math.min(692,260+game.radius+dx*ratio)),y=Math.max(28,Math.min(502,265+dy*ratio));electronX=x;electronY=y;el('electron').setAttribute('transform',`translate(${x} ${y})`);el('tether').setAttribute('d',game.removed?'':`M ${260+game.radius} 265 Q ${260+game.radius+dx*ratio/2} ${265+dy*ratio/2+10} ${x} ${y}`);el('electron').classList.toggle('detached',game.removed);meter()}
function reset(){drag=null;keyboardPull=0;game.reset();render()}
el('mode').addEventListener('change',e=>{game.setMode(e.target.value);reset()});el('elements').addEventListener('click',e=>{const b=e.target.closest('[data-element]');if(b){game.choose(Number(b.dataset.element));reset();el('elements').querySelector('[data-element="'+game.selected+'"]').focus()}});
function selectChart(e){const b=e.target.closest('[data-chart-element]');if(!b)return;game.choose(Number(b.dataset.chartElement));reset();el('chart').querySelector('[data-chart-element="'+game.selected+'"]').focus()}
el('chart').addEventListener('click',selectChart);el('chart').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectChart(e)}});
const svg=el('diagram');function point(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
svg.addEventListener('pointerdown',e=>{if(e.button!==0||!e.target.closest('#sh-electron'))return;e.preventDefault();const p=point(e);keyboardPull=0;drag={id:e.pointerId,startX:p.x,startY:p.y,offsetX:electronX-p.x,offsetY:electronY-p.y};svg.setPointerCapture(e.pointerId)});
svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();const p=point(e);
 if(game.removed){
  electronX=Math.max(28,Math.min(692,p.x+drag.offsetX));electronY=Math.max(28,Math.min(502,p.y+drag.offsetY));
  if(Math.hypot(electronX-260,electronY-265)<=game.radius+24){game.reset();keyboardPull=0;render();drag.startX=p.x;drag.startY=p.y;drag.offsetX=electronX-p.x;drag.offsetY=electronY-p.y;return}
  el('electron').setAttribute('transform',`translate(${electronX} ${electronY})`);return;
 }
 const dx=p.x-drag.startX,dy=p.y-drag.startY;
 // Only outward displacement counts: pulling toward the nucleus cannot remove the electron.
 const radial=Math.hypot(game.radius+dx,dy)-game.radius;if(radial<=0){drawPull(0,0);return}const distance=Math.hypot(dx,dy);const scaled=radial/distance;drawPull(dx*scaled,dy*scaled);
 if(game.removed){drag.offsetX=electronX-p.x;drag.offsetY=electronY-p.y}
});
function end(e){if(!drag||e.pointerId!==drag.id)return;drag=null;keyboardPull=0;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);if(!game.release()){render();el('status').textContent='The nucleus pulled the electron back'}}
svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',()=>{if(drag)reset()});
svg.addEventListener('keydown',e=>{if(!e.target.closest('#sh-electron'))return;if(e.key==='Escape'||(game.removed&&e.key==='ArrowLeft')){e.preventDefault();reset();el('electron').focus();return}if(e.key==='ArrowRight'&&!game.removed){e.preventDefault();keyboardPull+=18;drawPull(keyboardPull,0)}});
render();
})();
