'use strict';
class HBrMechanism {
 constructor(){this.reset()}
 reset(){this.stage=0;this.source=null;this.arrows=[];this.ready=false;this.message='';this.correct=false}
 say(text,correct=false){this.message=text;this.correct=correct}
 nodes(){return ['c1','c2','c3','h1','h2','h3','h4','h5','h6','h','br','sigma12','sigma23','c1h1','c1h2','c2h3','c3h4','c3h5','c3h6',...(this.stage===0?['pi','hbr']:['c1h']),...(this.stage===2?['c2br']:[])]}
 begin(node){if(this.ready||!this.nodes().includes(node))return false;this.source=node;this.say('');return true}
 select(node){if(this.ready)return;if(this.source===node){this.cancel();return}if(this.source)this.connect(this.source,node);else this.begin(node)}
 connect(source,target){
  if(this.ready||!this.nodes().includes(source)||!this.nodes().includes(target))return false;
  this.source=null;
  if(this.stage===0&&((source==='pi'&&target==='h')||(source==='hbr'&&target==='br'))&&!this.arrows.includes(source)){this.arrows.push(source);this.ready=this.arrows.length===2;this.say('Correct',true);return true}
  if(this.stage===1&&source==='br'&&target==='c2'){this.arrows=['attack'];this.ready=true;this.say('Correct',true);return true}
  this.say(this.stage===2?'':'Try again');return false;
 }
 currentAction(){
  if(this.stage===0){const first=!this.arrows.includes('pi');return {step:1,index:first?1:2,total:2,source:first?'pi':'hbr',target:first?'h':'br',answer:first?'C=C π bond → H':'H–Br σ bond → Br'}}
  if(this.stage===1)return {step:2,index:1,total:1,source:'br',target:'c2',answer:'Br⁻ → C⁺'};
  return null;
 }
 showAnswer(){const action=this.currentAction();if(action)this.connect(action.source,action.target);return action}
 cancel(){this.source=null;this.say('')}
 advance(){if(!this.ready||this.stage===2)return;this.stage++;this.ready=false;this.source=null;this.arrows=[];this.message='';this.correct=false}
}
if(typeof document!=='undefined'){
 const game=new HBrMechanism();
 const el=id=>document.getElementById(id);
 let positions={};
 let showPartialCharges=false;
 const text=(x,y,label,cls='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="middle">${label}</text>`;
 const arrow=d=>`<path d="${d}" class="electron-arrow" marker-end="url(#electron-head)"/>`;
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
  const label=id==='hbr'?'H–Br σ bond':id==='pi'?'C1–C2 π bond':`${id} σ bond`;
  return `<g data-node="${id}" role="button" tabindex="0" aria-label="${label}" class="hit"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="bond ${type}"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="bond-hit"/></g>`;
 }
 function drawing(){
  positions={};
  let s=`<defs><marker id="electron-head" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#7754a6" stroke-width="1.5"/></marker></defs>`;
  const stage=game.stage;
  // Diagram rule: 4 bonded neighbours use 90°, 3 use 120°.
  // A double bond occupies one neighbour direction.
  // Center-to-center distances: C–H 90; C–C, H–Br and C–Br 160.
  const ch=90,cc=160,root3=Math.sqrt(3),three=stage<2;
  const methyl=three?[320+cc/2,250+cc*root3/2]:[480,250];
  const points={c1:[160,250],c2:[320,250],c3:methyl,
   h1:stage===0?[160-ch/2,250-ch*root3/2]:[160,250-ch],
   h2:stage===0?[160-ch/2,250+ch*root3/2]:[160,250+ch],
   h3:three?[320+ch/2,250-ch*root3/2]:[320,250+ch],
   h4:three?[methyl[0]+ch*root3/2,methyl[1]-ch/2]:[480,250-ch],
   h5:three?[methyl[0]+ch/2,methyl[1]+ch*root3/2]:[480+ch,250],
   h6:three?[methyl[0]-ch*root3/2,methyl[1]+ch/2]:[480,250+ch],
   h:stage===0?[220,65]:[160-ch,250],br:stage===0?[380,65]:stage===1?[320,65]:[320,250-cc]};
  function link(id,from,to,type='sigma',offset=0){
   const [x1,y1]=points[from],[x2,y2]=points[to];const length=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/length,uy=(y2-y1)/length;
   const trimA=(from==='br'?26:22)+4,trimB=(to==='br'?26:22)+4;
   return bond(id,x1+ux*trimA-uy*offset,y1+uy*trimA+ux*offset,x2-ux*trimB-uy*offset,y2-uy*trimB+ux*offset,type);
  }
  s+=link('sigma12','c1','c2','sigma',stage===0?10:0)+link('sigma23','c2','c3');
  if(stage===0)s+=link('pi','c1','c2','pi',-10);
  for(const [id,c,h] of [['c1h1','c1','h1'],['c1h2','c1','h2'],['c2h3','c2','h3'],['c3h4','c3','h4'],['c3h5','c3','h5'],['c3h6','c3','h6']])s+=link(id,c,h);
  if(stage===0)s+=link('hbr','h','br');else s+=link('c1h','c1','h');
  if(stage===2)s+=link('c2br','c2','br');
  for(const [id,[x,y]] of Object.entries(points)){
   const label=id.startsWith('c')?'C':id==='br'?'Br':'H';
   const charge=stage===1?(id==='c2'?1:id==='br'?-1:0):0;
   const partial=showPartialCharges&&stage===0?(id==='h'?1:id==='br'?-1:0):0;
   s+=atom(id,x,y,label,id==='br'?'Bromine':id.startsWith('c')?`Carbon ${id.slice(1)}`:'Hydrogen',charge,partial);
  }
  if(stage===0&&game.arrows.includes('pi'))s+=arrow('M240 240 Q130 150 213 91');
  if(stage===0&&game.arrows.includes('hbr'))s+=arrow('M298 65 Q330 12 365 42');
  if(stage===1&&game.arrows.includes('attack'))s+=arrow('M320 65 Q410 150 325 223');
  return s;
 }
 function render(){
  if(game.ready&&game.stage<2)game.advance();
  const step=Math.min(game.stage+1,2);
  const action=game.currentAction();
  el('hbr-progress').textContent=`Step ${step}/2`+(action?` · Action ${action.index}${action.total>1?'/'+action.total:''}`:'');
  const track=el('hbr-progress-track');track.setAttribute('aria-valuenow',String(step));track.setAttribute('aria-valuetext',game.stage===2?'Complete':`Step ${step} of 2`);
  [['pi','hbr'],['attack']].forEach((ids,stepIndex)=>ids.forEach((id,index)=>{
   const cell=el('action-'+id),done=game.stage>stepIndex||(game.stage===stepIndex&&game.arrows.includes(id));
   const current=game.stage===stepIndex&&action?.index===index+1;
   cell.classList.toggle('done',done);cell.classList.toggle('current',current);
   cell.setAttribute('aria-label',`Step ${stepIndex+1}${ids.length>1?`, action ${index+1} of ${ids.length}`:''}: ${done?'complete':current?'current':'not completed'}`);
  }));
  el('hbr-show-answer').hidden=game.stage===2;
  const charges=el('hbr-show-charges');charges.hidden=game.stage===2;charges.textContent=showPartialCharges?'Hide partial charges':'Show partial charges';charges.setAttribute('aria-pressed',String(showPartialCharges));
  el('hbr-svg').innerHTML=drawing();el('hbr-svg').setAttribute('aria-label',game.stage===0?'Propene and HBr':game.stage===1?'Secondary propyl carbocation and bromide ion':'2-bromopropane product');
  el('hbr-status').textContent=game.stage===2?'Reaction complete':game.ready?'Correct':game.message&&!game.source&&!game.correct?'Try again':'';
  el('hbr-status').classList.toggle('sr-only',game.stage!==2);
 }
 const svg=el('hbr-svg');
 let gesture=null,suppressClickUntil=0;

 function select(node){game.select(node);render();const target=svg.querySelector(`[data-node="${node}"]`);if(target)target.focus({preventScroll:true})}
 function clearPreview(){svg.querySelector('#drag-preview')?.remove();svg.querySelectorAll('.drop-target').forEach(n=>n.classList.remove('drop-target'))}
 function point(clientX,clientY){const matrix=svg.getScreenCTM();if(!matrix)return null;return new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse())}
 function preview(clientX,clientY){
  clearPreview();const p=point(clientX,clientY);const source=gesture?.dragging?gesture.node:game.source;
  if(!p||!source||!positions[source]||game.ready)return;
  const node=document.createElementNS('http://www.w3.org/2000/svg','path');node.id='drag-preview';node.setAttribute('class','drag-preview');
  const [x,y]=positions[source];const mx=(x+p.x)/2,my=(y+p.y)/2;
  node.setAttribute('d',`M${x} ${y} Q${mx+45} ${my-35} ${p.x} ${p.y}`);node.setAttribute('marker-end','url(#electron-head)');
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
 el('hbr-show-answer').addEventListener('click',()=>{cancelGesture();game.showAnswer();render()});
 el('hbr-show-charges').addEventListener('click',()=>{cancelGesture();showPartialCharges=!showPartialCharges;render()});
 el('hbr-restart').addEventListener('click',()=>{cancelGesture();showPartialCharges=false;game.reset();render();svg.focus({preventScroll:true})});
 render();
}
