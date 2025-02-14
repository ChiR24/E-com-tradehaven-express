
import { useState, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { HeroSection } from "@/components/index/HeroSection";
import { CategoryTabs } from "@/components/index/CategoryTabs";
import { NewsletterSection } from "@/components/index/NewsletterSection";
import { type Product } from "@/types/product";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("featured");
  const { toast } = useToast();

  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ["featured-products", activeCategory, searchQuery, priceRange, sortBy],
    queryFn: async () => {
      let query = supabase.from("products").select("*");

      if (activeCategory === "featured") {
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
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching products",
          description: error.message,
        });
        throw error;
      }

      return data as Product[];
    },
  });

  const handleSearch = useCallback(() => {
    // The query will automatically run due to the searchQuery dependency
    console.log("Search triggered with query:", searchQuery);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-shop-50 to-shop-100">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24">
        <HeroSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onSearch={handleSearch}
        />

        <div className="mb-8">
          <CategoryTabs
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            isGridView={isGridView}
            setIsGridView={setIsGridView}
            isLoading={isLoading}
            featuredProducts={featuredProducts}
          />
        </div>

        <NewsletterSection />
      </main>
    </div>
  );
};

export default Index;
