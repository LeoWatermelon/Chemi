(()=>{
'use strict';
// Valence-bond teaching model: OpenStax Chemistry 2e §8.2 / Organic Chemistry §§1.6–1.9.
const axes=[[1,0,0],[0,1,0],[0,0,1]],labels=['2s','2p<sub>x</sub>','2p<sub>y</sub>','2p<sub>z</sub>'];
const orbitalColors=[[196,151,52],[59,130,184],[143,96,181],[203,101,104]],colorCSS=i=>'rgb('+orbitalColors[i].join(',')+')';
const add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,k)=>a.map(v=>v*k),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>mul(a,1/Math.hypot(...a));
const hybridLabel=n=>['','sp','sp²','sp³'][n];
function directions(n,selected=[1,2,3]){const p=selected.map(i=>axes[i-1]);if(n===1)return [p[0],mul(p[0],-1)];if(n===2)return [p[0],add(mul(p[0],-.5),mul(p[1],Math.sqrt(3)/2)),add(mul(p[0],-.5),mul(p[1],-Math.sqrt(3)/2))];return [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(norm)}
class Hybridise{
 constructor(){this.target=2;this.selected=new Set();this.solved=false}
 choose(i){if(!Number.isInteger(i)||i<0||i>3)return;this.solved=false;this.selected.has(i)?this.selected.delete(i):this.selected.add(i)}
 reset(){this.selected.clear();this.solved=false}
 setTarget(n){if([1,2,3].includes(n)){this.target=n;this.reset()}}
 random(){const a=[1,2,3].filter(n=>n!==this.target);this.setTarget(a[Math.floor(Math.random()*a.length)])}
 get p(){return [...this.selected].filter(i=>i>0).sort()}
 get remaining(){return [1,2,3].filter(i=>!this.selected.has(i))}
 check(){if(!this.selected.has(0))return {ok:false,text:'Include the s orbital.'};if(this.p.length!==this.target)return {ok:false,text:'For '+hybridLabel(this.target)+', select one s orbital and '+this.target+' p '+(this.target===1?'orbital.':'orbitals.')};this.solved=true;return {ok:true,text:'✓ '+(this.target+1)+' '+hybridLabel(this.target)+' hybrid orbitals formed.'}}
}
if(typeof module!=='undefined'&&module.exports)module.exports={Hybridise,directions,dot};if(typeof document==='undefined')return;
const root=document.getElementById('hybridise-yourself-game');if(!root)return;const game=new Hybridise(),el=id=>document.getElementById('hy-'+id),canvas=el('canvas'),ctx=canvas.getContext('2d');let yaw=-.45,pitch=.3,drag=null,hits=[];
function rotate(v){const c=Math.cos(yaw),s=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),x=v[0]*c+v[2]*s,z=-v[0]*s+v[2]*c;return [x,v[1]*cp-z*sp,v[1]*sp+z*cp]}
function project(v){const r=rotate(v),k=112*9/(9-r[2]);return {x:420+r[0]*k,y:250-r[1]*k,z:r[2],k}}
function draw(){if(!ctx)return;ctx.clearRect(0,0,840,500);const selectedP=game.p.length===game.target?game.p:[1,2,3].slice(0,game.target),dirs=directions(game.target,selectedP);hits=[];
 const faces=[],halos=[];
 function lobe(center,axis,length,width,color,alpha,teardrop=false,glow=false){if(glow)halos.push({center,axis,length,width,color});const u=norm(cross(axis,Math.abs(axis[0])<.8?[1,0,0]:[0,1,0])),v=cross(axis,u);function point(t,f){const radial=width*(teardrop?.25+.9*(1+Math.cos(t))/2:1);return project(add(center,add(mul(axis,Math.cos(t)*length),add(mul(u,Math.sin(t)*Math.cos(f)*radial),mul(v,Math.sin(t)*Math.sin(f)*radial)))))}
 for(let i=0;i<8;i++)for(let j=0;j<14;j++){const a=i*Math.PI/8,b=(i+1)*Math.PI/8,c=j*2*Math.PI/14,d=(j+1)*2*Math.PI/14,ps=[point(a,c),point(a,d),point(b,d),point(b,c)];faces.push({ps,z:ps.reduce((s,p)=>s+p.z,0)/4,color,alpha})}}
 function pOrbital(i){const a=axes[i-1],chosen=game.selected.has(i),color=orbitalColors[i];for(const sign of [-1,1]){const outward=mul(a,sign),center=mul(outward,.9);lobe(center,outward,.9,.53,color,chosen?.84:.62,true,chosen&&!game.solved);const p=project(mul(outward,1.05));hits.push({i,x:p.x,y:p.y,z:p.z,r:42})}}
 if(game.solved){const colors=[...game.selected].sort();dirs.forEach((d,i)=>{const color=orbitalColors[colors[i]];lobe(mul(d,.85),d,.85,.45,color,.76,true);lobe(mul(d,-.25),mul(d,-1),.25,.18,color,.76,true)});game.remaining.forEach(pOrbital)}
 else{[1,2,3].forEach(pOrbital);lobe([0,0,0],[0,1,0],.52,.52,orbitalColors[0],game.selected.has(0)?.84:.58,false,game.selected.has(0));const p=project([0,0,0]);hits.push({i:0,x:p.x,y:p.y,z:2,r:25})}
 halos.forEach(h=>{const p=project(h.center),tip=project(add(h.center,mul(h.axis,h.length))),base=project(add(h.center,mul(h.axis,-h.length))),rx=Math.max(Math.hypot(tip.x-base.x,tip.y-base.y)/2,h.width*p.k),ry=h.width*p.k;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(tip.y-base.y,tip.x-base.x));ctx.beginPath();ctx.ellipse(0,0,rx+5,ry+5,0,0,Math.PI*2);ctx.shadowColor='rgba('+h.color.join(',')+',.95)';ctx.shadowBlur=24;ctx.fillStyle='rgba('+h.color.join(',')+',.16)';ctx.fill();ctx.strokeStyle='rgba('+h.color.join(',')+',.65)';ctx.lineWidth=3;ctx.stroke();ctx.restore()});
 faces.sort((a,b)=>a.z-b.z).forEach(f=>{ctx.beginPath();f.ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=`rgba(${f.color.join(',')},${f.alpha})`;ctx.fill()});
 const carbon=project([0,0,0]);ctx.beginPath();ctx.arc(carbon.x,carbon.y,13,0,Math.PI*2);ctx.fillStyle='#285842';ctx.fill();ctx.font='12px Arial';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('C',carbon.x,carbon.y+4);

 if(!game.solved){[1,2,3].forEach(i=>{const p=project(mul(axes[i-1],2.02));ctx.fillStyle=colorCSS(i);ctx.font='15px Arial';ctx.textAlign='left';ctx.fillText('2p',p.x-12,p.y);ctx.font='10px Arial';ctx.fillText(['','x','y','z'][i],p.x+5,p.y+5)});const p=project([0,0,0]);ctx.fillStyle=colorCSS(0);ctx.textAlign='center';ctx.font='14px Arial';ctx.fillText('2s',p.x-35,p.y+35)}
 drawAngle(game.solved?dirs:axes,game.solved?['','180°','120°','109.5°'][game.target]:'90°');
}
function drawAngle(vectors,label){
 // One representative angle, projected from the actual 3D directions.
 const origin=project([0,0,0]);let best=null;
 for(let i=0;i<vectors.length;i++)for(let j=i+1;j<vectors.length;j++){
  const a=vectors[i],b=vectors[j],cos=Math.max(-1,Math.min(1,dot(a,b))),theta=Math.acos(cos);let tangent;
  if(cos<-.999){const candidates=axes.filter(v=>Math.abs(dot(a,v))<.9).map(v=>norm(add(v,mul(a,-dot(a,v)))));tangent=candidates.sort((u,v)=>{const pa=project(a),pu=project(u),pv=project(v);return Math.abs((pa.x-origin.x)*(pv.y-origin.y)-(pa.y-origin.y)*(pv.x-origin.x))-Math.abs((pa.x-origin.x)*(pu.y-origin.y)-(pa.y-origin.y)*(pu.x-origin.x))})[0]}
  else tangent=norm(add(b,mul(a,-cos)));
  const pa=project(a),pt=project(tangent),score=Math.abs((pa.x-origin.x)*(pt.y-origin.y)-(pa.y-origin.y)*(pt.x-origin.x));if(!best||score>best.score)best={a,tangent,theta,score};
 }
 if(!best)return;const {a,tangent,theta}=best,at=(angle,r)=>project(mul(add(mul(a,Math.cos(angle)),mul(tangent,Math.sin(angle))),r));
 ctx.save();ctx.strokeStyle='rgba(48,72,58,.72)';ctx.lineWidth=1.5;ctx.setLineDash([3,4]);for(const angle of [0,theta]){const p=at(angle,.88);ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.lineTo(p.x,p.y);ctx.stroke()}ctx.setLineDash([]);ctx.beginPath();for(let i=0;i<=32;i++){const p=at(theta*i/32,.88);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}ctx.stroke();
 const p=at(theta/2,1.17);ctx.font='14px Arial';ctx.textAlign='center';const w=ctx.measureText(label).width;ctx.fillStyle='rgba(250,252,247,.94)';ctx.fillRect(p.x-w/2-8,p.y-12,w+16,23);ctx.fillStyle='#365b3e';ctx.fillText(label,p.x,p.y+4);ctx.restore();
}
function clearFeedback(){el('feedback').hidden=true}
function render(){el('target').value=String(game.target);el('prompt').textContent='Create '+hybridLabel(game.target)+' hybridisation';el('molecule').textContent='Carbon';el('inputs').hidden=game.solved;
 for(let i=0;i<4;i++){el('orbital-'+i).setAttribute('aria-pressed',String(game.selected.has(i)));el('orbital-'+i).disabled=game.solved}
 el('mix').disabled=!game.selected.size||game.solved;el('result').hidden=!game.solved;
 if(game.solved){el('result-title').textContent=(game.target+1)+' '+hybridLabel(game.target)+' hybrids'+(game.remaining.length?' + '+game.remaining.length+' unhybridised p '+(game.remaining.length===1?'orbital':'orbitals'):'');el('result-boxes').innerHTML=Array.from({length:game.target+1},(_,j)=>`<div class="hy-output-orbital" style="--hy-orbital-color:${colorCSS([...game.selected].sort()[j])}"><span>${hybridLabel(game.target)}</span><b>↑</b></div>`).join('')+game.remaining.map(i=>`<div class="hy-output-orbital unhybridised" style="--hy-orbital-color:${colorCSS(i)}"><span>${labels[i]}</span><b>↑</b></div>`).join('');el('geometry').textContent=['','Linear · 180°','Trigonal planar · 120°','Tetrahedral · 109.5°'][game.target]}
 el('selection').textContent=game.selected.size+' orbitals selected';draw();document.dispatchEvent(new Event('chemi-controls-sync'))}
function choose(i){if(game.solved)return;game.choose(i);clearFeedback();render()}
for(let i=0;i<4;i++)el('orbital-'+i).addEventListener('click',()=>choose(i));
el('target').addEventListener('change',e=>{game.setTarget(Number(e.target.value));clearFeedback();render()});el('random').addEventListener('click',()=>{game.random();clearFeedback();render()});el('reset').addEventListener('click',()=>{game.reset();clearFeedback();render()});
el('mix').addEventListener('click',()=>{const result=game.check();render();el('feedback').textContent=result.text;el('feedback').hidden=false;el('feedback').className='of-feedback'+(result.ok?' success':'')});
el('view').addEventListener('change',e=>{const box=e.target.value==='boxes';el('stage').hidden=box;root.classList.toggle('hy-box-view',box);el('reset-view').hidden=box;draw()});
el('reset-view').addEventListener('click',()=>{yaw=-.45;pitch=.3;draw()});
function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*840/r.width,y:(e.clientY-r.top)*500/r.height}}
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();const p=point(e);drag={id:e.pointerId,start:p,last:p,moved:false};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const p=point(e);if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>5)drag.moved=true;if(drag.moved){yaw+=(p.x-drag.last.x)*.009;pitch=Math.max(-1.45,Math.min(1.45,pitch+(p.y-drag.last.y)*.009));draw()}drag.last=p});
canvas.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;const p=point(e),click=!drag.moved;drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(click&&!game.solved){const hit=hits.filter(h=>Math.hypot(h.x-p.x,h.y-p.y)<h.r).sort((a,b)=>b.z-a.z)[0];if(hit)choose(hit.i)}});
canvas.addEventListener('pointercancel',()=>{drag=null});canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')pitch=Math.max(-1.45,pitch-.12);if(e.key==='ArrowDown')pitch=Math.min(1.45,pitch+.12);draw()});render();
})();
