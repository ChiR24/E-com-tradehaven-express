
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductWishlistButtonProps {
  productId: string;
}

export const ProductWishlistButton = ({ productId }: ProductWishlistButtonProps) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkWishlistStatus();
  }, [productId]);

  const checkWishlistStatus = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("wishlists")
        .select()
        .eq("product_id", productId)
        .eq("user_id", session.session.user.id)
        .maybeSingle();

      setIsInWishlist(!!data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      setIsLoading(false);
    }
  };

  const toggleWishlist = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add items to your wishlist",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      if (isInWishlist) {
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("product_id", productId)
          .eq("user_id", session.session.user.id);

        if (!error) {
          setIsInWishlist(false);
          toast({
            title: "Removed from wishlist",
            description: "The item has been removed from your wishlist",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to remove item from wishlist",
            variant: "destructive",
          });
        }
      } else {
        const { error } = await supabase.from("wishlists").insert({
          product_id: productId,
          user_id: session.session.user.id,
        });

        if (!error) {
          setIsInWishlist(true);
          toast({
            title: "Added to wishlist",
            description: "The item has been added to your wishlist",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to add item to wishlist",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={toggleWishlist}
      disabled={isLoading}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
        }`}
      />
    </Button>
  );
};
