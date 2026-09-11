import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const originalHt =
  'function ht({size:t=26}){return a.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[a.jsxs("svg",{width:t,height:t,viewBox:"0 0 32 32",fill:"none",children:[a.jsx("rect",{width:"32",height:"32",rx:"8",fill:"#8fce00"}),a.jsx("path",{d:"M6 21 L13 14 L18 18 L26 9",stroke:"#191919",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"}),a.jsx("circle",{cx:"26",cy:"9",r:"2.4",fill:"#191919"})]}),a.jsxs("span",{style:{fontWeight:700,fontSize:t*.7,letterSpacing:".5px"},children:["Trading",a.jsx("span",{style:{color:"var(--lime)"},children:"Pro"})]})]})}';

const newHt = `function WlHeroBrand(){const[_b,_sb]=b.useState(()=>(window.__WHITELABEL_BRANDING__||(window.__WHITELABEL_BRANDING_CONTROLLER__?window.__WHITELABEL_BRANDING_CONTROLLER__.getBranding():{})));b.useEffect(()=>{const h=(e)=>{if(e.detail)_sb({...e.detail});};window.addEventListener("whitelabel:update",h);return()=>window.removeEventListener("whitelabel:update",h);},[]);const _n=(_b.name||"TradingPro").trim(),_p=_n.split(" "),_f=_p.length>1?_p.slice(0,-1).join(" "):_n,_l=_p.length>1?_p[_p.length-1]:"";return a.jsxs("h1",{className:"hero-brand","aria-label":_n,children:[a.jsx("span",{children:_f}),_l?a.jsx("span",{className:"brand-accent",style:{marginLeft:10},children:_l}):null]});}function WlSplashWord(){const[_b,_sb]=b.useState(()=>(window.__WHITELABEL_BRANDING__||(window.__WHITELABEL_BRANDING_CONTROLLER__?window.__WHITELABEL_BRANDING_CONTROLLER__.getBranding():{})));b.useEffect(()=>{const h=(e)=>{if(e.detail)_sb({...e.detail});};window.addEventListener("whitelabel:update",h);return()=>window.removeEventListener("whitelabel:update",h);},[]);const _n=(_b.name||"TradingPro").trim(),_p=_n.split(" "),_f=_p.length>1?_p.slice(0,-1).join(" "):_n,_l=_p.length>1?_p[_p.length-1]:"";return a.jsxs("div",{className:"splash-word",children:[a.jsx("span",{children:_f}),_l?a.jsx("span",{style:{color:"var(--lime)",marginLeft:4},children:_l}):null]});}function ht({size:t=26}){const[_b,_sb]=b.useState(()=>(window.__WHITELABEL_BRANDING__||(window.__WHITELABEL_BRANDING_CONTROLLER__?window.__WHITELABEL_BRANDING_CONTROLLER__.getBranding():{})));b.useEffect(()=>{const h=(e)=>{if(e.detail)_sb({...e.detail});};window.addEventListener("whitelabel:update",h);return()=>window.removeEventListener("whitelabel:update",h);},[]);const _n=(_b.name||"TradingPro").trim(),_lg=_b.logo||_b.favicon||"",_c=_b.color||"var(--lime)",_p=_n.split(" "),_f=_p.length>1?_p.slice(0,-1).join(" "):_n,_l=_p.length>1?_p[_p.length-1]:"";return a.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[_lg?a.jsx("img",{src:_lg,alt:_n,style:{height:t,maxWidth:t*3.5,objectFit:"contain",borderRadius:6}}):a.jsxs("svg",{width:t,height:t,viewBox:"0 0 32 32",fill:"none",children:[a.jsx("rect",{width:"32",height:"32",rx:"8",fill:_c}),a.jsx("path",{d:"M6 21 L13 14 L18 18 L26 9",stroke:"#191919",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round",fill:"none"}),a.jsx("circle",{cx:"26",cy:"9",r:"2.4",fill:"#191919"})]}),a.jsxs("span",{style:{fontWeight:700,fontSize:t*.7,letterSpacing:".5px"},children:[_f,_l?a.jsx("span",{style:{color:"var(--lime)",marginLeft:4},children:_l}):null]})]});}`;

const originalHero =
  'a.jsxs("h1",{className:"hero-brand","aria-label":"TradingPro",children:[a.jsx("span",{children:"Trading"}),a.jsx("span",{className:"brand-accent",children:"Pro"})]})';
const newHero = 'a.jsx(WlHeroBrand,{})';

const originalSplash =
  'a.jsxs("div",{className:"splash-word",children:["Trading",a.jsx("span",{children:"Pro"})]})';
const newSplash = 'a.jsx(WlSplashWord,{})';

export function patchBundleFile(targetPath) {
  if (!existsSync(targetPath)) return false;
  let code = readFileSync(targetPath, 'utf-8');
  let changed = false;

  // 1. ht and hero brand definition
  if (code.includes(originalHt)) {
    code = code.replace(originalHt, newHt);
    changed = true;
    console.log(`[Patch] Successfully replaced originalHt in ${targetPath}`);
  } else if (code.includes('function WlHeroBrand()')) {
    // Already has an earlier patch - update it cleanly up to function ju
    const start = code.indexOf('function WlHeroBrand()');
    const end = code.indexOf('function ju({code:t,size:e=20})');
    if (start !== -1 && end !== -1 && end > start) {
      code = code.substring(0, start) + newHt + code.substring(end);
      changed = true;
      console.log(`[Patch] Successfully updated WlHeroBrand/ht in ${targetPath}`);
    }
  }

  // 2. hero-brand JSX
  if (code.includes(originalHero)) {
    code = code.replace(originalHero, newHero);
    changed = true;
    console.log(`[Patch] Successfully replaced hero-brand JSX in ${targetPath}`);
  }

  // 3. splash-word JSX
  if (code.includes(originalSplash)) {
    code = code.replace(originalSplash, newSplash);
    changed = true;
    console.log(`[Patch] Successfully replaced splash-word JSX in ${targetPath}`);
  }

  if (changed) {
    writeFileSync(targetPath, code, 'utf-8');
    console.log(`[Patch] Saved updates to ${targetPath}`);
  } else {
    console.log(`[Patch] No changes needed for ${targetPath}`);
  }
  return true;
}

const targets = [
  join(process.cwd(), 'prototipo', 'assets', 'index-D08ZekFh.js'),
  join(process.cwd(), 'public', 'assets', 'index-D08ZekFh.js'),
];

for (const target of targets) {
  patchBundleFile(target);
}
console.log('All bundle patches processed.');
