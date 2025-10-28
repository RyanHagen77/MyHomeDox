// app/register/page.tsx
"use client";
import { useState } from "react";
export default function RegisterPage() {
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [msg, setMsg] = useState<string|null>(null);
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    const res = await fetch("/api/register", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { const j = await res.json().catch(()=>({})); setMsg(j.error || "Failed to register"); return; }
    window.location.href = "/login";
  }
  return (
    <main className="mx-auto max-w-md p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input className="w-full border rounded p-2" type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required/>
        <input className="w-full border rounded p-2" type="password" placeholder="Password (min 8)" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} required/>
        <button className="w-full rounded p-2 bg-black text-white">Create account</button>
      </form>
      {msg && <p className="text-sm">{msg}</p>}
    </main>
  );
}