import React, { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  User,
  Mail,
  MapPin,
  CreditCard,
  Package,
  Heart,
  Clock,
  Settings,
  Plus,
  Star,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Gift,
  Award,
  Truck,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Profile() {
  const theme = useTheme();
  const { profile, loading, updateProfile } = useProfile();
  const [activeTab, setActiveTab] = useState('orders');

  // Mock data - replace with actual data from your backend
  const recentOrders = [
    {
      id: 'ORD-123',
      date: '2024-03-18',
      status: 'delivered',
      total: 299.99,
      items: 3,
    },
    {
      id: 'ORD-122',
      date: '2024-03-15',
      status: 'processing',
      total: 149.99,
      items: 2,
    },
  ];

  const addresses = [
    {
      id: 1,
      type: 'home',
      default: true,
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
    {
      id: 2,
      type: 'office',
      default: false,
      street: '456 Business Ave',
      city: 'New York',
      state: 'NY',
      zip: '10002',
      country: 'USA',
    },
  ];

  const paymentMethods = [
    {
      id: 1,
      type: 'visa',
      last4: '4242',
      expiry: '12/25',
      default: true,
    },
    {
      id: 2,
      type: 'mastercard',
      last4: '8888',
      expiry: '08/24',
      default: false,
    },
  ];

  const wishlist = [
    {
      id: 1,
      name: 'Premium Headphones',
      price: 199.99,
      image: '/images/products/headphones.jpg',
      inStock: true,
    },
    {
      id: 2,
      name: 'Wireless Keyboard',
      price: 89.99,
      image: '/images/products/keyboard.jpg',
      inStock: false,
    },
  ];

  // Add mock reviews data
  const reviews = [
    {
      id: 1,
      productId: 'PROD-123',
      productName: 'Premium Headphones',
      rating: 5,
      comment: 'Excellent sound quality and very comfortable for long sessions.',
      date: '2024-03-15',
      likes: 12,
      helpful: true,
    },
    {
      id: 2,
      productId: 'PROD-456',
      productName: 'Wireless Keyboard',
      rating: 4,
      comment: 'Great keyboard, but battery life could be better.',
      date: '2024-03-10',
      likes: 8,
      helpful: false,
    },
  ];

  // Add purchase statistics
  const purchaseStats = {
    totalSpent: 1299.99,
    totalOrders: 15,
    averageOrderValue: 86.67,
    mostPurchasedCategory: 'Electronics',
    recentPurchases: 3,
  };

  // Add loyalty program data
  const loyaltyData = {
    tier: 'Gold',
    points: 2450,
    pointsToNextTier: 550,
    rewards: [
      {
        id: 1,
        type: 'discount',
        value: '20% OFF',
        expiresAt: '2024-04-15',
        status: 'active',
      },
      {
        id: 2,
        type: 'freeShipping',
        value: 'Free Express Shipping',
        expiresAt: '2024-04-30',
        status: 'active',
      },
      {
        id: 3,
        type: 'birthday',
        value: '$50 Birthday Voucher',
        expiresAt: '2024-05-10',
        status: 'upcoming',
      },
    ],
    history: [
      {
        id: 1,
        date: '2024-03-15',
        points: 150,
        description: 'Purchase Order #ORD-123',
      },
      {
        id: 2,
        date: '2024-03-10',
        points: 50,
        description: 'Product Review Bonus',
      },
    ],
  };

  // Add order tracking data
  const orderTracking = {
    orderId: 'ORD-123',
    status: 'in_transit',
    estimatedDelivery: '2024-03-20',
    carrier: 'FedEx',
    trackingNumber: '1234567890',
    timeline: [
      {
        status: 'ordered',
        date: '2024-03-18 09:30 AM',
        location: 'Online',
        completed: true,
      },
      {
        status: 'processing',
        date: '2024-03-18 02:15 PM',
        location: 'Warehouse',
        completed: true,
      },
      {
        status: 'shipped',
        date: '2024-03-19 10:45 AM',
        location: 'Distribution Center',
        completed: true,
      },
      {
        status: 'in_transit',
        date: '2024-03-19 03:20 PM',
        location: 'In Transit to Destination',
        completed: false,
      },
      {
        status: 'delivered',
        date: null,
        location: 'Delivery Address',
        completed: false,
      },
    ],
  };

  // Function to render order timeline
  const renderOrderTimeline = (timeline) => {
    return (
      <div className="relative space-y-4 pl-8 pt-2">
        {timeline.map((event, index) => (
          <div key={event.status} className="relative">
            {/* Connection Line */}
            {index < timeline.length - 1 && (
              <div
                className={cn(
                  'absolute left-[-16px] top-8 h-full w-0.5',
                  event.completed ? 'bg-primary-500' : 'bg-gray-200'
                )}
              />
            )}
            {/* Status Dot */}
            <div
              className={cn(
                'absolute left-[-20px] top-2 h-4 w-4 rounded-full border-2',
                event.completed
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300 bg-white'
              )}
            />
            {/* Content */}
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium capitalize">
                  {event.status.replace('_', ' ')}
                </h4>
                <span className="text-sm text-gray-500">
                  {event.date || 'Pending'}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{event.location}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatarUrl} alt={profile?.fullName} />
              <AvatarFallback>
                {profile?.fullName?.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile?.fullName}</h2>
              <p className="text-gray-500">{profile?.email}</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary">Premium Member</Badge>
                <Badge variant="secondary">{recentOrders.length} Orders</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="orders" className="flex-1">
            <Package className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex-1">
            <MapPin className="mr-2 h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment Methods
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="flex-1">
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex-1">
            <MessageSquare className="mr-2 h-4 w-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1">
            <TrendingUp className="mr-2 h-4 w-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex-1">
            <Gift className="mr-2 h-4 w-4" />
            Rewards
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Orders Tab with Tracking */}
        <TabsContent value="orders">
          <div className="grid gap-6">
            {/* Order History Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order History</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Returns
                    </Button>
                    <Button variant="outline">
                      <Clock className="mr-2 h-4 w-4" />
                      View All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <div className="flex items-center gap-4">
                          <Package className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Tracking Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Track Order</CardTitle>
                  <Badge variant="outline">
                    <Truck className="mr-2 h-4 w-4" />
                    {orderTracking.carrier}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="font-medium">{orderTracking.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <p className="font-medium">{orderTracking.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium">
                      {new Date(orderTracking.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {renderOrderTimeline(orderTracking.timeline)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shipping Addresses</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Address
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {address.type}
                      </Badge>
                      {address.default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="font-medium">{address.street}</p>
                    <p className="text-gray-500">
                      {address.city}, {address.state} {address.zip}
                    </p>
                    <p className="text-gray-500">{address.country}</p>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      {!address.default && (
                        <Button variant="outline" size="sm">
                          Set as Default
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Methods</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Card
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {method.type}
                      </Badge>
                      {method.default && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="font-medium">•••• •••• •••• {method.last4}</p>
                    <p className="text-gray-500">Expires {method.expiry}</p>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      {!method.default && (
                        <Button variant="outline" size="sm">
                          Set as Default
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle>Wishlist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="h-20 w-20 flex-shrink-0 rounded-md bg-gray-100">
                      {/* Replace with actual product image */}
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <Package className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-lg font-semibold">${item.price}</p>
                      <div className="mt-2">
                        {item.inStock ? (
                          <Badge variant="success">In Stock</Badge>
                        ) : (
                          <Badge variant="destructive">Out of Stock</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button>Add to Cart</Button>
                      <Button variant="outline">Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Reviews & Ratings</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Star className="mr-1 h-3 w-3 fill-current" />
                    {reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length} Average
                  </Badge>
                  <Badge variant="secondary">{reviews.length} Reviews</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{review.productName}</h3>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-4 w-4',
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-gray-200 text-gray-200'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm">
                          👍 {review.likes} Helpful
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit Review
                        </Button>
                      </div>
                      {review.helpful && (
                        <Badge variant="success">Marked as Helpful</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Purchase Statistics</CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Stats
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-2xl font-bold">${purchaseStats.totalSpent}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Across {purchaseStats.totalOrders} orders
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Average Order Value</p>
                  <p className="text-2xl font-bold">${purchaseStats.averageOrderValue}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Last 30 days
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-gray-500">Most Purchased Category</p>
                  <p className="text-2xl font-bold">{purchaseStats.mostPurchasedCategory}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {purchaseStats.recentPurchases} recent purchases
                  </p>
                </div>
              </div>

              {/* Add a chart component here for purchase history trends */}
              <div className="mt-8 h-64 rounded-lg border p-4">
                <p className="mb-4 font-medium">Purchase History Trend</p>
                {/* Add your chart component here */}
                <div className="flex h-full items-center justify-center text-gray-500">
                  Purchase trend chart will be displayed here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyalty & Rewards Tab */}
        <TabsContent value="loyalty">
          <div className="grid gap-6">
            {/* Loyalty Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Loyalty Program</CardTitle>
                  <Badge variant="secondary">
                    <Award className="mr-2 h-4 w-4" />
                    {loyaltyData.tier} Member
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium">Points Balance</p>
                    <p className="text-2xl font-bold">{loyaltyData.points}</p>
                  </div>
                  <div className="mb-2 h-2 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{
                        width: `${(loyaltyData.points / (loyaltyData.points + loyaltyData.pointsToNextTier)) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    {loyaltyData.pointsToNextTier} points to next tier
                  </p>
                </div>

                {/* Available Rewards */}
                <div className="space-y-4">
                  <h3 className="font-medium">Available Rewards</h3>
                  {loyaltyData.rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{reward.value}</p>
                        <p className="text-sm text-gray-500">
                          Expires: {new Date(reward.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant={reward.status === 'active' ? 'default' : 'outline'}
                        disabled={reward.status !== 'active'}
                      >
                        {reward.status === 'active' ? 'Redeem Now' : 'Coming Soon'}
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Points History */}
                <div className="mt-8">
                  <h3 className="mb-4 font-medium">Points History</h3>
                  <div className="space-y-4">
                    {loyaltyData.history.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">{entry.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">+{entry.points} points</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Membership Benefits Card */}
            <Card>
              <CardHeader>
                <CardTitle>Membership Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <Gift className="mb-2 h-6 w-6 text-primary-500" />
                    <h4 className="font-medium">Birthday Rewards</h4>
                    <p className="text-sm text-gray-500">
                      Special rewards during your birthday month
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <Truck className="mb-2 h-6 w-6 text-primary-500" />
                    <h4 className="font-medium">Free Shipping</h4>
                    <p className="text-sm text-gray-500">
                      Free shipping on orders over $50
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <Star className="mb-2 h-6 w-6 text-primary-500" />
                    <h4 className="font-medium">Exclusive Access</h4>
                    <p className="text-sm text-gray-500">
                      Early access to sales and new products
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 