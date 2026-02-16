import ProductCard from '../components/catalog/ProductCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, Gamepad2 } from 'lucide-react';
import InstallAppBar from '../components/promo/InstallAppBar';
import { useGetProducts } from '../hooks/useQueries';

export default function HomePage() {
  const { data: products = [] } = useGetProducts();

  const freeFireProducts = [
    { name: 'ID Code TopUp (BD)', icon: '/assets/generated/product-icons-sprite.dim_1024x1024.png' },
    { name: 'New Level Up Pass', icon: '/assets/generated/product-icons-sprite.dim_1024x1024.png' },
    { name: 'Weekly Lite (BD Server)', icon: '/assets/generated/product-icons-sprite.dim_1024x1024.png' },
    { name: 'E-Badge / Evo Access (BD)', icon: '/assets/generated/product-icons-sprite.dim_1024x1024.png' },
    { name: 'Indonesia Server (UID)', icon: '/assets/generated/product-icons-sprite.dim_1024x1024.png' },
    { name: 'Weekly / Monthly Offer', icon: '/assets/generated/product-icons-sprite.dim_1024x1024.png' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative py-20 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/generated/hero-bg-light-purple.dim_1920x800.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-gradient-purple mb-4">
              Fast & Secure Gaming Top-Up
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8">
              Get your Free Fire diamonds instantly with our automated delivery system
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge className="bg-primary text-white text-base px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                Instant Delivery
              </Badge>
              <Badge className="bg-secondary text-secondary-foreground text-base px-4 py-2">
                <Gamepad2 className="w-4 h-4 mr-2" />
                24/7 Support
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* New Offer Section */}
      <section className="py-12 container mx-auto px-4">
        <Card className="border-primary/20 overflow-hidden shadow-soft bg-gradient-purple-light">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gradient-purple">New Offer</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <h3 className="text-2xl font-bold text-primary mb-2">Free 25 Diamond Giveaway</h3>
            <p className="text-foreground/70 mb-4">
              Join our Telegram channel and get a chance to win 25 diamonds for free!
            </p>
            <Badge className="bg-primary text-white">
              Limited Time Offer
            </Badge>
          </CardContent>
        </Card>
      </section>

      {/* Special Offer Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-purple mb-2">
              Special Offer
            </h2>
            <p className="text-muted-foreground">
              Get the best deals on Free Fire diamonds
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.slice(0, 6).map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                price={`৳${Number(product.price)}`}
                icon="/assets/generated/product-icons-sprite.dim_1024x1024.png"
                isAutoDelivery={product.isAutoDelivery}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Free Fire Products Section */}
      <section className="py-12 container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-purple mb-2">
            Free Fire Products
          </h2>
          <p className="text-muted-foreground">
            Choose from our wide range of Free Fire top-up options
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freeFireProducts.map((product, index) => (
            <ProductCard
              key={index}
              name={product.name}
              icon={product.icon}
              isAutoDelivery={true}
            />
          ))}
        </div>
      </section>

      <InstallAppBar />
    </div>
  );
}
