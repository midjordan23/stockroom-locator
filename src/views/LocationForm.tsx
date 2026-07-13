import { useState } from "react";
import { getConfig, Loc, saveLocation } from "../store";

const Chips = ({ opts, value, onPick }: { opts: string[]; value: string; onPick: (v: string) => void }) => (
  <div className="chips">
    {opts.map((o) => (
      <button key={o} className={o === value ? "on" : ""} onClick={() => onPick(o)}>{o}</button>
    ))}
  </div>
);

export default function LocationForm({ barcode, initial, onSaved }: { barcode: string; initial?: Loc; onSaved: (loc: Loc) => void }) {
  const cfg = getConfig();
  const [loc, setLoc] = useState<Loc>(initial ?? { room: cfg.rooms[0], rack: cfg.racks[0], shelf: cfg.shelves[0], bin: cfg.bins[0] });
  const pick = (k: keyof Loc) => (v: string) => setLoc({ ...loc, [k]: v });

  return (
    <div>
      <p className="muted">Barcode: {barcode}</p>
      <p className="label">Room</p>
      <Chips opts={cfg.rooms} value={loc.room} onPick={pick("room")} />
      <p className="label">Rack</p>
      <Chips opts={cfg.racks} value={loc.rack} onPick={pick("rack")} />
      <p className="label">Shelf</p>
      <Chips opts={cfg.shelves} value={loc.shelf} onPick={pick("shelf")} />
      <p className="label">Bin</p>
      <Chips opts={cfg.bins} value={loc.bin} onPick={pick("bin")} />
      <div style={{ height: 24 }} />
      <button className="btn primary" onClick={() => { saveLocation(barcode, loc); onSaved(loc); }}>Save location</button>
    </div>
  );
}
