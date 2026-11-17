# Autoplan — acesso por usuário e senha

A aplicação usa um servidor Node.js independente de provedor de hospedagem. Execute `npm install` e `npm start` na pasta `acesso`. A porta vem da variável `PORT` (padrão 3000). Publique atrás de HTTPS; os cookies de sessão exigem conexão segura.

Configure SUPABASE_URL, SUPABASE_ANON_KEY, AUTH_USERNAME, AUTH_EMAIL e AUTH_USER_ID nas variáveis de ambiente da hospedagem escolhida. O nome de usuário é associado no servidor à conta autorizada no Supabase. AUTH_USER_ID deve ser o identificador exato dessa conta. Não há cadastro público. Nunca salve senhas ou chaves no repositório.

Enquanto a autenticação não estiver configurada, a tela informa que a ativação está pendente, o botão Entrar fica desativado e as rotas protegidas retornam 503 sem dados.

Os arquivos `private/panel.html`, `private/data.json` e `private/conferencia.md` não estão incluídos nesta versão do código. Sua transferência depende da autorização específica do proprietário. São lidos somente pelas rotas autenticadas; o servidor não publica diretórios ou arquivos arbitrários.

Verificação: `npm test` testa acesso sem configuração, ausência de sessão, identidade não autorizada, identidade autorizada e origem inválida.

