import { createServerClient } from '@supabase/ssr';
import { parse, serialize } from 'cookie';
import { readFileSync } from 'node:fs';

const configured=()=>['SUPABASE_URL','SUPABASE_ANON_KEY','AUTH_USERNAME','AUTH_EMAIL','AUTH_USER_ID'].every(k=>process.env[k]);
function client(req,res){
 const jar=parse(req.headers.cookie||'');
 return createServerClient(process.env.SUPABASE_URL,process.env.SUPABASE_ANON_KEY,{cookies:{
  getAll:()=>Object.entries(jar).map(([name,value])=>({name,value})),
  setAll:items=>{for(const x of items)jar[x.name]=x.value;const prior=res.getHeader('Set-Cookie')||[];res.setHeader('Set-Cookie',[...(Array.isArray(prior)?prior:[prior]),...items.map(({name,value,options})=>serialize(name,value,{...options,httpOnly:true,secure:true,sameSite:'lax',path:'/'}))]);}
 }});
}
function json(res,status,body){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body));}
async function body(req){if(req.body&&typeof req.body==='object')return req.body;let value='';for await(const p of req){value+=p;if(value.length>8192)throw Error('body');}return JSON.parse(value||'{}');}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
 const path=new URL(req.url,'https://localhost').pathname;
 if(path==='/api/status')return json(res,200,{configured:configured()});
 if(!configured())return json(res,503,{error:'O acesso está em configuração. A relação permanece protegida.'});
 try{
  if(req.method==='POST'){
   const origin=req.headers.origin;const host=req.headers['x-forwarded-host']||req.headers.host;
   if(!origin||new URL(origin).host!==host)return json(res,403,{error:'Solicitação não permitida.'});
  }
  const supabase=client(req,res);
  if(path==='/api/login'&&req.method==='POST'){
   const {username,password}=await body(req);
   if(typeof username!=='string'||typeof password!=='string'||password.length>256||username.trim().toLowerCase()!==process.env.AUTH_USERNAME.toLowerCase())return json(res,401,{error:'Usuário ou senha inválidos.'});
   const {data,error}=await supabase.auth.signInWithPassword({email:process.env.AUTH_EMAIL,password});
   if(error||data.user?.id!==process.env.AUTH_USER_ID){await supabase.auth.signOut();return json(res,401,{error:'Usuário ou senha inválidos.'});}
   return json(res,200,{ok:true,redirect:'/dashboard'});
  }
  if(path==='/api/logout'&&req.method==='POST'){await supabase.auth.signOut();return json(res,200,{ok:true});}
  if(req.method!=='GET')return json(res,405,{error:'Método não permitido.'});
  const {data,error}=await supabase.auth.getUser();
  if(error||data.user?.id!==process.env.AUTH_USER_ID){if(path==='/dashboard'){res.statusCode=303;res.setHeader('Location','/');res.end();return;}return json(res,401,{error:'Entre para consultar a relação.'});}
  if(path==='/api/processos'){res.setHeader('Content-Type','application/json; charset=utf-8');res.end(readFileSync(new URL('../private/data.json',import.meta.url)));return;}
  if(path==='/relatorio'){res.setHeader('Content-Type','text/markdown; charset=utf-8');res.setHeader('Content-Disposition','attachment; filename="autoplan-conferencia.md"');res.end(readFileSync(new URL('../private/conferencia.md',import.meta.url)));return;}
  if(path==='/dashboard'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(readFileSync(new URL('../private/panel.html',import.meta.url)));return;}
  return json(res,404,{error:'Página não encontrada.'});
 }catch{return json(res,503,{error:'Não foi possível concluir o acesso. Tente novamente mais tarde.'});}
}

