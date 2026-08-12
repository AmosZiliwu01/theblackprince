import { cn } from "@/lib/utils";

/**
 * DescriptionRenderer
 *
 * Menampilkan teks bebas dari admin panel (kolom description / subtitle /
 * how_to_join / answer / message) apa adanya:
 *  - baris kosong  -> paragraf baru (dengan jarak)
 *  - enter tunggal -> line break di dalam paragraf
 *  - baris diawali -, *, • atau "1." -> item list sederhana
 *  - emoji & teks panjang aman (wrap, tidak overflow di mobile)
 *
 * Data lama tidak perlu diubah: parsing dilakukan saat render.
 */

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] };

const BULLET = /^\s*([-*•·])\s+(.*)$/;
const NUMBERED = /^\s*(\d+)[.)]\s+(.*)$/;

function parse(text: string): Block[] {
  const normalized = text.replace(/\r\n?/g, "\n");
  const blocks: Block[] = [];

  for (const chunk of normalized.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim() !== "");
    if (lines.length === 0) continue;

    if (lines.every((l) => BULLET.test(l))) {
      blocks.push({ kind: "ul", items: lines.map((l) => l.replace(BULLET, "$2")) });
    } else if (lines.every((l) => NUMBERED.test(l))) {
      blocks.push({ kind: "ol", items: lines.map((l) => l.replace(NUMBERED, "$2")) });
    } else {
      blocks.push({ kind: "p", lines });
    }
  }

  return blocks;
}

export function DescriptionRenderer({
  text,
  className,
  size = "sm",
}: {
  text?: string | null;
  className?: string;
  /** sm = body kartu, base = halaman detail */
  size?: "xs" | "sm" | "base";
}) {
  if (!text || !text.trim()) return null;
  const blocks = parse(text);

  const sizeClass =
    size === "base" ? "text-base leading-7" : size === "xs" ? "text-xs leading-5" : "text-sm leading-6";

  return (
    <div className={cn("space-y-3 break-words [overflow-wrap:anywhere]", sizeClass, className)}>
      {blocks.map((b, i) => {
        if (b.kind === "p") {
          return (
            <p key={i}>
              {b.lines.map((line, j) => (
                <span key={j}>
                  {line}
                  {j < b.lines.length - 1 && <br />}
                </span>
              ))}
            </p>
          );
        }
        if (b.kind === "ul") {
          return (
            <ul key={i} className="space-y-1.5 pl-1">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-neon" />
                  <span className="min-w-0 flex-1">{it}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <ol key={i} className="space-y-1.5 pl-1">
            {b.items.map((it, j) => (
              <li key={j} className="flex gap-2">
                <span className="shrink-0 font-bold text-primary">{j + 1}.</span>
                <span className="min-w-0 flex-1">{it}</span>
              </li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
