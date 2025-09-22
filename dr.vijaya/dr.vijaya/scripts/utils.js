/* UI utils, theme, toasts, PWA & DPDP consent */
function setupThemeToggle(){
  const b=document.getElementById('themeToggle'); if(!b) return;
  const apply=t=>{document.documentElement.dataset.theme=t;localStorage.setItem('theme',t)};
  const saved=localStorage.getItem('theme'); if(saved) apply(saved);
  b.onclick=()=>apply((document.documentElement.dataset.theme==='dark')?'light':'dark');
}
function toast(msg,type){
  const t=document.createElement('div');t.className='toast '+(type||'');t.textContent=msg;
  Object.assign(t.style,{position:'fixed',left:'50%',bottom:'16px',transform:'translateX(-50%)',padding:'10px 14px',borderRadius:'12px',background:'#111827',color:'#fff',zIndex:9999});
  document.body.appendChild(t); setTimeout(()=>t.remove(),2200);
}
function registerSW(){ if('serviceWorker' in navigator){ navigator.serviceWorker.register('service-worker.js'); } }
function watermarkCss(){return `body::before{content:"Sex not disclosed";position:fixed;inset:0;pointer-events:none;background:repeating-linear-gradient(45deg, rgba(200,200,200,.18) 0 20px, rgba(200,200,200,.05) 20px 40px);mix-blend-mode:multiply;}`;}
/* DPDP simple consent */
(function(){
  if(localStorage.getItem('dpdpConsent')==='1') return;
  const m=document.createElement('div');m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:99999';
  m.innerHTML=`<div style="max-width:520px;background:#fff;color:#111;border-radius:16px;padding:16px"><h3>Consent</h3><p>This app stores limited personal data locally for clinical care & compliance (DPDP 2023). By continuing you consent to data processing; retention is configurable in Settings.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button id="cDecl" class="btn">Decline</button><button id="cAcc" class="btn primary">I Consent</button></div></div>`;
  document.addEventListener('DOMContentLoaded',()=>{document.body.appendChild(m);document.getElementById('cAcc').onclick=()=>{localStorage.setItem('dpdpConsent','1');m.remove();};document.getElementById('cDecl').onclick=()=>{alert('Consent required');location.href='about:blank';};});
})();
