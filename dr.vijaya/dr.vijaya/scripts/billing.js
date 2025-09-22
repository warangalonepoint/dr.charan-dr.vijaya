window.Billing = (function(){
  const db = DB.db;
  async function init(){
    const today = new Date().toISOString().slice(0,10);
    document.getElementById('b_date').value = today;
    await refresh();
  }
  async function save(){
    const data = {
      patientId: Number(b_patientId.value||0),
      bookingId: b_bookingId.value? Number(b_bookingId.value): null,
      serviceType: b_service.value.trim(),
      amount: Number(b_amount.value||0),
      paymentMode: b_mode.value,
      refNo: b_ref.value.trim(),
      date: b_date.value || new Date().toISOString().slice(0,10),
      notes: b_notes.value.trim(),
      createdAt: new Date().toISOString()
    };
    if(!data.serviceType){ toast('Enter service'); return; }
    await db.bills.add(data);
    toast('Bill saved'); clearForm(); refresh();
  }
  function clearForm(){ ['b_bookingId','b_service','b_amount','b_ref','b_notes'].forEach(id=>document.getElementById(id).value=''); }
  async function refresh(){
    const today = new Date().toISOString().slice(0,10);
    const bills = (await db.bills.toArray()).filter(b=>b.date===today);
    // totals by mode
    const totals = bills.reduce((m,b)=>{ m.total=(m.total||0)+(+b.amount||0); m[b.paymentMode]=(m[b.paymentMode]||0)+(+b.amount||0); return m; },{});
    const keys = Object.keys(totals).filter(k=>k!=='total');
    todayTotals.textContent = 'Total ₹'+(totals.total||0)+' • ' + keys.map(k=>`${k}: ₹${totals[k]}`).join('  ');
    // list
    billList.innerHTML = '';
    bills.reverse().forEach(b=>{
      const d = document.createElement('div'); d.className='row';
      d.innerHTML = `<div><strong>₹${b.amount}</strong> • ${b.serviceType}</div>
                     <div class="muted">${b.paymentMode}${b.refNo?(' • '+b.refNo):''} • Patient ${b.patientId||'-'}${b.bookingId?(' • Booking '+b.bookingId):''} • ${b.date}</div>`;
      billList.appendChild(d);
    });
  }
  async function exportCsv(){
    const bills = await db.bills.toArray();
    const header = ['id','patientId','bookingId','serviceType','amount','paymentMode','refNo','date','notes','createdAt'];
    const lines = [header.join(',')];
    bills.forEach(b=>{
      const row = header.map(k=>csvSafe(b[k]));
      lines.push(row.join(','));
    });
    const blob = new Blob([lines.join('\n')],{type:'text/csv'});
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='bills.csv'; a.click(); URL.revokeObjectURL(url);
  }
  function csvSafe(v){ if(v==null) return ''; const s=String(v).replaceAll('"','""'); return /[",\n]/.test(s)?`"${s}"`:s; }
  return {init, save, clearForm, exportCsv};
})();