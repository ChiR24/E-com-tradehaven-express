import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const PROMOTIONS = [
  {
    id: "1",
    title: "GET UP TO 50% OFF",
    description: "Get Discount",
    image: "/lovable-uploads/6370d849-75f9-44d7-898a-b572baa19afb.png",
    gradient: "from-secondary/20 to-secondary/40",
  },
  {
    id: "2",
    title: "Winter's weekend",
    subtitle: "keep it casual",
    image: "/lovable-uploads/6370d849-75f9-44d7-898a-b572baa19afb.png",
    gradient: "from-primary/20 to-primary/40",
  },
];

export const PromotionsSection = () => {
  return (
    <div className="mb-16 grid gap-4 md:grid-cols-2">
      {PROMOTIONS.map((promo) => (
        <motion.div
          key={promo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`group overflow-hidden rounded-2xl bg-gradient-to-r ${promo.gradient} p-8 shadow-lg transition-all hover:shadow-xl`}
        >
          <h2 className="mb-2 text-3xl font-bold text-shop-900">{promo.title}</h2>
          {promo.subtitle && (
            <p className="mb-4 text-lg text-shop-700">{promo.subtitle}</p>
          )}
          <Button 
            variant="default" 
            className="group relative overflow-hidden rounded-full bg-white px-6 py-2 text-shop-900 shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            <span className="relative z-10">{promo.description || "Shop Now"}</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-secondary via-accent to-primary opacity-0 transition-opacity group-hover:opacity-10" />
          </Button>
        </motion.div>
      ))}
    </div>
  );
};