(()=>{
'use strict';
const samples=[{name:'Chlorine',symbol:'Cl',m:[35,37]},{name:'Bromine',symbol:'Br',m:[79,81]},{name:'Boron',symbol:'B',m:[10,11]},{name:'Lithium',symbol:'Li',m:[6,7]}];
const mean=(m,p)=>(m[0]*p+m[1]*(100-p))/100;
const abundance=(m,average)=>100*(m[1]-average)/(m[1]-m[0]);
const fmt=n=>Number(n.toFixed(2)).toString();
class RelativeMass{
 constructor(){this.mode='explore';this.sample=0;this.p=75;this.solved=false}
 get data(){return samples[this.sample]}get average(){return mean(this.data.m,this.p)}
 setPercent(p){if(Number.isFinite(p))this.p=Math.max(0,Math.min(100,Math.round(p*10)/10))}
 next(){this.sample=Math.floor(Math.random()*samples.length);this.p=10+Math.floor(Math.random()*81);this.solved=false}
 get answer(){return this.mode==='abundance'?this.p:this.average}
 check(raw){if(raw.trim()===''||!Number.isFinite(Number(raw)))return 'Enter a number.';const value=Number(raw);if(this.mode==='abundance'&&(value<0||value>100))return 'Abundance must be between 0% and 100%.';if(Math.abs(value-this.answer)<=0.005001){this.solved=true;return 'Correct.'}return this.mode==='abundance'?'Try again. The two abundances add to 100%.':'Try again. Weight each isotope mass by its percentage abundance, then divide the total by 100.'}
}
if(typeof module!=='undefined'&&module.exports)module.exports={RelativeMass,samples,mean,abundance};
if(typeof document==='undefined')return;const root=document.getElementById('relative-mass-game');if(!root)return;
const game=new RelativeMass(),el=id=>document.getElementById('rm-'+id);
function feedback(text,kind=''){el('feedback').textContent=text;el('feedback').hidden=!text;el('feedback').className='of-feedback '+kind}
function clear(){el('answer').value='';game.solved=false;feedback('')}
function render(){const d=game.data,explore=game.mode==='explore',unknown=game.mode==='abundance';el('sample').value=String(game.sample);el('sample-label').hidden=!explore;el('explore').hidden=!explore;el('result-panel').hidden=!explore;el('practice').hidden=explore;el('next').hidden=explore;el('check').hidden=explore;el('show').hidden=explore;el('check').disabled=game.solved;el('show').disabled=game.solved;
 el('isotope-a').textContent=d.symbol+'-'+d.m[0];el('isotope-b').textContent=d.symbol+'-'+d.m[1];el('percent-a').textContent=unknown?'?':fmt(game.p)+'%';el('percent-b').textContent=unknown?'?':fmt(100-game.p)+'%';
 el('slider').value=game.p;el('percent').value=game.p;el('slider').setAttribute('aria-label',d.symbol+'-'+d.m[0]+' abundance');el('percent').setAttribute('aria-label',d.symbol+'-'+d.m[0]+' percentage abundance');el('slider-label').textContent=d.symbol+'-'+d.m[0]+' abundance';el('average').textContent=fmt(game.average);el('calculation').textContent='('+d.m[0]+' × '+fmt(game.p)+' + '+d.m[1]+' × '+fmt(100-game.p)+') ÷ 100 = '+fmt(game.average);
 el('mixture-a').style.width=game.p+'%';el('mixture-b').style.width=(100-game.p)+'%';el('mixture').setAttribute('aria-label',fmt(game.p)+'% '+d.symbol+'-'+d.m[0]+', '+fmt(100-game.p)+'% '+d.symbol+'-'+d.m[1]);
 el('low').textContent=d.m[0];el('high').textContent=d.m[1];el('marker').style.left=(100-game.p)+'%';
 el('question').textContent=unknown?'Relative atomic mass = '+fmt(game.average)+'. Find the percentage abundance of '+d.symbol+'-'+d.m[0]+'.':'Calculate the relative atomic mass of this '+d.name.toLowerCase()+' sample.';el('answer-label').textContent=unknown?d.symbol+'-'+d.m[0]+' abundance (%)':'Relative atomic mass';el('answer').max=unknown?'100':'';el('answer').step='any';document.dispatchEvent(new Event('chemi-controls-sync'));
}
el('mode').addEventListener('change',e=>{game.mode=e.target.value;if(game.mode!=='explore')game.next();clear();render()});el('sample').addEventListener('change',e=>{game.sample=Number(e.target.value);clear();render()});el('slider').addEventListener('input',e=>{game.setPercent(Number(e.target.value));render()});el('percent').addEventListener('input',e=>{if(e.target.value===''||!e.target.validity.valid)return;game.setPercent(Number(e.target.value));render()});el('percent').addEventListener('change',()=>render());el('next').addEventListener('click',()=>{game.next();clear();render()});
function check(){const text=game.check(el('answer').value);render();feedback(text,game.solved?'success':'')}
el('check').addEventListener('click',check);el('answer').addEventListener('keydown',e=>{if(e.key==='Enter'&&!game.solved){e.preventDefault();check()}});el('answer').addEventListener('input',()=>{if(!game.solved)feedback('')});
el('show').addEventListener('click',()=>{const d=game.data;el('answer').value=fmt(game.answer);game.solved=true;render();feedback(game.mode==='abundance'?'Let x be the percentage of '+d.symbol+'-'+d.m[0]+'. '+fmt(game.average)+' = ('+d.m[0]+'x + '+d.m[1]+'(100 − x)) ÷ 100, so x = '+fmt(game.p)+'%.':el('calculation').textContent,'answer')});render();
})();
