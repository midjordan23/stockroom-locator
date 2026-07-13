import { useRef, useState } from "react";
import { AdminCfg, exportSnapshot, formatLoc, getConfig, getHistory, importSnapshot, saveConfig, timeAgo } from "../store";

function CfgList({ label, one, name, cfg, setCfg }: { label: string; one: string; name: keyof AdminCfg; cfg: AdminCfg; setCfg: (c: AdminCfg) => void }) {
  const [add, setAdd] = useState("");
  const update = (list: string[]) => { const next = { ...cfg, [name]: list }; saveConfig(next); setCfg(next); };
  return (
    <div>
      <p className="label">{label}</p>
      <div className="chips">
        {cfg[name].map((v) => (
          <button key={v} onClick={() => confirm(`Remove ${v}?`) && update(cfg[name].filter((x) => x !== v))}>{v} ✕</button>
        ))}
      </div>
      <form className="row-btns" style={{ marginTop: 10 }}
        onSubmit={(e) => { e.preventDefault(); const v = add.trim(); if (v && !cfg[name].includes(v)) update([...cfg[name], v]); setAdd(""); }}>
        <input className="input" placeholder={`Add ${one}`} value={add} onChange={(e) => setAdd(e.target.value)} />
        <button className="btn ghost" style={{ width: 90 }}>Add</button>
      </form>
    </div>
  );
}

export default function Admin() {
  const [cfg, setCfg] = useState(getConfig());
  const [msg, setMsg] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const doExport = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([exportSnapshot()], { type: "application/json" }));
    a.download = `stockroom-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const doImport = async (f: File) => {
    try {
      const n = importSnapshot(await f.text());
      setCfg(getConfig());
      setMsg(`Restored ${n} items ✓`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Import failed.");
    }
  };

  return (
    <div>
      <CfgList label="Rooms" one="room" name="rooms" cfg={cfg} setCfg={setCfg} />
      <CfgList label="Racks" one="rack" name="racks" cfg={cfg} setCfg={setCfg} />
      <CfgList label="Shelves" one="shelf" name="shelves" cfg={cfg} setCfg={setCfg} />
      <CfgList label="Bins" one="bin" name="bins" cfg={cfg} setCfg={setCfg} />

      <p className="label">Backup</p>
      <div className="row-btns">
        <button className="btn ghost" onClick={doExport}>Export</button>
        <button className="btn ghost" onClick={() => file.current?.click()}>Import</button>
      </div>
      <input ref={file} type="file" accept=".json" hidden onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
      {msg && <p className="hint">{msg}</p>}

      <p className="label">Move history</p>
      {getHistory().length === 0 ? (
        <p className="empty">No moves yet.</p>
      ) : (
        <ul className="list">
          {getHistory().slice(0, 50).map((h, i) => (
            <li key={i} style={{ cursor: "default" }}>
              <div className="body">
                <p className="title">{h.barcode}</p>
                <p className="sub">{h.from ? `${formatLoc(h.from)} → ${formatLoc(h.to)}` : `Added at ${formatLoc(h.to)}`}</p>
              </div>
              <p className="end muted">{timeAgo(h.movedAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
