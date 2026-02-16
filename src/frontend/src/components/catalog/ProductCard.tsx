import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap } from 'lucide-react';

interface ProductCardProps {
  name: string;
  icon?: string;
  isAutoDelivery?: boolean;
  onClick?: () => void;
  price?: string;
}

export default function ProductCard({
  name,
  icon,
  isAutoDelivery = true,
  onClick,
  price,
}: ProductCardProps) {
  return (
    <Card
      className="card-lift cursor-pointer overflow-hidden border-border bg-white hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="p-6 flex flex-col items-center text-center gap-4">
        {icon && (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <img src={icon} alt={name} className="w-10 h-10 object-contain" />
          </div>
        )}
        <h3 className="font-bold text-foreground text-lg">{name}</h3>
        {price && <p className="text-primary font-semibold text-xl">{price}</p>}
        {isAutoDelivery && (
          <Badge className="bg-primary text-white">
            <Zap className="w-3 h-3 mr-1" />
            Auto Delivery
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
