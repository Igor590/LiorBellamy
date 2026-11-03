const PAGE_SIZE = 4;
const json = (data, status = 200) => Response.json(data, {
  status, headers: {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
});

export async function onRequest({request, env}) {
  if (!env.DB) return json({error:'Livro indisponível. Tente novamente mais tarde.'},503);
  try {
    if (request.method === 'GET') {
      const before = new URL(request.url).searchParams.get('antes');
      if (before !== null && (!/^\d+$/.test(before) || !Number.isSafeInteger(Number(before)))) {
        return json({error:'Página inválida.'},400);
      }
      const {results} = await env.DB.prepare(
        'SELECT id, nickname, message FROM guestbook WHERE id < ? ORDER BY id DESC LIMIT ?'
      ).bind(before === null ? Number.MAX_SAFE_INTEGER : Number(before), PAGE_SIZE+1).all();
      const entries = results.slice(0,PAGE_SIZE);
      return json({entries,next:results.length>PAGE_SIZE ? entries.at(-1).id : null});
    }
    if (request.method !== 'POST') return json({error:'Método não permitido.'},405);
    if (request.headers.get('origin') !== new URL(request.url).origin) return json({error:'Origem inválida.'},403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({error:'Formato inválido.'},415);
    // Bound the body even when Content-Length is absent.
    const reader=request.body?.getReader();
    if (!reader) return json({error:'Assinatura vazia.'},400);
    let bytes=0, raw='';
    const decoder=new TextDecoder();
    for (;;) {
      const {done,value}=await reader.read(); if(done) break;
      bytes+=value.length;
      if(bytes>4096){await reader.cancel();return json({error:'Recado muito longo.'},413)}
      raw+=decoder.decode(value,{stream:true});
    }
    let data;
    try { data=JSON.parse(raw+decoder.decode()); } catch { return json({error:'Formato inválido.'},400); }
    const nickname=typeof data?.nickname==='string'?data.nickname.trim():'';
    const message=typeof data?.message==='string'?data.message.trim():null;
    if(!nickname || nickname.length>32 || /[\u0000-\u001f\u007f]/.test(nickname) || message===null || message.length>360 ||
       !/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(data?.key||'')) return json({error:'Confira o nome e o tamanho do recado.'},400);
    await env.DB.prepare('INSERT INTO guestbook(request_key,nickname,message) VALUES(?,?,?) ON CONFLICT(request_key) DO NOTHING')
      .bind(data.key,nickname,message).run();
    return json({saved:true},201);
  } catch {return json({error:'Não foi possível abrir o livro agora. Tente novamente.'},503)}
}
