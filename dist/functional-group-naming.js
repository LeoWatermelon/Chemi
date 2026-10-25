(()=>{'use strict';
// Prefixes refer to the group attached to the left-hand R; suffixes use an open-chain parent.
const groups=[
{name:['Alkene'],prefix:['none','no prefix','not applicable','n/a'],suffix:['ene'],formula:['C=C','-CH=CH-'],atoms:[['R',100,240],['C',245,240],['C',405,240],["R′",550,240],['H',245,100],['H',405,100]],bonds:[[0,1,1],[1,2,2],[2,3,1],[1,4,1],[2,5,1]]},
{name:['Alkyne'],prefix:['none','no prefix','not applicable','n/a'],suffix:['yne'],formula:['C≡C','C#C'],atoms:[['R',100,210],['C',245,210],['C',405,210],["R′",550,210]],bonds:[[0,1,1],[1,2,3],[2,3,1]]},
{name:['Alcohol','Hydroxyl','Hydroxyl group'],prefix:['hydroxy'],suffix:['ol'],formula:['-OH'],atoms:[['R',180,210],['O',310,210],['H',420,210]],bonds:[[0,1,1],[1,2,1]]},
{name:['Amine','Primary amine','Amino','Amino group'],prefix:['amino'],suffix:['amine'],formula:['-NH2'],atoms:[['R',180,210],['N',310,210],['H',410,145],['H',410,275]],bonds:[[0,1,1],[1,2,1],[1,3,1]]},
{name:['Ketone','Carbonyl','Carbonyl group'],prefix:['oxo'],suffix:['one'],formula:['-CO-','-C(=O)-'],atoms:[['R',160,240],['C',300,240],['O',300,100],["R′",440,240]],bonds:[[0,1,1],[1,2,2],[1,3,1]]},
{name:['Aldehyde'],prefix:['formyl'],suffix:['al'],formula:['-CHO','-C(=O)H'],atoms:[['R',160,240],['C',300,240],['O',300,100],['H',440,240]],bonds:[[0,1,1],[1,2,2],[1,3,1]]},
{name:['Carboxylic acid','Carboxyl','Carboxyl group'],prefix:['carboxy'],suffix:['oic acid'],formula:['-COOH','-CO2H','-C(=O)OH'],atoms:[['R',120,240],['C',260,240],['O',260,100],['O',400,240],['H',510,240]],bonds:[[0,1,1],[1,2,2],[1,3,1],[3,4,1]]},
{name:['Ester'],prefix:['alkoxycarbonyl'],suffix:['oate'],formula:['-COO-','-C(=O)O-','-COOR','-COOR′'],atoms:[['R',120,240],['C',260,240],['O',260,100],['O',400,240],["R′",530,240]],bonds:[[0,1,1],[1,2,2],[1,3,1],[3,4,1]]},
{name:['Amide','Primary amide'],prefix:['carbamoyl'],suffix:['amide'],formula:['-CONH2','-C(=O)NH2'],atoms:[['R',110,240],['C',250,240],['O',250,100],['N',390,240],['H',500,175],['H',500,305]],bonds:[[0,1,1],[1,2,2],[1,3,1],[3,4,1],[3,5,1]]},
{name:['Ether'],prefix:['alkoxy'],suffix:['none','no suffix','not applicable','n/a'],formula:['-O-'],atoms:[['R',160,210],['O',300,210],["R′",440,210]],bonds:[[0,1,1],[1,2,1]]}
];
const fields=['name','prefix','suffix','formula'];
function normal(value){return value.trim().toLowerCase().replace(/[₀₁₂₃₄₅₆₇₈₉]/g,c=>'₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).replace(/[\s–—−-]/g,'').replace(/[’']/g,'′');}
function check(group,answers){return fields.filter(k=>answers[k]?.trim()).map(key=>({key,ok:group[key].some(a=>normal(a)===normal(answers[key])),answer:group[key][0]}));}
function pick(previous=-1,random=Math.random){const choice=Math.floor(random()*(groups.length-(previous>=0?1:0)));return previous>=0&&choice>=previous?choice+1:choice;}
if(typeof module!=='undefined'&&module.exports)module.exports={groups,check,normal,pick};if(typeof document==='undefined')return;
const $=id=>document.getElementById('gn-'+id);if(!$('game'))return;let index=-1;
function render(){const g=groups[index];let svg='<title>Displayed functional group structure</title><desc>'+g.atoms.map((a,i)=>'Atom '+(i+1)+': '+a[0]).join('; ')+'. '+g.bonds.map(b=>'Atoms '+(b[0]+1)+' and '+(b[1]+1)+': '+b[2]+' bond'+(b[2]>1?'s':'')).join('; ')+'</desc>';for(const [a,b,order] of g.bonds){const p=g.atoms[a],q=g.atoms[b],dx=q[1]-p[1],dy=q[2]-p[2],len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;for(let j=0;j<order;j++){const off=(j-(order-1)/2)*8;svg+=`<line x1="${p[1]+29*ux-off*uy}" y1="${p[2]+29*uy+off*ux}" x2="${q[1]-29*ux-off*uy}" y2="${q[2]-29*uy+off*ux}" class="lc-bond"/>`;}}for(const [label,x,y] of g.atoms)svg+=`<circle cx="${x}" cy="${y}" r="27" class="gn-atom"/><text x="${x}" y="${y}" class="lc-label">${label}</text>`;$('diagram').innerHTML=svg;}
function next(){index=pick(index);fields.forEach(k=>{$(k).value='';$(k+'-result').textContent='';$(k).removeAttribute('aria-invalid');});$('feedback').textContent='';$('check').disabled=true;render();}
fields.forEach(k=>$(k).addEventListener('input',()=>{$(k+'-result').textContent='';$(k).removeAttribute('aria-invalid');$('feedback').textContent='';$('check').disabled=!fields.some(f=>$(f).value.trim());}));
$('form').addEventListener('submit',e=>{e.preventDefault();const results=check(groups[index],Object.fromEntries(fields.map(k=>[k,$(k).value])));fields.forEach(k=>{$(k+'-result').textContent='';$(k).removeAttribute('aria-invalid');});for(const r of results){$(r.key+'-result').textContent=r.ok?'Correct':'Expected: '+r.answer;$(r.key+'-result').classList.toggle('success',r.ok);$(r.key).setAttribute('aria-invalid',String(!r.ok));}$('feedback').textContent=results.length?results.filter(r=>r.ok).length+' of '+results.length+' completed fields correct. Blank fields were not checked.':'Fill in any one field to check.';});$('next').addEventListener('click',next);next();
})();
