import { formatDualPrice } from "@/lib/currency";

interface Props {
  price: number;
  priceRm?: number | null;
  originalPrice?: number;
  originalPriceRm?: number | null;
  percent?: number;
  className?: string;
  size?: "sm" | "lg";
}

export function PriceTag({
  price,
  priceRm,
  originalPrice,
  originalPriceRm,
  percent = 0,
  className = "",
  size = "sm",
}: Props) {
  const discounted = percent > 0;
  return (
    <div className={"flex flex-wrap items-center gap-x-2 gap-y-0.5 " + className}>
      <span className={(size === "lg" ? "text-2xl" : "text-sm") + " font-black text-primary"}>
        {formatDualPrice(price, priceRm)}
      </span>
      {discounted && (
        <>
          <span className={(size === "lg" ? "text-sm" : "text-[11px]") + " text-muted-foreground line-through"}>
            {formatDualPrice(originalPrice ?? price, originalPriceRm)}
          </span>
          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white">
            -{Math.round(percent)}%
          </span>
        </>
      )}
    </div>
  );
}
