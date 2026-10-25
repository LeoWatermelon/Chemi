(()=>{
'use strict';
const elements=[["H","Hydrogen"],["He","Helium"],["Li","Lithium"],["Be","Beryllium"],["B","Boron"],["C","Carbon"],["N","Nitrogen"],["O","Oxygen"],["F","Fluorine"],["Ne","Neon"],["Na","Sodium"],["Mg","Magnesium"],["Al","Aluminium"],["Si","Silicon"],["P","Phosphorus"],["S","Sulfur"],["Cl","Chlorine"],["Ar","Argon"],["K","Potassium"],["Ca","Calcium"],["Sc","Scandium"],["Ti","Titanium"],["V","Vanadium"],["Cr","Chromium"],["Mn","Manganese"],["Fe","Iron"],["Co","Cobalt"],["Ni","Nickel"],["Cu","Copper"],["Zn","Zinc"],["Ga","Gallium"],["Ge","Germanium"],["As","Arsenic"],["Se","Selenium"],["Br","Bromine"],["Kr","Krypton"],["Rb","Rubidium"],["Sr","Strontium"],["Y","Yttrium"],["Zr","Zirconium"],["Nb","Niobium"],["Mo","Molybdenum"],["Tc","Technetium"],["Ru","Ruthenium"],["Rh","Rhodium"],["Pd","Palladium"],["Ag","Silver"],["Cd","Cadmium"],["In","Indium"],["Sn","Tin"],["Sb","Antimony"],["Te","Tellurium"],["I","Iodine"],["Xe","Xenon"]];
const subshells=[{"id":"1s","boxes":1},{"id":"2s","boxes":1},{"id":"2p","boxes":3},{"id":"3s","boxes":1},{"id":"3p","boxes":3},{"id":"4s","boxes":1},{"id":"3d","boxes":5},{"id":"4p","boxes":3},{"id":"5s","boxes":1},{"id":"4d","boxes":5},{"id":"5p","boxes":3}];
const cores={He:2,Ne:10,Ar:18,Kr:36,Xe:54,Rn:86};
const superscripts=['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
// Neutral ground states, NIST: https://math.nist.gov/DFTdata/atomdata/configuration.html
const exceptions={24:{'4s':1,'3d':5},29:{'4s':1,'3d':10},41:{'5s':1,'4d':4},42:{'5s':1,'4d':5},44:{'5s':1,'4d':7},45:{'5s':1,'4d':8},46:{'5s':0,'4d':10},47:{'5s':1,'4d':10},57:{'4f':0,'5d':1},58:{'4f':1,'5d':1},64:{'4f':7,'5d':1},78:{'6s':1,'5d':9},79:{'6s':1,'5d':10},89:{'5f':0,'6d':1},90:{'5f':0,'6d':2},91:{'5f':2,'6d':1},92:{'5f':3,'6d':1}};
class ElectronArrangement {
 constructor(){this.z=8;this.format='full';this.core='He';this.spin='up';this.reset()}
 coreZ(){return this.format==='noble'?cores[this.core]:0}
 validCore(){return this.coreZ()<this.z}
 distribution(z){const atomicNumber=z,out={};for(const sub of subshells){out[sub.id]=Math.min(z,sub.boxes*2);z-=out[sub.id]}return Object.assign(out,exceptions[atomicNumber]||{})}
 available(){const core=this.distribution(this.coreZ()),limit=this.z<=18?5:this.z<=36?8:this.z<=54?11:this.z<=86?15:18;return subshells.slice(0,limit).filter(s=>core[s.id]===0)}
 expected(){const full=this.distribution(this.z),core=this.distribution(this.coreZ());return Object.fromEntries(subshells.map(s=>[s.id,Math.max(0,full[s.id]-core[s.id])]))}
 reset(){this.rows=this.available().map(s=>s.id);this.slots=Object.fromEntries(subshells.map(s=>[s.id,Array(s.boxes*2).fill(null)]));this.feedback=null;this.revealed=false}
 configure(key,value){this[key]=value;this.reset()}
 fail(rule,text){this.feedback={type:'error',rule,text};return false}
 put(id,index,spin){
  if(!this.rows.includes(id)||!['up','down'].includes(spin)||index<0||index>=this.slots[id].length)return false;
  if(this.slots[id][index])return this.fail('Pauli exclusion','This position is already occupied. Each orbital can hold only two electrons, with opposite spins.');
  const partner=index%2===0?index+1:index-1;
  if(this.slots[id][partner]===spin)return this.fail('Pauli exclusion',`The two electrons in this ${id} orbital must have opposite spins.`);
  const expected=this.expected(),next=this.rows.find(row=>this.count(row)<expected[row]);
  if(id!==next)return this.fail('Aufbau principle',next?`Complete ${next} before adding electrons to ${id}. Follow the subshell order and occupancies in the given configuration.`:'The given configuration is already complete.');
  const values=this.slots[id],boxes=values.length/2;
  if(boxes>1){
   let empty=0;const singles=[];
   for(let i=0;i<values.length;i+=2){const pair=values.slice(i,i+2).filter(Boolean);if(!pair.length)empty++;if(pair.length===1)singles.push(pair[0])}
   if(values[partner]&&empty)return this.fail('Hund’s rule',`Place one electron in every ${id} orbital before pairing electrons.`);
   if(!values[partner]&&singles.some(value=>value!==spin))return this.fail('Hund’s rule',`Unpaired electrons in ${id} must have parallel spins.`);
  }
  this.slots[id][index]=spin;this.feedback=null;this.revealed=false;
  if(this.total()===this.z)this.check();return true;
 }
 move(from,fromIndex,to,toIndex){
  if(from===to&&fromIndex===toIndex)return false;
  const spin=this.slots[from]?.[fromIndex];if(!spin)return false;
  this.slots[from][fromIndex]=null;
  if(this.put(to,toIndex,spin))return true;
  this.slots[from][fromIndex]=spin;return false;
 }
 targetNotation(){const expected=this.expected();return subshells.filter(s=>expected[s.id]).map(s=>s.id+String(expected[s.id]).split('').map(n=>superscripts[Number(n)]).join('')).join(' ')}
 remove(id,index){if(!this.rows.includes(id)||index<0||index>=this.slots[id].length)return;this.slots[id][index]=null;this.feedback=null;this.revealed=false}
 count(id){return this.slots[id].filter(Boolean).length}
 total(){return this.rows.reduce((n,id)=>n+this.count(id),0)}
 problem(){
  if(!this.validCore())return {rule:'Noble-gas core',text:`[${this.core}] is not a smaller core for ${elements[this.z-1][1].toLowerCase()}. Choose a smaller noble gas or use Full.`};
  for(const id of this.rows){const values=this.slots[id];for(let i=0;i<values.length;i+=2)if(values[i]&&values[i]===values[i+1])return {rule:'Pauli exclusion',row:id,text:`The two electrons in one ${id} orbital have the same spin. Electrons sharing an orbital must have opposite spins.`}}
  for(const id of this.rows){const sub=subshells.find(s=>s.id===id);if(sub.boxes===1)continue;const values=this.slots[id],singles=[];let occupied=0;
   for(let i=0;i<values.length;i+=2){const pair=values.slice(i,i+2).filter(Boolean);if(pair.length)occupied++;if(pair.length===1)singles.push(pair[0])}
   if(occupied<Math.min(this.count(id),sub.boxes))return {rule:'Hund’s rule',row:id,text:`In ${id}, put one electron in each equal-energy orbital before pairing them.`};
   if(new Set(singles).size>1)return {rule:'Hund’s rule',row:id,text:`The unpaired electrons in ${id} must have parallel spins. Either all ↑ or all ↓ is accepted.`};
  }
  const target=this.z-this.coreZ();if(this.total()!==target)return {rule:'Electron count',text:`You have placed ${this.total()} of the ${target} electrons needed${this.format==='noble'?' beyond ['+this.core+']':''}. ${this.total()<target?'Add the remaining electrons.':'Remove the extra electrons.'}`};
  const expected=this.expected();for(const sub of this.available())if(this.count(sub.id)!==expected[sub.id])return {rule:'Aufbau principle',row:sub.id,text:exceptions[this.z]?`The given configuration includes an exception to the simple filling pattern. Recheck ${sub.id}.`:`Recheck ${sub.id}. Follow the subshell filling order.`};
  return null;
 }
 check(){const problem=this.problem();this.feedback=problem?{...problem,type:'error'}:{type:'success',rule:'Correct',text:'Configuration complete.'};return !problem}
 hint(){const problem=this.problem();this.feedback=problem?{...problem,type:'hint'}:{type:'success',rule:'Ready',text:'Your configuration satisfies the filling rules.'};return problem}
 showAnswer(){if(!this.validCore()){this.check();return false}const expected=this.expected();for(const sub of subshells){this.slots[sub.id].fill(null);const n=expected[sub.id];for(let i=0;i<Math.min(n,sub.boxes);i++)this.slots[sub.id][2*i]='up';for(let i=0;i<Math.max(0,n-sub.boxes);i++)this.slots[sub.id][2*i+1]='down'}this.revealed=true;this.feedback={type:'answer',rule:'Answer shown',text:'One valid orbital arrangement is shown. Reversing all unpaired spins is also valid.'};return true}
 next(random=Math.random){const candidates=elements.map((_,i)=>i+1).filter(z=>z>this.coreZ()&&z!==this.z);this.z=candidates[Math.min(candidates.length-1,Math.floor(random()*candidates.length))];this.reset()}
 notation(){return (this.format==='noble'?'['+this.core+'] ':'')+subshells.filter(s=>this.rows.includes(s.id)&&this.count(s.id)).map(s=>s.id+String(this.count(s.id)).split('').map(n=>superscripts[Number(n)]).join('')).join(' ')}
}
if(typeof document==='undefined')return;
const root=document.getElementById('electron-arrangement-game');if(!root)return;
const game=new ElectronArrangement(),el=id=>document.getElementById('ea-'+id);
function render(){
 el('question').textContent=game.targetNotation();
 el('count').textContent=`Electrons placed: ${game.total()}/${game.validCore()?game.z-game.coreZ():'—'}`;
 el('up').setAttribute('aria-pressed',String(game.spin==='up'));el('down').setAttribute('aria-pressed',String(game.spin==='down'));
 el('rows').innerHTML=game.rows.map(id=>{
  const sub=subshells.find(s=>s.id===id);let boxes='';
  for(let i=0;i<sub.boxes;i++){let slots='';for(let j=0;j<2;j++){const index=2*i+j,spin=game.slots[id][index];slots+=`<button type="button" class="of-slot${spin?' filled':''}" data-row="${id}" data-slot="${index}" aria-label="${id} orbital ${i+1}, position ${j+1}: ${spin?spin+' electron; click to remove':'empty; place selected electron'}">${spin==='up'?'↑':spin==='down'?'↓':''}</button>`}boxes+=`<div class="of-orbital" role="group" aria-label="${id} orbital ${i+1}">${slots}</div>`}
  return `<div class="of-row"><span class="of-subshell-name">${id}</span><div class="of-boxes">${boxes}</div></div>`;
 }).join('');
 const feedback=el('feedback');feedback.hidden=!game.feedback;feedback.className='of-feedback '+(game.feedback?.type||'');el('feedback-rule').textContent=game.feedback?.rule||'';el('feedback-text').textContent=game.feedback?.text||'';
}
function focusSlot(id,index){el('rows').querySelector(`[data-row="${id}"][data-slot="${index}"]`)?.focus({preventScroll:true})}
let gesture=null,suppressClickUntil=0,ghost=null,hover=null;
function clearDrag(){ghost?.remove();ghost=null;hover?.classList.remove('drop-target');hover=null}
function cancelDrag(){if(!gesture)return;const id=gesture.id;gesture=null;clearDrag();if(root.hasPointerCapture?.(id))root.releasePointerCapture(id)}
root.addEventListener('pointerdown',event=>{
 suppressClickUntil=0;
 if(event.button!==0||event.isPrimary===false)return;const target=event.target.closest('[data-spin],[data-slot]');if(!target)return;
 const row=target.dataset.row,index=Number(target.dataset.slot),spin=target.dataset.spin||(row?game.slots[row][index]:null);if(!spin)return;
 gesture={id:event.pointerId,x:event.clientX,y:event.clientY,spin,row,index,dragging:false};root.setPointerCapture(event.pointerId);
});
root.addEventListener('pointermove',event=>{
 if(!gesture||gesture.id!==event.pointerId)return;
 if(!gesture.dragging&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>6){gesture.dragging=true;ghost=document.createElement('div');ghost.className='of-drag-ghost';ghost.setAttribute('aria-hidden','true');ghost.textContent=gesture.spin==='up'?'↑':'↓';document.body.appendChild(ghost)}
 if(!gesture.dragging)return;event.preventDefault();ghost.style.left=event.clientX+'px';ghost.style.top=event.clientY+'px';hover?.classList.remove('drop-target');hover=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-slot]');if(hover&&root.contains(hover))hover.classList.add('drop-target');else hover=null;
});
root.addEventListener('pointerup',event=>{
 if(!gesture||gesture.id!==event.pointerId)return;const drag=gesture;gesture=null;if(root.hasPointerCapture(event.pointerId))root.releasePointerCapture(event.pointerId);clearDrag();
 if(!drag.dragging){suppressClickUntil=Date.now()+450;if(drag.row){game.remove(drag.row,drag.index);render();focusSlot(drag.row,drag.index)}else{game.spin=drag.spin;render();el(drag.spin).focus({preventScroll:true})}return;}event.preventDefault();suppressClickUntil=Date.now()+450;
 const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-slot]');if(!target||!root.contains(target))return;
 const row=target.dataset.row,index=Number(target.dataset.slot);
 if(drag.row)game.move(drag.row,drag.index,row,index);else game.put(row,index,drag.spin);render();focusSlot(row,index)
});
root.addEventListener('pointercancel',cancelDrag);root.addEventListener('lostpointercapture',()=>{if(gesture)cancelDrag()});
root.addEventListener('keydown',event=>{if(event.key==='Escape')cancelDrag()});window.addEventListener('hashchange',cancelDrag);
root.addEventListener('click',event=>{
 if(Date.now()<suppressClickUntil&&event.detail!==0)return;
 const palette=event.target.closest('[data-spin]');if(palette){game.spin=palette.dataset.spin;render();return}
 const slot=event.target.closest('[data-slot]');if(slot){const row=slot.dataset.row,index=Number(slot.dataset.slot);if(game.slots[row][index])game.remove(row,index);else game.put(row,index,game.spin);render();focusSlot(row,index)}
});
for(const key of ['check','hint','show-answer','clear','next','random'])el(key).addEventListener('click',()=>{cancelDrag();if(key==='check')game.check();if(key==='hint')game.hint();if(key==='show-answer')game.showAnswer();if(key==='clear')game.reset();if(key==='next'||key==='random')game.next();render()});
render();
})();
