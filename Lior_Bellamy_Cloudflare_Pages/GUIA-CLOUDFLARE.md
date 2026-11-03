# Publicar a oficina e o livro de visitas

O ZIP é o projeto para Cloudflare Pages. Extraia-o e envie o conteúdo para a raiz do seu repositório GitHub, preservando a estrutura: dist/ contém o site, functions/api/visitas.js é a função pública e schema.sql cria a tabela. O ZIP precisa dessas pastas. Não envie apenas dist/ e não use o upload de arrastar e soltar para este projeto com Functions.

1. No painel Cloudflare, abra D1 e crie um banco, por exemplo oficina-bellamy.
2. Abra o console desse banco, cole o conteúdo de schema.sql e execute. Isso cria a tabela guestbook. Você só precisa fazer isso uma vez.
3. Em Workers & Pages, crie um projeto **Pages**, conecte o repositório e selecione a branch principal. Deixe o diretório raiz padrão, escolha o preset None, deixe o comando de build vazio e use **dist** como diretório de saída. Faça o primeiro deploy.
4. Nas configurações de bindings do projeto Pages, adicione um binding D1 chamado **DB** (em maiúsculas). Selecione o banco criado no passo 1 para produção. Para testar branches de prévia, vincule outro banco de teste nesse ambiente e execute o schema nele.
5. Refaça o deploy para aplicar o binding. Abra /api/visitas no domínio do projeto: com o banco vazio, deve retornar {"entries":[],"next":null}. HTML em vez de JSON indica que a Function não foi publicada. Erro 503 indica que é preciso verificar o binding e a tabela.
6. Entre com um apelido, complete a encomenda e abra o livro no fim do capítulo 12 ou no caderno. Assine, abra o site em outro navegador e confira a entrada. Se preferir, apague essa assinatura de teste em seguida.

## Apagar um recado indesejado

Somente quem tem acesso administrativo ao seu D1 faz a moderação. Não há senha de administrador no JavaScript nem rota pública de exclusão. No console D1 execute:

    SELECT id, nickname, message, created_at FROM guestbook ORDER BY id DESC LIMIT 100;

Confira o ID e o texto da linha. Para apagar **apenas a entrada escolhida**, substitua 123 pelo ID correto:

    DELETE FROM guestbook WHERE id = 123;

A remoção é definitiva. Reabra o livro para atualizar as páginas. Não retire a condição WHERE.

## Dados e prévia

O nome na porta fica no navegador do leitor. Apenas o clique em “Assinar no livro público” envia assinatura e mensagem para o D1. O recado é opcional. As folhas exibem quatro entradas por vez, das mais recentes para as antigas.

O visualizador do ChatGPT usa um livro de demonstração separado por navegador. A versão Pages usa /api/visitas e não finge salvar no dispositivo quando o banco está indisponível. Nenhuma chave ou token do Cloudflare precisa ser incluído no ZIP.

## Se for sua primeira vez no GitHub

Crie um repositório e, nele, use **Add file → Upload files**. Arraste o conteúdo da pasta extraída, confirme com **Commit changes** e veja se aparecem dist, functions e schema.sql lado a lado. No Cloudflare Pages, autorize o acesso a esse repositório ao conectar o GitHub.

## Conferência rápida antes de divulgar

Faça uma assinatura com um recado que você reconheça. Abra o livro no celular ou em uma janela privada, entre com outro apelido e procure esse recado. Depois use a consulta por ID da seção de moderação para apagar o teste e abra o livro novamente. Você pode usar o mesmo procedimento para remover mensagens indesejadas depois.

Documentação do Cloudflare:
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/functions/bindings/
- https://developers.cloudflare.com/d1/get-started/
