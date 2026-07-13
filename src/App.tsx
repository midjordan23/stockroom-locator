import { useState } from "react";
import { Icon, icons } from "./icons";
import Home from "./views/Home";
import Session from "./views/Session";
import Find from "./views/Find";
import Admin from "./views/Admin";

export type View = "home" | "session" | "find" | "admin";

const TITLES: Record<View, string> = { home: "StockRoom", session: "Shelf session", find: "Find a shoe", admin: "Admin" };
const NAV: [View, keyof typeof icons, string][] = [["home", "home", "Home"], ["session", "scan", "Session"], ["find", "find", "Find"], ["admin", "admin", "Admin"]];

export default function App() {
  const [view, setView] = useState<View>("home");
  const [epoch, setEpoch] = useState(0); // remount view on nav so each visit starts fresh
  const go = (v: View) => { setView(v); setEpoch(epoch + 1); };

  return (
    <div className="screen">
      <div className="top">
        {view !== "home" && <button className="iconbtn" onClick={() => go("home")} aria-label="Back"><Icon d={icons.back} /></button>}
        <h1>{TITLES[view]}</h1>
      </div>
      <div key={epoch}>
        {view === "home" && <Home go={go} />}
        {view === "session" && <Session />}
        {view === "find" && <Find />}
        {view === "admin" && <Admin />}
      </div>
      <nav className="nav">
        {NAV.map(([v, ic, label]) => (
          <button key={v} className={view === v ? "on" : ""} onClick={() => go(v)}>
            <Icon d={icons[ic]} />{label}
          </button>
        ))}
      </nav>
    </div>
  );
}
