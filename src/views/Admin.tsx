import { useRef, useState } from "react";
import QRCode from "qrcode";
import { exportSnapshot, getName, getSessions, importSnapshot, setName, timeAgo } from "../store";

export default function Admin() {
  const [name, setNameState] = useState(getName());
  const [labels, setLabels] = useState("");
  const [qrs, setQrs] = useState<{ label: string; url: string }[]>([]);
  const [msg, setMsg] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const makeLabels = async () => {
    const names = labels.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    setQrs(await Promise.all(names.map(async (label) => ({ label, url: await QRCode.toDataURL(label, { margin: 1, scale: 8 }) }))));
  };

  const doExport = async () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([await exportSnapshot()], { type: "application/json" }));
    a.download = `stockroom-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const doImport = async (f: File) => {
    try {
      const n = await importSnapshot(await f.text());
      setNameState(getName());
      setMsg(`Restored ${n} barcodes ✓`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Import failed.");
    }
  };

  return (
    <div>
      <p className="label">Employee name</p>
      <input className="input" placeholder="Shown in session history" value={name}
        onChange={(e) => { setNameState(e.target.value); setName(e.target.value); }} />

      <p className="label">Shelf QR labels</p>
      <p className="muted">One shelf per line (or comma-separated), e.g. Offsite A1. Generate, then print this page and tape each label to its shelf.</p>
      <div className="stack" style={{ marginTop: 10 }}>
        <textarea className="input" rows={3} placeholder={"Offsite A1\nOffsite A2\nOffsite B4"} value={labels} onChange={(e) => setLabels(e.target.value)} />
        <div className="row-btns">
          <button className="btn ghost" onClick={makeLabels} disabled={!labels.trim()}>Generate</button>
          {qrs.length > 0 && <button className="btn primary" onClick={() => window.print()}>Print labels</button>}
        </div>
      </div>
      {qrs.length > 0 && (
        <div className="qr-grid">
          {qrs.map((q) => (
            <figure key={q.label}>
              <img src={q.url} alt={`QR for ${q.label}`} />
              <figcaption>{q.label}</figcaption>
            </figure>
          ))}
        </div>
      )}

      <p className="label">Backup</p>
      <div className="row-btns">
        <button className="btn ghost" onClick={doExport}>Export</button>
        <button className="btn ghost" onClick={() => file.current?.click()}>Import</button>
      </div>
      <input ref={file} type="file" accept=".json" hidden onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
      {msg && <p className="hint">{msg}</p>}

      <p className="label">Session history</p>
      {getSessions().length === 0 ? (
        <p className="empty">No sessions yet.</p>
      ) : (
        <ul className="list">
          {getSessions().slice(0, 50).map((s, i) => (
            <li key={i} style={{ cursor: "default" }}>
              <div className="body">
                <p className="title">{s.shelf} — {s.type === "in" ? "Scan in" : "Scan out"}</p>
                <p className="sub">{s.ok} scans{s.fail ? ` · ${s.fail} failed` : ""} · {Math.max(1, Math.round((s.end - s.start) / 60000))} min{s.employee ? ` · ${s.employee}` : ""}</p>
              </div>
              <p className="end muted">{timeAgo(s.end)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
