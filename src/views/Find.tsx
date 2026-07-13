import { useState } from "react";
import Scanner from "../scanner";
import { deleteBarcode, getStock, shelvesFor, timeAgo } from "../store";
import { compress, delPhoto, setPhoto, usePhoto } from "../photos";
import { Icon, icons } from "../icons";

function Row({ code, total, shelves, at, onClick }: { code: string; total: number; shelves: number; at: number; onClick: () => void }) {
  const photo = usePhoto(code);
  return (
    <li onClick={onClick}>
      {photo ? <img className="thumb" src={photo} alt="" /> : <div className="thumb"><Icon d={icons.box} /></div>}
      <div className="body">
        <p className="title">{code}</p>
        <p className="sub">{total} on {shelves} {shelves === 1 ? "shelf" : "shelves"}</p>
      </div>
      <p className="end muted">{timeAgo(at)}</p>
    </li>
  );
}

function Detail({ code, onBack }: { code: string; onBack: () => void }) {
  const existing = usePhoto(code);
  const [shot, setShot] = useState<string>();
  const photo = shot ?? existing;
  const rows = shelvesFor(code);
  return (
    <div>
      <h2>Shoe</h2>
      <div className="card">
        {photo && <img className="photo" src={photo} alt="Shoe" />}
        <p className="code">{code}</p>
        <div className="loc-grid">
          {rows.map((r) => (
            <div key={r.shelf}><small>{r.shelf}</small><b>× {r.qty}</b></div>
          ))}
        </div>
        {rows.length === 0 && <p className="muted">Not on any shelf right now.</p>}
      </div>
      <div className="stack">
        <label className="btn ghost">
          <Icon d={icons.camera} size={19} />{photo ? "Retake photo" : "Add photo"}
          <input type="file" accept="image/*" capture="environment" hidden
            onChange={async (e) => { const f = e.target.files?.[0]; if (f) { const p = await compress(f); await setPhoto(code, p); setShot(p); } }} />
        </label>
        <button className="btn ghost" onClick={onBack}>Back to list</button>
        <button className="btn ghost" style={{ color: "var(--accent-deep)", borderColor: "var(--accent-deep)" }}
          onClick={() => { if (confirm(`Delete ${code} from all shelves?`)) { deleteBarcode(code); delPhoto(code); onBack(); } }}>
          Delete everywhere
        </button>
      </div>
    </div>
  );
}

export default function Find() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  if (sel) return <Detail code={sel} onBack={() => setSel(null)} />;

  if (scanning)
    return (
      <div>
        <h2>Scan to find</h2>
        <Scanner onDetect={(code) => { setScanning(false); setSel(code.trim()); }} submitLabel="Look up" />
        <div style={{ height: 10 }} />
        <button className="btn ghost" onClick={() => setScanning(false)}>Cancel</button>
      </div>
    );

  const stock = getStock();
  const codes = Object.keys(stock)
    .filter((c) => c.includes(q.trim()))
    .map((code) => {
      const shelves = Object.values(stock[code]);
      return { code, total: shelves.reduce((s, x) => s + x.qty, 0), shelves: shelves.length, at: Math.max(...shelves.map((x) => x.at)) };
    })
    .sort((a, b) => b.at - a.at);

  return (
    <div>
      <div className="stack">
        <button className="btn primary" onClick={() => setScanning(true)}>Scan a shoe</button>
        <input className="search" placeholder="Search barcode" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {codes.length === 0 ? (
        <p className="empty">{q ? "No match — check the number or scan the box." : "Nothing in stock yet. Run a scan-in session to get started."}</p>
      ) : (
        <ul className="list">
          {codes.map((c) => <Row key={c.code} {...c} onClick={() => setSel(c.code)} />)}
        </ul>
      )}
    </div>
  );
}
