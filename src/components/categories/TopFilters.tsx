
import { Button } from "@/components/ui/button";
import { Search, Grid2x2, Grid3x3, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";

interface TopFiltersProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  gridView: "2x2" | "3x3";
  setGridView: (view: "2x2" | "3x3") => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
}

export const TopFilters = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  gridView,
  setGridView,
  priceRange,
  setPriceRange,
}: TopFiltersProps) => {
  return (
    <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-4">
        {["All", "Featured", "New", "Top Rated"].map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "ghost"}
            onClick={() => setActiveFilter(filter)}
            className="rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            {filter}
          </Button>
        ))}
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 md:flex-none">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-full border px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setGridView("2x2")}
            className={`rounded-full ${
              gridView === "2x2" ? "bg-primary text-white" : ""
            }`}
          >
            <Grid2x2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setGridView("3x3")}
            className={`rounded-full ${
              gridView === "3x3" ? "bg-primary text-white" : ""
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-full">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
              <SheetDescription>
                Adjust filters to find the perfect products
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div>
                <h4 className="mb-4 font-medium">Price Range</h4>
                <Slider
                  defaultValue={priceRange}
                  max={1000}
                  step={10}
                  onValueChange={setPriceRange}
                />
                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
