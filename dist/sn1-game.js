'use strict';
class SN1Mechanism {
 constructor(){this.reset()}
 reset(){this.stage=0;this.source=null;this.arrows=[];this.ready=false;this.message='';this.correct=false}
 say(text,correct=false){this.message=text;this.correct=correct}
 nodes(){return ['c1','c2','c3','h1','h2','h3','h4','h5','h6','h7','o','ho','br','cc2','cc3','c2h1','c2h2','c2h3','c3h4','c3h5','c3h6','c1h7','oh',...(this.stage===0?['cbr']:this.stage===2?['co']:[])]}
 begin(node){if(this.ready||!this.nodes().includes(node))return false;this.source=node;this.say('');return true}
 select(node){if(this.ready)return;if(this.source===node){this.cancel();return}if(this.source)this.connect(this.source,node);else this.begin(node)}
 connect(source,target){
  if(this.ready||!this.nodes().includes(source)||!this.nodes().includes(target))return false;
  this.source=null;
  if((this.stage===0&&source==='cbr'&&target==='br')||(this.stage===1&&source==='o'&&target==='c1')){this.arrows=[source];this.ready=true;this.say('Correct',true);return true}
  this.say(this.stage===2?'':'Try again');return false;
 }
 currentAction(){
  if(this.stage===0)return {step:1,index:1,total:1,source:'cbr',target:'br'};
  if(this.stage===1)return {step:2,index:1,total:1,source:'o',target:'c1'};
  return null;
 }
 showAnswer(){const action=this.currentAction();if(action)this.connect(action.source,action.target);return action}
 cancel(){this.source=null;this.say('')}
 advance(){if(!this.ready||this.stage===2)return;this.stage++;this.ready=false;this.source=null;this.arrows=[];this.message='';this.correct=false}
}
if(typeof document!=='undefined'){
 const game=new SN1Mechanism();
 const el=id=>document.getElementById(id);
 let positions={};
 let showPartialCharges=false;
 const text=(x,y,label,cls='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="middle">${label}</text>`;
 const arrow=d=>`<path d="${d}" class="electron-arrow" marker-end="url(#sn1-electron-head)"/>`;
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
  const label=({cc2:'C–C',cc3:'C–C',cbr:'C–Br',co:'C–O',oh:'O–H'})[id]||'C–H';
  return `<g data-node="${id}" role="button" tabindex="0" aria-label="${label}" class="hit"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="bond ${type}"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="bond-hit"/></g>`;
 }
 function drawing(){
  positions={};
  let s=`<defs><marker id="sn1-electron-head" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#7754a6" stroke-width="1.5"/></marker></defs>`;
  const stage=game.stage;
  // Diagram rule: four neighbours at 90°, three at 120°.
  // The central carbon changes geometry when the carbocation forms.
  // All heavy-atom bonds are 160; bonds to hydrogen are 90.
  const root3=Math.sqrt(3),planar=stage===1;
  const methyl=planar?[460,280-80*root3]:[380,120];
  const points={c1:[380,280],c2:[220,280],c3:methyl,
   h1:[130,280],h2:[220,190],h3:[220,370],
   h4:planar?[methyl[0]-45*root3,methyl[1]-45]:[290,120],
   h5:planar?[methyl[0]+45,methyl[1]-45*root3]:[380,30],
   h6:planar?[methyl[0]+45*root3,methyl[1]+45]:[470,120],
   h7:planar?[425,280+45*root3]:[380,370],
   o:stage===2?[540,280]:[700,280],ho:stage===2?[540,190]:[700,190],
   br:stage===0?[540,280]:[80,65]};
  function link(id,from,to){
   const [x1,y1]=points[from],[x2,y2]=points[to];const length=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/length,uy=(y2-y1)/length;
   const trimA=(from==='br'?26:22)+4,trimB=(to==='br'?26:22)+4;
   return bond(id,x1+ux*trimA,y1+uy*trimA,x2-ux*trimB,y2-uy*trimB);
  }
  for(const [id,a,b] of [['cc2','c1','c2'],['cc3','c1','c3'],['c2h1','c2','h1'],['c2h2','c2','h2'],['c2h3','c2','h3'],['c3h4','c3','h4'],['c3h5','c3','h5'],['c3h6','c3','h6'],['c1h7','c1','h7'],['oh','o','ho']])s+=link(id,a,b);
  if(stage===0)s+=link('cbr','c1','br');
  if(stage===2)s+=link('co','c1','o');
  for(const [id,[x,y]] of Object.entries(points)){
   const label=id.startsWith('c')?'C':id==='br'?'Br':id==='o'?'O':'H';
   const charge=stage===1&&id==='c1'?1:((stage<2&&id==='o')||(stage>0&&id==='br'))?-1:0;
   const partial=showPartialCharges&&stage<2&&!charge?(id==='ho'?1:stage===0&&id==='c1'?1:stage===0&&id==='br'?-1:stage===2&&id==='o'?-1:stage===2&&id==='c1'?1:0):0;
   s+=atom(id,x,y,label,id==='br'?'Bromine':id==='o'?'Oxygen':id.startsWith('c')?`Carbon ${id.slice(1)}`:'Hydrogen',charge,partial);
  }
  return s;
 }
 function render(){
  if(game.ready&&game.stage<2)game.advance();
  const complete=game.stage===2,step=Math.min(game.stage+1,2);
  el('sn1-progress').textContent=`Step ${step}/2`+(complete?'':' · Action 1');
  const track=el('sn1-progress-track');track.setAttribute('aria-valuenow',String(game.stage));track.setAttribute('aria-valuetext',complete?'Complete':`Step ${step} of 2`);
  ['cbr','o'].forEach((id,index)=>{
   const cell=el('sn1-action-'+id),done=game.stage>index,current=game.stage===index;
   cell.classList.toggle('done',done);cell.classList.toggle('current',current);
   cell.setAttribute('aria-label',`Step ${index+1}: ${done?'complete':current?'current':'not completed'}`);
  });
  el('sn1-show-answer').hidden=complete;
  const charges=el('sn1-show-charges');charges.hidden=complete;charges.textContent=showPartialCharges?'Hide partial charges':'Show partial charges';charges.setAttribute('aria-pressed',String(showPartialCharges));
  el('sn1-svg').innerHTML=drawing();el('sn1-svg').setAttribute('aria-label',complete?'Propan-2-ol and bromide ion':game.stage===1?'Secondary propyl carbocation, hydroxide and bromide ions':'2-bromopropane and hydroxide ion');
  el('sn1-status').textContent=complete?'Reaction complete':game.message&&!game.source&&!game.correct?'Try again':'';
  el('sn1-status').classList.toggle('sr-only',!complete);
 }
 const svg=el('sn1-svg');
 let gesture=null,suppressClickUntil=0;

 function select(node){game.select(node);render();const target=svg.querySelector(`[data-node="${node}"]`);if(target)target.focus({preventScroll:true})}
 function clearPreview(){svg.querySelector('#drag-preview')?.remove();svg.querySelectorAll('.drop-target').forEach(n=>n.classList.remove('drop-target'))}
 function point(clientX,clientY){const matrix=svg.getScreenCTM();if(!matrix)return null;return new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse())}
 function preview(clientX,clientY){
  clearPreview();const p=point(clientX,clientY);const source=gesture?.dragging?gesture.node:game.source;
  if(!p||!source||!positions[source]||game.ready)return;
  const node=document.createElementNS('http://www.w3.org/2000/svg','path');node.id='drag-preview';node.setAttribute('class','drag-preview');
  const [x,y]=positions[source];const mx=(x+p.x)/2,my=(y+p.y)/2;
  node.setAttribute('d',`M${x} ${y} Q${mx+45} ${my-35} ${p.x} ${p.y}`);node.setAttribute('marker-end','url(#sn1-electron-head)');
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
 el('sn1-show-answer').addEventListener('click',()=>{cancelGesture();game.showAnswer();render()});
 el('sn1-show-charges').addEventListener('click',()=>{cancelGesture();showPartialCharges=!showPartialCharges;render()});
 el('sn1-restart').addEventListener('click',()=>{cancelGesture();showPartialCharges=false;game.reset();render();svg.focus({preventScroll:true})});
 render();
}
