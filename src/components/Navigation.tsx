import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, User, Search, Menu, LogOut, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/useProfile";

export const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { items, total, removeItem, updateQuantity } = useCart();
  const { signOut } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="text-2xl font-bold">
          Store
        </Link>

        <div className="hidden items-center space-x-8 md:flex">
          <Link to="/products" className="text-gray-600 hover:text-gray-900">
            Products
          </Link>
          <Link to="/categories" className="text-gray-600 hover:text-gray-900">
            Categories
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-gray-900">
            About
          </Link>
        </div>

        <div className="hidden items-center space-x-4 md:flex">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.fullName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <div className="h-8 w-8 rounded-full bg-primary/10">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.fullName}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{profile?.fullName}</span>
                  <span className="text-xs text-gray-500">{profile?.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <Link to="/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link to="/profile?tab=preferences">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="default" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
                    {items.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex h-full flex-col">
                <h2 className="mb-4 text-lg font-semibold">Shopping Cart</h2>
                {items.length === 0 ? (
                  <p className="text-muted-foreground">Your cart is empty</p>
                ) : (
                  <>
                    <div className="flex-1 space-y-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 border-b pb-4"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              ${item.price}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                              >
                                -
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="mb-4 flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-semibold">${total.toFixed(2)}</span>
                      </div>
                      <Button className="w-full">Checkout</Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col space-y-4 pt-4">
              <Link to="/products" className="text-gray-600 hover:text-gray-900">
                Products
              </Link>
              <Link to="/categories" className="text-gray-600 hover:text-gray-900">
                Categories
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
};
