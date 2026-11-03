const key='lior-visitor-v1';
let name='';
try { name=(localStorage.getItem(key)||'').trim().slice(0,32); } catch {}
export const visitorName=()=>name;
export function rememberName(value){
  name=value.trim().slice(0,32);
  try {localStorage.setItem(key,name)} catch {}
}
