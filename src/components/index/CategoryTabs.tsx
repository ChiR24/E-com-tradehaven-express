
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, TrendingUp, Star, Heart, Gift } from "lucide-react";
import { PromotionsSection } from "./PromotionsSection";
import { ProductsSection } from "./ProductsSection";
import { type Product } from "@/types/product";

interface CategoryTabsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  isGridView: boolean;
  setIsGridView: (isGrid: boolean) => void;
  isLoading: boolean;
  featuredProducts: Product[];
}

export const CategoryTabs = ({
  activeCategory,
  setActiveCategory,
  isGridView,
  setIsGridView,
  isLoading,
  featuredProducts,
}: CategoryTabsProps) => {
  const CATEGORIES = [
    { id: "all", label: "All", icon: ShoppingBag },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "featured", label: "Featured", icon: Star },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "gifts", label: "Gifts", icon: Gift },
  ];

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-2 gap-4 md:grid-cols-5">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <TabsTrigger
              key={category.id}
              value={category.id}
              onClick={() => setActiveCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="all" className="mt-6">
        <PromotionsSection />
        <ProductsSection
          isGridView={isGridView}
          setIsGridView={setIsGridView}
          isLoading={isLoading}
          featuredProducts={featuredProducts}
        />
      </TabsContent>

      {CATEGORIES.slice(1).map((category) => (
        <TabsContent key={category.id} value={category.id}>
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <h3 className="mb-2 text-xl font-semibold">{category.label} Products</h3>
            <p className="text-gray-500">Coming soon...</p>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
