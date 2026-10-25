(()=>{
'use strict';
const properties=['Atomic radius','Electronegativity','First ionisation energy'];
const cases=[{id:'right',title:'To the right across a period',arrow:'→',answers:['decrease','increase','increase']},{id:'left',title:'To the left across a period',arrow:'←',answers:['increase','decrease','decrease']},{id:'up',title:'Further up a group',arrow:'↑',answers:['decrease','increase','increase']},{id:'down',title:'Lower down a group',arrow:'↓',answers:['increase','decrease','decrease']}];
function shuffled(){const a=[0,1,2,3];for(let i=3;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
class TrendPractice{
 constructor(){this.order=shuffled();this.position=0;this.answers=[null,null,null];this.checked=false}
 get current(){return cases[this.order[this.position]]}get ready(){return this.answers.every(Boolean)}
 select(i,value){if(i>=0&&i<3&&['increase','decrease'].includes(value)){this.answers[i]=value;this.checked=false}}
 check(){if(!this.ready)return null;this.checked=true;return this.answers.map((v,i)=>v===this.current.answers[i])}
 next(){if(this.position===3){const last=this.order[3];this.order=shuffled();if(this.order[0]===last)[this.order[0],this.order[1]]=[this.order[1],this.order[0]];this.position=0}else this.position++;this.answers=[null,null,null];this.checked=false}
}
if(typeof module!=='undefined'&&module.exports)module.exports={TrendPractice,cases,properties};if(typeof document==='undefined')return;const root=document.getElementById('trend-practice-game');if(!root)return;const game=new TrendPractice(),el=id=>document.getElementById('tp-'+id);
function render(){el('condition').textContent=game.current.title;el('arrow').textContent=game.current.arrow;el('case').textContent='Case '+(game.position+1)+' / 4';
 el('rows').innerHTML=properties.map((p,i)=>{const correct=game.checked&&game.answers[i]===game.current.answers[i];return `<div class="tp-row"><div class="tp-property">${p}</div><div class="tp-choices" role="group" aria-label="${p}">${['increase','decrease'].map(v=>`<button type="button" data-property="${i}" data-choice="${v}" aria-pressed="${game.answers[i]===v}">${v==='increase'?'Increase':'Decrease'}</button>`).join('')}</div><div class="tp-result${game.checked?(correct?' correct':' incorrect'):''}" aria-live="polite">${game.checked?(correct?'✓ Correct':'Try again'):''}</div></div>`}).join('');
 el('check').disabled=!game.ready;el('next').disabled=!game.checked;el('feedback').hidden=!game.checked;if(game.checked){const score=game.answers.filter((v,i)=>v===game.current.answers[i]).length;el('feedback').textContent=score===3?'All three are correct.':score+' of 3 correct. Change your selections and check again.';el('feedback').className='of-feedback'+(score===3?' success':'')}
}
el('rows').addEventListener('click',e=>{const b=e.target.closest('[data-choice]');if(!b)return;const i=Number(b.dataset.property),v=b.dataset.choice;game.select(i,v);render();el('rows').querySelector('[data-property="'+i+'"][data-choice="'+v+'"]').focus()});el('check').addEventListener('click',()=>{game.check();render()});el('next').addEventListener('click',()=>{game.next();render()});render();
})();
