import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { PostgrestResponse } from '@supabase/supabase-js';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery?: string;
}

interface Address {
  id: string;
  type: string;
  is_default: boolean;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry: string;
  is_default: boolean;
}

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    stock_quantity: number;
  };
}

interface Review {
  id: string;
  product_id: string;
  product: {
    name: string;
  };
  rating: number;
  comment: string;
  created_at: string;
  likes: number;
  helpful: boolean;
}

interface LoyaltyData {
  points: number;
  tier: string;
  rewards: Array<{
    id: string;
    type: string;
    value: string;
    status: string;
    expires_at: string;
  }>;
  history: Array<{
    id: string;
    points: number;
    description: string;
    created_at: string;
  }>;
}

interface WishlistDBResponse {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    stock_quantity: number;
  };
}

export function useEcommerce() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);

  useEffect(() => {
    if (!user) return;
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchAddresses(),
        fetchPaymentMethods(),
        fetchWishlist(),
        fetchReviews(),
        fetchLoyaltyData(),
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setOrders(data || []);
  };

  const fetchAddresses = async () => {
    const { data, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_default', { ascending: false });

    if (error) throw error;
    setAddresses(data || []);
  };

  const fetchPaymentMethods = async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_default', { ascending: false });

    if (error) throw error;
    setPaymentMethods(data || []);
  };

  const fetchWishlist = async () => {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select(`
        id,
        product:products (
          id,
          name,
          price,
          image_url,
          stock_quantity
        )
      `)
      .eq('user_id', user?.id)
      .returns<WishlistDBResponse[]>();

    if (error) throw error;
    
    const transformedData: WishlistItem[] = (data || []).map(item => ({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image_url: item.product.image_url || undefined,
        stock_quantity: item.product.stock_quantity,
      },
    }));

    setWishlist(transformedData);
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, product:products(name)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setReviews(data || []);
  };

  const fetchLoyaltyData = async () => {
    // Fetch loyalty points
    const { data: pointsData, error: pointsError } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (pointsError) throw pointsError;

    // Fetch rewards
    const { data: rewardsData, error: rewardsError } = await supabase
      .from('loyalty_rewards')
      .select('*')
      .eq('user_id', user?.id)
      .gte('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true });

    if (rewardsError) throw rewardsError;

    // Fetch history
    const { data: historyData, error: historyError } = await supabase
      .from('loyalty_history')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) throw historyError;

    setLoyaltyData({
      points: pointsData?.points || 0,
      tier: pointsData?.tier || 'bronze',
      rewards: rewardsData || [],
      history: historyData || [],
    });
  };

  const addToWishlist = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: user?.id, product_id: productId });

      if (error) throw error;
      toast.success('Added to wishlist');
      await fetchWishlist();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', wishlistItemId);

      if (error) throw error;
      toast.success('Removed from wishlist');
      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    try {
      const { error } = await supabase
        .from('shipping_addresses')
        .insert({ ...address, user_id: user?.id });

      if (error) throw error;
      toast.success('Address added successfully');
      await fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };

  const updateAddress = async (addressId: string, updates: Partial<Address>) => {
    try {
      const { error } = await supabase
        .from('shipping_addresses')
        .update(updates)
        .eq('id', addressId);

      if (error) throw error;
      toast.success('Address updated successfully');
      await fetchAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      // First, remove default from all addresses
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Then set the new default
      const { error } = await supabase
        .from('shipping_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;
      toast.success('Default address updated');
      await fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to set default address');
    }
  };

  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id'>) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .insert({ ...paymentMethod, user_id: user?.id });

      if (error) throw error;
      toast.success('Payment method added successfully');
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      // First, remove default from all payment methods
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Then set the new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId);

      if (error) throw error;
      toast.success('Default payment method updated');
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to set default payment method');
    }
  };

  return {
    loading,
    orders,
    addresses,
    paymentMethods,
    wishlist,
    reviews,
    loyaltyData,
    addToWishlist,
    removeFromWishlist,
    addAddress,
    updateAddress,
    setDefaultAddress,
    addPaymentMethod,
    setDefaultPaymentMethod,
    refresh: loadUserData,
  };
} 