
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface ProductQuickViewProps {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  ratings?: number;
  totalReviews?: number;
  colors?: string[];
  sizes?: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductQuickView = ({
  id,
  name,
  price,
  image,
  description,
  ratings = 0,
  totalReviews = 0,
  colors = [],
  sizes = [],
  open,
  onOpenChange,
}: ProductQuickViewProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleAddToCart = () => {
    addItem({ id, name, price, image });
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img src={image} alt={name} className="h-full w-full object-cover" />
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{description}</p>
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
            {colors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Colors</p>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        selectedColor === color
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}
            {sizes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold">${price.toFixed(2)}</p>
              <Button onClick={handleAddToCart} className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
