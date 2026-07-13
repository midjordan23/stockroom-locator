import { useState } from "react";
import LocationCard from "./LocationCard";
import LocationForm from "./LocationForm";
import { deleteItem, formatLoc, getItems, Item, timeAgo } from "../store";
import { delPhoto, usePhoto } from "../photos";

function Row({ item, onClick }: { item: Item; onClick: () => void }) {
  const photo = usePhoto(item.barcode);
  return (
    <li onClick={onClick}>
      {photo ? <img className="thumb" src={photo} alt="" /> : <div className="thumb">👟</div>}
      <div className="body">
        <p className="title">{item.barcode}</p>
        <p className="sub">{formatLoc(item)}</p>
      </div>
      <p className="end muted">{timeAgo(item.updatedAt)}</p>
    </li>
  );
}

export default function Find() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Item | null>(null);
  const [editing, setEditing] = useState(false);

  if (sel) {
    if (editing)
      return (
        <div>
          <h2>Move shoe</h2>
          <LocationForm barcode={sel.barcode} initial={sel} onSaved={() => { setSel(null); setEditing(false); }} />
          <div style={{ height: 10 }} />
          <button className="btn ghost" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      );
    return (
      <div>
        <h2>Shoe location</h2>
        <LocationCard item={sel} />
        <div className="stack">
          <button className="btn primary" onClick={() => setEditing(true)}>Move / edit location</button>
          <button className="btn ghost" onClick={() => setSel(null)}>Back to list</button>
          <button className="btn ghost" style={{ color: "#c1121f", borderColor: "#c1121f" }}
            onClick={() => { if (confirm(`Delete ${sel.barcode}?`)) { deleteItem(sel.barcode); delPhoto(sel.barcode); setSel(null); } }}>
            Delete
          </button>
        </div>
      </div>
    );
  }

  const items = Object.values(getItems())
    .filter((i) => i.barcode.includes(q.trim()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div>
      <input className="search" inputMode="numeric" placeholder="🔍  Search barcode" value={q} onChange={(e) => setQ(e.target.value)} />
      {items.length === 0 ? (
        <p className="empty">{q ? "No match — check the number or scan the box." : "Nothing saved yet. Scan a shoe to get started."}</p>
      ) : (
        <ul className="list">
          {items.map((i) => <Row key={i.barcode} item={i} onClick={() => setSel(i)} />)}
        </ul>
      )}
    </div>
  );
}
