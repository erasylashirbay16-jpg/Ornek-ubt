'use strict';
/* Non-destructive Örnek site checks. node scripts/site-health.cjs local|remote */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../site');
const base=(process.env.ORNEK_BASE_URL||'https://ornek-ubt.vercel.app').replace(/\/+$/,'');
function scriptsFrom(text){
 const found=text.match(/const\s+scripts\s*=\s*\[([\s\S]*?)\];/);
 assert(found,'Missing ordered startup script list in boot.js');
 const names=[...found[1].matchAll(/'([^']+\.js)'/g)].map(m=>m[1]);
 assert(names.length>=40,'Startup script list unexpectedly short');
 assert.equal(new Set(names).size,names.length,'Duplicate scripts in startup list');
 return names;
}
function assetsFrom(html){
 const names=new Set();
 for(const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["']/g)){
  const raw=m[1].split(/[?#]/)[0];
  if(!raw||/^(?:https?:|data:|\/\/)/i.test(raw))continue;
  const name=raw.replace(/^\/+/,'');
  if(/\.(?:js|css|png|jpg|webp|svg|woff2?|ico)$/i.test(name))names.add(name);
 }
 return [...names];
}
function local(){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const boot=fs.readFileSync(path.join(root,'boot.js'),'utf8');
 const vercel=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));
 assert(/<title>[^<]*(?:рнек|rnek)/i.test(html),'Wrong or missing site title');
 assert(/src=["']boot\.js/.test(html),'index.html must load boot.js');
 assert.equal(vercel.version,2,'Invalid vercel.json version');
 const assets=[...new Set([...scriptsFrom(boot),...assetsFrom(html),'boot.js','index.html'])];
 let bytes=0;const errors=[];
 for(const name of assets){
  const file=path.resolve(root,name);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){errors.push('Missing '+name);continue}
  if(name.endsWith('.js')){
   const source=fs.readFileSync(file,'utf8');bytes+=Buffer.byteLength(source);
   try{new vm.Script(source,{filename:file})}catch(e){errors.push('Syntax '+name+': '+e.message)}
  }
 }
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('PASS source: '+assets.length+' assets; '+(bytes/1048576).toFixed(2)+' MiB JS');
 if(bytes>5*1048576)console.warn('WARN large startup payload: consider lazy loading.');
}
async function ask(url,method='HEAD'){
 let previous;
 for(let attempt=0;attempt<2;attempt++){
  try{
   const res=await fetch(url,{method,redirect:'follow',headers:{'User-Agent':'Ornek-Health-Check/1.0'},signal:AbortSignal.timeout(12000)});
   if([429,500,502,503,504].includes(res.status)&&attempt===0)continue;
   return res;
  }catch(e){previous=e}
 }
 throw previous||Error('Repeated network failure '+url);
}
async function remote(){
 const parsed=new URL(base);
 assert(parsed.protocol==='https:','HTTPS required');
 assert(parsed.hostname==='ornek-ubt.vercel.app'||process.env.ORNEK_ALLOW_PREVIEW==='1','Unexpected host');
 const home=await ask(base+'/','GET');
 assert.equal(home.status,200,'Homepage returned '+home.status);
 assert((home.headers.get('content-type')||'').includes('text/html'),'Homepage is not HTML');
 const html=await home.text();
 assert(/<title>[^<]*(?:рнек|rnek)/i.test(html),'Unexpected homepage content');
 const boot=await ask(base+'/boot.js','GET');
 assert.equal(boot.status,200,'boot.js returned '+boot.status);
 const assets=[...new Set([...scriptsFrom(await boot.text()),...assetsFrom(html)])];
 const failed=[];let next=0;
 async function worker(){
  while(next<assets.length){
   const name=assets[next++];
   try{
    const res=await ask(base+'/'+name);
    if(res.status!==200)failed.push(name+': HTTP '+res.status);
    else if(name.endsWith('.js')&&(res.headers.get('content-type')||'').includes('text/html'))failed.push(name+': received HTML instead of JS');
   }catch(e){failed.push(name+': '+e.message)}
  }
 }
 await Promise.all(Array.from({length:Math.min(5,assets.length)},worker));
 const api=await ask(base+'/api/chat','GET');
 if(api.status!==405)failed.push('/api/chat GET expected 405, got '+api.status);
 assert.equal(failed.length,0,failed.join('\n'));
 console.log('PASS live: homepage, '+assets.length+' static assets, and API method guard.');
}
(async()=>{if(process.argv[2]==='local')local();else if(process.argv[2]==='remote')await remote();else throw Error('Use local or remote')})().catch(err=>{console.error(err.stack||err);process.exitCode=1});
