'use strict';
class SN2Mechanism {
 constructor(){this.reset()}
 reset(){this.stage=0;this.source=null;this.arrows=[];this.ready=false;this.message='';this.correct=false}
 say(text,correct=false){this.message=text;this.correct=correct}
 nodes(){return ['c1','c2','h1','h2','h3','h4','h5','o','ho','br','cc','c1h1','c1h2','c2h3','c2h4','c2h5','oh',...(this.stage===0?['cbr']:['co'])]}
 begin(node){if(this.ready||!this.nodes().includes(node))return false;this.source=node;this.say('');return true}
 select(node){if(this.ready)return;if(this.source===node){this.cancel();return}if(this.source)this.connect(this.source,node);else this.begin(node)}
 connect(source,target){
  if(this.ready||!this.nodes().includes(source)||!this.nodes().includes(target))return false;
  this.source=null;
  if(this.stage===0&&((source==='o'&&target==='c1')||(source==='cbr'&&target==='br'))&&!this.arrows.includes(source)){this.arrows.push(source);this.ready=this.arrows.length===2;this.say('Correct',true);return true}
  this.say(this.stage===1?'':'Try again');return false;
 }
 currentAction(){
  if(this.stage===0){const first=!this.arrows.includes('o');return {step:1,index:first?1:2,total:2,source:first?'o':'cbr',target:first?'c1':'br'}}
  return null;
 }
 showAnswer(){const action=this.currentAction();if(action)this.connect(action.source,action.target);return action}
 cancel(){this.source=null;this.say('')}
 advance(){if(!this.ready||this.stage===1)return;this.stage++;this.ready=false;this.source=null;this.arrows=[];this.message='';this.correct=false}
}
if(typeof document!=='undefined'){
 const game=new SN2Mechanism();
 const el=id=>document.getElementById(id);
 let positions={};
 let showPartialCharges=false;
 const text=(x,y,label,cls='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="middle">${label}</text>`;
 const arrow=d=>`<path d="${d}" class="electron-arrow" marker-end="url(#sn2-electron-head)"/>`;
 function atom(id,x,y,label,accessible=label,charge=0,partial=0){
  positions[id]=[x,y];
  const radius=id==='br'?26:22;
  const chargeLabel=charge===1?'positive charge':charge===-1?'negative charge':partial===1?'partial positive charge':partial===-1?'partial negative charge':'';
  const value=charge||partial;
  const chargeMark=value?text(x+radius+(partial?15:9),y-radius+7,charge?(charge>0?'+':'−'):(partial>0?'δ+':'δ−'),`formal-charge ${value>0?'positive':'negative'}${partial?' partial-charge':''}`):'';
  return `<g data-node="${id}" role="button" tabindex="0" aria-label="${accessible}${chargeLabel?', '+chargeLabel:''}" class="hit atom-node"><circle class="atom-hit" cx="${x}" cy="${y}" r="${radius}"/>${text(x,y+9,label)}${chargeMark}</g>`;
 }
 function bond(id,x1,y1,x2,y2,type='sigma'){
  positions[id]=[(x1+x2)/2,(y1+y2)/2];
  const label=({cc:'C–C',cbr:'C–Br',co:'C–O',oh:'O–H'})[id]||'C–H';
  return `<g data-node="${id}" role="button" tabindex="0" aria-label="${label}" class="hit"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="bond ${type}"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="bond-hit"/></g>`;
 }
 function drawing(){
  positions={};
  let s=`<defs><marker id="sn2-electron-head" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#7754a6" stroke-width="1.5"/></marker></defs>`;
  const stage=game.stage;
  // One concerted substitution; both electron transfers are required.
  // C–C, C–Br and C–O are 160; C–H and O–H are 90.
  const points={c1:[350,290],c2:[350,130],h1:[260,290],h2:[350,380],
   h3:[260,130],h4:[440,130],h5:[350,40],
   o:stage===0?[110,290]:[510,290],ho:stage===0?[110,200]:[510,200],
   br:stage===0?[510,290]:[110,290]};
  function link(id,from,to){
   const [x1,y1]=points[from],[x2,y2]=points[to];const length=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/length,uy=(y2-y1)/length;
   const trimA=(from==='br'?26:22)+4,trimB=(to==='br'?26:22)+4;
   return bond(id,x1+ux*trimA,y1+uy*trimA,x2-ux*trimB,y2-uy*trimB);
  }
  for(const [id,a,b] of [['cc','c1','c2'],['c1h1','c1','h1'],['c1h2','c1','h2'],['c2h3','c2','h3'],['c2h4','c2','h4'],['c2h5','c2','h5'],['oh','o','ho']])s+=link(id,a,b);
  s+=stage===0?link('cbr','c1','br'):link('co','c1','o');
  for(const [id,[x,y]] of Object.entries(points)){
   const label=id.startsWith('c')?'C':id==='br'?'Br':id==='o'?'O':'H';
   const charge=(stage===0&&id==='o')||(stage===1&&id==='br')?-1:0;
   const partial=showPartialCharges&&stage<1&&!charge?(id==='ho'?1:id==='c1'?1:stage===0&&id==='br'?-1:stage===1&&id==='o'?-1:0):0;
   s+=atom(id,x,y,label,id==='br'?'Bromine':id==='o'?'Oxygen':id.startsWith('c')?`Carbon ${id.slice(1)}`:'Hydrogen',charge,partial);
  }
  if(stage===0&&game.arrows.includes('o'))s+=arrow('M110 290 Q215 160 327 277');
  if(stage===0&&game.arrows.includes('cbr'))s+=arrow('M428 290 Q464 230 491 264');
  return s;
 }
 function render(){
  if(game.ready&&game.stage===0)game.advance();
  const complete=game.stage===1,action=game.currentAction();
  el('sn2-progress').textContent='Step 1/1'+(action?` · Action ${action.index}/${action.total}`:'');
  const track=el('sn2-progress-track');track.setAttribute('aria-valuenow',String(complete?2:game.arrows.length));track.setAttribute('aria-valuetext',complete?'Complete':`Step 1 of 1, action ${action.index} of 2`);
  ['o','cbr'].forEach((id,index)=>{
   const cell=el('sn2-action-'+id),done=complete||game.arrows.includes(id),current=!complete&&action.index===index+1;
   cell.classList.toggle('done',done);cell.classList.toggle('current',current);
   cell.setAttribute('aria-label',`Step 1, action ${index+1} of 2: ${done?'complete':current?'current':'not completed'}`);
  });
  el('sn2-show-answer').hidden=complete;
  const charges=el('sn2-show-charges');charges.hidden=complete;charges.textContent=showPartialCharges?'Hide partial charges':'Show partial charges';charges.setAttribute('aria-pressed',String(showPartialCharges));
  el('sn2-svg').innerHTML=drawing();el('sn2-svg').setAttribute('aria-label',complete?'Ethanol and bromide ion':'Hydroxide ion and bromoethane');
  el('sn2-status').textContent=complete?'Reaction complete':game.message&&!game.source&&!game.correct?'Try again':'';
  el('sn2-status').classList.toggle('sr-only',!complete);
 }
 const svg=el('sn2-svg');
 let gesture=null,suppressClickUntil=0;

 function select(node){game.select(node);render();const target=svg.querySelector(`[data-node="${node}"]`);if(target)target.focus({preventScroll:true})}
 function clearPreview(){svg.querySelector('#drag-preview')?.remove();svg.querySelectorAll('.drop-target').forEach(n=>n.classList.remove('drop-target'))}
 function point(clientX,clientY){const matrix=svg.getScreenCTM();if(!matrix)return null;return new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse())}
 function preview(clientX,clientY){
  clearPreview();const p=point(clientX,clientY);const source=gesture?.dragging?gesture.node:game.source;
  if(!p||!source||!positions[source]||game.ready)return;
  const node=document.createElementNS('http://www.w3.org/2000/svg','path');node.id='drag-preview';node.setAttribute('class','drag-preview');
  const [x,y]=positions[source];const mx=(x+p.x)/2,my=(y+p.y)/2;
  node.setAttribute('d',`M${x} ${y} Q${mx+45} ${my-35} ${p.x} ${p.y}`);node.setAttribute('marker-end','url(#sn2-electron-head)');
  svg.appendChild(node);
  const target=document.elementFromPoint(clientX,clientY)?.closest('[data-node]');
  if(target&&svg.contains(target)&&target.dataset.node!==source)target.classList.add('drop-target');
 }
 svg.addEventListener('pointerdown',event=>{
  if(event.button!==0||event.isPrimary===false||game.ready )return;
  const node=event.target.closest('[data-node]');if(!node)return;
  gesture={id:event.pointerId,node:node.dataset.node,x:event.clientX,y:event.clientY,dragging:false,valid:false};
  svg.setPointerCapture(event.pointerId);
 });
 svg.addEventListener('pointermove',event=>{
  if(!gesture){if(game.source&&!game.ready)preview(event.clientX,event.clientY);return}
  if(gesture.id!==event.pointerId)return;
  if(!gesture.dragging&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>6){gesture.dragging=true;svg.setAttribute('data-dragging','true');gesture.valid=game.begin(gesture.node);render()}
  if(gesture.dragging){event.preventDefault();if(gesture.valid)preview(event.clientX,event.clientY)}
 });
 svg.addEventListener('pointerup',event=>{
  if(!gesture||gesture.id!==event.pointerId)return;
  const finished=gesture;gesture=null;svg.setAttribute('data-dragging','false');
  if(svg.hasPointerCapture(event.pointerId))svg.releasePointerCapture(event.pointerId);
  suppressClickUntil=Date.now()+450;
  if(!finished.dragging){select(finished.node);return}
  event.preventDefault();clearPreview();
  if(finished.valid){const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-node]');
   if(target&&svg.contains(target))game.connect(finished.node,target.dataset.node);
   else game.say('Try again');
  }
  render();
 });
 function cancelGesture(){if(!gesture)return;const id=gesture.id;gesture=null;svg.setAttribute('data-dragging','false');clearPreview();if(svg.hasPointerCapture(id))svg.releasePointerCapture(id);game.cancel();render();suppressClickUntil=Date.now()+450}
 svg.addEventListener('pointerleave',()=>{if(!gesture)clearPreview()});
 svg.addEventListener('pointercancel',cancelGesture);
 svg.addEventListener('lostpointercapture',()=>{if(gesture)cancelGesture()});
 // Click remains available for keyboards, assistive technology and non-pointer browsers.
 svg.addEventListener('click',event=>{if(Date.now()<suppressClickUntil)return;const node=event.target.closest('[data-node]');if(node)select(node.dataset.node)});
 svg.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();if(gesture)cancelGesture();else{game.cancel();render()}return}
  if(event.key==='Enter'||event.key===' '){const node=event.target.closest('[data-node]');if(node){event.preventDefault();select(node.dataset.node)}}
 });
 window.addEventListener('hashchange',cancelGesture);
 el('sn2-show-answer').addEventListener('click',()=>{cancelGesture();game.showAnswer();render()});
 el('sn2-show-charges').addEventListener('click',()=>{cancelGesture();showPartialCharges=!showPartialCharges;render()});
 el('sn2-restart').addEventListener('click',()=>{cancelGesture();showPartialCharges=false;game.reset();render();svg.focus({preventScroll:true})});
 render();
}
