export function condition(code:number,day=true,en=false){
 const k=code===0?'clear':code<=3?'cloud':code<=48?'fog':code>=95?'storm':(code>=71&&code<=77)||code===85||code===86?'snow':'rain';
 const names={clear:['Ясно','Clear'],cloud:['Облачно','Cloudy'],fog:['Туман','Fog'],storm:['Гроза','Thunderstorm'],snow:['Снег','Snow'],rain:['Дождь','Rain']};
 return {kind:day?k:'night',label:names[k][en?1:0],icon:!day&&code<3?'🌙':({clear:'☀️',cloud:'☁️',fog:'🌫️',storm:'⛈️',snow:'🌨️',rain:'🌧️'})[k]};
}
export async function upstream(url:string){const r=await fetch(url,{signal:AbortSignal.timeout(12000)});if(!r.ok){console.error('Weather upstream HTTP',r.status,new URL(url).hostname);throw new Error('Weather provider unavailable');}return r.json() as Promise<any>;}

export function forecastUrl(lat:number,lon:number){return 'https://api.open-meteo.com/v1/forecast?'+new URLSearchParams({latitude:String(lat),longitude:String(lon),timezone:'auto',forecast_days:'7',wind_speed_unit:'ms',current:'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m',hourly:'temperature_2m,precipitation_probability,weather_code,visibility,is_day',daily:'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max'});}
