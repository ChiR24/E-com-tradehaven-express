
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CategoryFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  isLoading: boolean;
}

export const CategoryFilters = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  isLoading,
}: CategoryFiltersProps) => {
  return (
    <div className="mb-8 flex flex-wrap justify-center gap-4">
      <Button
        onClick={() => setSelectedCategory(null)}
        variant={selectedCategory === null ? "default" : "outline"}
        className="rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
      >
        All Categories
      </Button>
      {isLoading ? (
        <Button disabled variant="outline" className="rounded-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      ) : (
        categories.map((category) => (
          <Button
            key={category}
            onClick={() => setSelectedCategory(category)}
            variant={selectedCategory === category ? "default" : "outline"}
            className="rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            {category}
          </Button>
        ))
      )}
    </div>
  );
};
