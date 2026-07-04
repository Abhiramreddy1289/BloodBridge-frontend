import{d as M}from"./index-CCjnodAv.js";/**
 * @license lucide-react v1.17.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=[["polygon",{points:"3 11 22 2 13 21 11 13 3 11",key:"1ltx0t"}]],N=M("navigation",k),m=["A+","A-","B+","B-","AB+","AB-","O+","O-"],v=(a={})=>m.some(o=>Number(a[o])>0),B=(a="")=>{const o=Array.from(String(a)).reduce((e,t)=>e+t.charCodeAt(0),0);return m.reduce((e,t,r)=>{const s=(o+r*7)%34+6;return e[t]=s,e},{})},_=(a,o)=>{if(!a||!o)return null;const[e,t]=a.map(Number),[r,s]=o.map(Number);if(![e,t,r,s].every(Number.isFinite))return null;const l=6371,n=d(r-e),i=d(s-t),c=Math.sin(n/2)**2+Math.cos(d(e))*Math.cos(d(r))*Math.sin(i/2)**2;return l*2*Math.atan2(Math.sqrt(c),Math.sqrt(1-c))},C=a=>a==null?"Location needed":a<1?`${Math.round(a*1e3)} m`:`${a.toFixed(a<10?1:0)} km`,F=()=>new Promise((a,o)=>{if(!("geolocation"in navigator)){o(new Error("Location access is not available in this browser"));return}navigator.geolocation.getCurrentPosition(e=>a([e.coords.latitude,e.coords.longitude]),()=>o(new Error("Please allow location access to calculate nearby distance")),{enableHighAccuracy:!0,timeout:1e4})}),d=a=>a*(Math.PI/180),I=async([a,o],e=20)=>{const t=Number(e)*1e3,r=`
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${t},${a},${o});
      way["amenity"="hospital"](around:${t},${a},${o});
      relation["amenity"="hospital"](around:${t},${a},${o});
      node["healthcare"="blood_bank"](around:${t},${a},${o});
      way["healthcare"="blood_bank"](around:${t},${a},${o});
      relation["healthcare"="blood_bank"](around:${t},${a},${o});
      node["healthcare"="hospital"](around:${t},${a},${o});
      way["healthcare"="hospital"](around:${t},${a},${o});
      relation["healthcare"="hospital"](around:${t},${a},${o});
    );
    out center tags;
  `,s=await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(r)}`);if(!s.ok)throw new Error("Unable to load nearby hospitals and blood banks");return((await s.json()).elements||[]).map(n=>{var h,u,p,$,b,y,f,w,g;const i=n.lat||((h=n.center)==null?void 0:h.lat),c=n.lon||((u=n.center)==null?void 0:u.lon);return!i||!c?null:{id:`osm-${n.type}-${n.id}`,name:((p=n.tags)==null?void 0:p.name)||(($=n.tags)==null?void 0:$.operator)||"Medical Facility",type:((b=n.tags)==null?void 0:b.healthcare)==="blood_bank"?"Blood Bank":"Hospital",address:L(n.tags),phone:((y=n.tags)==null?void 0:y.phone)||((f=n.tags)==null?void 0:f["contact:phone"])||"",website:((w=n.tags)==null?void 0:w.website)||((g=n.tags)==null?void 0:g["contact:website"])||"",source:"OpenStreetMap",position:[i,c]}}).filter(Boolean).slice(0,80)},L=(a={})=>[a["addr:housename"]||a["addr:housenumber"],a["addr:street"],a["addr:city"],a["addr:district"],a["addr:state"],a["addr:postcode"]].filter(Boolean).join(", ");export{N,C as a,m as b,B as c,_ as d,I as f,F as g,v as h};
