import { useState } from "react";
import Scanner from "../scanner";
import LocationCard from "./LocationCard";
import LocationForm from "./LocationForm";
import { getItem, Item } from "../store";

type Stage = { step: "scan" } | { step: "found"; item: Item } | { step: "new" | "move"; barcode: string; item?: Item } | { step: "saved"; item: Item };

export default function Scan() {
  const [stage, setStage] = useState<Stage>({ step: "scan" });

  const onDetect = (barcode: string) => {
    const item = getItem(barcode);
    setStage(item ? { step: "found", item } : { step: "new", barcode: barcode.trim() });
  };

  if (stage.step === "scan") return <Scanner onDetect={onDetect} />;

  if (stage.step === "found")
    return (
      <div>
        <h2>Found it 🎯</h2>
        <LocationCard item={stage.item} />
        <div className="row-btns">
          <button className="btn ghost" onClick={() => setStage({ step: "move", barcode: stage.item.barcode, item: stage.item })}>Move</button>
          <button className="btn primary" onClick={() => setStage({ step: "scan" })}>Scan next</button>
        </div>
      </div>
    );

  if (stage.step === "saved")
    return (
      <div>
        <h2>Saved ✓</h2>
        <LocationCard item={stage.item} />
        <button className="btn primary" onClick={() => setStage({ step: "scan" })}>Scan next</button>
      </div>
    );

  return (
    <div>
      <h2>{stage.step === "move" ? "Move shoe" : "New shoe — save its spot"}</h2>
      {stage.step === "new" && <p className="muted" style={{ margin: "8px 0 4px" }}>This barcode isn't saved yet.</p>}
      <LocationForm barcode={stage.barcode} initial={stage.item} onSaved={() => setStage({ step: "saved", item: getItem(stage.barcode)! })} />
      <div style={{ height: 10 }} />
      <button className="btn ghost" onClick={() => setStage({ step: "scan" })}>Cancel</button>
    </div>
  );
}
