import { useState } from "react";
import { Icon, icons } from "./icons";
import Home from "./views/Home";
import Scan from "./views/Scan";
import Find from "./views/Find";
import Admin from "./views/Admin";

export type View = "home" | "scan" | "find" | "admin";

const TITLES: Record<View, string> = { home: "StockRoom", scan: "Scan", find: "Find a shoe", admin: "Admin" };
const NAV: [View, string][] = [["home", "Home"], ["scan", "Scan"], ["find", "Find"], ["admin", "Admin"]];

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
        {view === "scan" && <Scan />}
        {view === "find" && <Find />}
        {view === "admin" && <Admin />}
      </div>
      <nav className="nav">
        {NAV.map(([v, label]) => (
          <button key={v} className={view === v ? "on" : ""} onClick={() => go(v)}>
            <Icon d={icons[v]} />{label}
          </button>
        ))}
      </nav>
    </div>
  );
}
