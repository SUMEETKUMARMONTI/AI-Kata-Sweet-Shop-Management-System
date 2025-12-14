import { cn } from "@/lib/utils";

interface StockIndicatorProps {
  quantity: number;
  showText?: boolean;
  className?: string;
}

export function StockIndicator({ quantity, showText = true, className }: StockIndicatorProps) {
  const getStockStatus = () => {
    if (quantity === 0) {
      return { color: "bg-red-500", text: "Out of Stock", textColor: "text-red-600 dark:text-red-400" };
    }
    if (quantity < 10) {
      return { color: "bg-orange-500", text: `Low Stock (${quantity})`, textColor: "text-orange-600 dark:text-orange-400" };
    }
    return { color: "bg-green-500", text: `In Stock (${quantity})`, textColor: "text-green-600 dark:text-green-400" };
  };

  const status = getStockStatus();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={cn("h-2 w-2 rounded-full", status.color)} />
      {showText && (
        <span className={cn("text-sm", status.textColor)}>{status.text}</span>
      )}
    </div>
  );
}
