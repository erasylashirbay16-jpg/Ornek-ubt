/* Supabase owns sessions and verifies ownership through row-level security. */
window.ornekSupabase=supabase.createClient('https://fyftyopmjscupfnecqqj.supabase.co','sb_publishable_Tz3aiNjtLNH7mLoAk8SV-w_zOir88T_');
window.ornekApi=async function(path,options={}){
 const {data:{user},error}=await ornekSupabase.auth.getUser();
 if(path==='/api/me'){
  if(!user)return Response.json({user:null});
  const {data,error}=await ornekSupabase.from('ornek_profiles').select('display_name').eq('user_id',user.id).maybeSingle();
  if(error)throw error;
  return Response.json({user:{id:user.id,name:data?.display_name||user.user_metadata?.display_name||user.email,registered:!!data}});
 }
 if(!user)return Response.json({error:'sign_in_required'},{status:401});
 if(path==='/api/register'){
  const name=JSON.parse(options.body).name.trim();if(name.length<2||name.length>60)return Response.json({error:'name_length'},{status:400});
  const {error}=await ornekSupabase.from('ornek_profiles').upsert({user_id:user.id,display_name:name});if(error)throw error;
  return Response.json({user:{id:user.id,name,registered:true}});
 }
 if(path==='/api/state'){
  if(options.method==='PUT'){
   const {changes}=JSON.parse(options.body);
   for(const [key,value]of Object.entries(changes)){
    if(!ornekAccount.keys.includes(key))throw Error('Invalid state key');
    const result=value===null?await ornekSupabase.from('ornek_state').delete().eq('user_id',user.id).eq('key',key):await ornekSupabase.from('ornek_state').upsert({user_id:user.id,key,value},{onConflict:'user_id,key'});
    if(result.error)throw result.error;
   }return Response.json({ok:true});
  }
  const {data,error}=await ornekSupabase.from('ornek_state').select('key,value').eq('user_id',user.id);if(error)throw error;
  return Response.json({state:Object.fromEntries(data.map(r=>[r.key,r.value]))});
 }
 throw Error('Unknown account operation');
};
