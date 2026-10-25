(()=>{
'use strict';
// Common VSEPR shapes: OpenStax Chemistry 2e, section 7.6, Molecular Structure and Polarity.
const rows={2:['Linear'],3:['Trigonal planar','Bent'],4:['Tetrahedral','Trigonal pyramidal','Bent'],5:['Trigonal bipyramidal','Seesaw','T-shaped','Linear'],6:['Octahedral','Square pyramidal','Square planar']};
const cases=Object.entries(rows).flatMap(([d,shapes])=>shapes.map((shape,l)=>({domains:Number(d),lone:l,shape,key:d+'-'+l})));
const choices=['Linear','Bent','Trigonal planar','Trigonal pyramidal','Tetrahedral','Trigonal bipyramidal','Seesaw','T-shaped','Octahedral','Square pyramidal','Square planar'];
class ShapesPractice{
 constructor(){this.answers={};this.bag=[];this.current=null;this.answer='';this.next()}
 set(key,value){if(cases.some(c=>c.key===key)&&choices.includes(value))this.answers[key]=value}
 checkTable(){return cases.map(c=>({...c,result:!this.answers[c.key]?'empty':this.answers[c.key]===c.shape?'correct':'incorrect'}))}
 next(){if(!this.bag.length){this.bag=[...cases];for(let i=this.bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]]}if(this.current&&this.bag.at(-1).key===this.current.key)[this.bag[0],this.bag[this.bag.length-1]]=[this.bag.at(-1),this.bag[0]]}this.current=this.bag.pop();this.answer=''}
 checkQuiz(){return this.answer?this.answer===this.current.shape:null}
}
const layouts={2:[[110,250],[490,250]],3:[[300,65],[115,385],[485,385]],4:[[300,55],[95,305],[300,445],[505,305]],5:[[300,55],[300,445],[100,250],[485,145],[485,355]],6:[[300,55],[300,445],[120,145],[480,355],[480,145],[120,355]]};
function referenceAngles(c){if(c.shape==='Linear')return [[180]];if(c.shape==='Bent')return c.domains===3?[[120]]:[[109.5]];if(c.shape==='Trigonal pyramidal')return [[109.5]];if(c.domains===3)return [[120]];if(c.domains===4)return [[109.5]];return c.domains===5&&c.lone<2?[[90,120,180]]:[[90,180]]}
function angleValues(raw){const clean=raw.toLowerCase().replace(/degrees?|deg|and/g,'').replace(/[°º,;\/<>≤≥~≈\s]/g,'');if(!clean||!/^[\d.]+$/.test(clean))return [];const nums=raw.match(/\d+(?:\.\d+)?/g)||[];return [...new Set(nums.map(Number))].sort((a,b)=>a-b)}
function validateName(c,slots,angle){
 if(slots.length!==c.domains||slots.some(s=>!['bond','lone'].includes(s)))return {ok:false,text:'Choose Bond or Lone pair for every position.'};
 const lp=slots.map((s,i)=>s==='lone'?i:-1).filter(i=>i>=0);
 if(lp.length!==c.lone)return {ok:false,text:'Check the number of bonds and lone pairs for this shape.'};
 if(c.domains===5&&lp.some(i=>i<2))return {ok:false,text:'For this shape, place lone pairs in the equatorial positions.'};
 if(c.domains===6&&lp.length===2&&Math.floor(lp[0]/2)!==Math.floor(lp[1]/2))return {ok:false,text:'The two lone pairs need to be opposite each other.'};
 const nums=angleValues(angle),correct=referenceAngles(c).some(a=>a.length===nums.length&&a.every((v,i)=>Math.abs(v-nums[i])<.11));
 if(!correct)return {ok:false,text:'Check the bond angle(s). Include each distinct reference angle.'};
 return {ok:true,text:'✓ Correct — bonds, lone pairs and angles match.'};
}
if(typeof module!=='undefined'&&module.exports)module.exports={ShapesPractice,cases,rows,choices,layouts,referenceAngles,angleValues,validateName};if(typeof document==='undefined')return;
const root=document.getElementById('shapes-practice-game');if(!root)return;const game=new ShapesPractice(),el=id=>document.getElementById('sp-'+id);
const options='<option value="">Choose shape</option>'+choices.map(s=>`<option value="${s}">${s}</option>`).join('');
el('table-body').innerHTML=Object.entries(rows).map(([d,shapes])=>`<tr><th scope="row">${d}</th>${[0,1,2,3].map(l=>shapes[l]?`<td><select data-shape-cell="${d}-${l}" id="sp-cell-${d}-${l}" aria-label="${d} electron domains, ${l} lone pairs">${options}</select><span id="sp-result-${d}-${l}" class="sp-cell-result" aria-live="polite"></span></td>`:`<td class="sp-unused" aria-label="Not included in this common-shapes table"><span aria-hidden="true">—</span></td>`).join('')}</tr>`).join('');
el('answer').innerHTML=options;
function sync(){document.dispatchEvent(new Event('chemi-controls-sync'))}
function question(){el('domains').textContent=game.current.domains;el('lone').textContent=game.current.lone;el('answer').value='';el('check-quiz').disabled=true;el('quiz-feedback').hidden=true;sync()}
function clearResult(key){const n=el('result-'+key);n.textContent='';n.className='sp-cell-result'}
el('mode').addEventListener('change',e=>{el('table-panel').hidden=e.target.value!=='table';el('quiz-panel').hidden=e.target.value!=='quiz'});
el('table-body').addEventListener('change',e=>{const key=e.target.dataset.shapeCell;if(!key)return;if(e.target.value)game.set(key,e.target.value);else delete game.answers[key];clearResult(key);el('table-feedback').hidden=true});
el('check-table').addEventListener('click',()=>{let correct=0,filled=0;game.checkTable().forEach(c=>{const n=el('result-'+c.key);n.className='sp-cell-result '+c.result;n.textContent=c.result==='correct'?'✓ Correct':c.result==='incorrect'?'Try again':'Not filled';if(c.result!=='empty')filled++;if(c.result==='correct')correct++});el('table-feedback').hidden=false;el('table-feedback').textContent=correct===cases.length?'All 13 shapes are correct.':`${correct} correct · ${cases.length-filled} remaining`;});
el('clear').addEventListener('click',()=>{game.answers={};cases.forEach(c=>{el('cell-'+c.key).value='';clearResult(c.key)});el('table-feedback').hidden=true;sync()});
el('answer').addEventListener('change',e=>{game.answer=e.target.value;el('check-quiz').disabled=!game.answer;el('quiz-feedback').hidden=true});
el('check-quiz').addEventListener('click',()=>{const correct=game.checkQuiz();if(correct===null)return;el('quiz-feedback').hidden=false;el('quiz-feedback').textContent=correct?'✓ Correct — '+game.current.shape+'.':'Try again.';el('quiz-feedback').className='of-feedback'+(correct?' success':'')});
el('next').addEventListener('click',()=>{game.next();question()});question();
const nameGame=new ShapesPractice();let slots=[];
function paintName(){const c=nameGame.current,points=layouts[c.domains];let svg='<title>Schematic electron-domain positions</title><desc>Projected positions for '+c.domains+' electron domains. The drawing is not an angle scale.</desc>';
 points.forEach(([x,y],i)=>{const dx=x-300,dy=y-250,px=300+dx*.62,py=250+dy*.62;svg+=`<line x1="300" y1="250" x2="${px}" y2="${py}" class="sp-domain-line ${slots[i]||''}"/>`;if(slots[i]==='bond')svg+=`<circle cx="${px}" cy="${py}" r="15" class="sp-bond-atom"/><text x="${px}" y="${py+5}" text-anchor="middle" class="sp-atom-text">X</text>`;if(slots[i]==='lone')svg+=`<ellipse cx="${px}" cy="${py}" rx="22" ry="15" class="sp-lone-cloud"/><circle cx="${px-6}" cy="${py}" r="4" class="sp-lone-dot"/><circle cx="${px+6}" cy="${py}" r="4" class="sp-lone-dot"/>`;
 const label=el('position-'+i);label.hidden=false;label.style.left=x/6+'%';label.style.top=y/6.2+'%';el('position-kind-'+i).textContent=c.domains===5?(i<2?'Axial':'Equatorial'):'Position '+(i+1);
 });for(let i=c.domains;i<6;i++)el('position-'+i).hidden=true;
 svg+='<circle cx="300" cy="250" r="28" class="sp-central"/><text x="300" y="257" text-anchor="middle" class="sp-central-text">A</text>';el('name-diagram').innerHTML=svg;
}
function selectedAngles(){return Array.from({length:referenceAngles(nameGame.current)[0].length},(_,i)=>el('angle-'+i).value)}
function nameReady(){el('check-name').disabled=slots.some(v=>!v)||selectedAngles().some(v=>!v);el('name-feedback').hidden=true}
function nameQuestion(){slots=Array(nameGame.current.domains).fill('');el('shape-name').textContent=nameGame.current.shape;el('name-domains').textContent=nameGame.current.domains+' electron domains';for(let i=0;i<6;i++)el('domain-'+i).value='';for(let i=0;i<3;i++){el('angle-'+i).value='';el('angle-label-'+i).hidden=i>=referenceAngles(nameGame.current)[0].length}paintName();nameReady();sync()}
for(let i=0;i<6;i++)el('domain-'+i).addEventListener('change',e=>{slots[i]=e.target.value;paintName();nameReady()});
for(let i=0;i<3;i++)el('angle-'+i).addEventListener('change',nameReady);
function checkName(){if(el('check-name').disabled)return;const result=validateName(nameGame.current,slots,selectedAngles().join(', '));el('name-feedback').textContent=result.text;el('name-feedback').className='of-feedback'+(result.ok?' success':'');el('name-feedback').hidden=false}
el('check-name').addEventListener('click',checkName);el('next-name').addEventListener('click',()=>{nameGame.next();nameQuestion()});nameQuestion();
})();
