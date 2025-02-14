
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Grid, List, ArrowRight } from "lucide-react";

interface ProductsSectionProps {
  isGridView: boolean;
  setIsGridView: (isGrid: boolean) => void;
  isLoading: boolean;
  featuredProducts: any[];
}

export const ProductsSection = ({
  isGridView,
  setIsGridView,
  isLoading,
  featuredProducts,
}: ProductsSectionProps) => {
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-shop-900">Featured Products</h2>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
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
          <Button variant="ghost" className="group">
            View All
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : featuredProducts.length > 0 ? (
        <ScrollArea className="h-[600px] rounded-md">
          <div
            className={`grid gap-6 p-4 ${
              isGridView ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            }`}
          >
            <AnimatePresence>
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price || 0}
                    image={
                      product.image_url ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
                    }
                    description={product.description || ""}
                    ratings={product.ratings || 0}
                    totalReviews={product.total_reviews || 0}
                    colors={Array.isArray(product.colors) ? product.colors : []}
                    sizes={Array.isArray(product.sizes) ? product.sizes : []}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500">No products available</p>
        </div>
      )}
    </>
  );
};
