(()=>{
'use strict';
const types={london:'London dispersion',dipole:'Dipole–dipole',hydrogen:'Hydrogen bonding'};
const chain=(labels,orders=[])=>({atoms:labels.map((label,i)=>({label,x:360+(i-(labels.length-1)/2)*135,y:150})),bonds:labels.slice(1).map((_,i)=>[i,i+1,orders[i]||1])});
const carbonyl=(left,right)=>({atoms:[{label:'C',x:360,y:165},{label:'O',x:360,y:65},{label:left,x:220,y:165},{label:right,x:500,y:165}],bonds:[[0,1,2],[0,2,1],[0,3,1]]});
const star=(center,outer,angles)=>({atoms:[{label:center,x:360,y:135},...angles.map(a=>({label:outer,x:360+110*Math.cos(a*Math.PI/180),y:135+90*Math.sin(a*Math.PI/180)}))],bonds:angles.map((_,i)=>[0,i+1,1])});
const molecules=[
{name:'Hydrogen',formula:'H₂',organic:false,type:'london',drawing:chain(['H','H']),why:'The identical atoms share electrons equally, so H₂ has no permanent dipole.'},
{name:'Nitrogen',formula:'N₂',organic:false,type:'london',drawing:chain(['N','N'],[3]),why:'N₂ is nonpolar because its two atoms are identical.'},
{name:'Oxygen',formula:'O₂',organic:false,type:'london',drawing:chain(['O','O'],[2]),why:'O₂ is nonpolar because its two atoms are identical.'},
{name:'Carbon dioxide',formula:'CO₂',organic:false,type:'london',drawing:chain(['O','C','O'],[2,2]),why:'The two C=O bond dipoles cancel in the linear molecule, making CO₂ nonpolar.'},
{name:'Methane',formula:'CH₄',organic:true,type:'london',drawing:star('C','H',[-90,30,90,150]),why:'Methane is a symmetric tetrahedral molecule, so its bond dipoles cancel.'},
{name:'Ethane',formula:'C₂H₆',organic:true,type:'london',drawing:chain(['CH₃','CH₃']),why:'Ethane is a nonpolar hydrocarbon.'},
{name:'Propane',formula:'C₃H₈',organic:true,type:'london',drawing:chain(['CH₃','CH₂','CH₃']),why:'Propane is a nonpolar hydrocarbon.'},
{name:'Ethene',formula:'C₂H₄',organic:true,type:'london',drawing:chain(['CH₂','CH₂'],[2]),why:'The bond dipoles cancel in symmetric, planar ethene.'},
{name:'Ethyne',formula:'C₂H₂',organic:true,type:'london',drawing:chain(['H','C','C','H'],[1,3,1]),why:'Ethyne is linear and symmetric, so it has no permanent molecular dipole.'},
{name:'Tetrachloromethane',formula:'CCl₄',organic:true,type:'london',drawing:star('C','Cl',[-90,30,90,150]),why:'Although C–Cl bonds are polar, their dipoles cancel in the symmetric tetrahedral molecule.'},
{name:'Water',formula:'H₂O',organic:false,type:'hydrogen',drawing:star('O','H',[38,142]),why:'Water has O–H bonds and lone pairs on oxygen, so neighbouring water molecules form hydrogen bonds.'},
{name:'Ammonia',formula:'NH₃',organic:false,type:'hydrogen',drawing:star('N','H',[30,90,150]),why:'Ammonia has N–H bonds and a lone pair on nitrogen, allowing hydrogen bonding between its molecules.'},
{name:'Hydrogen fluoride',formula:'HF',organic:false,type:'hydrogen',drawing:chain(['H','F']),why:'Hydrogen is directly bonded to fluorine, whose lone pairs accept hydrogen bonds from neighbouring HF molecules.'},
{name:'Methanol',formula:'CH₃OH',organic:true,type:'hydrogen',drawing:chain(['CH₃','O','H']),why:'The O–H group lets methanol molecules donate and accept hydrogen bonds.'},
{name:'Ethanol',formula:'C₂H₅OH',organic:true,type:'hydrogen',drawing:chain(['CH₃','CH₂','O','H']),why:'The O–H group allows hydrogen bonding between ethanol molecules.'},
{name:'Methylamine',formula:'CH₃NH₂',organic:true,type:'hydrogen',drawing:chain(['CH₃','NH₂']),why:'Methylamine has N–H bonds and a nitrogen lone pair, so it forms hydrogen bonds with itself.'},
{name:'Ethanoic acid',formula:'CH₃COOH',organic:true,type:'hydrogen',drawing:carbonyl('CH₃','OH'),why:'The carboxyl group provides an O–H donor and an oxygen acceptor; ethanoic acid molecules can form hydrogen-bonded dimers.'},
{name:'Hydrogen chloride',formula:'HCl',organic:false,type:'dipole',drawing:chain(['H','Cl']),why:'HCl is polar. It does not form the conventional N–H, O–H or F–H hydrogen bonds used in this exercise.'},
{name:'Sulfur dioxide',formula:'SO₂',organic:false,type:'dipole',drawing:{atoms:[{label:'S',x:360,y:110},{label:'O',x:240,y:190},{label:'O',x:480,y:190}],bonds:[[0,1,2],[0,2,2]]},why:'SO₂ is bent, so its polar S–O bond dipoles do not cancel. It has no hydrogen-bond donor.'},
{name:'Methanal',formula:'CH₂O',organic:true,type:'dipole',drawing:carbonyl('H','H'),why:'The C=O group gives methanal a permanent dipole, but it has no O–H or N–H bond to donate a hydrogen bond.'},
{name:'Ethanal',formula:'CH₃CHO',organic:true,type:'dipole',drawing:carbonyl('CH₃','H'),why:'Ethanal has a polar carbonyl group but no hydrogen-bond donor. Its oxygen can accept hydrogen bonds from water, but this question concerns pure ethanal.'},
{name:'Propanone',formula:'CH₃COCH₃',organic:true,type:'dipole',drawing:carbonyl('CH₃','CH₃'),why:'The C=O group makes propanone polar. With no O–H or N–H bond, pure propanone cannot hydrogen-bond to itself in this model.'},
{name:'Dimethyl ether',formula:'CH₃OCH₃',organic:true,type:'dipole',drawing:{atoms:[{label:'O',x:360,y:110},{label:'CH₃',x:235,y:190},{label:'CH₃',x:485,y:190}],bonds:[[0,1,1],[0,2,1]]},why:'Dimethyl ether is polar but has no O–H bond. Oxygen alone is not enough for hydrogen bonding between identical ether molecules.'},
{name:'Chloromethane',formula:'CH₃Cl',organic:true,type:'dipole',drawing:chain(['CH₃','Cl']),why:'The C–Cl bond gives chloromethane a permanent dipole. It has no N–H, O–H or F–H bond.'}
];
class Identify{
 constructor(random=Math.random){this.random=random;this.filter='all';this.bag=[];this.index=-1;this.next();}
 get molecule(){return molecules[this.index]}
 setFilter(value){this.filter=value;this.bag=[];this.next();}
 next(){if(!this.bag.length){this.bag=molecules.map((_,i)=>i).filter(i=>this.filter==='all'||molecules[i].organic===(this.filter==='organic'));for(let i=this.bag.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}if(this.bag.length>1&&this.bag.at(-1)===this.index)[this.bag[0],this.bag[this.bag.length-1]]=[this.bag.at(-1),this.bag[0]];}this.index=this.bag.pop();this.choice=null;this.stage=1;this.selected=new Set();}
 get present(){return this.molecule.type==='london'?['london']:this.molecule.type==='dipole'?['london','dipole']:['london','dipole','hydrogen'];}
 checkPresent(){if(this.stage!==1)return false;const ok=this.selected.size===this.present.length&&this.present.every(t=>this.selected.has(t));if(ok)this.stage=2;return ok;}
 check(){const ok=this.stage===2&&this.choice===this.molecule.type;if(ok)this.stage=3;return ok;}
}
if(typeof module!=='undefined'&&module.exports)module.exports={Identify,molecules,types};if(typeof document==='undefined')return;
const $=id=>document.getElementById('if-'+id);if(!$('game'))return;const game=new Identify();
function diagram(m){let s=`<title>${m.name}: structural formula</title><desc>${m.drawing.atoms.map(a=>a.label).join(', ')}. Bonds: ${m.drawing.bonds.map(([i,j,n])=>m.drawing.atoms[i].label+' to '+m.drawing.atoms[j].label+', '+['','single','double','triple'][n]).join('; ')}.</desc>`;for(const [i,j,n] of m.drawing.bonds){const a=m.drawing.atoms[i],b=m.drawing.atoms[j],dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy),ux=dx/l,uy=dy/l;const padA=a.label.length>2?35:25,padB=b.label.length>2?35:25;for(let k=0;k<n;k++){const off=(k-(n-1)/2)*8;s+=`<line x1="${a.x+padA*ux-off*uy}" y1="${a.y+padA*uy+off*ux}" x2="${b.x-padB*ux-off*uy}" y2="${b.y-padB*uy+off*ux}" class="if-bond"/>`;}}for(const a of m.drawing.atoms)s+=`<text x="${a.x}" y="${a.y}" class="if-atom">${a.label}</text>`;return s;}
function feedback(text,ok=false){$('feedback').hidden=!text;$('feedback').textContent=text;$('feedback').classList.toggle('success',ok);}
function render(){const m=game.molecule;$('name').textContent=m.name;$('formula').textContent=m.formula;$('diagram').innerHTML=diagram(m);for(const type of Object.keys(types)){$(type).setAttribute('aria-pressed',String(game.stage===1?game.selected.has(type):game.choice===type));$(type).disabled=game.stage===3;}$('check').disabled=game.stage===1?!game.selected.size:game.stage===2?!game.choice:true;$('check').textContent=game.stage===1?'Check forces present':game.stage===2?'Check most prominent':'Complete';$('question').textContent=game.stage===1?'1 · Which IMFs are present?':'2 · Which is the most prominent IMF?';$('selection-hint').textContent=game.stage===1?'Select all that apply.':'Choose one.';$('present').hidden=game.stage===1;$('present').textContent='Present: '+game.present.map(t=>types[t]).join(' · ');}
for(const type of Object.keys(types))$(type).addEventListener('click',()=>{if(game.stage===3)return;if(game.stage===1){if(game.selected.has(type))game.selected.delete(type);else game.selected.add(type);}else game.choice=type;feedback('');render();});
$('check').addEventListener('click',()=>{if(game.stage===1){if(!game.selected.size)return;const ok=game.checkPresent();feedback(ok?'Correct. Now choose the most prominent interaction.':'Try again. London dispersion is present in every molecule. Also consider permanent dipoles and whether these molecules can hydrogen-bond to each other.',ok);render();return;}if(game.stage!==2||!game.choice)return;const m=game.molecule,ok=game.check();feedback(ok?'Correct — '+types[m.type]+'. '+m.why+(m.type==='london'?'':' London dispersion is also present.'):m.type==='hydrogen'?'Try again. Look for hydrogen directly bonded to N, O or F and a neighbouring molecule that can accept a hydrogen bond.':m.type==='dipole'?'Try again. This molecule has a permanent dipole, but pure molecules of this substance do not have the required hydrogen-bond donors.':'Try again. Consider the whole molecule: its bond dipoles cancel, or its bonds are nonpolar.',ok);render();});
$('next').addEventListener('click',()=>{game.next();feedback('');render();});$('filter').addEventListener('change',e=>{game.setFilter(e.target.value);feedback('');render();});render();
})();
