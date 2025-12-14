import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { sweetCategories, type SweetCategory } from "@shared/schema";
import { useState } from "react";

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategories: SweetCategory[];
  onCategoryChange: (categories: SweetCategory[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
}

export function SearchFilters({
  searchTerm,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  maxPrice,
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryToggle = (category: SweetCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    onSearchChange("");
    onCategoryChange([]);
    onPriceRangeChange([0, maxPrice]);
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-3 block">Categories</Label>
        <div className="space-y-2">
          {sweetCategories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
                data-testid={`checkbox-category-${category}`}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">
          Price Range: ${priceRange[0].toFixed(0)} - ${priceRange[1].toFixed(0)}
        </Label>
        <Slider
          min={0}
          max={maxPrice}
          step={1}
          value={priceRange}
          onValueChange={(value) => onPriceRangeChange(value as [number, number])}
          className="mt-2"
          data-testid="slider-price-range"
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
          data-testid="button-clear-filters"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-64 flex-shrink-0">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FilterContent />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 lg:hidden mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sweets..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            data-testid="input-search-mobile"
          />
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" data-testid="button-open-filters">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:block mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sweets by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            data-testid="input-search-desktop"
          />
        </div>
      </div>
    </>
  );
}
