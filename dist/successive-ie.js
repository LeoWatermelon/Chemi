(()=>{
'use strict';
// First eight successive IE values (kJ/mol): https://periodic-table.rsc.org/element/11/ through /18/ (Atomic data).
const elements=[
 {s:'Na',name:'Sodium',z:11,ie:[495.845,4562.444,6910.28,9543.36,13353.6,16612.85,20117.2,25496.25]},
 {s:'Mg',name:'Magnesium',z:12,ie:[737.75,1450.683,7732.692,10542.519,13630.48,18019.6,21711.13,25661.24]},
 {s:'Al',name:'Aluminium',z:13,ie:[577.539,1816.679,2744.781,11577.469,14841.857,18379.49,23326.3,27465.52]},
 {s:'Si',name:'Silicon',z:14,ie:[786.518,1577.134,3231.585,4355.523,16090.571,19805.55,23783.6,29287.16]},
 {s:'P',name:'Phosphorus',z:15,ie:[1011.812,1907.467,2914.118,4963.582,6273.969,21267.395,25430.64,29871.9]},
 {s:'S',name:'Sulfur',z:16,ie:[999.589,2251.763,3356.72,4556.231,7004.305,8495.824,27107.363,31719.56]},
 {s:'Cl',name:'Chlorine',z:17,ie:[1251.186,2297.663,3821.78,5158.608,6541.7,9361.97,11018.221,33603.91]},
 {s:'Ar',name:'Argon',z:18,ie:[1520.571,2665.857,3930.81,5770.79,7238.33,8781.034,11995.347,13841.79]}
];
const removalLimit=8;
class SuccessiveIE{constructor(){this.selected=0;this.removed=0}get atom(){return elements[this.selected]}get remaining(){return this.atom.z-this.removed}get shells(){return [Math.min(2,this.remaining),Math.min(8,Math.max(0,this.remaining-2)),Math.max(0,this.remaining-10)]}get done(){return this.removed>=removalLimit}get inner(){return this.remaining<=10}get jumpIndex(){return this.atom.z-10}remove(){if(this.done)return null;const from=this.inner?2:3,jump=this.removed===this.jumpIndex,value=this.atom.ie[this.removed++];return {from,value,jump}}reset(){this.removed=0}}
if(typeof module!=='undefined'&&module.exports)module.exports={SuccessiveIE,elements};if(typeof document==='undefined')return;const root=document.getElementById('successive-ie-game');if(!root)return;const game=new SuccessiveIE(),el=id=>document.getElementById('si-'+id);let drag=null,last=null;
el('element').innerHTML=elements.map((a,i)=>`<option value="${i}">${a.name} (${a.s})</option>`).join('');el('element').value=String(game.selected);
const charge=(s,q)=>s+(q===0?'':q===1?'⁺':String(q).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('')+'⁺');
function graph(){const a=game.atom,values=a.ie.slice(0,game.removed),max=Math.max(1000,Math.ceil(Math.max(0,...values)/5000)*5000),x=i=>85+(i-1)*590/(removalLimit-1),y=v=>255-v/max*215;let s='<title>Successive ionisation energies</title><desc>Each point is the energy to remove the next electron from the gaseous atom or ion.</desc>';
 for(let n=0;n<=4;n++){const v=max*n/4,yy=y(v);s+=`<line x1="75" x2="695" y1="${yy}" y2="${yy}" class="si-grid"/><text x="65" y="${yy+5}" text-anchor="end" class="si-axis-text">${Math.round(v/1000*10)/10}</text>`}
 s+='<path d="M 75 35 V 255 H 695" class="si-axis"/><text x="20" y="145" transform="rotate(-90 20 145)" text-anchor="middle" class="si-axis-text">IE (×10³ kJ mol⁻¹)</text><text x="390" y="315" text-anchor="middle" class="si-axis-text">Electron removed</text>';
 for(let i=1;i<=removalLimit;i++)s+=`<text x="${x(i)}" y="280" text-anchor="middle" class="si-axis-text">${i}</text>`;
 values.forEach((v,i)=>{if(i)s+=`<line x1="${x(i)}" y1="${y(values[i-1])}" x2="${x(i+1)}" y2="${y(v)}" class="si-line${i===game.jumpIndex?' jump':''}"/>`;s+=`<g role="button" tabindex="0" data-point="${i}" aria-label="Ionisation ${i+1}: ${Math.round(v)} kilojoules per mole"><circle cx="${x(i+1)}" cy="${y(v)}" r="16" fill="transparent"/><circle cx="${x(i+1)}" cy="${y(v)}" r="${i===values.length-1?6:4}" class="si-point"/></g>`});el('graph').innerHTML=s}
function render(){const a=game.atom;el('remove').disabled=game.done;el('charge').textContent=charge(a.s,game.removed);let s='<circle cx="220" cy="210" r="26" class="si-nucleus"/><text x="220" y="216" text-anchor="middle" class="si-nucleus-text">'+a.z+' p⁺</text>';
 game.shells.forEach((count,idx)=>{if(!count)return;const r=[55,105,155][idx],canRemove=!game.done&&idx===(game.inner?1:2);s+=`<circle cx="220" cy="210" r="${r}" class="si-shell"/>`;for(let j=0;j<count;j++){const angle=j*2*Math.PI/count,x=220+r*Math.cos(angle),y=210+r*Math.sin(angle);s+=`<g ${canRemove?'data-electron="true" role="button" tabindex="0"':''} data-x="${x}" data-y="${y}" class="si-electron${canRemove?' removable':''}" transform="translate(${x} ${y})" aria-label="${canRemove?'Remove':'Bound'} electron"><circle r="25" fill="transparent"/><circle r="10" class="si-dot"/><text y="4" text-anchor="middle">−</text></g>`}});el('diagram').innerHTML=s;
 table();graph()}
function remove(){const result=game.remove();if(result){last=result;render()}}
el('remove').addEventListener('click',remove);el('element').addEventListener('change',e=>{drag=null;game.selected=Number(e.target.value);game.reset();last=null;render()});el('reset').addEventListener('click',()=>{drag=null;game.reset();last=null;render()});
const svg=el('diagram');function point(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
let suppress=false;
svg.addEventListener('pointerdown',e=>{const g=e.target.closest('[data-electron]');if(!g||e.button!==0)return;e.preventDefault();drag={id:e.pointerId,node:g,start:point(e),moved:false};svg.setPointerCapture(e.pointerId)});
svg.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();const p=point(e);if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>6)drag.moved=true;drag.node.setAttribute('transform',`translate(${p.x} ${p.y})`)});
svg.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const p=point(e),moved=drag.moved;drag=null;svg.releasePointerCapture(e.pointerId);suppress=true;setTimeout(()=>suppress=false,0);if(!moved||Math.hypot(p.x-220,p.y-210)>185)remove();else render()});svg.addEventListener('pointercancel',()=>{drag=null;render()});svg.addEventListener('click',e=>{if(!suppress&&e.target.closest('[data-electron]'))remove()});svg.addEventListener('keydown',e=>{if(e.target.closest('[data-electron]')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();remove()}});
function table(selected=game.removed-1){el('values').innerHTML=game.atom.ie.map((v,i)=>{const revealed=i<game.removed,jump=revealed&&i===game.jumpIndex;return `<tr class="${revealed&&i===selected?'selected':''}${jump?' si-big-jump':''}"><th scope="row">${i+1}${jump?'<span class="si-jump-badge">↑ Big jump</span>':''}</th><td>${revealed?Math.round(v).toLocaleString('en'):'—'}</td></tr>`}).join('')}
function inspect(e){const p=e.target.closest('[data-point]');if(p)table(Number(p.dataset.point))}el('graph').addEventListener('click',inspect);el('graph').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect(e)}});render();
})();
