import { allPhotos, setPhoto } from "./photos";

export type Loc = { room: string; rack: string; shelf: string; bin: string };
export type Item = Loc & { barcode: string; updatedAt: number };
export type MoveRecord = { barcode: string; from: Loc | null; to: Loc; movedAt: number };
export type AdminCfg = { rooms: string[]; racks: string[]; shelves: string[]; bins: string[] };

const seq = (n: number, label: string) => Array.from({ length: n }, (_, i) => `${label} ${i + 1}`);
const DEFAULT_CFG: AdminCfg = { rooms: ["Room A", "Room B"], racks: seq(10, "Rack"), shelves: seq(5, "Shelf"), bins: seq(8, "Bin") };

const read = <T,>(key: string, fallback: T): T => JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
const write = (key: string, v: unknown) => localStorage.setItem(key, JSON.stringify(v));

export const getItems = () => read<Record<string, Item>>("srl.items", {});
export const getItem = (barcode: string) => getItems()[barcode.trim()] ?? null;
export const getHistory = () => read<MoveRecord[]>("srl.history", []);
export const getConfig = () => read<AdminCfg>("srl.config", DEFAULT_CFG);
export const saveConfig = (cfg: AdminCfg) => write("srl.config", cfg);

export function saveLocation(barcode: string, to: Loc): Item {
  const code = barcode.trim();
  const items = getItems();
  const prev = items[code];
  const item: Item = { barcode: code, ...to, updatedAt: Date.now() };
  items[code] = item;
  write("srl.items", items);
  const from = prev ? { room: prev.room, rack: prev.rack, shelf: prev.shelf, bin: prev.bin } : null;
  write("srl.history", [{ barcode: code, from, to, movedAt: item.updatedAt }, ...getHistory()].slice(0, 500));
  return item;
}

export function deleteItem(barcode: string) {
  const items = getItems();
  delete items[barcode.trim()];
  write("srl.items", items);
}

export const exportSnapshot = async () =>
  JSON.stringify({ version: 1, items: getItems(), history: getHistory(), config: getConfig(), photos: await allPhotos() }, null, 2);

export async function importSnapshot(json: string) {
  const snap = JSON.parse(json);
  if (!snap?.items || !snap?.config) throw new Error("Not a valid StockRoom backup file.");
  write("srl.items", snap.items);
  write("srl.history", snap.history ?? []);
  write("srl.config", snap.config);
  for (const [k, v] of Object.entries(snap.photos ?? {})) await setPhoto(k, v as string);
  return Object.keys(snap.items).length;
}

export const formatLoc = (l: Loc) => `${l.room} · ${l.rack} · ${l.shelf} · ${l.bin}`;

export function timeAgo(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  if (m < 43200) return `${Math.floor(m / 1440)}d ago`;
  return new Date(ts).toLocaleDateString();
}
