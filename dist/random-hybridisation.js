(function(){
'use strict';
// Domain-based hybridisation model: 2 → sp, 3 → sp², 4 → sp³.
const molecules=[
 {name:'Methane',formula:'CH₄',atom:'C',groups:['H','H','H','H'],orders:[1,1,1,1],lp:0},
 {name:'Ethane',formula:'C₂H₆',atom:'C',groups:['CH₃','H','H','H'],orders:[1,1,1,1],lp:0},
 {name:'Ethene',formula:'C₂H₄',atom:'C',groups:['CH₂','H','H'],orders:[2,1,1],lp:0},
 {name:'Ethyne',formula:'C₂H₂',atom:'C',groups:['CH','H'],orders:[3,1],lp:0},
 {name:'Methanol',formula:'CH₃OH',atom:'O',groups:['CH₃','H'],orders:[1,1],lp:2},
 {name:'Ethanol',formula:'C₂H₅OH',atom:'C',groups:['CH₃','OH','H','H'],orders:[1,1,1,1],lp:0},
 {name:'Methylamine',formula:'CH₃NH₂',atom:'N',groups:['CH₃','H','H'],orders:[1,1,1],lp:1},
 {name:'Methanal',formula:'CH₂O',atom:'C',groups:['O','H','H'],orders:[2,1,1],lp:0},
 {name:'Ethanal',formula:'CH₃CHO',atom:'C',groups:['O','CH₃','H'],orders:[2,1,1],lp:0},
 {name:'Propanone',formula:'CH₃COCH₃',atom:'C',groups:['O','CH₃','CH₃'],orders:[2,1,1],lp:0},
 {name:'Hydrogen cyanide',formula:'HCN',atom:'C',groups:['N','H'],orders:[3,1],lp:0},
 {name:'Carbon dioxide',formula:'CO₂',atom:'C',groups:['O','O'],orders:[2,2],lp:0},
 {name:'Ammonia',formula:'NH₃',atom:'N',groups:['H','H','H'],orders:[1,1,1],lp:1},
 {name:'Water',formula:'H₂O',atom:'O',groups:['H','H'],orders:[1,1],lp:2},
 {name:'Boron trifluoride',formula:'BF₃',atom:'B',groups:['F','F','F'],orders:[1,1,1],lp:0},
 {name:'Ammonium',formula:'NH₄⁺',atom:'N',groups:['H','H','H','H'],orders:[1,1,1,1],lp:0,charge:'+'},
 {name:'Carbonate',formula:'CO₃²⁻',atom:'C',groups:['O','O⁻','O⁻'],orders:[2,1,1],lp:0,charge:'2−',resonance:true},
 {name:'Bromate',formula:'BrO₃⁻',atom:'Br',groups:['O','O','O⁻'],orders:[2,2,1],lp:1,charge:'−',resonance:true,hypervalent:true}
];
class Practice{
 constructor(random=Math.random){this.random=random;this.bag=[];this.index=-1;this.next();}
 next(){if(!this.bag.length){this.bag=molecules.map((_,i)=>i);for(let i=this.bag.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}if(this.bag[this.bag.length-1]===this.index)[this.bag[0],this.bag[this.bag.length-1]]=[this.bag[this.bag.length-1],this.bag[0]];}this.index=this.bag.pop();this.stage=1;this.domains=null;this.hybrid=null;return this.current;}
 get current(){return molecules[this.index];}
 get count(){return this.current.groups.length+this.current.lp;}
 checkDomains(value){if(this.stage!==1)return false;this.domains=Number(value);if(this.domains===this.count){this.stage=2;return true;}return false;}
 checkHybrid(value){if(this.stage!==2)return false;this.hybrid=Number(value);if(this.hybrid===this.count-1){this.stage=3;return true;}return false;}
}
if(typeof module!=='undefined'&&module.exports)module.exports={Practice,molecules};
if(typeof document==='undefined')return;
const $=id=>document.getElementById(id);if(!$('random-hybridisation-game'))return;
const game=new Practice();let domainChoice=null,hybridChoice=null;
function diagram(m){
 const cx=300,cy=190;const angles=m.groups.length===2?[0,180]:m.groups.length===3?[0,120,240]:[0,90,180,270];
 let out='<title>'+m.name+': highlighted '+m.atom+' atom</title><desc>'+m.groups.map((g,i)=>g+' joined by a '+['','single','double','triple'][m.orders[i]]+' bond').join('; ')+'. '+m.lp+' lone pairs on the highlighted atom.</desc>';
 if(m.charge)out+='<path d="M80 35 H65 V355 H80 M520 35 H535 V355 H520" class="rh-bracket"/><text x="548" y="50" class="rh-charge">'+m.charge+'</text>';
 angles.forEach((angle,i)=>{const a=angle*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a),x=cx+145*dx,y=cy+145*dy;for(let b=0;b<m.orders[i];b++){const offset=(b-(m.orders[i]-1)/2)*8;out+='<line class="rh-bond" x1="'+(cx+36*dx-offset*dy)+'" y1="'+(cy+36*dy+offset*dx)+'" x2="'+(x-38*dx-offset*dy)+'" y2="'+(y-38*dy+offset*dx)+'"/>';}out+='<text class="rh-group" x="'+x+'" y="'+y+'">'+m.groups[i]+'</text>';});
 out+='<circle class="rh-target-halo" cx="300" cy="190" r="34"/><text class="rh-target" x="300" y="190">'+m.atom+'</text>';
 for(let p=0;p<m.lp;p++){const a=(m.lp===1?-55:p===0?-90:90)*Math.PI/180;for(const side of [-1,1])out+='<circle class="rh-dot" cx="'+(cx+49*Math.cos(a)-side*6*Math.sin(a))+'" cy="'+(cy+49*Math.sin(a)+side*6*Math.cos(a))+'" r="3.8"/>';}
 return out;
}
function feedback(text,success=false){$('rh-feedback').textContent=text;$('rh-feedback').hidden=!text;$('rh-feedback').classList.toggle('success',success);}
function render(){const m=game.current;$('rh-name').textContent=m.name;$('rh-formula').textContent=m.formula;$('rh-target-label').textContent='Highlighted atom: '+m.atom;$('rh-diagram').innerHTML=diagram(m);
 $('rh-step1').disabled=game.stage!==1;$('rh-step2').disabled=game.stage!==2;
 for(const n of [2,3,4])$('rh-domain-'+n).setAttribute('aria-pressed',String(domainChoice===n));
 for(const n of [1,2,3])$('rh-hybrid-'+n).setAttribute('aria-pressed',String(hybridChoice===n));
 $('rh-check').disabled=game.stage===3||(game.stage===1?domainChoice===null:hybridChoice===null);
 $('rh-check').textContent=game.stage===1?'Check domains':game.stage===2?'Check hybridisation':'Complete';
 $('rh-status1').textContent=game.stage>1?'✓ '+game.count+' domains':'';
 $('rh-status2').textContent=game.stage===1?'Count domains first':game.stage===3?'✓ Correct':'';
 $('rh-specific-info').textContent=(m.resonance?'One resonance contributor is shown. Resonance does not change the number of electron domains here. ':'')+(m.hypervalent?'For bromate, use the school-level domain model: three bonded atoms and one lone pair. The sp³ label describes this four-domain model; hypervalent bonding is more complex than literal sp³ orbital mixing.':'');
}
for(const n of [2,3,4])$('rh-domain-'+n).addEventListener('click',()=>{if(game.stage!==1)return;domainChoice=n;feedback('');render();});
for(const n of [1,2,3])$('rh-hybrid-'+n).addEventListener('click',()=>{if(game.stage!==2)return;hybridChoice=n;feedback('');render();});
$('rh-check').addEventListener('click',()=>{if(game.stage===1&&domainChoice!==null){if(game.checkDomains(domainChoice))feedback('Correct. Now choose the hybridisation.',true);else feedback('Try again. Each bonded atom counts as one domain, even with a double or triple bond. Include each lone pair on the highlighted atom.');}else if(game.stage===2&&hybridChoice!==null){if(game.checkHybrid(hybridChoice))feedback(game.current.groups.length+' bonding domains + '+game.current.lp+' lone-pair domains = '+game.count+' domains → '+['','sp','sp²','sp³'][hybridChoice]+'.',true);else feedback('Try again. The number of hybrid orbitals must match the '+game.count+' electron domains.');}render();});
$('rh-next').addEventListener('click',()=>{game.next();domainChoice=null;hybridChoice=null;feedback('');render();});
render();
})();
