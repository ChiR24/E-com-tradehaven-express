import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const NewsletterSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 p-8 shadow-lg"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-bold text-shop-900">Stay Updated</h2>
        <p className="mb-6 text-shop-600">
          Subscribe to our newsletter for the latest updates and exclusive offers.
        </p>
        <div className="flex items-center gap-4">
          <Input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-full border focus:ring-2 focus:ring-primary"
          />
          <Button className="rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            Subscribe
          </Button>
        </div>
      </div>
    </motion.section>
  );
};