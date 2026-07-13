import { Item, timeAgo } from "../store";
import { usePhoto } from "../photos";

export default function LocationCard({ item }: { item: Item }) {
  const photo = usePhoto(item.barcode);
  return (
    <div className="card">
      {photo && <img className="photo" src={photo} alt="Shoe" />}
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
