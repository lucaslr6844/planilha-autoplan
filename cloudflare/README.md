# Autoplan na Cloudflare

Worker com login próprio e armazenamento D1. Não depende de Vercel ou Supabase. Esta pasta não inclui dados privados de processos nem credenciais.

1. Criar o banco D1 e executar `schema.sql` uma única vez.
2. Vincular o banco ao Worker com o nome `DB`.
3. Publicar `worker.mjs` como Worker ES Module.
4. O proprietário deve cadastrar pessoalmente um segredo `SETUP_KEY` de pelo menos 32 caracteres nas configurações do Worker. Não enviar esse segredo pela conversa.
5. Até o prazo `SETUP_DEADLINE`, abrir `/setup` e informar pessoalmente o segredo, o usuário e a senha desejados. A primeira conta encerra permanentemente o cadastro. Excluir `SETUP_KEY` depois de criar a conta.
6. Entrar pela página inicial com o usuário e senha cadastrados. A relação pode ser importada pelo proprietário autenticado. A migração dos dados ainda depende de autorização específica.

Senhas usam scrypt com salt aleatório, N=65.536, r=8 e p=2. Sessões opacas de oito horas são mantidas no D1 somente como SHA-256; cookies são Secure, HttpOnly e SameSite=Strict. Todas as operações que alteram dados exigem origem exata, corpo JSON e sessão quando aplicável. Há limite de tentativas de login e instalação. Não existe cadastro público após a primeira conta. Nenhuma senha é registrada em logs.

O domínio personalizado depende de sua configuração DNS. O endereço workers.dev pode ser usado enquanto isso.
