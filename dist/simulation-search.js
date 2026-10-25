(()=>{
'use strict';
function normalise(text){return text.normalize('NFKD').replace(/σ/g,' sigma ').replace(/π/g,' pi ').replace(/ionization/gi,'ionisation').replace(/hybridization/gi,'hybridisation').replace(/[^a-z0-9]+/gi,' ').toLowerCase().trim();}
function search(items,query){const words=normalise(query).split(/\s+/).filter(Boolean);return items.map(item=>{const name=normalise(item.name),all=normalise(item.name+' '+item.category+' '+item.description+' '+(item.aliases||''));return {item,match:words.every(w=>all.includes(w)),rank:words.length?(name===normalise(query)?100:0)+words.reduce((score,w)=>score+(name.startsWith(w)?8:name.includes(w)?4:0),0):0};}).filter(r=>r.match).sort((a,b)=>b.rank-a.rank||a.item.name.localeCompare(b.item.name)).map(r=>r.item);}
if(typeof module!=='undefined'&&module.exports)module.exports={normalise,search};
if(typeof document==='undefined')return;
const button=document.getElementById('simulation-search-open'),dialog=document.getElementById('simulation-search-dialog'),input=document.getElementById('simulation-search-input'),list=document.getElementById('simulation-search-results'),count=document.getElementById('simulation-search-count');
if(!button)return;
const items=[],seen=new Set();
for(const card of document.querySelectorAll('a.simulation-card')){const href=card.getAttribute('href');if(!href||seen.has(href))continue;seen.add(href);const route=href.slice(1),page=pages[route];let parent=page&&page.parent,parts=[];while(parent&&parent!=='home'&&pages[parent]){parts.unshift(pages[parent].title);parent=pages[parent].parent;}
items.push({href,name:card.querySelector('.simulation-card-title').textContent.trim(),description:card.querySelector('.simulation-card-description').textContent.trim(),category:parts.join(' › '),aliases:route.replace(/[-/]/g,' ')});}
function render(){const results=search(items,input.value);list.replaceChildren();count.textContent=results.length+' simulation'+(results.length===1?'':'s');if(!results.length){const empty=document.createElement('p');empty.className='ss-empty';empty.textContent='No simulations found. Try another name or topic.';list.append(empty);return;}
for(const item of results){const a=document.createElement('a');a.href=item.href;a.className='ss-result';const name=document.createElement('strong'),category=document.createElement('span'),description=document.createElement('p');name.textContent=item.name;category.textContent=item.category;description.textContent=item.description;a.append(name,category,description);list.append(a);}}
button.addEventListener('click',()=>{input.value='';render();dialog.showModal();input.focus();});
document.getElementById('simulation-search-close').addEventListener('click',()=>dialog.close());
input.addEventListener('input',render);
input.addEventListener('keydown',e=>{const first=list.querySelector('a');if(e.key==='ArrowDown'&&first){e.preventDefault();first.focus();}else if(e.key==='Enter'&&first){e.preventDefault();first.click();}});
list.addEventListener('click',e=>{if(e.target.closest('a'))dialog.close();});
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();});
window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close();});
})();
