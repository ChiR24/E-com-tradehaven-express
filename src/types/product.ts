
export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  ratings: number;
  total_reviews: number;
  colors: string[];
  sizes: string[];
  category: string | null;
  featured: boolean;
  stock: number;
  sales: number;
  batch: string | null;
  supplier: string | null;
  created_at: string | null;
  updated_at: string | null;
}
