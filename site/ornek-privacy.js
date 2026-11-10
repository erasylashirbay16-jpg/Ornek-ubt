/* Örnek Privacy Kit. UI only: production needs server-side consent enforcement. */
(function () {
  "use strict";
  const KEY="ornek_cookie_consent_v1";
  const VERSION="2026-11-06-draft";
  const links={privacy:"/legal/privacy.html",consent:"/legal/consent.html",cookies:"/legal/cookies.html"};
  const initial=()=>({necessary:true,analytics:false,marketing:false,version:VERSION});
  const listeners=new Set();
  let banner=null,dialog=null,returnFocus=null;
  const $=(selector,scope=document)=>scope.querySelector(selector);
  function stored(){try{const c=JSON.parse(localStorage.getItem(KEY)||"null");return c&&c.version===VERSION&&typeof c.analytics==="boolean"&&typeof c.marketing==="boolean"?{...c,necessary:true}:null;}catch{return null;}}
  function save(analytics,marketing){
    const choice={necessary:true,analytics:!!analytics,marketing:!!marketing,version:VERSION,savedAt:new Date().toISOString()};
    try{localStorage.setItem(KEY,JSON.stringify(choice));}catch{}
    if(banner){banner.remove();banner=null;} close();
    listeners.forEach(f=>{try{f(choice);}catch(e){console.error(e);}});
    window.dispatchEvent(new CustomEvent("ornek:cookie-consent",{detail:choice}));
  }
  function element(tag,cls){const e=document.createElement(tag);if(cls)e.className=cls;return e;}
  function button(text,action,primary=false){const b=element("button","op-button"+(primary?" op-primary":""));b.type="button";b.textContent=text;b.addEventListener("click",action);return b;}
  function actions(){return element("div","op-actions");}
  function close(){if(dialog){dialog.remove();dialog=null;if(returnFocus?.isConnected)returnFocus.focus();}}
  function settings(){
    if(dialog)return;
    returnFocus=document.activeElement;
    const saved=stored()||initial();
    dialog=element("div","op-overlay");
    const panel=element("section","op-dialog");panel.setAttribute("role","dialog");panel.setAttribute("aria-modal","true");panel.setAttribute("aria-label","Cookie баптаулары");
    const top=element("div","op-heading"),h=element("h2");h.textContent="Cookie баптаулары";top.append(h,button("Жабу",close));
    panel.append(top);
    const p=element("p");p.textContent="Қажетті cookie әрқашан қосулы. Қалғандары тек таңдауыңыз бойынша қолданылады.";panel.append(p);
    function toggle(label,description,checked,disabled){const l=element("label","op-option"),t=element("span"),small=element("small"),input=element("input");input.type="checkbox";input.checked=checked;input.disabled=disabled;small.textContent=description;t.textContent=label;t.append(small);l.append(t,input);panel.append(l);return input;}
    toggle("Қажетті cookie","Кіру сессиясы және сайттың негізгі жұмысы",true,true);
    const analytics=toggle("Аналитика","Қосымша статистика",saved.analytics,false);
    const marketing=toggle("Маркетинг","Қосымша жарнама құралдары",saved.marketing,false);
    const bar=actions();bar.append(button("Таңдауды сақтау",()=>save(analytics.checked,marketing.checked),true),button("Міндеттілер ғана",()=>save(false,false)));panel.append(bar);
    dialog.append(panel);dialog.addEventListener("mousedown",e=>{if(e.target===dialog)close();});dialog.addEventListener("keydown",e=>{if(e.key==="Escape")close();if(e.key==="Tab"){const f=[...dialog.querySelectorAll('button,input:not([disabled])')];if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus();}}});
    document.body.append(dialog);$("button",panel).focus();
  }
  function showBanner(){
    if(stored()||banner||!document.body)return;
    banner=element("section","op-banner");banner.setAttribute("role","region");banner.setAttribute("aria-label","Cookie таңдауы");
    const h=element("h2");h.textContent="Құпиялылығыңыз маңызды";banner.append(h);
    const p=element("p");p.append("Örnek қажетті cookie-лерді қолданады. Аналитика мен маркетинг тек келісім бергенде қосылады. ");
    const a=element("a");a.href=links.cookies;a.textContent="Cookie саясаты";p.append(a,".");banner.append(p);
    const bar=actions();bar.append(button("Барлығын қабылдау",()=>save(true,true),true),button("Міндеттілер ғана",()=>save(false,false)),button("Баптау",settings));banner.append(bar);document.body.append(banner);
  }
  function footer(e){ e.replaceChildren(); e.hidden=true; e.style.display="none"; }
  function consentBlock(){
    const wrap=element("div","op-consent"),label=element("label"),check=element("input"),span=element("span");
    check.type="checkbox";check.name="personal_data_consent";check.value="yes";check.required=true;
    const a=element("a");a.href=links.consent;a.target="_blank";a.rel="noopener noreferrer";a.textContent="дербес деректерімді өңдеуге келісім";
    span.append("Мен ",a," беремін және құпиялық саясатымен таныстым.");label.append(check,span);
    const error=element("p","op-error");error.textContent="Жалғастыру үшін келісімді белгілеңіз.";error.hidden=true;
    check.addEventListener("change",()=>{error.hidden=check.checked;});wrap.append(label,error);return {wrap,check,error};
  }
  function protectForm(form){
    if(form.dataset.opReady)return;form.dataset.opReady="1";
    const c=consentBlock(),submit=$('button[type="submit"],input[type="submit"]',form);
    if(submit)submit.before(c.wrap);else form.append(c.wrap);
    form.addEventListener("submit",event=>{if(!c.check.checked){event.preventDefault();event.stopImmediatePropagation();c.error.hidden=false;c.check.focus();}},true);
  }
  function protectOauth(area){
    if(area.dataset.opReady)return;area.dataset.opReady="1";const c=consentBlock();area.prepend(c.wrap);
    area.querySelectorAll("[data-ornek-oauth-button]").forEach(b=>b.addEventListener("click",event=>{if(!c.check.checked){event.preventDefault();event.stopImmediatePropagation();c.error.hidden=false;c.check.focus();}},true));
  }
  function init(){document.querySelectorAll("[data-ornek-privacy-footer]").forEach(footer);document.querySelectorAll("[data-ornek-consent-form]").forEach(protectForm);document.querySelectorAll("[data-ornek-oauth-area]").forEach(protectOauth);showBanner();}
  window.OrnekPrivacy=Object.freeze({init,openSettings:settings,getChoice:stored,allowed:category=>category==="necessary"||!!stored()?.[category],onChoice(fn){listeners.add(fn);return()=>listeners.delete(fn);},policyVersion:VERSION,links});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();