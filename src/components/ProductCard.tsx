
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { ProductQuickView } from "./product/ProductQuickView";
import { ProductWishlistButton } from "./product/ProductWishlistButton";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  ratings?: number;
  totalReviews?: number;
  colors?: string[];
  sizes?: string[];
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  description,
  ratings = 0,
  totalReviews = 0,
  colors = [],
  sizes = [],
}: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem({ id, name, price, image });
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`,
    });
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition-all duration-300 hover:shadow-xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute right-2 top-2 flex flex-col gap-2">
            <ProductWishlistButton productId={id} />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white"
              onClick={() => setShowQuickView(true)}
            >
              <Eye className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-medium text-shop-900">{name}</h3>
          <p className="text-sm text-shop-600 line-clamp-2">{description}</p>

          {ratings > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      index < Math.floor(ratings)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({totalReviews} reviews)
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-shop-900">
              ${price.toFixed(2)}
            </p>
            <Button
              onClick={handleAddToCart}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Button
            variant="outline"
            className="rounded-full bg-white text-gray-900"
            onClick={() => setShowQuickView(true)}
          >
            Quick View
          </Button>
        </motion.div>
      </motion.div>

      <ProductQuickView
        id={id}
        name={name}
        price={price}
        image={image}
        description={description}
        ratings={ratings}
        totalReviews={totalReviews}
        colors={colors}
        sizes={sizes}
        open={showQuickView}
        onOpenChange={setShowQuickView}
      />
    </>
  );
};
