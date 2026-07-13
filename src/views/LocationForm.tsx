import { useState } from "react";
import { getConfig, Loc, saveLocation } from "../store";
import { compress, setPhoto, usePhoto } from "../photos";
import { Icon, icons } from "../icons";

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
  const existing = usePhoto(barcode);
  const [shot, setShot] = useState<string>();
  const photo = shot ?? existing;

  return (
    <div>
      <p className="muted">Barcode: {barcode}</p>
      <p className="label">Photo</p>
      {photo && <img className="photo" src={photo} alt="Shoe" />}
      <label className="btn ghost">
        <Icon d={icons.camera} size={19} />{photo ? "Retake photo" : "Add photo"}
        <input type="file" accept="image/*" capture="environment" hidden
          onChange={async (e) => { const f = e.target.files?.[0]; if (f) setShot(await compress(f)); }} />
      </label>
      <p className="label">Room</p>
      <Chips opts={cfg.rooms} value={loc.room} onPick={pick("room")} />
      <p className="label">Rack</p>
      <Chips opts={cfg.racks} value={loc.rack} onPick={pick("rack")} />
      <p className="label">Shelf</p>
      <Chips opts={cfg.shelves} value={loc.shelf} onPick={pick("shelf")} />
      <p className="label">Bin</p>
      <Chips opts={cfg.bins} value={loc.bin} onPick={pick("bin")} />
      <div style={{ height: 24 }} />
      <button className="btn primary" onClick={async () => { saveLocation(barcode, loc); if (shot) await setPhoto(barcode.trim(), shot); onSaved(loc); }}>Save location</button>
    </div>
  );
}
