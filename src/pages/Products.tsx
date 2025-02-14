
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

const ITEMS_PER_PAGE = 12;
const CATEGORIES = ["All", "New", "Featured", "Top Rated", "Sale"];
const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name" },
  { value: "rating", label: "Top Rated" },
];

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  ratings: number;
  total_reviews: number;
  colors: string[];
  sizes: string[];
}

const Products = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("featured");
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["products", activeCategory, searchQuery, priceRange, sortBy],
    queryFn: async ({ pageParam }) => {
      let query = supabase
        .from("products")
        .select("*")
        .range(
          pageParam * ITEMS_PER_PAGE,
          (pageParam + 1) * ITEMS_PER_PAGE - 1
        );

      if (activeCategory === "Featured") {
        query = query.eq("featured", true);
      }

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      query = query.gte("price", priceRange[0]).lte("price", priceRange[1]);

      switch (sortBy) {
        case "price-asc":
          query = query.order("price", { ascending: true });
          break;
        case "price-desc":
          query = query.order("price", { ascending: false });
          break;
        case "name":
          query = query.order("name");
          break;
        case "rating":
          query = query.order("ratings", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === ITEMS_PER_PAGE ? pages.length : undefined;
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = data?.pages.flat() ?? [];

  if (isError) {
    toast({
      title: "Error",
      description: "Failed to load products. Please try again later.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-shop-50 to-shop-100">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "ghost"}
                onClick={() => setActiveCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full rounded-full border px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                  <SheetDescription>
                    Adjust filters to find exactly what you're looking for.
                  </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-200px)] px-1">
                  <div className="space-y-6 py-4">
                    <div>
                      <h4 className="mb-4 text-sm font-medium">Price Range</h4>
                      <Slider
                        defaultValue={[0, 1000]}
                        max={1000}
                        step={10}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="w-full"
                      />
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-4 text-sm font-medium">Sort By</h4>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          {SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsGridView(!isGridView)}
              className="rounded-full"
            >
              {isGridView ? (
                <Grid className="h-4 w-4" />
              ) : (
                <List className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </motion.div>
          ) : allProducts.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`grid gap-6 ${
                  isGridView
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                <AnimatePresence>
                  {allProducts.map((product: Product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        image={product.image_url || "/placeholder.svg"}
                        description={product.description}
                        ratings={product.ratings}
                        totalReviews={product.total_reviews}
                        colors={product.colors}
                        sizes={product.sizes}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              <div
                ref={loadMoreRef}
                className="mt-8 flex items-center justify-center"
              >
                {isFetchingNextPage && (
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                )}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-gray-300 p-8 text-center"
            >
              <div className="rounded-full bg-gray-100 p-3">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  No products found
                </h3>
                <p className="text-sm text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setPriceRange([0, 1000]);
                  setSortBy("featured");
                  setActiveCategory("All");
                }}
              >
                Reset filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Products;
