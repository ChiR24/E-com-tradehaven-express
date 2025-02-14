
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CategoryFilters } from "@/components/categories/CategoryFilters";
import { TopFilters } from "@/components/categories/TopFilters";
import { ProductGrid } from "@/components/categories/ProductGrid";

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
  category: string;
  featured: boolean;
}

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [gridView, setGridView] = useState<"2x2" | "3x3">("3x3");
  const { toast } = useToast();

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .not("category", "is", null)
        .order("category");

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching categories",
          description: error.message,
        });
        throw error;
      }

      return Array.from(new Set(data.map((item) => item.category)));
    },
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", selectedCategory, activeFilter, priceRange],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .gte("price", priceRange[0])
        .lte("price", priceRange[1])
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      if (activeFilter === "Featured") {
        query = query.eq("featured", true);
      } else if (activeFilter === "Top Rated") {
        query = query.gte("ratings", 4);
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-shop-50 to-shop-100">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24">
        <TopFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          gridView={gridView}
          setGridView={setGridView}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />

        <motion.section
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="mb-16"
        >
          <CategoryFilters
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isLoading={loadingCategories}
          />

          <ProductGrid
            products={filteredProducts}
            isLoading={loadingProducts}
            gridView={gridView}
          />
        </motion.section>
      </main>
    </div>
  );
};

export default Categories;
