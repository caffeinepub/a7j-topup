import ProductCard from '../components/catalog/ProductCard';
import { Gamepad2 } from 'lucide-react';
import { useGetProducts } from '../hooks/useQueries';
import { useCreateOrder } from '../hooks/useOrders';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export default function TopupPage() {
  const { data: products = [] } = useGetProducts();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

  const handleProductClick = async (productId: number, productName: string) => {
    // Special case: ID Code TopUp (BD) navigates to dedicated page without auth
    if (productName === 'ID Code TopUp (BD)') {
      navigate({ to: '/id-code-top-up' });
      return;
    }

    // All other products require authentication
    if (!identity) {
      navigate({ to: '/login' });
      return;
    }

    try {
      await createOrder.mutateAsync(productId);
      toast.success(`Order placed for ${productName}!`);
      navigate({ to: '/dashboard' });
    } catch (error: any) {
      if (error.message?.includes('Insufficient balance')) {
        toast.error('Insufficient balance. Please add money to your wallet.');
        navigate({ to: '/add-money' });
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    }
  };

  const freeFireProducts = [
    { id: 1, name: 'ID Code TopUp (BD)', price: '৳100' },
    { id: 2, name: 'New Level Up Pass', price: '৳250' },
    { id: 3, name: 'Weekly Lite (BD Server)', price: '৳150' },
    { id: 4, name: 'E-Badge / Evo Access (BD)', price: '৳300' },
    { id: 5, name: 'Indonesia Server (UID)', price: '৳200' },
    { id: 6, name: 'Weekly / Monthly Offer', price: '৳500' },
  ];

  return (
    <div className="min-h-screen py-12 bg-white">
      <Toaster />
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-gradient-purple">Topup</h1>
        </div>

        <p className="text-muted-foreground mb-8">
          Select a product to top up your gaming account
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {freeFireProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              icon="/assets/generated/product-icons-sprite.dim_1024x1024.png"
              isAutoDelivery
              onClick={() => handleProductClick(product.id, product.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
