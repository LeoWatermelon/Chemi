(()=>{
'use strict';
const elements=[null,['H','Hydrogen'],['He','Helium'],['Li','Lithium'],['Be','Beryllium'],['B','Boron'],['C','Carbon'],['N','Nitrogen'],['O','Oxygen'],['F','Fluorine'],['Ne','Neon'],['Na','Sodium'],['Mg','Magnesium'],['Al','Aluminium'],['Si','Silicon'],['P','Phosphorus'],['S','Sulfur'],['Cl','Chlorine'],['Ar','Argon']];
const tasks=[{p:11,n:12,e:10},{p:6,n:6,e:6},{p:8,n:8,e:10},{p:1,n:1,e:1},{p:17,n:18,e:18},{p:12,n:12,e:10},{p:6,n:8,e:6},{p:3,n:4,e:2},{p:2,n:2,e:2},{p:13,n:14,e:10},{p:10,n:10,e:10},{p:8,n:10,e:8}];
const chargeText=q=>q===0?'0':(Math.abs(q)===1?'':Math.abs(q))+(q>0?'+':'−');
class Atom{
 constructor(){this.p=6;this.n=6;this.e=6}
 change(k,delta){const max={p:18,n:24,e:18};if(!(k in max))return;this[k]=Math.min(max[k],Math.max(0,this[k]+delta))}
 get mass(){return this.p+this.n}get charge(){return this.p-this.e}get element(){return elements[this.p]}
 get shells(){let left=this.e;return [2,8,8].map(cap=>{const n=Math.min(cap,left);left-=n;return n})}
 matches(t){return ['p','n','e'].every(k=>this[k]===t[k])}
}
if(typeof module!=='undefined'&&module.exports)module.exports={Atom,tasks,chargeText};
if(typeof document==='undefined')return;
const root=document.getElementById('build-atom-game');if(!root)return;
const atom=new Atom(),el=id=>document.getElementById('ba-'+id);let mode='explore',taskIndex=0;
function feedback(text,good=false){el('feedback').hidden=!text;el('feedback').textContent=text;el('feedback').className='of-feedback'+(good?' success':'')}
function render(){
 for(const k of ['p','n','e']){el(k).textContent=atom[k];root.querySelector(`[data-change="${k}:-1"]`).disabled=atom[k]===0;root.querySelector(`[data-change="${k}:1"]`).disabled=atom[k]===({p:18,n:24,e:18}[k])}
 el('name').textContent=atom.element?atom.element[1]+'-'+atom.mass:'No element';el('symbol').textContent=atom.element?atom.element[0]:'—';el('mass').textContent=atom.mass;el('number').textContent=atom.p;el('charge').textContent=atom.p?chargeText(atom.charge):'';el('mass-value').textContent=atom.mass;el('charge-value').textContent=atom.charge>0?'+'+atom.charge:String(atom.charge);el('state').textContent=!atom.p?'Add a proton to define an element':atom.charge===0?'Neutral atom':atom.charge>0?'Positive ion':'Negative ion';el('shells').textContent=atom.e?atom.shells.filter(n=>n).join(', '):'0';
 let svg='<title>Atom model</title><desc>'+atom.p+' protons, '+atom.n+' neutrons and '+atom.e+' electrons. Simplified shell model.</desc>';
 [96,140,181].forEach((r,i)=>{if(atom.shells[i]||i===0)svg+=`<circle cx="215" cy="215" r="${r}" class="ba-shell"/>`;for(let j=0;j<atom.shells[i];j++){const a=-Math.PI/2+j*2*Math.PI/atom.shells[i],x=215+r*Math.cos(a),y=215+r*Math.sin(a);svg+=`<circle cx="${x}" cy="${y}" r="10" class="ba-electron"/><text x="${x}" y="${y+4}" class="ba-particle-label">−</text>`}});
 const total=atom.mass;let pLeft=atom.p,nLeft=atom.n;for(let i=0;i<total;i++){const r=total===1?0:10*Math.sqrt(i),a=i*2.39996323,x=215+r*Math.cos(a),y=215+r*Math.sin(a);const proton=pLeft>0&&(nLeft===0||i%2===0);if(proton)pLeft--;else nLeft--;svg+=`<circle cx="${x}" cy="${y}" r="10" class="${proton?'ba-proton':'ba-neutron'}"/><text x="${x}" y="${y+4}" class="ba-particle-label">${proton?'+':'n'}</text>`}
 el('diagram').innerHTML=svg;el('task-panel').hidden=mode!=='task';el('check').hidden=mode!=='task';el('next').hidden=mode!=='task';
 const t=tasks[taskIndex],q=t.p-t.e;el('task').textContent='Build '+elements[t.p][1].toLowerCase()+'-'+(t.p+t.n)+(q===0?' as a neutral atom.':' with charge '+(q>0?'+'+q:q.toString().replace('-','−'))+'.');
}
root.addEventListener('click',e=>{const b=e.target.closest('[data-change]');if(!b)return;const [k,d]=b.dataset.change.split(':');atom.change(k,Number(d));feedback('');render()});
el('mode').addEventListener('change',e=>{mode=e.target.value;if(mode==='task')atom.p=atom.n=atom.e=0;feedback('');render()});
el('reset').addEventListener('click',()=>{atom.p=atom.n=atom.e=0;feedback('');render()});
el('check').addEventListener('click',()=>{const t=tasks[taskIndex];if(atom.matches(t)){feedback('Correct — the element, mass number and charge all match.',true);return}feedback(atom.p!==t.p?'Check the protons: proton number determines the element.':atom.n!==t.n?'Check the neutrons: mass number = protons + neutrons.':'Check the electrons: charge = protons − electrons.')});
el('next').addEventListener('click',()=>{taskIndex=(taskIndex+1)%tasks.length;atom.p=atom.n=atom.e=0;feedback('');render()});
render();
})();
