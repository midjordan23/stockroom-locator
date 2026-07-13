import { formatLoc, getHistory, timeAgo } from "../store";
import type { View } from "../App";

export default function Home({ go }: { go: (v: View) => void }) {
  const recent = getHistory().slice(0, 5);
  return (
    <div>
      <div className="tiles">
        <button className="tile" onClick={() => go("scan")}><span>📷</span>Scan shoe</button>
        <button className="tile" onClick={() => go("find")}><span>🔍</span>Find shoe</button>
        <button className="tile" onClick={() => go("scan")}><span>📦</span>Move shoe</button>
        <button className="tile" onClick={() => go("admin")}><span>⚙️</span>Admin</button>
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
