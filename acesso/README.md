# Autoplan — acesso por usuário e senha

A relação é servida somente por rotas autenticadas. Configure SUPABASE_URL, SUPABASE_ANON_KEY, AUTH_USERNAME, AUTH_EMAIL e AUTH_USER_ID no ambiente da Vercel. AUTH_USER_ID deve ser o identificador exato da conta autorizada. O projeto não oferece cadastro público. Enquanto o serviço não estiver configurado, o login fica desativado e as rotas protegidas retornam 503 sem dados.

