import { getSessions, timeAgo } from "../store";
import { Icon, icons } from "../icons";
import type { View } from "../App";

const Tile = ({ ic, label, onClick }: { ic: keyof typeof icons; label: string; onClick: () => void }) => (
  <button className="tile" onClick={onClick}>
    <div className="tile-ic"><Icon d={icons[ic]} /></div>{label}
  </button>
);

export default function Home({ go }: { go: (v: View) => void }) {
  const recent = getSessions().slice(0, 5);
  return (
    <div>
      <div className="tiles">
        <Tile ic="scan" label="Shelf session" onClick={() => go("session")} />
        <Tile ic="find" label="Find shoe" onClick={() => go("find")} />
        <Tile ic="box" label="Scan in / out" onClick={() => go("session")} />
        <Tile ic="admin" label="Admin" onClick={() => go("admin")} />
      </div>
      <p className="label">Recent sessions</p>
      {recent.length === 0 ? (
        <p className="empty">No sessions yet — scan a shelf label to start.</p>
      ) : (
        <ul className="list">
          {recent.map((s, i) => (
            <li key={i} style={{ cursor: "default" }}>
              <div className="body">
                <p className="title">{s.shelf}</p>
                <p className="sub">{s.type === "in" ? "Scan in" : "Scan out"} · {s.ok} scans{s.fail ? ` · ${s.fail} failed` : ""}</p>
              </div>
              <p className="end muted">{timeAgo(s.end)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
