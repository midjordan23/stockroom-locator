import { formatLoc, getHistory, timeAgo } from "../store";
import { Icon, icons } from "../icons";
import type { View } from "../App";

const Tile = ({ ic, label, onClick }: { ic: keyof typeof icons; label: string; onClick: () => void }) => (
  <button className="tile" onClick={onClick}>
    <div className="tile-ic"><Icon d={icons[ic]} /></div>{label}
  </button>
);

export default function Home({ go }: { go: (v: View) => void }) {
  const recent = getHistory().slice(0, 5);
  return (
    <div>
      <div className="tiles">
        <Tile ic="scan" label="Scan shoe" onClick={() => go("scan")} />
        <Tile ic="find" label="Find shoe" onClick={() => go("find")} />
        <Tile ic="box" label="Move shoe" onClick={() => go("scan")} />
        <Tile ic="admin" label="Admin" onClick={() => go("admin")} />
      </div>
      <p className="label">Recent activity</p>
      {recent.length === 0 ? (
        <p className="empty">No activity yet — scan your first box.</p>
      ) : (
        <ul className="list">
          {recent.map((h, i) => (
            <li key={i} style={{ cursor: "default" }}>
              <div className="body">
                <p className="title">{h.barcode}</p>
                <p className="sub">{formatLoc(h.to)}</p>
              </div>
              <p className="end muted">{timeAgo(h.movedAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
