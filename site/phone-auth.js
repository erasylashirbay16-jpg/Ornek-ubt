/* Phone OTP via Supabase Auth. Requires enabled Phone provider and SMS transport in Supabase. */
(function(){
 'use strict';
 const pendingPhone=new WeakMap();
 const minInterval=60000;
 let nextSendAt=0;
 const consentKey='ornek_pending_privacy_consent';
 const consentVersion='2026-11-11-phone-auth';
 function phoneNumber(value){
  const digits=String(value||'').replace(/\D/g,'');
  const local=digits.length===10?digits:digits.length===11&&/^[78]/.test(digits)?digits.slice(1):'';
  return /^\d{10}$/.test(local)?'+7'+local:null;
 }
 function feedback(error){
  const code=String(error?.code||'');
  const msg=String(error?.message||'').toLowerCase();
  if(/provider|disabled|not.configured|sms.not.enabled/.test(code+' '+msg))return 'SMS арқылы тіркелу әкімші жағынан әлі қосылмаған. Қазір email немесе Google арқылы кіре аласыз.';
  if(/rate.limit|too.many|over.sms/.test(code+' '+msg))return 'Код сұрау шегіне жеттіңіз. Кейінірек қайта көріңіз.';
  if(/invalid|expired|otp/.test(code+' '+msg))return 'Код қате немесе мерзімі өткен. SMS-тегі соңғы кодты тексеріңіз.';
  return 'SMS операциясы орындалмады. Нөмірді және байланысты тексеріп, кейінірек қайта көріңіз.';
 }
 function busy(form,state){form.querySelectorAll('button,input').forEach(x=>x.disabled=state);}
 window.phoneOrnekSendCode=async function(form){
  const box=form.closest('.ornek-phone-auth');
  const status=form.querySelector('.ornek-phone-status');
  const phone=phoneNumber(form.elements.phone.value);
  if(!phone){status.textContent='Нөмірді +7 701 234 56 78 форматында енгізіңіз.';form.elements.phone.focus();return;}
  if(!form.elements.privacyAccepted.checked||!form.elements.guardianAccepted.checked){
   status.textContent='Деректерді өңдеуге келісімді және жас/заңды өкіл растауын белгілеңіз.';
   (!form.elements.privacyAccepted.checked?form.elements.privacyAccepted:form.elements.guardianAccepted).focus();
   return;
  }
  if(Date.now()<nextSendAt){status.textContent='Қайта код сұрауға кемінде 60 секунд аралық сақтаңыз.';return;}
  status.textContent='SMS жіберілуде…';busy(form,true);
  try{
   const {error}=await ornekSupabase.auth.signInWithOtp({phone,options:{shouldCreateUser:true}});
   if(error)throw error;
   nextSendAt=Date.now()+minInterval;
   const verify=box.querySelector('.ornek-phone-verify');
   pendingPhone.set(verify,phone);
   verify.querySelector('.ornek-phone-destination').textContent='Код +7 *** *** '+phone.slice(-4)+' нөміріне жіберілді.';
   localStorage.setItem(consentKey,JSON.stringify({version:consentVersion,acceptedAt:new Date().toISOString()}));
   form.hidden=true;verify.hidden=false;verify.elements.otp.focus();status.textContent='';
  }catch(error){status.textContent=feedback(error)}
  finally{busy(form,false)}
 };
 window.phoneOrnekVerifyCode=async function(form){
  const status=form.querySelector('.ornek-phone-code-status');
  const phone=pendingPhone.get(form);
  const token=String(form.elements.otp.value||'').trim();
  if(!phone){status.textContent='Алдымен телефон нөмірін енгізіңіз.';return;}
  if(!/^\d{6}$/.test(token)){status.textContent='6 цифрдан тұратын SMS-кодты енгізіңіз.';return;}
  busy(form,true);status.textContent='Код тексерілуде…';
  try{
   const {data,error}=await ornekSupabase.auth.verifyOtp({phone,token,type:'sms'});
   if(error)throw error;
   if(!data?.session)throw new Error('Session was not issued.');
   form.elements.otp.value='';
   location.reload();
  }catch(error){status.textContent=feedback(error);busy(form,false);}
 };
 window.phoneOrnekReset=function(button){
  const box=button.closest('.ornek-phone-auth');
  const form=box.querySelector('.ornek-phone-verify');
  pendingPhone.delete(form);
  form.elements.otp.value='';
  form.querySelector('.ornek-phone-code-status').textContent='';
  form.hidden=true;
  const send=box.querySelector('.ornek-phone-send');
  send.hidden=false;
  send.querySelector('.ornek-phone-status').textContent='';
  send.elements.phone.focus();
 };
})();
