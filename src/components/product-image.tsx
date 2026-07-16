import { ImageIcon, Apple, Wrench, UserCircle2 } from "lucide-react";

interface Props {
  src?: string | null;
  alt?: string | null;
  className?: string;
  ratio?: "square" | "video" | "portrait";
  /** Used to pick a sensible fallback icon when no image is set */
  kind?: "fruit" | "joki" | "account";
}

const FALLBACK_ICON: Record<string, typeof ImageIcon> = {
  fruit: Apple,
  joki: Wrench,
  account: UserCircle2,
};

export function ProductImage({ src, alt, className = "", ratio = "square", kind }: Props) {
  const ratioClass =
    ratio === "square" ? "aspect-square" : ratio === "video" ? "aspect-video" : "aspect-[3/4]";
  const FallbackIcon = (kind && FALLBACK_ICON[kind]) || ImageIcon;

  return (
    <div
      className={
        "relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 " +
        ratioClass +
        " " +
        className
      }
    >
      {src ? (
        <img
          src={src}
          alt={alt || "Product"}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-300 hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
          <FallbackIcon className="h-10 w-10" />
        </div>
      )}
    </div>
  );
}