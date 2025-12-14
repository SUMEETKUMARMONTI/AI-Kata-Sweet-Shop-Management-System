import { Candy, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StockIndicator } from "@/components/stock-indicator";
import type { Sweet } from "@shared/schema";

interface SweetCardProps {
  sweet: Sweet;
  onPurchase: (id: string) => void;
  isPurchasing?: boolean;
}

const categoryColors: Record<string, string> = {
  Chocolate: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Candy: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  Pastry: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Cookie: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  Cake: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  "Ice Cream": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  Traditional: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export function SweetCard({ sweet, onPurchase, isPurchasing }: SweetCardProps) {
  const isOutOfStock = sweet.quantity === 0;

  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 hover-elevate ${isOutOfStock ? "opacity-70" : ""}`}
      data-testid={`card-sweet-${sweet.id}`}
    >
      <div className="aspect-square bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 flex items-center justify-center relative">
        <Candy className="h-16 w-16 text-primary/40" />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2" data-testid={`text-sweet-name-${sweet.id}`}>
            {sweet.name}
          </h3>
        </div>
        <Badge 
          variant="secondary" 
          className={`${categoryColors[sweet.category] || categoryColors.Other} mb-3`}
          data-testid={`badge-category-${sweet.id}`}
        >
          {sweet.category}
        </Badge>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary" data-testid={`text-price-${sweet.id}`}>
            ${sweet.price.toFixed(2)}
          </span>
          <StockIndicator quantity={sweet.quantity} showText={false} />
        </div>
        <StockIndicator quantity={sweet.quantity} className="mt-2" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          disabled={isOutOfStock || isPurchasing}
          onClick={() => onPurchase(sweet.id)}
          data-testid={`button-purchase-${sweet.id}`}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isPurchasing ? "Processing..." : isOutOfStock ? "Unavailable" : "Purchase"}
        </Button>
      </CardFooter>
    </Card>
  );
}
