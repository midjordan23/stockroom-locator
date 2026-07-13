import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";

// Camera viewfinder + manual entry fallback. Calls onDetect with the barcode either way.
export default function Scanner({ onDetect }: { onDetect: (barcode: string) => void }) {
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
      .catch((e) => setCamError(e.name === "NotAllowedError" ? "Camera access denied — allow it in Settings, or type the barcode below." : "No camera available — type the barcode below."));
    return () => controls?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {camError ? <p className="empty">{camError}</p> : <video ref={video} className="viewfinder" muted playsInline />}
      {!camError && <p className="hint">Point the camera at the box barcode</p>}
      <div className="divider">or type it</div>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) onDetect(manual);
        }}
      >
        <input className="input" inputMode="numeric" placeholder="Barcode number" value={manual} onChange={(e) => setManual(e.target.value)} />
        <button className="btn primary" disabled={!manual.trim()}>Look up</button>
      </form>
    </div>
  );
}
