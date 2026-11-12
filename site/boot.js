/* Guest data remains local; signed-in data is namespaced and synced only to its owner. */
(async()=>{
const scripts=['questions-hard.js','questions-hard-extra.js','questions-hard-next.js','questions-new.js','questions-materials.js','questions-2026-400.js','questions-diverse.js','questions-expanded.js','questions-quality.js','math-literacy-fresh-800.js','app.js','features.js','polish.js','qadam.js','test-variants.js','tests.js','workspace.js','question-room.js','reading-data.js','reading-short-passages.js','reading.js','welcome.js','locale.js','math-ru.js','hard60-ru.js','math-solutions-ru.js','new100-ru.js','extra100-ru.js','extra-second100-ru.js','next-first100-ru.js','next-second100-ru.js','reading-ru-core.js','reading-ru-v1.js','reading-ru-v2.js','reading-ru-v3.js','reading-ru-v4.js','reading-ru-v5.js','reading-ru-v6.js','reading-ru-v7.js','reading-ru-v8.js','reading-ru-v9.js','reading-ru-v10.js','reading-short-ru.js','ornek.js','history-data.js','history.js','history-dates-data.js','history-dates-quiz.js','math-profile-data.js','math-profile-elite-levels.js','math-profile.js','physics-data.js','physics-elite-bank.js','physics-depth-prompts.js','physics.js','physics-elite-round.js','architecture.js','email-account.js','phone-auth.js','study-features.js','formula-guide.js','formula-ru.js','ornek-qa-fixes.js','editorial.js','visual-refresh.js','subject-picker.js','ornek-creative-ui.js','gemini-chat.js','subject-dashboards.js'];
// Bound concurrent preloads so large question banks do not monopolize startup.
const assetVersion='20261112-math-elite-v1',preloadAhead=9;
function primeAsset(index){if(index>=scripts.length)return;const preload=document.createElement('link');preload.rel='preload';preload.as='script';preload.href=scripts[index]+'?v='+assetVersion;document.head.append(preload)}
for(let i=0;i<Math.min(preloadAhead,scripts.length);i++)primeAsset(i);
function bootDeadline(promise,ms){let timer;return Promise.race([Promise.resolve(promise),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('network startup timed out')),ms)})]).finally(()=>clearTimeout(timer))}

const keys=['qadam-hard-v1-progress','qadam-hard-v1-bookmarks','qadam-hard-v1-history','qadam-hard-v1-plan','qadam-ai-help-history-v1','qadam-reader-large','qadam-hard-variant-results-v2','qadam-hard-draft-v2','ornek-reading-results-v1','ornek-reading-draft-v1','ornek-reading-bookmarks-v1','ornek-history-results-v1','ornek-history-draft-v1','ornek-history-bookmarks-v1','ornek-reading-history-v1','ornek-reading-plan-v1'];
let user=null,syncError=false;try{const response=await bootDeadline(ornekApi('/api/me',{cache:'no-store'}),3500);if(response.ok)user=(await response.json()).user}catch{syncError=true}
window.ornekAccount={user,syncError,keys};const prefix=user?'ornek-user-'+user.id+':':'';const pendingKey='ornek-pending-'+(user?.id||'guest');let pending={};try{pending=JSON.parse(localStorage.getItem(pendingKey)||'{}')}catch{}
let syncTimer,flushPromise=null;function flush(){if(!user)return Promise.resolve();if(flushPromise)return flushPromise;flushPromise=(async()=>{while(Object.keys(pending).length){const changes={...pending};try{const r=await ornekApi('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({changes})});if(!r.ok)throw Error();for(const k of Object.keys(changes))if(pending[k]===changes[k])delete pending[k];localStorage.setItem(pendingKey,JSON.stringify(pending));ornekAccount.syncError=false}catch{ornekAccount.syncError=true;break}window.dispatchEvent(new Event('ornek-sync'))}})().finally(()=>flushPromise=null);return flushPromise}
function queue(k,v){if(!user||!keys.includes(k))return;pending[k]=v;localStorage.setItem(pendingKey,JSON.stringify(pending));clearTimeout(syncTimer);syncTimer=setTimeout(flush,650)}
window.ornekLocal={getItem:k=>localStorage.getItem((keys.includes(k)?prefix:'')+k),setItem:(k,v)=>{localStorage.setItem((keys.includes(k)?prefix:'')+k,v);queue(k,v)},removeItem:k=>{localStorage.removeItem((keys.includes(k)?prefix:'')+k);queue(k,null)}};window.ornekFlush=flush;
if(user){try{await bootDeadline(flush(),5000);const r=await bootDeadline(ornekApi('/api/state',{cache:'no-store'}),5000);if(!r.ok)throw Error();const {state}=await r.json();for(const k of keys)if(!(k in pending)){if(typeof state[k]==='string')localStorage.setItem(prefix+k,state[k]);else localStorage.removeItem(prefix+k)}}catch{ornekAccount.syncError=true}}
window.addEventListener('online',flush);

for(let i=0;i<scripts.length;i++){
 primeAsset(i+preloadAhead);
 const src=scripts[i];
 await new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  const timer=setTimeout(()=>reject(Error('Asset load timeout: '+src)),30000);
  script.src=src+'?v='+assetVersion;
  script.onload=()=>{clearTimeout(timer);resolve()};
  script.onerror=()=>{clearTimeout(timer);reject(Error('Asset failed: '+src))};
  document.body.append(script);
 }).then(async()=>{if(src==='math-profile-data.js')await bootDeadline(profileDataReady,20000);if(src==='physics-data.js')await bootDeadline(physicsDataReady,20000)});
}
document.getElementById('boot-status')?.remove();document.body.classList.remove('ornek-loading');
})().catch(error=>{console.error('Örnek startup error',error);document.body.classList.remove('ornek-loading');const el=document.getElementById('boot-status');if(el){el.className='ornek-boot-error';el.innerHTML='<h2>Өрнек жүктелмеді</h2><p>Жүктеу кезінде қате шықты. Бетті қайта ашып көріңіз.</p><button type="button" onclick="location.reload()">Қайта жүктеу</button>'}});
