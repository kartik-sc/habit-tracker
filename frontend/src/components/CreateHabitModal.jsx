import React, { useState } from "react";

export default function CreateHabitModal({ open, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [customTimes, setCustomTimes] = useState(3);
  const [startDate, setStartDate] = useState("");
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    onCreate({
      name,
      description,
      frequency,
      times_per_week: frequency === "custom" ? customTimes : 7,
      start_date: startDate,
    });
    setName("");
    setDescription("");
    setFrequency("daily");
    setCustomTimes(3);
    setStartDate("");
    setError(null);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{position: 'fixed', top:0, left:0, right:0, bottom:0, background:'var(--modal-bg)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <form className="terminal-panel" style={{background:'var(--surface)', padding:32, borderRadius:8, minWidth:320, maxWidth:400, boxShadow:'var(--shadow)'}} onSubmit={handleSubmit}>
        <h3 style={{fontFamily:'IBM Plex Serif,serif', color:'var(--text)', fontWeight:700, fontSize:20, marginBottom:16}}>Create Habit</h3>
        {error && <div style={{color:'var(--negative)', marginBottom:8}}>{error}</div>}
        <div style={{marginBottom:12}}>
          <label style={{fontFamily:'IBM Plex Mono,monospace', fontSize:13, color:'var(--muted)'}}>Name</label>
          <input style={{width:'100%',marginTop:4,padding:8,borderRadius:4,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--text)'}} value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div style={{marginBottom:12}}>
          <label style={{fontFamily:'IBM Plex Mono,monospace', fontSize:13, color:'var(--muted)'}}>Description</label>
          <input style={{width:'100%',marginTop:4,padding:8,borderRadius:4,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--text)'}} value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <div style={{marginBottom:12}}>
          <label style={{fontFamily:'IBM Plex Mono,monospace', fontSize:13, color:'var(--muted)'}}>Frequency</label>
          <select style={{width:'100%',marginTop:4,padding:8,borderRadius:4,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--text)'}} value={frequency} onChange={e=>setFrequency(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        {frequency === "custom" && (
          <div style={{marginBottom:12}}>
            <label style={{fontFamily:'IBM Plex Mono,monospace', fontSize:13, color:'var(--muted)'}}>Times per week</label>
            <input type="number" min={1} max={7} style={{width:'100%',marginTop:4,padding:8,borderRadius:4,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--text)'}} value={customTimes} onChange={e=>setCustomTimes(Number(e.target.value))} />
          </div>
        )}
        <div style={{marginBottom:18}}>
          <label style={{fontFamily:'IBM Plex Mono,monospace', fontSize:13, color:'var(--muted)'}}>Start Date</label>
          <input type="date" style={{width:'100%',marginTop:4,padding:8,borderRadius:4,border:'1px solid var(--border)',background:'var(--surface-2)',color:'var(--text)'}} value={startDate} onChange={e=>setStartDate(e.target.value)} />
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <button type="button" className="terminal-btn" style={{background:'var(--border)',color:'var(--muted)'}} onClick={onClose}>Cancel</button>
          <button type="submit" className="terminal-btn">Create</button>
        </div>
      </form>
    </div>
  );
}
