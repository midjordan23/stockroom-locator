import { allPhotos, setPhoto } from "./photos";

export type ShelfQty = { qty: number; at: number };
export type Stock = Record<string, Record<string, ShelfQty>>; // barcode → shelf → qty
export type Session = { shelf: string; type: "in" | "out"; employee: string; start: number; end: number; ok: number; fail: number };

const read = <T,>(key: string, fallback: T): T => JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
const write = (key: string, v: unknown) => localStorage.setItem(key, JSON.stringify(v));

export const getStock = () => read<Stock>("srl.stock", {});
export const getSessions = () => read<Session[]>("srl.sessions", []);
export const getName = () => read<string>("srl.name", "");
export const setName = (n: string) => write("srl.name", n.trim());

// Apply one scan. Returns new qty on that shelf, or null for a scan-out of a barcode not on the shelf.
export function adjust(barcode: string, shelf: string, delta: 1 | -1): number | null {
  const code = barcode.trim();
  const stock = getStock();
  const shelves = (stock[code] ??= {});
  const cur = shelves[shelf]?.qty ?? 0;
  if (delta < 0 && cur <= 0) return null;
  const qty = cur + delta;
  if (qty <= 0) delete shelves[shelf];
  else shelves[shelf] = { qty, at: Date.now() };
  if (!Object.keys(shelves).length) delete stock[code];
  write("srl.stock", stock);
  return qty;
}

export const shelvesFor = (barcode: string) =>
  Object.entries(getStock()[barcode.trim()] ?? {})
    .map(([shelf, s]) => ({ shelf, ...s }))
    .sort((a, b) => b.qty - a.qty);

export function deleteBarcode(barcode: string) {
  const stock = getStock();
  delete stock[barcode.trim()];
  write("srl.stock", stock);
}

export const saveSession = (s: Session) => write("srl.sessions", [s, ...getSessions()].slice(0, 200));

export const exportSnapshot = async () =>
  JSON.stringify({ version: 2, stock: getStock(), sessions: getSessions(), name: getName(), photos: await allPhotos() }, null, 2);

export async function importSnapshot(json: string) {
  const snap = JSON.parse(json);
  if (!snap?.stock) throw new Error("Not a valid StockRoom backup file.");
  write("srl.stock", snap.stock);
  write("srl.sessions", snap.sessions ?? []);
  write("srl.name", snap.name ?? "");
  for (const [k, v] of Object.entries(snap.photos ?? {})) await setPhoto(k, v as string);
  return Object.keys(snap.stock).length;
}

export function timeAgo(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  if (m < 43200) return `${Math.floor(m / 1440)}d ago`;
  return new Date(ts).toLocaleDateString();
}
