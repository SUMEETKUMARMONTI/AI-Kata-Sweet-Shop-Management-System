import { SweetCard } from "@/components/sweet-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Candy } from "lucide-react";
import type { Sweet } from "@shared/schema";

interface SweetGridProps {
  sweets: Sweet[];
  isLoading: boolean;
  onPurchase: (id: string) => void;
  purchasingId?: string | null;
}

function SweetCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-5 w-20 mb-3" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-2 w-2 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24 mt-2" />
      </div>
      <div className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}

export function SweetGrid({ sweets, isLoading, onPurchase, purchasingId }: SweetGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SweetCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (sweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Candy className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No sweets found</h3>
        <p className="text-muted-foreground max-w-sm">
          Try adjusting your search or filter criteria to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sweets.map((sweet) => (
        <SweetCard
          key={sweet.id}
          sweet={sweet}
          onPurchase={onPurchase}
          isPurchasing={purchasingId === sweet.id}
        />
      ))}
    </div>
  );
}
