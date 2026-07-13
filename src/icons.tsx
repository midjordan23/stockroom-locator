const attrs = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const Icon = ({ d, size = 22 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...attrs} aria-hidden="true"><path d={d} /></svg>
);

export const icons = {
  home: "M3 10.5 12 3l9 7.5M5.5 9v11h13V9",
  scan: "M3 7V4h4M17 4h4v3M21 17v3h-4M7 20H3v-3M3 12h18",
  find: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-5.2-5.2",
  admin: "M4 7h9M17 7h3M17 4.5v5M4 17h3M11 17h9M11 14.5v5",
  box: "M21 8l-9-5-9 5v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8",
  camera: "M4 8h3l2-3h6l2 3h3v11H4V8ZM12 16a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z",
  back: "M15 5l-7 7 7 7",
} as const;
