const {WEBAPP_URL,SETUP_SECRET}=process.env;
if(!WEBAPP_URL||!SETUP_SECRET)throw Error('Set WEBAPP_URL and SETUP_SECRET in the environment.');
const url=new URL(WEBAPP_URL);if(url.protocol!=='https:')throw Error('WEBAPP_URL must use HTTPS.');
const r=await fetch(new URL('/api/setup',url),{method:'POST',headers:{Authorization:`Bearer ${SETUP_SECRET}`},signal:AbortSignal.timeout(60000)});
if(!r.ok)throw Error(`Bot setup failed (HTTP ${r.status}); check deployed secrets and server logs.`);
const d=await r.json();console.log(`Bot configured: https://t.me/${d.username}`);console.log(`Webhook: ${d.webhook.url}`);
