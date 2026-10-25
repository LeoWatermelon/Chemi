'use strict';
class E1Mechanism {
 constructor(){this.reset()}
 reset(){this.stage=0;this.source=null;this.arrows=[];this.ready=false;this.message='';this.correct=false;this.hydrogen=null;this.transfers=[]}
 get complete(){return this.stage===2}
 say(text,correct=false){this.message=text;this.correct=correct}
 nodes(){return ['c1','c2','c3','h1','h2','h3','h4','h5','h6','h7','o','ho','br','cc2','cc3','oh','hw','ow', ...['h1','h2','h3','h4','h5','h6'].filter(h=>!this.complete||h!==this.hydrogen).map(h=>'b'+h),'c1h7',...(this.stage===0?['cbr']:[]),...(this.complete?['pi','newoh']:[])]}
 begin(n){if(this.complete||this.ready||!this.nodes().includes(n))return false;this.source=n;this.say('');return true}
 cancel(){this.source=null;this.say('')}
 select(n){if(this.source===n)this.cancel();else if(this.source)this.connect(this.source,n);else this.begin(n)}
 actions(){return true&&this.stage===0?['cbr']:true?['o','ch']:['o','ch','cbr']}
 connect(source,target){
  if(this.complete||this.ready||!this.nodes().includes(source)||!this.nodes().includes(target))return false;
  this.source=null;let key=null,h=null;
  if(source==='cbr'&&target==='br'&&this.stage===0)key='cbr';
  if(!true||this.stage===1){
   if(source==='o'&&/^h[1-6]$/.test(target)){key='o';h=target}
   if(/^bh[1-6]$/.test(source)){h=source.slice(1);const carbon=+h.slice(1)<=3?'c2':'c3';if(target==='c1'||target===(carbon==='c2'?'cc2':'cc3'))key='ch';}
  }
  if(!key||this.arrows.includes(key)||(h&&this.hydrogen&&h!==this.hydrogen)){this.say('Try again');return false}
  if(h)this.hydrogen=h;
  this.arrows.push(key);this.transfers.push([source,target]);this.ready=this.actions().every(a=>this.arrows.includes(a));this.say('Correct',true);return true;
 }
 currentAction(){if(this.complete)return null;const actions=this.actions(),key=actions.find(a=>!this.arrows.includes(a)),h=this.hydrogen||'h3';return {index:actions.indexOf(key)+1,total:actions.length,source:key==='ch'?'b'+h:key,target:key==='ch'?'c1':key==='o'?h:'br'}}
 showAnswer(){const a=this.currentAction();if(a)this.connect(a.source,a.target);return a}
 advance(){if(!this.ready||this.complete)return;this.stage++;this.ready=false;this.source=null;this.arrows=[];this.transfers=[];this.message='';this.correct=false}
}
if(typeof document!=='undefined'){
 const game=new E1Mechanism();
 const el=id=>document.getElementById(id);
 let positions={};
 let showPartialCharges=false;
 const text=(x,y,label,cls='')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="middle">${label}</text>`;
 const arrow=d=>`<path d="${d}" class="electron-arrow" marker-end="url(#e1-electron-head)"/>`;
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
  const label=type==='pi'?'C–C π bond':({cc2:'C–C σ bond',cc3:'C–C σ bond',cbr:'C–Br',oh:'O–H',ow:'O–H',newoh:'O–H'})[id]||'C–H';
  return `<g data-node="${id}" role="button" tabindex="0" aria-label="${label}" class="hit"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="bond ${type}"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="bond-hit"/></g>`;
 }
 function drawing(){
  positions={};let s=`<defs><marker id="e1-electron-head" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#7754a6" stroke-width="1.5"/></marker></defs>`;
  const planar=game.stage>0,done=game.complete,r=Math.sqrt(3);
  const points={c1:[380,300],c2:[220,300],c3:planar?[460,300-80*r]:[380,140],h7:planar?[425,300+45*r]:[380,390],o:[720,360],ho:[720,270],br:game.stage===0?[540,300]:[640,80]};
  const methyl=points.c3;
  Object.assign(points,{h1:[130,300],h2:[220,210],h3:[220,390],h4:planar?[methyl[0]-45*r,methyl[1]-45]:[290,140],h5:planar?[methyl[0]+45,methyl[1]-45*r]:[380,50],h6:planar?[methyl[0]+45*r,methyl[1]+45]:[470,140]});
  if(true)points.hw=[810,360];
  let beta='c2';
  if(done){
   beta=+game.hydrogen.slice(1)<=3?'c2':'c3';
   const others=(beta==='c2'?['h1','h2','h3']:['h4','h5','h6']).filter(h=>h!==game.hydrogen);
   const [x,y]=points[beta],theta=Math.atan2(300-y,380-x);
   others.forEach((h,i)=>points[h]=[x+90*Math.cos(theta+(i? -1:1)*2*Math.PI/3),y+90*Math.sin(theta+(i? -1:1)*2*Math.PI/3)]);
   points[game.hydrogen]=true?[720+45*r,405]:[810,360];
   if(true){points.ho=[720,270];points.hw=[720-45*r,405]}
  }
  function link(id,a,b,type='sigma',offset=0){
   const [x,y]=points[a],[u,v]=points[b],len=Math.hypot(u-x,v-y),dx=(u-x)/len,dy=(v-y)/len;
   return bond(id,x+dx*28-dy*offset,y+dy*28+dx*offset,u-dx*28-dy*offset,v-dy*28+dx*offset,type);
  }
  for(const [id,a,b] of [['cc2','c1','c2'],['cc3','c1','c3'],['c1h7','c1','h7'],['oh','o','ho']])s+=link(id,a,b);
  if(true)s+=link('ow','o','hw');
  for(let i=1;i<=6;i++){const h='h'+i;if(!done||h!==game.hydrogen)s+=link('b'+h,i<=3?'c2':'c3',h)}
  if(game.stage===0)s+=link('cbr','c1','br');
  if(done){s+=link('pi','c1',beta,'pi',12);s+=link('newoh','o',game.hydrogen)}
  for(const [id,[x,y]] of Object.entries(points)){
   const label=id.startsWith('c')?'C':id==='br'?'Br':id==='o'?'O':'H';
   const charge=(true&&game.stage===1&&id==='c1')||(true&&done&&id==='o')?1:(id==='br'&&game.stage>0)||(!true&&!done&&id==='o')?-1:0;
   const partial=showPartialCharges&&!done&&!charge?(id==='o'?-1:id==='ho'||id==='hw'?1:game.stage===0&&id==='br'?-1:game.stage===0&&id==='c1'?1:/^h[1-6]$/.test(id)&&(game.stage===1)?1:0):0;
   s+=atom(id,x,y,label,label,charge,partial);
  }
  for(const [a,b] of game.transfers){const [x,y]=positions[a],[u,v]=positions[b];s+=arrow(`M${x} ${y} Q${(x+u)/2+35} ${(y+v)/2-55} ${u} ${v}`)}
  return s;
 }
 function render(){
  if(game.ready)game.advance();
  const complete=game.complete,action=game.currentAction(),steps=true?2:1,step=Math.min(game.stage+1,steps);
  el('e1-progress').textContent=`Step ${step}/${steps}`+(action?` · Action ${action.index}${action.total>1?'/'+action.total:''}`:'');
  const track=el('e1-progress-track');track.setAttribute('aria-valuenow',String(complete?3:(true&&game.stage===1?1:0)+game.arrows.length));track.setAttribute('aria-valuetext',complete?'Complete':el('e1-progress').textContent);
  ['cbr','o','ch'].forEach(id=>{const cell=el('e1-action-'+id),done=complete||(true&&game.stage>0&&id==='cbr')||game.arrows.includes(id);cell.classList.toggle('done',done);cell.classList.toggle('current',!done&&action&&(action.source===id||(id==='ch'&&action.source.startsWith('bh'))))});
  el('e1-show-answer').hidden=complete;
  const charges=el('e1-show-charges');charges.hidden=complete;charges.textContent=showPartialCharges?'Hide partial charges':'Show partial charges';charges.setAttribute('aria-pressed',String(showPartialCharges));
  el('e1-svg').innerHTML=drawing();el('e1-svg').setAttribute('aria-label',complete?'Propene, bromide and '+(true?'hydronium':'water'):true&&game.stage===1?'Propyl carbocation, water and bromide':'2-bromopropane and '+(true?'water':'hydroxide'));
  el('e1-status').textContent=complete?'Reaction complete':game.message&&!game.source&&!game.correct?'Try again':'';el('e1-status').classList.toggle('sr-only',!complete);
 }
 const svg=el('e1-svg');
 let gesture=null,suppressClickUntil=0;

 function select(node){game.select(node);render();const target=svg.querySelector(`[data-node="${node}"]`);if(target)target.focus({preventScroll:true})}
 function clearPreview(){svg.querySelector('#drag-preview')?.remove();svg.querySelectorAll('.drop-target').forEach(n=>n.classList.remove('drop-target'))}
 function point(clientX,clientY){const matrix=svg.getScreenCTM();if(!matrix)return null;return new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse())}
 function preview(clientX,clientY){
  clearPreview();const p=point(clientX,clientY);const source=gesture?.dragging?gesture.node:game.source;
  if(!p||!source||!positions[source]||game.ready)return;
  const node=document.createElementNS('http://www.w3.org/2000/svg','path');node.id='drag-preview';node.setAttribute('class','drag-preview');
  const [x,y]=positions[source];const mx=(x+p.x)/2,my=(y+p.y)/2;
  node.setAttribute('d',`M${x} ${y} Q${mx+45} ${my-35} ${p.x} ${p.y}`);node.setAttribute('marker-end','url(#e1-electron-head)');
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
 el('e1-show-answer').addEventListener('click',()=>{cancelGesture();game.showAnswer();render()});
 el('e1-show-charges').addEventListener('click',()=>{cancelGesture();showPartialCharges=!showPartialCharges;render()});
 el('e1-restart').addEventListener('click',()=>{cancelGesture();showPartialCharges=false;game.reset();render();svg.focus({preventScroll:true})});
 render();
}
