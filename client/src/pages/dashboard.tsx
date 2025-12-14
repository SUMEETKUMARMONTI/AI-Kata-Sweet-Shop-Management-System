import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { SearchFilters } from "@/components/search-filters";
import { SweetGrid } from "@/components/sweet-grid";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Sweet, SweetCategory } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<SweetCategory[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const sweetsQuery = useQuery<Sweet[]>({
    queryKey: ["/api/sweets"],
    enabled: !!user,
  });

  const maxPrice = useMemo(() => {
    if (!sweetsQuery.data?.length) return 100;
    return Math.ceil(Math.max(...sweetsQuery.data.map((s) => s.price)));
  }, [sweetsQuery.data]);

  const filteredSweets = useMemo(() => {
    if (!sweetsQuery.data) return [];

    return sweetsQuery.data.filter((sweet) => {
      const matchesSearch = sweet.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(sweet.category);
      const matchesPrice = sweet.price >= priceRange[0] && sweet.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [sweetsQuery.data, searchTerm, selectedCategories, priceRange]);

  const purchaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("POST", `/api/sweets/${id}/purchase`);
      return response.json();
    },
    onMutate: (id) => {
      setPurchasingId(id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      toast({
        title: "Purchase successful!",
        description: `You purchased ${data.name}. Stock remaining: ${data.quantity}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setPurchasingId(null);
    },
  });

  const handlePurchase = (id: string) => {
    purchaseMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sweet Collection</h1>
          <p className="text-muted-foreground">
            Browse our delicious selection of sweets and treats
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            maxPrice={maxPrice}
          />

          <div className="flex-1">
            <SweetGrid
              sweets={filteredSweets}
              isLoading={sweetsQuery.isLoading}
              onPurchase={handlePurchase}
              purchasingId={purchasingId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
