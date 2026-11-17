import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
let identity=null;const env={};
const context=vm.createContext({process:{env},URL,JSON,Error,Array,Object,String});
const modules={
 '@supabase/ssr':`export const createServerClient=()=>({auth:{getUser:async()=>({data:{user:globalThis.identity},error:null}),signOut:async()=>({}),signInWithPassword:async()=>({data:{user:globalThis.identity},error:null})}});`,
 'cookie':`export const parse=()=>({});export const serialize=()=>'';`,
 'node:fs':`export const readFileSync=()=>JSON.stringify([{process:'TEST'}]);`
};
const main=new vm.SourceTextModule(readFileSync(new URL('./api/index.mjs',import.meta.url),'utf8'),{context,identifier:import.meta.url,initializeImportMeta:meta=>{meta.url=new URL('./api/index.mjs',import.meta.url).href;}});
await main.link(async name=>{const m=new vm.SourceTextModule(modules[name],{context});await m.link(()=>{});await m.evaluate();return m;});await main.evaluate();
async function request(path,method='GET',body,origin='https://test.example'){
 const headers={};const res={statusCode:200,setHeader:(k,v)=>headers[k]=v,getHeader:k=>headers[k],end:value=>{res.body=value;}};
 await main.namespace.default({url:path,method,body,headers:{host:'test.example',origin}},res);return {...res,headers};
}
assert.equal((await request('/api/processos')).statusCode,503);
Object.assign(env,{SUPABASE_URL:'https://test.invalid',SUPABASE_ANON_KEY:'test',AUTH_USERNAME:'lucas',AUTH_EMAIL:'test@example.invalid',AUTH_USER_ID:'allowed'});
context.identity=null;
assert.equal((await request('/api/processos')).statusCode,401);
assert.equal((await request('/dashboard')).statusCode,303);
context.identity={id:'other'};assert.equal((await request('/api/processos')).statusCode,401);
context.identity={id:'allowed'};const allowed=await request('/api/processos');assert.equal(allowed.statusCode,200);assert.ok(allowed.body.includes('TEST'));assert.match(allowed.headers['Cache-Control'],/no-store/);
assert.equal((await request('/api/login','POST',{username:'lucas',password:'test'},'https://evil.invalid')).statusCode,403);
assert.equal((await request('/api/login','POST',{username:'outro',password:'test'})).statusCode,401);
console.log('Proteções verificadas: configuração ausente, sem sessão, usuário não autorizado, sessão válida e origem inválida.');
