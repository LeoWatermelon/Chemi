(()=>{
'use strict';
const shapes=['Linear','Bent','Trigonal planar','Trigonal pyramidal','Tetrahedral','Trigonal bipyramidal','Octahedral','Square planar'];
const molecules=[
{name:'Carbon dioxide',formula:'CO₂',center:'C',outer:'O',count:2,shape:'Linear',attract:'O',polar:false,order:2},
{name:'Water',formula:'H₂O',center:'O',outer:'H',count:2,shape:'Bent',attract:'O',polar:true},
{name:'Ammonia',formula:'NH₃',center:'N',outer:'H',count:3,shape:'Trigonal pyramidal',attract:'N',polar:true},
{name:'Methane',formula:'CH₄',center:'C',outer:'H',count:4,shape:'Tetrahedral',attract:'C',polar:false},
{name:'Boron trifluoride',formula:'BF₃',center:'B',outer:'F',count:3,shape:'Trigonal planar',attract:'F',polar:false},
{name:'Tetrachloromethane',formula:'CCl₄',center:'C',outer:'Cl',count:4,shape:'Tetrahedral',attract:'Cl',polar:false},
{name:'Sulfur dioxide',formula:'SO₂',center:'S',outer:'O',count:2,shape:'Bent',attract:'O',polar:true,order:2},
{name:'Phosphorus trichloride',formula:'PCl₃',center:'P',outer:'Cl',count:3,shape:'Trigonal pyramidal',attract:'Cl',polar:true},
{name:'Sulfur hexafluoride',formula:'SF₆',center:'S',outer:'F',count:6,shape:'Octahedral',attract:'F',polar:false},
{name:'Phosphorus pentachloride · gas',formula:'PCl₅',center:'P',outer:'Cl',count:5,shape:'Trigonal bipyramidal',attract:'Cl',polar:false},
{name:'Xenon tetrafluoride',formula:'XeF₄',center:'Xe',outer:'F',count:4,shape:'Square planar',attract:'F',polar:false},
{name:'Hydrogen',formula:'H₂',center:'H',outer:'H',count:1,shape:'Linear',attract:'equal',polar:false},
{name:'Chlorine',formula:'Cl₂',center:'Cl',outer:'Cl',count:1,shape:'Linear',attract:'equal',polar:false}
];
class Polarity{
 constructor(random=Math.random){this.random=random;this.bag=[];this.index=-1;this.next()}
 get molecule(){return molecules[this.index]}
 next(){if(!this.bag.length){this.bag=molecules.map((_,i)=>i);for(let i=this.bag.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}if(this.bag.at(-1)===this.index)[this.bag[0],this.bag[this.bag.length-1]]=[this.bag.at(-1),this.bag[0]];}this.index=this.bag.pop();this.revealed=false;this.answer=null;}
 reveal(shape,atom){this.revealed=shape===this.molecule.shape&&atom===this.molecule.attract;return this.revealed;}
 check(value){if(!this.revealed)return false;this.answer=value;return value===this.molecule.polar;}
}
function positions(m){
 const planar=angles=>angles.map(a=>({x:145*Math.cos(a*Math.PI/180),y:145*Math.sin(a*Math.PI/180),depth:0}));
 if(m.count===1)return [{x:170,y:0,depth:0}];
 switch(m.shape){case 'Linear':return planar([0,180]);case 'Bent':return planar([38,142]);case 'Trigonal planar':return planar([-90,30,150]);case 'Square planar':return planar([0,90,180,270]);
 case 'Tetrahedral':return [[1,1,1],[-1,-1,1],[1,-1,-1],[-1,1,-1]].map(([x,y,z])=>({x:115*(x+.35*z),y:115*(.85*y-.2*z),depth:z}));
 case 'Trigonal pyramidal':return [{x:-142,y:75,depth:0},{x:142,y:75,depth:-1},{x:0,y:130,depth:1}];
 case 'Octahedral':return [{x:-155,y:0,depth:0},{x:155,y:0,depth:0},{x:0,y:-155,depth:0},{x:0,y:155,depth:0},{x:-95,y:78,depth:1},{x:95,y:-78,depth:-1}];
 case 'Trigonal bipyramidal':return [{x:0,y:-155,depth:0},{x:0,y:155,depth:0},{x:-150,y:0,depth:0},{x:100,y:75,depth:1},{x:50,y:-75,depth:-1}];}
}
if(typeof module!=='undefined'&&module.exports)module.exports={Polarity,molecules,positions,shapes};if(typeof document==='undefined')return;
const $=id=>document.getElementById('mp-'+id);if(!$('game'))return;const game=new Polarity();
function feedback(text,ok=false){$('feedback').hidden=!text;$('feedback').textContent=text;$('feedback').classList.toggle('success',ok);}
function diagram(){const m=game.molecule,cx=m.count===1?290:380,cy=225;let s=`<title>${m.name}: ${m.shape.toLowerCase()} with bond dipoles</title><desc>${m.attract==='equal'?'Identical atoms attract bonding electrons equally.':'All bond dipole arrows point towards '+m.attract+'.'}</desc><defs><marker id="mp-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0 L6 3 L0 6 Z" fill="#b67425"/></marker></defs>`;
for(const p of positions(m)){const len=Math.hypot(p.x,p.y),ux=p.x/len,uy=p.y/len,x=cx+p.x,y=cy+p.y,start={x:cx+27*ux,y:cy+27*uy},end={x:x-29*ux,y:y-29*uy};
if(p.depth===1)s+=`<path d="M${start.x} ${start.y} L${end.x-7*uy} ${end.y+7*ux} L${end.x+7*uy} ${end.y-7*ux} Z" class="mp-wedge"/>`;else for(let n=0;n<(m.order||1);n++){const off=(n-((m.order||1)-1)/2)*7;s+=`<line x1="${start.x-off*uy}" y1="${start.y+off*ux}" x2="${end.x-off*uy}" y2="${end.y+off*ux}" class="mp-bond" ${p.depth<0?'stroke-dasharray="4 5"':''}/>`;}
if(m.attract!=='equal'){const inward=m.attract===m.center;const ax=cx+p.x*.31-18*uy,ay=cy+p.y*.31+18*ux,bx=cx+p.x*.76-18*uy,by=cy+p.y*.76+18*ux;const from=inward?{x:bx,y:by}:{x:ax,y:ay},to=inward?{x:ax,y:ay}:{x:bx,y:by};s+=`<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" class="mp-dipole" marker-end="url(#mp-arrowhead)"/><line x1="${from.x-5*uy}" y1="${from.y+5*ux}" x2="${from.x+5*uy}" y2="${from.y-5*ux}" class="mp-dipole"/>`;}
s+=`<text x="${x}" y="${y}" class="mp-atom">${m.outer}</text>`;}
s+=`<text x="${cx}" y="${cy}" class="mp-atom mp-center">${m.center}</text>`;return s;}
function render(){const m=game.molecule;$('name').textContent=m.name;$('formula').textContent=m.formula;$('stage').hidden=!game.revealed;$('placeholder').hidden=game.revealed;$('polarity').disabled=!game.revealed;$('diagram').innerHTML=game.revealed?diagram():'';$('shape-result').textContent=m.shape;$('equal-note').hidden=m.attract!=='equal';for(const [id,value] of [['polar',true],['nonpolar',false]])$(id).setAttribute('aria-pressed',String(game.answer===value));$('check').disabled=!$('shape').value||!$('attraction').value;}
function newQuestion(){const m=game.molecule;$('shape').value='';$('attraction').innerHTML='<option value="">Choose…</option>'+[...new Set([m.center,m.outer])].map(a=>`<option value="${a}">${a}</option>`).join('')+'<option value="equal">Equally attracted</option>';$('attraction').value='';feedback('');render();document.dispatchEvent(new Event('chemi-controls-sync'));}
$('shape').innerHTML='<option value="">Choose…</option>'+shapes.map(s=>`<option value="${s}">${s}</option>`).join('');
for(const id of ['shape','attraction'])$(id).addEventListener('change',()=>{game.revealed=false;game.answer=null;feedback('');render();});
$('check').addEventListener('click',()=>{const shape=$('shape').value,atom=$('attraction').value;if(!shape||!atom)return;if(game.reveal(shape,atom))feedback('Correct. Use the dipole arrows to decide the overall polarity.',true);else{const parts=[];if(shape!==game.molecule.shape)parts.push('Check the molecular shape, taking lone pairs into account.');if(atom!==game.molecule.attract)parts.push('Bonding electrons are attracted towards the more electronegative atom; identical atoms attract equally.');feedback(parts.join(' '));}render();});
for(const [id,value] of [['polar',true],['nonpolar',false]])$(id).addEventListener('click',()=>{if(!game.revealed)return;const correct=game.check(value);feedback(correct?(game.molecule.polar?'Correct — the bond dipoles do not cancel, so the molecule is polar.':game.molecule.attract==='equal'?'Correct — the bond is nonpolar, so the molecule is nonpolar.':'Correct — the bond dipoles cancel in this symmetric shape, so the molecule is nonpolar.'):'Try again. Consider the directions of all the bond dipoles together in three dimensions.',correct);render();});
$('next').addEventListener('click',()=>{game.next();newQuestion();});newQuestion();
})();
