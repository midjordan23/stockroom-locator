import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

// Camera viewfinder (barcodes + QR) with a manual-entry fallback. Stays open for continuous scans.
export default function Scanner({ onDetect, submitLabel = "Enter" }: { onDetect: (code: string) => void; submitLabel?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState("");
  const [camError, setCamError] = useState("");

  useEffect(() => {
    let controls: IScannerControls | undefined;
    new BrowserMultiFormatReader()
      .decodeFromVideoDevice(undefined, video.current!, (result) => {
        if (result) onDetect(result.getText());
      })
      .then((c) => (controls = c))
      .catch((e) => setCamError(e.name === "NotAllowedError" ? "Camera access denied — allow it in Settings, or type the code below." : "No camera available — type the code below."));
    return () => controls?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {camError ? <p className="empty">{camError}</p> : <video ref={video} className="viewfinder" muted playsInline />}
      {!camError && <p className="hint">Point the camera at the code</p>}
      <div className="divider">or type it</div>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) { onDetect(manual.trim()); setManual(""); }
        }}
      >
        <input className="input" placeholder="Code" value={manual} onChange={(e) => setManual(e.target.value)} />
        <button className="btn primary" disabled={!manual.trim()}>{submitLabel}</button>
      </form>
    </div>
  );
}
