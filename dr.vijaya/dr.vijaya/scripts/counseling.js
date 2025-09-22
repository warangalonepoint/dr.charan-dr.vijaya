window.Counsel=(()=>{
  const db=window.DB.db;
  async function save(){const pid=Number(document.getElementById('patientId').value||0); const reason=document.getElementById('reason').value.trim(); const pedigree=safeJson(document.getElementById('pedigree').value||'{}'); const options=[...document.querySelectorAll('.chips input:checked')].map(x=>x.value); const decision=document.getElementById('decision').value; const teleLog=JSON.parse(localStorage.getItem('teleLog')||'[]'); await db.counseling.add({pregnancyId:pid,reason,pedigreeJson:pedigree,optionsDiscussed:options,decision,teleLog,attachments:[]}); toast('Saved counseling'); refreshBoard(); }
  function safeJson(s){ try{return JSON.parse(s);}catch{return {};} }
  async function refreshBoard(){const list=await db.counseling.reverse().toArray(); const el=document.getElementById('board'); if(!el) return; el.innerHTML=''; list.forEach(c=>{const d=document.createElement('div'); d.className='row'; d.innerHTML=`<div><strong>Preg ${c.pregnancyId}</strong> • ${c.reason}</div><div class="muted">${c.decision}</div>`; el.appendChild(d);});}
  function clearForm(){['patientId','reason','pedigree','logNote'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';}); document.querySelectorAll('.chips input').forEach(x=>x.checked=false);}
  function search(q){location.search='?q='+encodeURIComponent(q);}
  async function addLog(){const note=document.getElementById('logNote').value.trim(); if(!note) return; const arr=JSON.parse(localStorage.getItem('teleLog')||'[]'); arr.push({at:new Date().toISOString(),note}); localStorage.setItem('teleLog',JSON.stringify(arr)); toast('Log added'); document.getElementById('logNote').value='';}
  return {save,refreshBoard,clearForm,search,addLog};
})();