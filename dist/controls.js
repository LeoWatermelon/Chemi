(()=>{
'use strict';
let serial=0;const closers=[];
function picker(control,search=false){
 const wrapper=document.createElement('div');wrapper.className='chemi-picker'+(search?' chemi-search':'');control.before(wrapper);wrapper.append(control);
 const list=document.createElement('div');list.id='chemi-options-'+(++serial);list.className='chemi-options';list.role='listbox';list.hidden=true;
 const trigger=search?control:document.createElement('button');if(!search){control.hidden=true;trigger.type='button';trigger.className='chemi-picker-trigger';wrapper.append(trigger)}
 const label=control.getAttribute('aria-label')||control.closest('label')?.firstChild?.textContent.trim()||'Choose an option';trigger.setAttribute('aria-label',label);trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',list.id);if(search){trigger.setAttribute('role','combobox');trigger.setAttribute('aria-autocomplete','list');control.removeAttribute('list')}
 wrapper.append(list);let active=-1,items=[],typeText='',lastKey=0;
 const source=search?document.getElementById('of-element-options'):control;
 function allOptions(){return [...source.options].map(o=>({value:o.value,text:o.textContent||o.value,disabled:o.disabled}))}
 function close(){list.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.removeAttribute('aria-activedescendant')}
 closers.push(close);
 function paint(){list.replaceChildren();items.forEach((o,i)=>{const item=document.createElement('div');item.id=list.id+'-'+i;item.className='chemi-option'+(i===active?' is-active':'');item.role='option';item.textContent=o.text;item.setAttribute('aria-selected',String(o.value===control.value));item.setAttribute('aria-disabled',String(o.disabled));item.addEventListener('pointerdown',e=>e.preventDefault());item.addEventListener('click',e=>{e.preventDefault();choose(i)});list.append(item)});if(!items.length){const empty=document.createElement('div');empty.className='chemi-empty';empty.textContent='No matching elements';list.append(empty)}if(active>=0){trigger.setAttribute('aria-activedescendant',list.id+'-'+active);list.children[active]?.scrollIntoView({block:'nearest'})}else trigger.removeAttribute('aria-activedescendant')}
 function open(filter=false){closers.forEach(c=>c());items=allOptions();if(search&&filter){const q=control.value.trim().toLowerCase();items=items.filter(o=>o.text.toLowerCase().includes(q))}active=items.findIndex(o=>o.value===control.value&&!o.disabled);list.hidden=false;trigger.setAttribute('aria-expanded','true');paint()}
 function sync(){if(!search){trigger.textContent=control.selectedOptions[0]?.textContent||'';trigger.disabled=control.disabled}if(!list.hidden)open(search)}
 function choose(i){const o=items[i];if(!o||o.disabled)return;control.value=o.value;close();control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}));close();sync();trigger.focus()}
 if(search){control.addEventListener('input',()=>open(true));control.addEventListener('click',()=>open(false));control.addEventListener('blur',close)}else trigger.addEventListener('click',e=>{e.preventDefault();list.hidden?open():close()});
 trigger.addEventListener('keydown',e=>{
  const key=e.key;if(key==='Tab'){close();return}if(key==='Escape'){if(!list.hidden){e.preventDefault();e.stopImmediatePropagation();close()}return}
  if(['ArrowDown','ArrowUp','Home','End','Enter',' '].includes(key)&&(!search||key!==' ')){
   if(search&&list.hidden&&key==='Enter')return;e.preventDefault();e.stopImmediatePropagation();
   if(list.hidden){open(search);if(key==='Enter'||key===' ')return}
   if(key==='Enter'||key===' '){choose(active);return}
   const direction=key==='ArrowUp'?-1:1;let next=key==='Home'?0:key==='End'?items.length-1:active+direction;
   for(let tries=0;tries<items.length;tries++){next=(next+items.length)%items.length;if(!items[next].disabled)break;next+=direction}active=items.length?next:-1;paint();
  }else if(!search&&key.length===1){e.preventDefault();if(list.hidden)open();const now=Date.now();typeText=now-lastKey<700?typeText+key:key;lastKey=now;const i=items.findIndex(o=>!o.disabled&&o.text.toLowerCase().startsWith(typeText.toLowerCase()));if(i>=0){active=i;paint()}}
 },true);
 document.addEventListener('chemi-controls-sync',sync);control.addEventListener('change',sync);new MutationObserver(sync).observe(source,{childList:true,subtree:true,attributes:true});sync();
 document.addEventListener('pointerdown',e=>{if(!wrapper.contains(e.target))close()});window.addEventListener('hashchange',close);
}
document.querySelectorAll('select:not([data-periodic-picker])').forEach(s=>picker(s));const search=document.getElementById('of-element');if(search)picker(search,true);
})();
