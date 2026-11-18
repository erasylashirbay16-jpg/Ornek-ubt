'use strict';
/* End-to-end smoke test for mobile startup and early subject selection.
 * Uses a local static server and does not access protected production sessions.
 */
const { chromium }=require('playwright');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../site');
const addr='http://127.0.0.1:8765/';
const child=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1','--directory',root],{stdio:'ignore'});
const globalTrace={steps:[],errors:[],requests:[]};
const watchdog=setTimeout(()=>{console.error('MOBILE_WATCHDOG '+JSON.stringify(globalTrace));process.exit(5)},70000);

async function waitServer(){
 for(let i=0;i<25;i++){try{const r=await fetch(addr);if(r.ok)return}catch{}
 await new Promise(resolve=>setTimeout(resolve,200))}
 throw Error('Static server did not start');
}
(async()=>{
 await waitServer();
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const captures=[];
 try{
  for(const queuedSubject of [null,'profile']){
   const context=await browser.newContext({viewport:{width:393,height:852},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'kk-KZ'});
   const page=await context.newPage();
   const errors=[],network=[];
   page.on('requestfinished',req=>{const n=req.url().split('/').pop();network.push(n);if(network.length>40)network.shift();globalTrace.requests=network.slice(-25)});
   page.on('requestfailed',req=>errors.push('Failed request '+req.url().split('/').pop()));
   page.on('pageerror',err=>{errors.push(err.message);globalTrace.errors=errors.slice(-20)});
   page.on('console',msg=>{const m=msg.text();if(m.includes('Örnek boot step')){globalTrace.steps.push(m);if(globalTrace.steps.length>30)globalTrace.steps.shift();}if(msg.type()==='error'){errors.push(m);globalTrace.errors=errors.slice(-20)}});
   await page.goto(addr,{waitUntil:'domcontentloaded',timeout:30000});
   const startup=page.locator('#ornek-startup');
   const visible=await startup.isVisible();
   if(visible){
    const box=await startup.boundingBox();
    assert(box&&box.x>=-1&&box.width<=395&&box.height>=700,'Mobile splash is clipped outside viewport');
    assert(await page.locator('#ornek-start-progress').isVisible(),'Startup status must be visible');
    assert(!await page.locator('#boot-status').isVisible(),'Old clipped loading modal must be hidden');
    if(queuedSubject)await page.locator('[data-start-subject="'+queuedSubject+'"]').click();
   }
   try{await page.waitForFunction(()=>{
     const b=document.body;
     return !b.classList.contains('ornek-loading') &&
       !document.querySelector('#ornek-startup') &&
       typeof window.openSubject==='function' &&
       document.getElementById('welcome')?.children.length>0;
   },null,{timeout:33000});}catch(e){
     console.error('MOBILE_STARTUP_DIAGNOSTIC '+JSON.stringify({errors:errors.slice(-35),lastAssets:network.slice(-35)}));
     throw e;
   }
   assert(!errors.some(x=>x.includes('Örnek startup error')),'Startup crash: '+errors.join('; '));
   if(queuedSubject){
    await page.waitForFunction(()=>!document.body.classList.contains('on-welcome'),null,{timeout:9000});
    const main=await page.locator('#main-content').innerText();
    assert(/Математика/.test(main),'Early-selected mathematics did not open');
   }else{
    const hero=page.locator('#welcome .arch-hero');
    assert(await hero.isVisible(),'Landing hero must be visible');
    const rect=await hero.boundingBox();
    assert(rect&&rect.width>250,'Main site content should use mobile viewport');
   }
   captures.push({queuedSubject:queuedSubject||'none',startupShown:visible,loaded:true,errors:errors.slice(0,5)});
   await context.close();
  }
  console.log('MOBILE_STARTUP_PASS '+JSON.stringify(captures));
 }finally{await browser.close()}
})().catch(err=>{console.error('MOBILE_STARTUP_FAIL',err);console.error('MOBILE_FINAL_TRACE '+JSON.stringify(globalTrace));process.exitCode=1})
 .finally(()=>{clearTimeout(watchdog);child.kill('SIGTERM')});
