import {forecastUrl} from './weather';
// Open-Meteo supports public browser requests; no credentials are involved.
// A server fallback handles networks where direct provider access fails.
export async function jsonRequest(url:string,signal?:AbortSignal){
 const controller=new AbortController();const abort=()=>controller.abort();
 if(signal?.aborted)controller.abort();else signal?.addEventListener('abort',abort,{once:true});
 const timer=setTimeout(abort,10000);
 try{const r=await fetch(url,{signal:controller.signal,credentials:'omit'});if(!r.ok)throw new Error(`HTTP ${r.status}`);return await r.json() as any}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',abort)}
}
async function withFallback(primary:string,fallback:string,valid:(d:any)=>boolean,signal?:AbortSignal){
 for(const url of [primary,fallback]){try{const d=await jsonRequest(url,signal);if(!valid(d))throw Error('Invalid provider response');return d}catch(e){if(signal?.aborted||url===fallback)throw e}}
}
export async function fetchWeather(lat:number,lon:number){
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw Error('Invalid coordinates');
 return withFallback(forecastUrl(lat,lon),`/api/weather?lat=${lat}&lon=${lon}`,d=>!!d?.current&&Array.isArray(d?.hourly?.time)&&d.hourly.time.length>=24&&Array.isArray(d?.daily?.time)&&d.daily.time.length===7);
}
export async function searchCities(q:string,lang:string,signal?:AbortSignal){
 q=q.trim();if(q.length<2||q.length>100||/[\x00-\x1f<>]/.test(q))throw Error('Invalid city');
 const params=new URLSearchParams({name:q,count:'8',language:lang==='en'?'en':'ru',format:'json'});
 const d=await withFallback('https://geocoding-api.open-meteo.com/v1/search?'+params,'/api/search?'+new URLSearchParams({q,lang}),d=>d&&typeof d==='object'&&!d.error&&(!d.results||Array.isArray(d.results)),signal);
 return {results:d.results||[]};
}
