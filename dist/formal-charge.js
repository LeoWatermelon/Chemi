(()=>{
'use strict';
// Each terminal: symbol, bond order, lone-pair count.
const H=['H',1,0],F=['F',1,3],O=['O',2,2],Om=['O',1,3];
const molecules=[
{name:'Tetrafluoroborate',formula:'BF₄⁻',atom:'B',valence:3,lp:0,ends:[F,F,F,F],charge:'−'},
{name:'Phosphonium',formula:'PH₄⁺',atom:'P',valence:5,lp:0,ends:[H,H,H,H],charge:'+'},
{name:'Amide ion',formula:'NH₂⁻',atom:'N',valence:5,lp:2,ends:[H,H],charge:'−'},
{name:'Hydroxide',formula:'OH⁻',atom:'O',valence:6,lp:3,ends:[H],charge:'−'},
{name:'Cyanide',formula:'CN⁻',atom:'C',valence:4,lp:1,ends:[['N',3,1]],charge:'−'},
{name:'Carbon monoxide',formula:'CO',atom:'C',valence:4,lp:1,ends:[['O',3,1]]},
{name:'Nitronium',formula:'NO₂⁺',atom:'N',valence:5,lp:0,ends:[O,O],charge:'+'},
{name:'Sulfonium',formula:'H₃S⁺',atom:'S',valence:6,lp:1,ends:[H,H,H],charge:'+'},
{name:'Sulfate · single-bond structure',formula:'SO₄²⁻',atom:'S',valence:6,lp:0,ends:[Om,Om,Om,Om],charge:'2−',structureNote:'This question uses the all-single-bond Lewis structure. Other Lewis representations can assign different formal charges; use the drawing shown.'},
{name:'Phosphate · single-bond structure',formula:'PO₄³⁻',atom:'P',valence:5,lp:0,ends:[Om,Om,Om,Om],charge:'3−',structureNote:'This question uses the all-single-bond Lewis structure. Other Lewis representations can assign different formal charges; use the drawing shown.'},
{name:'Ammonia',formula:'NH₃',atom:'N',valence:5,lp:1,ends:[H,H,H]},
{name:'Ammonium',formula:'NH₄⁺',atom:'N',valence:5,lp:0,ends:[H,H,H,H],charge:'+'},
{name:'Water',formula:'H₂O',atom:'O',valence:6,lp:2,ends:[H,H]},
{name:'Hydronium',formula:'H₃O⁺',atom:'O',valence:6,lp:1,ends:[H,H,H],charge:'+'},
{name:'Methane',formula:'CH₄',atom:'C',valence:4,lp:0,ends:[H,H,H,H]},
{name:'Methyl cation',formula:'CH₃⁺',atom:'C',valence:4,lp:0,ends:[H,H,H],charge:'+'},
{name:'Methyl anion',formula:'CH₃⁻',atom:'C',valence:4,lp:1,ends:[H,H,H],charge:'−'},
{name:'Boron trifluoride',formula:'BF₃',atom:'B',valence:3,lp:0,ends:[F,F,F]},
{name:'Borohydride',formula:'BH₄⁻',atom:'B',valence:3,lp:0,ends:[H,H,H,H],charge:'−'},
{name:'Carbon dioxide',formula:'CO₂',atom:'C',valence:4,lp:0,ends:[O,O]},
{name:'Nitrate',formula:'NO₃⁻',atom:'N',valence:5,lp:0,ends:[O,Om,Om],charge:'−',resonance:true},
{name:'Nitrite',formula:'NO₂⁻',atom:'N',valence:5,lp:1,ends:[O,Om],charge:'−',resonance:true},
{name:'Carbonate',formula:'CO₃²⁻',atom:'C',valence:4,lp:0,ends:[O,Om,Om],charge:'2−',resonance:true},
{name:'Ozone',formula:'O₃',atom:'O',valence:6,lp:1,ends:[O,Om],resonance:true}
];
const owned=m=>2*m.lp+m.ends.reduce((n,e)=>n+e[1],0);
function parseCharge(value){const s=String(value).trim().replace(/−/g,'-');if(/^[+-]?\d+$/.test(s))return Number(s);if(/^\d+[+-]$/.test(s))return Number(s.slice(0,-1))*(s.endsWith('-')?-1:1);return NaN;}
class Practice{
 constructor(random=Math.random){this.random=random;this.index=-1;this.bag=[];this.next()}
 get current(){return molecules[this.index]}
 next(){if(!this.bag.length){this.bag=molecules.map((_,i)=>i);for(let i=this.bag.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}if(this.bag.at(-1)===this.index)[this.bag[0],this.bag[this.bag.length-1]]=[this.bag.at(-1),this.bag[0]];}this.index=this.bag.pop();this.stage=1;}
 checkAll(values){const targets=[this.current.valence,owned(this.current),this.current.valence-owned(this.current)];return values.map((raw,i)=>{const text=String(raw).trim();return text!==''&&(i===2?parseCharge(text):/^\d+$/.test(text)?Number(text):NaN)===targets[i];});}

}
if(typeof module!=='undefined'&&module.exports)module.exports={molecules,owned,parseCharge,Practice};
if(typeof document==='undefined')return;
const $=id=>document.getElementById('fc-'+id);if(!$('game'))return;const game=new Practice();let bondView='lines',checked=null;
function pair(x,y,a){let s='';for(const sign of [-1,1])s+=`<circle cx="${x+sign*5*Math.cos(a)}" cy="${y+sign*5*Math.sin(a)}" r="3" class="fc-electron"/>`;return s;}
function diagram(m){const cx=300,cy=185,angles=m.ends.length===1?[0]:m.ends.length===2?[0,180]:m.ends.length===3?[0,120,240]:[0,90,180,270];let s=`<title>${m.name}: central ${m.atom}</title><desc>${m.ends.map(e=>e[0]+' joined by a '+['','single','double','triple'][e[1]]+' bond').join('; ')}. Central atom has ${m.lp} lone pairs.</desc>`;
if(m.charge)s+=`<path d="M65 25 H50 V355 H65 M535 25 H550 V355 H535" class="fc-bracket"/><text x="568" y="37" class="fc-charge">${m.charge}</text>`;
angles.forEach((deg,i)=>{const a=deg*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a),x=cx+110*dx,y=cy+110*dy,e=m.ends[i];for(let n=0;n<e[1];n++){const d=(n-(e[1]-1)/2)*8;if(bondView==='dots'){s+=pair(cx+55*dx-d*dy,cy+55*dy+d*dx,a);}else s+=`<line x1="${cx+38*dx-d*dy}" y1="${cy+38*dy+d*dx}" x2="${x-32*dx-d*dy}" y2="${y-32*dy+d*dx}" class="fc-bond"/>`;}s+=`<text x="${x}" y="${y}" class="fc-atom">${e[0]}</text>`;const offsets=e[2]===3?[0,90,-90]:[90,-90];for(let n=0;n<e[2];n++){const t=a+offsets[n]*Math.PI/180;s+=pair(x+33*Math.cos(t),y+33*Math.sin(t),t+Math.PI/2);}});
s+=`<text x="300" y="185" class="fc-atom fc-center">${m.atom}</text>`;
for(let p=0;p<m.lp;p++){const a=(m.lp===3?[-90,180,90][p]:m.lp===2?(p===0?-90:90):m.ends.length<=2?-90:-55)*Math.PI/180;s+=pair(cx+43*Math.cos(a),cy+43*Math.sin(a),a+Math.PI/2);}
return s;}
function feedback(text,ok=false){$('feedback').textContent=text;$('feedback').hidden=!text;$('feedback').classList.toggle('success',ok);}
function filled(){return [1,2,3].every(n=>$('answer'+n).value.trim()!=='');}
function render(){const m=game.current;$('name').textContent=m.name;$('formula').textContent=m.formula;$('target').textContent=(m.ends.length===1?'Selected atom: ':'Central atom: ')+m.atom;$('diagram').innerHTML=diagram(m);
for(let n=1;n<=3;n++){$('step'+n).disabled=false;$('status'+n).textContent=checked?(checked[n-1]?'✓':'Try again'):'';$('answer'+n).setAttribute('aria-invalid',String(!!checked&&!checked[n-1]));}
$('comparison').hidden=!checked||!checked[1];const count=owned(m),delta=count-m.valence;$('comparison').textContent='It’s supposed to have '+m.valence+' valence electrons, but now it owns '+count+', so it has '+(delta===0?'the same number of electrons.':Math.abs(delta)+(delta>0?' more':' fewer')+' electron'+(Math.abs(delta)===1?'':'s')+'.');
$('check').disabled=!filled();$('resonance').hidden=!m.resonance;$('structure-note').hidden=!m.structureNote;$('structure-note').textContent=m.structureNote||'';
for(const mode of ['lines','dots'])$('view-'+mode).setAttribute('aria-pressed',String(bondView===mode));
}
$('check').addEventListener('click',()=>{if(!filled())return;checked=game.checkAll([1,2,3].map(n=>$('answer'+n).value));render();const hints=[];if(!checked[0])hints.push('Use the neutral atom’s valence-electron count.');if(!checked[1])hints.push('Count all lone-pair electrons plus half the bonding electrons.');if(!checked[2])hints.push('Formal charge = expected valence electrons − electrons owned.');feedback(checked.every(Boolean)?'All three answers are correct.':hints.join(' '),checked.every(Boolean));});
for(let n=1;n<=3;n++){
$('answer'+n).addEventListener('input',()=>{checked=null;feedback('');render();});
$('answer'+n).addEventListener('keydown',e=>{if(e.key==='Enter'&&filled()){e.preventDefault();$('check').click();}});
}
for(const mode of ['lines','dots'])$('view-'+mode).addEventListener('click',()=>{bondView=mode;render();});
$('next').addEventListener('click',()=>{game.next();checked=null;for(let n=1;n<=3;n++)$('answer'+n).value='';feedback('');render();$('answer1').focus();});render();
})();
