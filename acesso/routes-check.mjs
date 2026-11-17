import vm from 'node:vm';
import * as http from 'node:http';
import * as fs from 'node:fs';
import * as url from 'node:url';
import assert from 'node:assert/strict';

const context = vm.createContext({ URL, Set, Number, process: { argv: [], env: {} } });
const libraries = { 'node:http': http, 'node:fs': fs, 'node:url': url };
const main = new vm.SourceTextModule(fs.readFileSync(new URL('./server.mjs', import.meta.url), 'utf8'), {
  context,
  initializeImportMeta: meta => { meta.url = new URL('./server.mjs', import.meta.url).href; }
});
await main.link(async name => {
  if (name === './api/index.mjs') {
    return new vm.SyntheticModule(['default'], function () {
      this.setExport('default', async (_req, res) => { res.statusCode = 503; res.end('Configuração pendente'); });
    }, { context });
  }
  const library = libraries[name];
  return new vm.SyntheticModule(Object.keys(library), function () {
    for (const key of Object.keys(library)) this.setExport(key, library[key]);
  }, { context });
});
await main.evaluate();
const server = main.namespace.createAppServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
try {
  const login = await fetch(base);
  assert.equal(login.status, 200);
  assert.match(await login.text(), /Nome de usuário/);
  for (const path of ['/private/data.json', '/private/panel.html', '/private/conferencia.md', '/.env', '/api/index.mjs', '/data.json']) {
    assert.equal((await fetch(base + path)).status, 404, path);
  }
  assert.equal((await fetch(base + '/api/processos')).status, 503);
  assert.equal((await fetch(base + '/dashboard')).status, 503);
  console.log('Rotas verificadas: tela de login disponível e arquivos privados inacessíveis.');
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
