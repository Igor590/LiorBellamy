const main=document.querySelector('#main');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const header=document.querySelector('.masthead');
const menu=document.querySelector('.menu-toggle');
const search=document.querySelector('#search-dialog');
const input=document.querySelector('#search-input');
const results=document.querySelector('#search-results');
let entries=[],observer;
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalized=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function closeMenu(){header.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');menu.textContent='Menu +';menu.setAttribute('aria-label','Abrir menu')}
menu.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Fechar −':'Menu +';menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu')});
header.querySelector('nav').addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
document.querySelector('.search-toggle').addEventListener('click',()=>{search.showModal();input.focus();renderSearch()});
document.querySelector('.search-close').addEventListener('click',()=>search.close());
search.addEventListener('click',e=>{if(e.target===search){const r=search.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)search.close()}});
input.addEventListener('input',renderSearch);
results.addEventListener('click',e=>{if(e.target.closest('a'))search.close()});
document.addEventListener('keydown',e=>{if(document.body.classList.contains('arrival-mode'))return;if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();if(!search.open)search.showModal();input.focus();renderSearch()}if(e.key==='Escape')closeMenu()});
function renderSearch(){const q=normalized(input.value.trim());const found=q?entries.filter(x=>normalized(x.title+' '+x.text).includes(q)):[];document.querySelector('#search-status').textContent=q?`${found.length} ${found.length===1?'página encontrada':'páginas encontradas'}`:'Pesquise na história, nas cenas extras, na ficha e nas anotações.';results.innerHTML=found.map(x=>{const pos=normalized(x.text).indexOf(q),start=Math.max(0,pos-55),excerpt=x.text.slice(start,start+160);return `<a class="search-result" href="${x.href}"><small>${safe(x.label)}</small><h3>${safe(x.title)}</h3><p>${start?'…':''}${safe(excerpt)}${start+160<x.text.length?'…':''}</p></a>`}).join('')}
const topButton=document.querySelector('.back-top');topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduce.matches?'instant':'smooth'}));
let scrollQueued=false;
window.addEventListener('scroll',()=>{if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{scrollQueued=false;topButton.classList.toggle('visible',scrollY>650);const pos=document.querySelector('.read-position'),paper=document.querySelector('.reader-paper');if(pos&&paper){const total=Math.max(1,paper.offsetHeight-innerHeight+100);const pct=Math.max(0,Math.min(100,Math.round((scrollY-paper.offsetTop)/total*100)));pos.textContent=`${pct}% desta leitura`}})},{passive:true});
document.addEventListener('click',e=>{const b=e.target.closest('#focus-reading');if(b){const active=document.body.classList.toggle('focus-mode');b.setAttribute('aria-pressed',String(active));b.textContent=active?'Sair do foco':'Foco'}});
export function enhance(data){closeMenu();document.body.classList.remove('focus-mode');observer?.disconnect();if(!entries.length){entries=[...data.chapters.map((c,i)=>({title:c.title,text:c.paragraphs.join(' '),href:`#/historia/${i+1}`,label:`CAPÍTULO ${String(i+1).padStart(2,'0')}`})),...data.scenes.map((c,i)=>({title:c.title,text:c.paragraphs.join(' '),href:`#/extras/${i+1}`,label:'ENTRELINHAS'})),...Object.entries(data.profile).map(([k,v])=>({title:k,text:v,href:'#/lior',label:'QUEM É LIOR'})),...data.notes.map((n,i)=>({title:`Anotação ${i+1}`,text:n,href:'#/caderno',label:'O CADERNO'})),...data.curiosities.map((n,i)=>({title:`Curiosidade ${i+1}`,text:n,href:'#/caderno',label:'NAS MARGENS'}))]}
if(!reduce.matches&&'IntersectionObserver' in window){observer=new IntersectionObserver(items=>items.forEach(item=>{if(item.isIntersecting){item.target.classList.add('revealed');observer.unobserve(item.target)}}),{threshold:.08});main.querySelectorAll('.opening,.shelf,.quote-strip,.profile-opener,.traits,.behavior-section,.wishes,.curiosities,.extra-row,.influences,.credit-note').forEach(el=>{el.classList.add('reveal-ready');observer.observe(el)})}
const index=main.querySelector('.reader-index');if(index){const p=document.createElement('p');p.className='read-position';p.textContent='0% desta leitura';index.append(p)}
}
