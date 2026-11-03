import {visitorName} from './visitor.js';

const preview = location.hostname.endsWith('.chatgpt.site') || location.hostname === 'terminal.local';
const demoKey='lior-livro-previa-v1';
let dialog;
let demoEntries=[];
try {const value=JSON.parse(localStorage.getItem(demoKey)||'[]'); if(Array.isArray(value)) demoEntries=value} catch {}

async function readPage(before){
  if(preview){
    const rows=demoEntries.filter(row=>before==null||row.id<before);
    return {entries:rows.slice(0,4),next:rows.length>4?rows[3].id:null};
  }
  const response=await fetch('/api/visitas'+(before?'?antes='+before:''),{cache:'no-store'});
  if(!response.ok) throw Error();
  const page=await response.json();
  if(!Array.isArray(page.entries)) throw Error();
  return page;
}

async function sign(entry){
  if(preview){
    if(!demoEntries.some(row=>row.key===entry.key)){
      demoEntries.unshift({...entry,id:(demoEntries[0]?.id||0)+1});
      try {localStorage.setItem(demoKey,JSON.stringify(demoEntries))} catch {}
    }
    return;
  }
  const response=await fetch('/api/visitas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(entry)});
  if(!response.ok || !(await response.json()).saved) throw Error();
}

export function installBook(path,last){
  dialog?.close();
  const chapter=path==='historia' && document.querySelector('#chapter-'+last);
  const notebook=path==='caderno' && document.querySelector('.notebook-page');
  const place=chapter || notebook;
  if(!place) return;
  const invitation=document.createElement('aside');
  invitation.className='visitor-invitation';
  invitation.innerHTML='<button class="visitor-cover"><span>OFICINA BELLAMY</span><strong>Livro<br>de visitas</strong><i>✳</i></button><div><small>NA ÚLTIMA GAVETA</small><h2>Quem passou por aqui.</h2><p></p><button class="book-opener">Abrir o livro ↗</button></div>';
  invitation.querySelector('p').textContent=visitorName()+', antes de fechar o caderno… deixa uma linha sua?';
  invitation.querySelectorAll('button').forEach(button=>button.onclick=openBook);
  place.append(invitation);
}

function openBook(){
  if(dialog?.open) return;
  dialog=document.createElement('dialog');
  dialog.className='visitors-book';
  dialog.setAttribute('aria-labelledby','visitors-title');
  dialog.innerHTML=`<header><div><small>ARQUIVO DA OFICINA · VOLUME I</small><h2 id="visitors-title">Livro de visitas</h2></div><button class="book-close" aria-label="Fechar livro">×</button></header>
  <div class="book-tools"><button data-view="read">Folhear</button><button data-view="write">Assinar a visita</button></div>
  <div class="book-preview" hidden>Este é um livro de teste. Só você vê o que assina aqui.</div>
  <section class="book-leaf"><small class="leaf-no"></small><div class="book-lines"></div><div class="book-nav"><button class="prev">← Anterior</button><button class="next">Próxima →</button></div></section>
  <form class="book-write" hidden><small>UMA LINHA SUA</small><h3>Também passei por aqui.</h3><label>Assinatura<input name="nickname" required maxlength="32" autocomplete="nickname"></label><label>Recado <small>(se quiser)</small><textarea name="message" maxlength="360" rows="3" placeholder="O que ficou com você?"></textarea></label><p class="publication-note"></p><button class="publish-note" type="submit"></button></form>
  <p class="book-status" role="status"></p>`;
  const book=dialog;
  document.body.append(book);
  const $=selector=>book.querySelector(selector);
  const leaf=$('.book-leaf'),form=$('form'),lines=$('.book-lines'),status=$('.book-status');
  const cursors=[null];
  let page=0,next=null,serial=0,loading=false,sending=false,requestKey=null;
  $('.book-preview').hidden=!preview;
  form.nickname.value=visitorName();
  $('.publication-note').textContent=preview?'Teste como a assinatura aparece no livro.':'Seu nome e seu recado vão aparecer aqui pra quem abrir o livro.';
  $('.publish-note').textContent=preview?'Guardar assinatura de teste ↗':'Assinar no livro público ↗';
  function view(writing){
    ++serial;
    leaf.hidden=writing;form.hidden=!writing;status.textContent='';
    $('[data-view="read"]').setAttribute('aria-pressed',String(!writing));
    $('[data-view="write"]').setAttribute('aria-pressed',String(writing));
  }
  function buttons(){
    $('.prev').disabled=loading||page===0;
    $('.next').disabled=loading||next==null;
  }
  async function render(){
    const version=++serial;
    loading=true;next=null;buttons();
    $('.leaf-no').textContent='FOLHA '+String(page+1).padStart(2,'0');
    lines.textContent='Abrindo a folha…';
    try{
      const result=await readPage(cursors[page]);
      if(version!==serial || !book.open)return;
      lines.replaceChildren();next=result.next;
      if(!result.entries.length)lines.textContent='Esta folha ainda está em branco. Que tal ser a primeira pessoa a assinar?';
      for(const entry of result.entries){
        const article=document.createElement('article'),name=document.createElement('strong'),message=document.createElement('p');
        name.textContent=entry.nickname;
        message.textContent=entry.message || 'Passou pela oficina.';
        article.append(name,message);lines.append(article);
      }
      leaf.classList.remove('leaf-turn');void leaf.offsetWidth;leaf.classList.add('leaf-turn');
    }catch{
      if(version!==serial)return;
      lines.textContent='Não foi possível carregar as assinaturas. ';
      const retry=document.createElement('button');retry.textContent='Tentar novamente';retry.onclick=render;lines.append(retry);
    }finally{if(version===serial){loading=false;buttons()}}
  }
  $('.prev').onclick=()=>{if(!loading&&page>0){page--;render()}};
  $('.next').onclick=()=>{if(!loading&&next!=null){cursors[++page]=next;render()}};
  book.onkeydown=e=>{if(!leaf.hidden && ['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();$(e.key==='ArrowLeft'?'.prev':'.next').click()}};
  $('[data-view="read"]').onclick=()=>{view(false);render()};
  $('[data-view="write"]').onclick=()=>{view(true);form.message.focus()};
  form.oninput=()=>{requestKey=null;form.nickname.setCustomValidity('')};
  form.onsubmit=async e=>{
    e.preventDefault();if(sending)return;
    const nickname=form.nickname.value.trim();
    if(!nickname){form.nickname.setCustomValidity('Escreva sua assinatura.');form.nickname.reportValidity();return}
    sending=true;
    const controls=[...form.elements,...book.querySelectorAll('[data-view]')];
    controls.forEach(control=>control.disabled=true);
    status.textContent='Guardando sua assinatura…';
    try{
      if(!requestKey){
        const hex=Array.from(crypto.getRandomValues(new Uint8Array(16)),byte=>byte.toString(16).padStart(2,'0')).join('');
        requestKey=[hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');
      }
      await sign({nickname,message:form.message.value.trim(),key:requestKey});
      if(!book.open)return;
      requestKey=null;form.message.value='';page=0;cursors.splice(1);
      view(false);await render();status.textContent='Pronto. Seu nome ficou no livro.';
    }catch{status.textContent='Ainda não consegui confirmar a assinatura. Seu recado está aqui. Tente de novo.'}
    finally{sending=false;controls.forEach(control=>control.disabled=false)}
  };
  $('.book-close').onclick=()=>book.close();
  book.addEventListener('close',()=>{++serial;book.remove()},{once:true});
  book.showModal();view(false);render();
}
