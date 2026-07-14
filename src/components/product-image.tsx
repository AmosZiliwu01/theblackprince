import { ImageIcon } from "lucide-react";

interface Props {
  src?: string | null;
  alt?: string | null;
  className?: string;
  ratio?: "square" | "video" | "portrait";
}

export function ProductImage({ src, alt, className = "", ratio = "square" }: Props) {
  const ratioClass =
    ratio === "square" ? "aspect-square" : ratio === "video" ? "aspect-video" : "aspect-[3/4]";
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
          <ImageIcon className="h-10 w-10" />
        </div>
      )}
    </div>
  );
}
