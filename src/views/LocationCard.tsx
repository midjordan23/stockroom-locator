import { Item, timeAgo } from "../store";

export default function LocationCard({ item }: { item: Item }) {
  return (
    <div className="card">
      <p className="code">{item.barcode}</p>
      <div className="loc-grid">
        <div><small>Room</small><b>{item.room}</b></div>
        <div><small>Rack</small><b>{item.rack}</b></div>
        <div><small>Shelf</small><b>{item.shelf}</b></div>
        <div><small>Bin</small><b>{item.bin}</b></div>
      </div>
      <p className="muted">Updated {timeAgo(item.updatedAt)}</p>
    </div>
  );
}
