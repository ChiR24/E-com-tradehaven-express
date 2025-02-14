
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onSearch: () => void;
}

export const HeroSection = ({
  searchQuery,
  setSearchQuery,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  onSearch,
}: HeroSectionProps) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-16 text-center"
    >
      <h1 className="mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-5xl font-bold tracking-tight text-transparent">
        Discover Your Style
      </h1>
      <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
        Explore our curated collection of premium products designed to enhance your lifestyle.
      </p>
      <div className="mx-auto flex max-w-lg items-center gap-2 rounded-full bg-white p-2 shadow-lg">
        <Search className="ml-2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 border-none bg-transparent px-4 py-2 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
              <SheetDescription>
                Adjust filters to find exactly what you're looking for.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div>
                <label className="text-sm font-medium">Price Range</label>
                <Slider
                  defaultValue={priceRange}
                  max={1000}
                  step={10}
                  onValueChange={setPriceRange}
                  className="mt-2"
                />
                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Button variant="default" className="rounded-full" onClick={onSearch}>
          Search
        </Button>
      </div>
    </motion.section>
  );
};
