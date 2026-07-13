import { useRef, useState } from "react";
import Scanner from "../scanner";
import { adjust, getName, saveSession } from "../store";

type Mode = "in" | "out";
type Stage =
  | { step: "shelf" }
  | { step: "mode"; shelf: string }
  | { step: "scan"; shelf: string; mode: Mode }
  | { step: "done"; shelf: string; mode: Mode; ok: number; fail: number };

let audio: AudioContext | undefined;
const beep = (freq: number) => {
  try {
    audio ??= new AudioContext();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.15, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.15);
    o.connect(g).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.2);
  } catch { /* no audio available */ }
};

export default function Session() {
  const [stage, setStage] = useState<Stage>({ step: "shelf" });
  const [ok, setOk] = useState(0);
  const [fail, setFail] = useState(0);
  const [feed, setFeed] = useState<{ code: string; qty: number | null }[]>([]);
  const last = useRef({ code: "", at: 0 });
  const start = useRef(0);

  const begin = (shelf: string, mode: Mode) => {
    setOk(0); setFail(0); setFeed([]);
    start.current = Date.now();
    setStage({ step: "scan", shelf, mode });
  };

  const onShoe = (shelf: string, mode: Mode) => (code: string) => {
    const now = Date.now();
    if (code === last.current.code && now - last.current.at < 2500) return; // camera re-reads the same box
    last.current = { code, at: now };
    const qty = adjust(code, shelf, mode === "in" ? 1 : -1);
    beep(qty === null ? 220 : 880);
    navigator.vibrate?.(qty === null ? [80, 60, 80] : 40);
    qty === null ? setFail((f) => f + 1) : setOk((o) => o + 1);
    setFeed((f) => [{ code, qty }, ...f].slice(0, 8));
  };

  if (stage.step === "shelf")
    return (
      <div>
        <h2>Scan shelf label</h2>
        <p className="hint">Point at the shelf's QR code to start a session.</p>
        <Scanner onDetect={(shelf) => setStage({ step: "mode", shelf })} submitLabel="Use this shelf" />
      </div>
    );

  if (stage.step === "mode")
    return (
      <div>
        <h2>Shelf</h2>
        <p className="shelf-tag">{stage.shelf}</p>
        <div className="stack" style={{ marginTop: 14 }}>
          <button className="btn primary" onClick={() => begin(stage.shelf, "in")}>Scan in — add to shelf</button>
          <button className="btn ghost" onClick={() => begin(stage.shelf, "out")}>Scan out — remove from shelf</button>
          <button className="btn ghost" onClick={() => setStage({ step: "shelf" })}>Different shelf</button>
        </div>
      </div>
    );

  if (stage.step === "scan")
    return (
      <div>
        <h2>{stage.mode === "in" ? "Scan in" : "Scan out"}</h2>
        <p className="shelf-tag">{stage.shelf}</p>
        <div className="count">
          <div><small>Scans</small><b>{ok}</b></div>
          <div className={fail ? "bad" : ""}><small>Failed</small><b>{fail}</b></div>
        </div>
        <Scanner onDetect={onShoe(stage.shelf, stage.mode)} submitLabel="Add scan" />
        {feed.length > 0 && (
          <ul className="list">
            {feed.map((f, i) => (
              <li key={i} style={{ cursor: "default" }}>
                <div className="body">
                  <p className="title">{f.code}</p>
                  {f.qty === null && <p className="sub fail-note">Not on this shelf — nothing removed</p>}
                </div>
                <p className="end muted">{f.qty === null ? "✕" : `qty ${f.qty}`}</p>
              </li>
            ))}
          </ul>
        )}
        <div style={{ height: 14 }} />
        <button
          className="btn primary"
          onClick={() => {
            saveSession({ shelf: stage.shelf, type: stage.mode, employee: getName(), start: start.current, end: Date.now(), ok, fail });
            setStage({ step: "done", shelf: stage.shelf, mode: stage.mode, ok, fail });
          }}
        >
          Finish session
        </button>
      </div>
    );

  return (
    <div>
      <h2>Session saved</h2>
      <p className="shelf-tag">{stage.shelf}</p>
      <div className="count">
        <div><small>{stage.mode === "in" ? "Scanned in" : "Scanned out"}</small><b>{stage.ok}</b></div>
        <div className={stage.fail ? "bad" : ""}><small>Failed</small><b>{stage.fail}</b></div>
      </div>
      <button className="btn primary" onClick={() => setStage({ step: "shelf" })}>New session</button>
    </div>
  );
}
