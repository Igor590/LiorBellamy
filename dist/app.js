import {visitorName} from './visitor.js';
import {installBook} from './guestbook.js';
import {exploreRoute,noteExtras} from './discoveries.js';
import {entrance,mountEntrance} from './entrance.js';
let disposeEntrance=()=>{},entryPassed=false;
try{entryPassed=localStorage.getItem('lior-entry-v1')==='true'}catch{}
import {drawer,mountDrawer} from './drawer.js';
let disposeDrawer=()=>{};
import {enhance} from './atelier.js';
import {home,contents,reader,profile,notebook,extras,credits,esc} from './views.js';
import {doodle} from './art.js';
const main=document.querySelector('#main');
const storage={get(k,fallback=null){try{return localStorage.getItem('lior-'+k)??fallback}catch{return fallback}},set(k,v){try{localStorage.setItem('lior-'+k,v)}catch{}}};
let data,activeNote=0,curiosity=0,currentRead=[],timer;
let fontSize=Math.max(16,Math.min(24,Number(storage.get('font','19'))||19));
function toast(message){const t=document.querySelector('.toast');t.textContent=message;t.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>t.classList.remove('show'),2800)}
function route(){
 if(location.hash&&!location.hash.startsWith('#/')&&!main.querySelector('.loading'))return;
 disposeDrawer();disposeEntrance();
 const [path='',key]=location.hash.replace(/^#\/?/,'').split('/');
 if(!entryPassed||!visitorName()||path==='entrada'){
  const destination=path==='entrada'?'#/':(location.hash.startsWith('#/')?location.hash:'#/');
  document.body.classList.remove('reader-mode','night','focus-mode');document.body.classList.add('arrival-mode');
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  main.innerHTML=entrance();document.title='A porta da oficina — Lior Bellamy';
  window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});
  disposeEntrance=mountEntrance(()=>{entryPassed=true;try{localStorage.setItem('lior-entry-v1','true')}catch{}history.replaceState(null,'',destination);route()});
  return;
 }
 document.body.classList.remove('arrival-mode');
 const isReader=(path==='historia'||path==='extras')&&!!key;
 document.body.classList.toggle('reader-mode',isReader);
 document.body.classList.toggle('night',storage.get('night')==='true');
 document.documentElement.style.setProperty('--body-size',fontSize+'px');
 document.querySelectorAll('[data-route]').forEach(a=>{if(a.dataset.route===path)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 currentRead=[];
 if(path==='historia'||path==='extras'){
  if(key){main.innerHTML=reader(data,key,path==='extras');const list=path==='extras'?data.scenes:data.chapters;const n=Math.max(1,Math.min(list.length,parseInt(key)||1));currentRead=key==='tudo'?list:[list[n-1]];if(path==='historia'&&key!=='tudo')storage.set('chapter',n)}
  else main.innerHTML=path==='historia'?contents(data):extras(data);
 }else if(path==='lior')main.innerHTML=profile(data);
 else if(path==='caderno'){curiosity=0;main.innerHTML=notebook(data);}
 else if(path==='oficina')main.innerHTML=drawer();
 else if(path==='creditos')main.innerHTML=credits();
 else main.innerHTML=home(data,Math.max(0,Math.min(12,Number(storage.get('chapter','0'))||0)));
 const names={oficina:'A gaveta dos talvez',historia:'A história',lior:'Quem é Lior',caderno:'O caderno dos talvez',extras:'Entrelinhas',creditos:'Referências & créditos'};
 document.title=`${names[path]||'A coleção dos talvez'} — Lior Bellamy`;
 window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});
 updateFontButtons();enhance(data);exploreRoute(path);installBook(path,data.chapters.length);if(path==='oficina')disposeDrawer=mountDrawer();
 if(location.hash==='#intro')document.querySelector('#intro')?.scrollIntoView();
}
function updateFontButtons(){const down=document.querySelector('#font-down'),up=document.querySelector('#font-up');if(down)down.disabled=fontSize<=16;if(up)up.disabled=fontSize>=24;const theme=document.querySelector('#reader-theme');if(theme)theme.setAttribute('aria-pressed',String(document.body.classList.contains('night')))}
const dialog=document.querySelector('#note-dialog');
function openNote(index){document.querySelector('#note-body').classList.remove('show-note-back','paper-turning');activeNote=(index+data.notes.length)%data.notes.length;const icons=['moon','bird','lamp','flower','flower','box','letter','bird'];document.querySelector('#note-body').innerHTML=`<p class="dialog-heading" id="note-title">CADERNO DOS TALVEZ · FOLHA ${String(activeNote+1).padStart(2,'0')}</p><div class="dialog-doodle">${doodle(icons[activeNote])}</div><p class="dialog-quote">${esc(data.notes[activeNote])}</p><p class="dialog-signature">L. Bellamy</p>${noteExtras(activeNote)}<div class="note-turner"><button data-turn="-1">← Folha anterior</button><button data-turn="1">Próxima folha →</button></div>`;dialog.setAttribute('aria-labelledby','note-title');if(!dialog.open)dialog.showModal();else document.querySelector('.close-dialog').focus()}
document.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close()}});
document.addEventListener('click',async e=>{
 const note=e.target.closest('[data-note]');if(note){openNote(Number(note.dataset.note));return}
 const turn=e.target.closest('[data-turn]');if(turn){openNote(activeNote+Number(turn.dataset.turn));return}
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='wind'){const art=document.querySelector('.cover-art');art.classList.remove('is-winding');void art.offsetWidth;art.classList.add('is-winding');const label=document.querySelector('.wind-caption');label.textContent='“Você viu? Ele tentou.”';setTimeout(()=>art.classList.remove('is-winding'),1800)}
 if(b.id==='font-up'||b.id==='font-down'){fontSize=Math.min(24,Math.max(16,fontSize+(b.id==='font-up'?1:-1)));storage.set('font',fontSize);document.documentElement.style.setProperty('--body-size',fontSize+'px');updateFontButtons()}
 if(b.id==='reader-theme'){const dark=document.body.classList.toggle('night');storage.set('night',String(dark));updateFontButtons()}
 if(b.id==='copy-text'){try{await navigator.clipboard.writeText(currentRead.map(c=>c.title+'\n\n'+c.paragraphs.join('\n\n')).join('\n\n'));toast('Texto copiado.')}catch{toast('Selecione o texto para copiar pelo navegador.')}}
 if(b.id==='cur-next'||b.id==='cur-prev'){curiosity=(curiosity+(b.id==='cur-next'?1:-1)+data.curiosities.length)%data.curiosities.length;document.querySelector('#curiosity-counter').textContent=String(curiosity+1).padStart(2,'0')+' / 20';document.querySelector('#curiosity-text').textContent=data.curiosities[curiosity]}
});
window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close();route()});
try{const response=await fetch('./data/content.json');if(!response.ok)throw Error('content');data=await response.json();route()}catch{main.innerHTML='<div class="page-intro" style="padding:60px 7%"><h1>O caderno não abriu.</h1><p>Recarregue a página para tentar novamente.</p><button class="ink-button" onclick="location.reload()">Tentar novamente</button></div>'}
