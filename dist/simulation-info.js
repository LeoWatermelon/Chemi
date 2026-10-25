(()=>{
'use strict';
document.querySelectorAll('[data-simulation-info]').forEach(root=>{
 const button=root.querySelector('[data-info-button]');if(!button)return;
 const dataRoots=['build-atom-game','relative-mass-game','energy-levels-game','atomic-radius-game','shielding-game','electronegativity-game','successive-ie-game','hybridise-yourself-game','dl-game','im-game'];
 const label=dataRoots.includes(root.id)?'data':'details';
 const legacy=button.hasAttribute('data-info-legacy');
 const targets=Array.from(root.querySelectorAll('[data-sim-info]'));
 targets.forEach((target,i)=>{if(!target.id)target.id=root.id+'-optional-info-'+i});
 button.setAttribute('aria-controls',targets.map(target=>target.id).join(' '));
 function sync(shown){root.setAttribute('data-info-open',String(shown));button.setAttribute('aria-pressed',String(shown));button.setAttribute('aria-expanded',String(shown));button.textContent=shown?'Hide '+label:'Show '+label}
 sync(false);
 // Existing simulation listeners run first and retain their model-specific visibility rules.
 button.addEventListener('click',()=>sync(legacy?button.getAttribute('aria-pressed')==='true':root.getAttribute('data-info-open')!=='true'));
});
})();
