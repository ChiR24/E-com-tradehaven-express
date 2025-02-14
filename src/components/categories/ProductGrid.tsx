
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { Loader2 } from "lucide-react";

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

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  gridView: "2x2" | "3x3";
}

export const ProductGrid = ({ products, isLoading, gridView }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <p className="text-xl font-semibold text-gray-600">
          No products found
        </p>
        <p className="mt-2 text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`grid gap-6 ${
          gridView === "2x2"
            ? "sm:grid-cols-1 md:grid-cols-2"
            : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        {products.map((product: Product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price || 0}
            image={product.image_url || "/placeholder.svg"}
            description={product.description || ""}
            ratings={product.ratings || 0}
            totalReviews={product.total_reviews || 0}
            colors={Array.isArray(product.colors) ? product.colors : []}
            sizes={Array.isArray(product.sizes) ? product.sizes : []}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
