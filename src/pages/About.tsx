
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-shop-50 to-shop-100">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="prose mx-auto max-w-2xl"
        >
          <h1 className="text-4xl font-bold">About Our Store</h1>
          <p className="mt-4 text-lg text-gray-600">
            Welcome to our premium shopping destination, where style meets comfort and quality meets
            affordability. We curate the finest selection of products to bring you a shopping
            experience like no other.
          </p>
          
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold">Our Mission</h2>
              <p className="mt-2 text-gray-600">
                To provide our customers with the highest quality products while maintaining
                exceptional service and competitive prices.
              </p>
            </div>
            
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-semibold">Our Vision</h2>
              <p className="mt-2 text-gray-600">
                To become the leading online destination for fashion-conscious shoppers who value
                quality and style.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default About;
