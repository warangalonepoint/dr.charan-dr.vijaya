window.PCPNDT=(()=>{
  const db=window.DB.db;
  async function generateFormFForScan(scanId){
    const s=await db.scans.get(Number(scanId)); const b=await db.bookings.get(s.bookingId);
    const preg=await db.pregnancies.get(b.pregnancyId); const p=await db.patients.get(preg.patientId);
    const monthKey=(b.date||new Date().toISOString().slice(0,10)).slice(0,7);
    const formF={scanId:s.id,patientName:p.name,patientPhone:p.phone,address:p.address||'',lmp:preg.lmp,edd:preg.edd,scanType:s.type,date:b.date,time:b.time,referrer:b.referrer||'',declaration:'Sex not disclosed'};
    const existing=(await db.compliance.where({scanId:s.id}).toArray())[0];
    if(existing) await db.compliance.update(existing.id,{formFJson:formF,monthKey}); else await db.compliance.add({scanId:s.id,monthKey,formFJson:formF,auditTrail:[{at:new Date().toISOString(),who:'system',what:'formF'}]});
    return formF;
  }
  async function getFormFForScan(scanId){return db.compliance.where({scanId:Number(scanId)}).first();}
  function previewFormF(rec){
    const f=rec.formFJson||{}; const html=`<!doctype html><html><head><meta charset="utf-8"><title>Form-F</title><style>@page{size:A4;margin:14mm}body{font:14px/1.4 system-ui;color:#111}h2{margin:0 0 8px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:6px}${watermarkCss()}</style></head><body><h2>PCPNDT – Form-F (Summary)</h2><table>${Object.entries(f).map(([k,v])=>`<tr><td>${k}</td><td>${v??''}</td></tr>`).join('')}</table><p style="margin-top:8px;color:#555">“Sex not disclosed” watermark is mandatory.</p></body></html>`;
    const w=window.open('','_blank','noopener'); w.document.open(); w.document.write(html); w.document.close();
  }
  async function exportMonthCsv(monthKey){const rows=await db.compliance.where({monthKey}).toArray(); const header=['scanId','patientName','patientPhone','address','lmp','edd','scanType','date','time','referrer','declaration']; const lines=[header.join(',')]; for(const r of rows){const f=r.formFJson||{}; lines.push(header.map(k=>csvSafe(f[k])).join(','));} return new Blob([lines.join('\n')],{type:'text/csv'});}
  function csvSafe(v){ if(v==null)return''; const s=String(v).replaceAll('"','""'); return /[",\n]/.test(s)?`"${s}"`:s; }
  return {generateFormFForScan,getFormFForScan,previewFormF,exportMonthCsv};
})();