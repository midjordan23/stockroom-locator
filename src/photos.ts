import { useEffect, useState } from "react";

// Photos live in IndexedDB (too big for localStorage), keyed by barcode, as compressed JPEG data URLs.
const req = <T,>(r: IDBRequest<T>) => new Promise<T>((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

let _db: Promise<IDBDatabase> | undefined;
const store = async (mode: IDBTransactionMode) => {
  _db ??= (() => { const o = indexedDB.open("srl", 1); o.onupgradeneeded = () => o.result.createObjectStore("photos"); return req(o); })();
  return (await _db).transaction("photos", mode).objectStore("photos");
};

export const getPhoto = async (code: string) => req<string | undefined>((await store("readonly")).get(code));
export const setPhoto = async (code: string, dataUrl: string) => { await req((await store("readwrite")).put(dataUrl, code)); };
export const delPhoto = async (code: string) => { await req((await store("readwrite")).delete(code)); };
export const allPhotos = async () => {
  const s = await store("readonly");
  const [keys, vals] = await Promise.all([req(s.getAllKeys()), req(s.getAll())]);
  return Object.fromEntries(keys.map((k, i) => [k as string, vals[i] as string]));
};

// Shrink a camera shot to a ~480px JPEG so hundreds of items stay small.
export const compress = (file: File, max = 480) =>
  new Promise<string>((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      res(c.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });

export function usePhoto(code: string) {
  const [url, setUrl] = useState<string>();
  useEffect(() => { getPhoto(code).then(setUrl); }, [code]);
  return url;
}
