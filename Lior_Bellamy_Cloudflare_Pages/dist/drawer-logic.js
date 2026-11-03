export const pieces=[
{id:'spring',name:'Mola de bolso',tag:'PEÇA Nº 17',hint:'Encontrei enrolada no fundo do bolso. Continua querendo sair de lá.',symbol:'◎'},
{id:'gear',name:'Roda dentada',tag:'PEÇA Nº 04',hint:'Um dente está mais gasto que os outros. Não é defeito. Eu acho.',symbol:'⚙'},
{id:'bell',name:'Sininho de latão',tag:'PEÇA Nº 23',hint:'Maela disse que este já bastava. Ainda estou pensando no assunto.',symbol:'♧'},
{id:'turbo',name:'Roda apressada',tag:'PEÇA Nº 09',hint:'Anotei “economiza tempo”. Alguém escreveu “de quem?” logo embaixo.',symbol:'↯'},
{id:'hammer',name:'Segundo martelo',tag:'PEÇA Nº 31',hint:'Guardei para garantir. Garantir o quê? Não lembro.',symbol:'⌁'},
{id:'feather',name:'Pena azul',tag:'ACHADO Nº 06',hint:'Caiu do pássaro. Ele insiste que foi de propósito.',symbol:'❧'}
];
export function evaluate(ids){const s=new Set(ids);if(!s.has('spring'))return {ok:false,state:'still',message:'A chave girou livre. Lá dentro, nada respondeu.'};if(!s.has('gear'))return {ok:false,state:'loose',message:'Um zrrr curto. Algo se desenrolou, mas o resto ficou parado.'};if(!s.has('bell'))return {ok:false,state:'quiet',message:'O mecanismo girou. Um toc seco na madeira. Nenhum sino.'};if(s.has('turbo')||s.has('hammer'))return {ok:false,state:'busy',message:s.has('turbo')?'Trim-trim-trim! O mecanismo deu mais voltas do que o pedido precisava.':'Trim… trim! A primeira batida foi perfeita. A segunda não estava no pedido.'};return {ok:true,state:'balanced',message:s.has('feather')?'Um toque. Depois, silêncio. A pena balançou na tampa. Nem todo detalhe precisa ter uma função.':'Um toque. Depois, silêncio. A caixinha fez exatamente o que foi pedido. Talvez já esteja pronta.'}}
