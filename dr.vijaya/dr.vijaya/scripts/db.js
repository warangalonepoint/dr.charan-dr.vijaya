/* DB shim (patched with 'bills' table) */
function SimpleTable(name){
  this.name=name; this.data=JSON.parse(localStorage.getItem('tbl_'+name)||'[]'); this._auto=this.data.reduce((m,x)=>Math.max(m,x.id||0),0);
}
SimpleTable.prototype._persist=function(){localStorage.setItem('tbl_'+this.name,JSON.stringify(this.data));};
SimpleTable.prototype.add=function(obj){obj={...obj}; obj.id=++this._auto; this.data.push(obj); this._persist(); return Promise.resolve(obj.id);};
SimpleTable.prototype.bulkAdd=function(arr){arr.forEach(o=>{o.id=++this._auto; this.data.push(o)}); this._persist(); return Promise.resolve();};
SimpleTable.prototype.get=function(id){return Promise.resolve(this.data.find(x=>Number(x.id)===Number(id)));};
SimpleTable.prototype.put=function(obj){const i=this.data.findIndex(x=>x.key===obj.key); if(i>-1)this.data[i]=Object.assign({},this.data[i],obj); else this.data.push(obj); this._persist(); return Promise.resolve();};
SimpleTable.prototype.update=function(id,patch){const it=this.data.find(x=>Number(x.id)===Number(id)); if(it) Object.assign(it,patch); this._persist(); return Promise.resolve();};
SimpleTable.prototype.clear=function(){this.data=[]; this._auto=0; this._persist(); return Promise.resolve();};
SimpleTable.prototype.toArray=function(){return Promise.resolve(this.data.slice());};
SimpleTable.prototype.first=function(){return Promise.resolve(this.data[0]||undefined);};
SimpleTable.prototype.reverse=function(){const self=this; return { toArray:()=>Promise.resolve(self.data.slice().reverse()) };};
SimpleTable.prototype.where=function(arg){ const self=this; if(typeof arg==='object'){ const q=arg; return { first:()=>Promise.resolve(self.data.find(row=>Object.keys(q).every(k=>row[k]===q[k]))), toArray:()=>Promise.resolve(self.data.filter(row=>Object.keys(q).every(k=>row[k]===q[k]))), limit:(n)=>({toArray:()=>Promise.resolve(self.data.filter(row=>Object.keys(q).every(k=>row[k]===q[k])).slice(0,n))})}; } else if(typeof arg==='string'){ const key=arg; return { equals:(val)=>({ toArray:()=>Promise.resolve(self.data.filter(row=>row[key]===val)), first:()=>Promise.resolve(self.data.find(row=>row[key]===val)), limit:(n)=>({toArray:()=>Promise.resolve(self.data.filter(row=>row[key]===val).slice(0,n))})})}; } return { toArray:()=>Promise.resolve(self.data.slice()) }; };
window.DB=(()=>{
  const db={
    patients:new SimpleTable('patients'),
    pregnancies:new SimpleTable('pregnancies'),
    bookings:new SimpleTable('bookings'),
    scans:new SimpleTable('scans'),
    diagnoses:new SimpleTable('diagnoses'),
    procedures:new SimpleTable('procedures'),
    counseling:new SimpleTable('counseling'),
    compliance:new SimpleTable('compliance'),
    users:new SimpleTable('users'),
    outcomes:new SimpleTable('outcomes'),
    settings:new SimpleTable('settings'),
    bills:new SimpleTable('bills')   // <-- NEW
  };
  async function ensureReady(){return db;}
  return { db, ensureReady };
})();