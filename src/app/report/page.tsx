"use client";
import * as React from "react";

export default function ReportPage() {
  const [data, setData] = React.useState<any>(null);

  React.useEffect(()=> {
    (async ()=>{
      await new Promise(r=>setTimeout(r,150));
      const res = await fetch("/mock/home.json");
      setData(await res.json());
    })();
  }, []);

  if (!data) return <div className="p-6">Loading report…</div>;

  const { property, records, warranties } = data;

  return (
    <div className="mx-auto max-w-3xl bg-white my-6 p-6 border rounded">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Home History Report</h1>
        <p className="text-subtext">{property.address}</p>
      </header>

      <section className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Health Score" value={`${property.healthScore}/100`} />
        <Stat label="Est. Value" value={`$${property.estValue.toLocaleString()}`} />
        <Stat label="Year Built" value={property.yearBuilt} />
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Verified History</h2>
        <ul className="divide-y">
          {records.map((r:any)=>(
            <li key={r.id} className="py-3 flex items-start justify-between">
              <div>
                <div className="font-medium">{r.title} • <span className="text-subtext">{r.vendor}</span></div>
                <div className="text-sm text-subtext">{new Date(r.date).toLocaleDateString()} • {r.category}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${r.cost.toLocaleString()}</div>
                <span className={`text-xs px-2 py-1 rounded ${r.verified ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                  {r.verified ? "Verified" : "Unverified"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Warranties</h2>
        <ul className="space-y-2">
          {warranties.map((w:any)=>(
            <li key={w.id} className="flex items-center justify-between text-sm">
              <span>{w.item} • <span className="text-subtext">{w.vendor}</span></span>
              <span className="text-subtext">Expires {new Date(w.expires).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-8 text-xs text-subtext">
        Generated {new Date().toLocaleString()} • For demonstration purposes only
      </footer>
    </div>
  );
}

function Stat({ label, value }:{label:string; value:string|number}){
  return (
    <div className="border rounded p-3">
      <div className="text-xs text-subtext">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
