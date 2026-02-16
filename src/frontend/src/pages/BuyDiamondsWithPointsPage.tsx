import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gem, Coins, ArrowRight, Loader2 } from 'lucide-react';
import { useGetConversionSettings, usePurchaseDiamondsWithPoints, useGetCallerPointsBalance } from '../hooks/usePoints';
import { generateTransactionId } from '../utils/transactionId';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export default function BuyDiamondsWithPointsPage() {
  const { data: pointsBalance = BigInt(0) } = useGetCallerPointsBalance();
  const { data: settings } = useGetConversionSettings();
  const purchaseDiamonds = usePurchaseDiamondsWithPoints();
  const [packageName, setPackageName] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!packageName.trim()) {
      toast.error('Please enter a package name');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (!settings) {
      toast.error('Unable to load conversion settings');
      return;
    }

    const totalPointsRequired = BigInt(qty) * settings.pointsToDiamondsRate;
    if (totalPointsRequired > pointsBalance) {
      toast.error('Insufficient points balance');
      return;
    }

    try {
      const transactionId = generateTransactionId();
      const pkgName = `${packageName} (x${qty})`;
      await purchaseDiamonds.mutateAsync({ packageName: pkgName, transactionId });
      toast.success('Diamonds purchased successfully');
      setPackageName('');
      setQuantity('1');
    } catch (error: any) {
      let errorMessage = 'Failed to purchase diamonds';
      if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  const calculateDiamonds = () => {
    if (!settings || !quantity) return 0;
    const qty = parseInt(quantity);
    if (isNaN(qty)) return 0;
    return Number(settings.diamondsPerPackage) * qty;
  };

  const calculatePointsCost = () => {
    if (!settings || !quantity) return 0;
    const qty = parseInt(quantity);
    if (isNaN(qty)) return 0;
    return Number(settings.pointsToDiamondsRate) * qty;
  };

  const estimatedDiamonds = calculateDiamonds();
  const pointsCost = calculatePointsCost();
  const hasInsufficientPoints = pointsCost > Number(pointsBalance);

  return (
    <div className="container mx-auto px-4 py-12 bg-white min-h-screen">
      <Toaster />
      
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Gem className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-gradient-purple">Buy Diamonds</h1>
        </div>

        {/* Points Balance */}
        <Card className="bg-primary shadow-soft border-primary mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-white" />
              <CardTitle className="text-lg text-white">Your Points Balance</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{pointsBalance.toString()} Points</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        {settings && (
          <Card className="bg-gradient-to-br from-purple-50 to-white shadow-soft border-primary/30 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-4 text-lg font-semibold">
                <span className="text-primary">{settings.pointsToDiamondsRate.toString()} Points</span>
                <ArrowRight className="w-5 h-5 text-primary" />
                <span className="text-primary">{settings.diamondsPerPackage.toString()} Diamonds</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Form */}
        <Card className="bg-white shadow-soft border-primary/30">
          <CardHeader>
            <CardTitle>Purchase Diamonds with Points</CardTitle>
            <CardDescription>Use your points to get diamonds</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePurchase} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="packageName">Package Name</Label>
                <Input
                  id="packageName"
                  type="text"
                  placeholder="e.g., Free Fire Diamond Package"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  required
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Number of packages"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  required
                  className="text-lg"
                />
              </div>

              {estimatedDiamonds > 0 && (
                <div className="bg-purple-50 border border-primary/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Points Required:</p>
                    <p className={`text-xl font-bold ${hasInsufficientPoints ? 'text-red-600' : 'text-primary'}`}>
                      {pointsCost} Points
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">You will receive:</p>
                    <p className="text-xl font-bold text-primary">{estimatedDiamonds} Diamonds</p>
                  </div>
                  {hasInsufficientPoints && (
                    <p className="text-sm text-red-600 mt-2">Insufficient points balance</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={purchaseDiamonds.isPending || !packageName || !quantity || hasInsufficientPoints}
                className="w-full btn-purple-gradient text-lg py-6"
              >
                {purchaseDiamonds.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Gem className="w-5 h-5 mr-2" />
                    Buy Diamonds
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
