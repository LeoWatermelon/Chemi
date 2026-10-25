(()=>{
'use strict';
// Common VSEPR cases: OpenStax Chemistry 2e §7.6. Indices 0/1 are axial for five domains;
// opposite pairs for six domains are 0/1, 2/3, and 4/5.
const positions={4:[[300,55],[95,305],[300,445],[505,305]],5:[[300,55],[300,445],[100,250],[485,145],[485,355]],6:[[300,55],[300,445],[120,145],[480,355],[480,145],[120,355]]};
const shapes={4:['Tetrahedral','Trigonal pyramidal','Bent'],5:['Trigonal bipyramidal','Seesaw','T-shaped','Linear'],6:['Octahedral','Square pyramidal','Square planar']};
class LonePairPosition{
 constructor(){this.domains=5;this.order=[]}
 get count(){return this.order.length}get limit(){return shapes[this.domains].length-1}get shape(){return shapes[this.domains][this.count]}
 setDomains(n){if(Number.isInteger(n)&&n>=4&&n<=6){this.domains=n;this.reset()}}
 reset(){this.order=[]}undo(){return this.order.pop()}
 random(){const alternatives=[4,5,6].filter(n=>n!==this.domains);this.setDomains(alternatives[Math.floor(Math.random()*alternatives.length)])}
 add(i){
  if(!Number.isInteger(i)||i<0||i>=this.domains)return {ok:false,text:'Choose a bonded position.'};
  if(this.order.includes(i))return {ok:false,text:'This position already has a lone pair.'};
  if(this.count===this.limit)return {ok:false,text:'This completes the common shapes for this domain count. Undo, reset or choose another domain count.'};
  if(this.domains===5&&i<2)return {ok:false,text:this.count===0?'Start at an equatorial position. A lone pair there has fewer 90° interactions.':'Add the next lone pair to another equatorial position, not an axial one.'};
  if(this.domains===6&&this.count===1&&Math.floor(i/2)!==Math.floor(this.order[0]/2))return {ok:false,text:'Place the second lone pair opposite the first, 180° apart, to minimise their repulsion.'};
  this.order.push(i);return {ok:true,text:this.count===this.limit?'✓ Correct — '+this.shape+'.':'✓ Correct placement.'};
 }
}
if(typeof module!=='undefined'&&module.exports)module.exports={LonePairPosition,positions,shapes};if(typeof document==='undefined')return;
const root=document.getElementById('lone-pair-position-game');if(!root)return;const game=new LonePairPosition(),el=id=>document.getElementById('lp-'+id);
function feedback(result){el('feedback').hidden=!result;if(result){el('feedback').textContent=result.text;el('feedback').className='of-feedback '+(result.ok?'success':'lp-incorrect')}}
function render(){el('domains').value=String(game.domains);el('shape').textContent=game.shape;el('counts').textContent=(game.domains-game.count)+' bonds · '+game.count+' lone '+(game.count===1?'pair':'pairs');el('undo').disabled=!game.count;el('reset').disabled=!game.count;el('step').textContent=game.count<game.limit?'Place lone pair '+(game.count+1):'Arrangement complete';
 let s='<title>Lone-pair placement</title><desc>Schematic projection of '+game.domains+' electron domains. Select a bonded atom to replace its bond with a lone pair. Positions are not drawn to an angle scale.</desc>';
 positions[game.domains].forEach(([x,y],i)=>{const lone=game.order.includes(i),step=game.order.indexOf(i)+1,kind=game.domains===5?(i<2?'axial':'equatorial'):'domain';
 s+=`<line x1="300" y1="250" x2="${x}" y2="${y}" class="lp-spoke${lone?' lone':''}"/>`;
 if(lone)s+=`<g aria-label="Lone pair ${step}, ${kind} position ${i+1}"><ellipse cx="${x}" cy="${y}" rx="36" ry="25" class="lp-cloud"/><circle cx="${x-9}" cy="${y}" r="6" class="lp-dot"/><circle cx="${x+9}" cy="${y}" r="6" class="lp-dot"/><text x="${x}" y="${y+43}" text-anchor="middle" class="lp-order">${step}</text></g>`;
 else s+=`<g data-lp-position="${i}" role="button" tabindex="0" aria-label="Replace bond at ${kind} position ${i+1} with a lone pair" class="lp-bond-choice"><circle cx="${x}" cy="${y}" r="42" fill="transparent"/><circle cx="${x}" cy="${y}" r="26" class="lp-outer"/><text x="${x}" y="${y+7}" text-anchor="middle" class="lp-symbol">X</text></g>`;
 if(game.domains===5)s+=`<text x="${x}" y="${y+(lone?60:48)}" text-anchor="middle" class="lp-position-label">${kind}</text>`;
 });s+='<circle cx="300" cy="250" r="32" class="lp-central"/><text x="300" y="259" text-anchor="middle" class="lp-central-text">A</text>';el('diagram').innerHTML=s;document.dispatchEvent(new Event('chemi-controls-sync'));
}
function choose(e){const target=e.target.closest('[data-lp-position]');if(!target)return;const i=Number(target.dataset.lpPosition),result=game.add(i);if(result.ok){render();const next=el('diagram').querySelector('[data-lp-position]');if(next)next.focus()}feedback(result)}
el('diagram').addEventListener('click',choose);el('diagram').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(e)}});
el('domains').addEventListener('change',e=>{game.setDomains(Number(e.target.value));feedback(null);render()});el('random').addEventListener('click',()=>{game.random();feedback(null);render()});el('undo').addEventListener('click',()=>{game.undo();feedback(null);render()});el('reset').addEventListener('click',()=>{game.reset();feedback(null);render()});render();
})();
