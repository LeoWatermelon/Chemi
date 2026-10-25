(()=>{
'use strict';
const energy=n=>-13.5984/(n*n),photon=(a,b)=>({from:a,to:b,ev:Math.abs(energy(b)-energy(a)),nm:1239.841984/Math.abs(energy(b)-energy(a))});
const region=nm=>nm<380?'UV':nm>750?'IR':'Visible';
const colour=nm=>nm<380?'#7933e8':nm>750?'#d83838':nm<450?'#9256ff':nm<490?'#398bff':nm<520?'#21d5dc':nm<570?'#79dd58':nm<600?'#f6df55':nm<640?'#ff9a43':'#ff5252';
class EnergyPlay{
 constructor(){this.mode='emission';this.initial=5;this.n=5;this.lines={emission:[],absorption:[]};this.last=null}
 allowed(n){return Number.isInteger(n)&&n>=1&&n<=6&&(this.mode==='emission'?n<this.n:n>this.n)}
 move(n){if(!this.allowed(n))return null;const p=photon(this.n,n);this.n=n;this.last=p;const existing=this.lines[this.mode].find(x=>x.from===p.from&&x.to===p.to);if(existing)existing.count++;else this.lines[this.mode].push({...p,count:1});return p}
 setMode(mode){this.mode=mode;this.initial=mode==='emission'?5:1;this.reset()}
 reset(){this.n=this.initial;this.last=null}
}
if(typeof module!=='undefined'&&module.exports)module.exports={EnergyPlay,energy,photon,region};if(typeof document==='undefined')return;const root=document.getElementById('energy-levels-game');if(!root)return;const game=new EnergyPlay(),el=id=>document.getElementById('en-'+id),levelY=n=>440-(n-1)*72;
function spectrumX(nm){if(nm<380)return 20+210*Math.log(nm/90)/Math.log(380/90);if(nm<=750)return 250+300*(nm-380)/370;return 570+210*Math.log(nm/750)/Math.log(10000/750)}
function renderSpectrum(){const absorption=game.mode==='absorption';let s=`<defs><linearGradient id="en-visible"><stop offset="0" stop-color="#7933e8"/><stop offset=".23" stop-color="#2584ed"/><stop offset=".4" stop-color="#39cf9b"/><stop offset=".55" stop-color="#dae648"/><stop offset=".72" stop-color="#f59c32"/><stop offset="1" stop-color="#d83838"/></linearGradient></defs><rect x="20" y="34" width="210" height="70" rx="5" fill="${absorption?'#7933e8':'#171f24'}"/><rect x="250" y="34" width="300" height="70" rx="5" fill="${absorption?'url(#en-visible)':'#171f24'}"/><rect x="570" y="34" width="210" height="70" rx="5" fill="${absorption?'#d83838':'#171f24'}"/>`;
 for(const [x,label] of [[125,'Ultraviolet'],[400,'Visible'],[675,'Infrared']])s+=`<text x="${x}" y="20" text-anchor="middle" class="en-spectrum-label">${label}</text>`;
 for(const [x,label] of [[20,'90'],[230,'380'],[250,'380'],[550,'750'],[570,'750'],[780,'10,000']])s+=`<text x="${x}" y="124" text-anchor="middle" class="en-spectrum-tick">${label}</text>`;
 game.lines[game.mode].forEach((p,i)=>{const x=spectrumX(p.nm);s+=`<g role="button" tabindex="0" data-line="${i}" aria-label="${p.from} to ${p.to}, ${p.nm.toFixed(1)} nanometres, ${p.count} photons"><rect x="${x-7}" y="32" width="14" height="74" fill="transparent"/><line x1="${x}" x2="${x}" y1="37" y2="101" stroke="${absorption?'#111':colour(p.nm)}" stroke-width="${Math.min(5,2+p.count)}"/></g>`});el('spectrum').innerHTML=s;el('spectrum-title').textContent=absorption?'Absorption spectrum':'Emission spectrum';el('line-count').textContent=game.lines[game.mode].length+(game.lines[game.mode].length===1?' line':' lines');
}
function render(){el('start').value=String(game.initial);[...el('start').options].forEach(o=>o.disabled=game.mode==='emission'?o.value==='1':o.value==='6');el('current').textContent='Electron at n = '+game.n;let s='<line x1="70" x2="420" y1="24" y2="24" class="en-limit"/><text x="70" y="16" class="en-small">Ionisation limit<tspan class="en-numerical"> · 0 eV</tspan></text>';
 for(let n=1;n<=6;n++){const y=levelY(n);s+=`<g class="en-level${game.allowed(n)?' allowed':''}" data-level="${n}" role="button" tabindex="${game.allowed(n)?0:-1}" aria-disabled="${!game.allowed(n)}" aria-label="n equals ${n}, ${energy(n).toFixed(2)} electronvolts"><rect x="30" y="${y-27}" width="425" height="54" rx="8"/><line x1="75" x2="320" y1="${y}" y2="${y}"/><text x="40" y="${y+5}" class="en-label">${n}</text><text x="335" y="${y+5}" class="en-small en-numerical">${energy(n).toFixed(2)} eV</text></g>`}
 s+=`<g id="en-electron" class="en-electron" role="button" tabindex="0" aria-label="Electron at n equals ${game.n}. Drag to an allowed energy level." transform="translate(190 ${levelY(game.n)})"><circle r="18"/><text y="6" text-anchor="middle">−</text></g>`;el('diagram').innerHTML=s;
 const p=game.last;el('details').hidden=!p;el('empty').hidden=!!p;el('boundary').hidden=game.mode==='emission'?game.n!==1:game.n!==6;el('boundary').textContent=game.mode==='emission'?'Ground state reached. Reset the electron to emit again.':'Highest available level reached. Reset the electron to absorb again.';
 if(p){el('transition').textContent='n = '+p.from+' → n = '+p.to;el('photon-energy').textContent=p.ev.toFixed(3)+' eV';el('wavelength').textContent=p.nm.toFixed(1)+' nm · '+region(p.nm);el('event').textContent=game.mode==='emission'?'Photon emitted':'Photon absorbed';el('electron-change').textContent=(game.mode==='emission'?'−':'+')+p.ev.toFixed(3)+' eV'}
 renderSpectrum();document.dispatchEvent(new Event('chemi-controls-sync'));
}
function move(n){game.move(n);render()}
el('info').addEventListener('click',()=>{const shown=root.classList.toggle('en-show-info');el('info').setAttribute('aria-pressed',String(shown));el('info').textContent=shown?'Hide data':'Show data'});
el('mode').addEventListener('change',e=>{game.setMode(e.target.value);render()});el('start').addEventListener('change',e=>{game.initial=Number(e.target.value);game.reset();render()});el('reset').addEventListener('click',()=>{game.reset();render()});el('clear').addEventListener('click',()=>{game.lines[game.mode]=[];renderSpectrum()});
let drag=null,suppress=false;const svg=el('diagram');
function point(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
svg.addEventListener('pointerdown',e=>{if(!e.target.closest('#en-electron')||e.button!==0)return;e.preventDefault();drag={id:e.pointerId};svg.setPointerCapture(e.pointerId)});
svg.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;e.preventDefault();const p=point(e);el('electron').setAttribute('transform',`translate(${Math.max(35,Math.min(420,p.x))} ${Math.max(50,Math.min(455,p.y))})`);svg.querySelectorAll('.en-drop').forEach(g=>g.classList.remove('en-drop'));const n=Math.round((440-p.y)/72)+1;if(game.allowed(n)&&p.x>=30&&p.x<=455)svg.querySelector('[data-level="'+n+'"]').classList.add('en-drop')});
svg.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;const p=point(e);drag=null;svg.releasePointerCapture(e.pointerId);suppress=true;setTimeout(()=>suppress=false,0);const n=Math.round((440-p.y)/72)+1;if(p.x>=30&&p.x<=455&&p.y>=53&&p.y<=467)move(n);else render()});svg.addEventListener('pointercancel',()=>{drag=null;render()});
svg.addEventListener('click',e=>{if(suppress)return;const g=e.target.closest('[data-level]');if(g)move(Number(g.dataset.level))});svg.addEventListener('keydown',e=>{const g=e.target.closest('[data-level]');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();move(Number(g.dataset.level))}else if(e.target.closest('#en-electron')&&(e.key==='ArrowUp'||e.key==='ArrowDown')){e.preventDefault();move(game.n+(e.key==='ArrowUp'?1:-1));el('electron').focus()}});
function inspect(e){const g=e.target.closest('[data-line]');if(!g)return;game.last=game.lines[game.mode][Number(g.dataset.line)];render()}
el('spectrum').addEventListener('click',inspect);el('spectrum').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect(e)}});render();
})();
