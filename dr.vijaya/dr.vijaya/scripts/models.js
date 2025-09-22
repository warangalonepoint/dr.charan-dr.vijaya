window.Models=(()=>{
  const db=window.DB.db;
  const SLOT_PREP={'NT (11–13+6)':'Fasting not required. Full bladder optional.','Detailed Anomaly (18–22)':'No specific prep. Bring prior reports.','Growth + Dopplers (28–36)':'No specific prep.','Targeted Scan':'No specific prep.','Fetal Echo':'No specific prep.','Early Viability':'No specific prep.','Procedures (CVS/Amnio/IUT)':'Consent & counseling mandatory.'};
  const prepFor = slot => SLOT_PREP[slot] || 'As advised.';

  async function quickCreatePatient(p){ if(!p.name) throw new Error('name required'); return db.patients.add({...p,createdAt:new Date().toISOString()}); }
  async function ensurePregnancy(patientId,lmp,edd){ const list=await db.pregnancies.where({patientId:Number(patientId)}).toArray(); const existing=list[0]; if(existing) return existing.id; return db.pregnancies.add({patientId:Number(patientId),lmp,edd,notes:''}); }
  async function createBooking(data){ return db.bookings.add({...data,reminderSentAt:null}); }
  async function markReminder(id){ return db.bookings.update(Number(id),{reminderSentAt:new Date().toISOString()}); }
  async function searchPatients(q){ const all=await db.patients.toArray(); if(!q) return all; q=q.toLowerCase(); return all.filter(p=>(p.name||'').toLowerCase().includes(q)||(p.phone||'').includes(q)); }
  async function getTodayBookings(){ const today=new Date().toISOString().slice(0,10); const arr=await db.bookings.where({date:today}).toArray(); const out=[]; for(const b of arr){ const preg=await db.pregnancies.get(b.pregnancyId); const patient=preg?await db.patients.get(preg.patientId):null; out.push({...b,patient}); } return out; }
  async function getBookingWithPatient(id){ const b=await db.bookings.get(Number(id)); const preg=await db.pregnancies.get(b.pregnancyId); const patient=await db.patients.get(preg.patientId); return {...b,patient,pregnancy:preg}; }
  async function ensureScanForBooking(bookingId,type){ const found=(await db.scans.where({bookingId:Number(bookingId)}).toArray())[0]; if(found) return found; const id=await db.scans.add({bookingId:Number(bookingId),type,checklist:{requiredPlanes:[]},biometry:{},dopplers:{}}); return db.scans.get(id); }
  function checkMandatory(type,checklist){ if(String(type).includes('Anomaly')){ const need=['HC','AC','FL','4CH']; return need.every(k=>(checklist.requiredPlanes||[]).includes(k)); } return (checklist.requiredPlanes||[]).length>0; }
  async function updateScan(id,data){ return db.scans.update(Number(id),data); }
  async function getScan(id){ return db.scans.get(Number(id)); }
  async function finalizeScan(id,data){ return db.scans.update(Number(id),{...data,finalizedAt:new Date().toISOString()}); }

  async function addProcedure(p){ return db.procedures.add(p); }
  async function listProcedures(){ return db.procedures.reverse().toArray(); }

  async function upsertUser(u){ const pinHash=await window.Auth.hashPin(u.pin); delete u.pin; const list=await db.users.where({name:u.name}).toArray(); if(list[0]) return db.users.update(list[0].id,{...list[0],...u,pinHash}); return db.users.add({name:u.name,role:u.role,rmpRegNo:u.rmpRegNo||'',pinHash}); }
  async function listUsers(){ return db.users.toArray(); }

  async function saveTemplates(obj){ return db.settings.put({key:'templates',value:obj}); }
  async function getTemplates(){ const row=(await db.settings.where({key:'templates'}).toArray())[0]; return row?row.value:{}; }

  async function exportDb(){ const dump={}; for(const t of ['patients','pregnancies','bookings','scans','diagnoses','procedures','counseling','compliance','users','outcomes','settings']){ dump[t]=await db[t].toArray(); } return new Blob([JSON.stringify(dump)],{type:'application/json'}); }
  async function importDb(dump){ for(const t in dump){ if(db[t]){ await db[t].clear(); await db[t].bulkAdd(dump[t]); } } }
  async function clearAll(){ for(const k of Object.keys(db)){ if(db[k]?.clear) await db[k].clear(); } }

  async function seedDemo(){
    const demoUsers=[{name:'Dr. Vijaya',role:'doctor',rmpRegNo:'TS/12345',pin:'1111'},{name:'Counselor',role:'counselor',pin:'2222'},{name:'FO Staff',role:'frontoffice',pin:'3333'},{name:'Admin',role:'admin',pin:'9999'}];
    for(const u of demoUsers) await upsertUser(u);
    const pids=[]; for(const p of[{name:'Anusha R',phone:'900000001',dob:'1995-02-11',address:'Warangal'},{name:'Bhavya K',phone:'900000002',dob:'1994-08-02',address:'Kazipet'},{name:'Chitra S',phone:'900000003',dob:'1992-12-19',address:'Hanamkonda'},{name:'Deepa P',phone:'900000004',dob:'1998-04-10',address:'Warangal'},{name:'Eesha A',phone:'900000005',dob:'1991-05-25',address:'Narsampet'}]){pids.push(await quickCreatePatient(p));}
    const pr=[]; pr.push(await db.pregnancies.add({patientId:pids[0],lmp:'2025-07-01',edd:'2026-04-07'})); pr.push(await db.pregnancies.add({patientId:pids[1],lmp:'2025-05-20',edd:'2026-02-24'})); pr.push(await db.pregnancies.add({patientId:pids[2],lmp:'2025-06-15',edd:'2026-03-22'}));
    const today=new Date().toISOString().slice(0,10); const times=['09:30','10:15','11:00','12:00','16:00','16:45']; const slots=['NT (11–13+6)','Detailed Anomaly (18–22)','Growth + Dopplers (28–36)','Targeted Scan','Early Viability','Fetal Echo'];
    for(let i=0;i<10;i++){ await db.bookings.add({pregnancyId:pr[i%pr.length],slotType:slots[i%slots.length],date:today,time:times[i%times.length],referrer:'Self',consentCaptured:true,fee:1500,status:'confirmed'}); }
    const some=(await db.bookings.where({status:'confirmed'}).toArray()).slice(0,3);
    for(const b of some){ const id=await db.scans.add({bookingId:b.id,type:'Detailed Anomaly (18–22)',checklist:{requiredPlanes:['HC','AC','FL','4CH'],notes:'All mandatory planes acquired.'},biometry:{BPD:52,HC:190,AC:160,FL:35,EFW:450},dopplers:{UA:0.9,MCA:1.5,CPR:1.67}}); await db.scans.update(id,{finalizedAt:new Date().toISOString(),reportHtml:'<h1>Demo Report</h1>'}); await db.compliance.add({scanId:id,monthKey:today.slice(0,7),formFJson:{patient:'demo'},auditTrail:[{at:new Date().toISOString(),who:'seed',what:'create'}]}); }
    for(const pid of [pr[0],pr[1]]){ await db.counseling.add({pregnancyId:pid,reason:'High risk screening',pedigreeJson:{},optionsDiscussed:['NIPT','CVS'],decision:'Decided: NIPT',teleLog:[{at:new Date().toISOString(),mode:'Video',note:'Discussion'}],attachments:[]}); }
    await db.procedures.add({pregnancyId:pr[2],kind:'Amniocentesis',preopChecklist:'Vitals, consent',lotNumbers:'Kit#123',complications:'None',followupDate:today});
    return true;
  }

  return { prepFor, quickCreatePatient, ensurePregnancy, createBooking, markReminder, searchPatients, getTodayBookings, getBookingWithPatient, ensureScanForBooking, updateScan, getScan, finalizeScan, checkMandatory, addProcedure, listProcedures, upsertUser, listUsers, saveTemplates, getTemplates, exportDb, importDb, clearAll, seedDemo };
})();