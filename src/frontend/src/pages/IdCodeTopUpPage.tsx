import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gem, User, CreditCard } from 'lucide-react';

interface DiamondPackage {
  amount: number;
  price: number;
  label?: string;
}

const diamondPackages: DiamondPackage[] = [
  { amount: 100, price: 125 },
  { amount: 200, price: 240 },
  { amount: 500, price: 625, label: '(15% off)' },
  { amount: 1000, price: 1260, label: '(20% bonus)' },
];

export default function IdCodeTopUpPage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [uid, setUid] = useState('');

  return (
    <div className="min-h-screen py-12 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-gradient-purple mb-8">ID Code Top-Up</h1>

        {/* Two top sections with icons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Diamond Selection Section */}
          <Card className="border-2 border-primary/20 shadow-soft bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-primary" />
                Select Diamond Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {diamondPackages.map((pkg) => (
                  <button
                    key={pkg.amount}
                    onClick={() => setSelectedPackage(pkg.amount)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedPackage === pkg.amount
                        ? 'border-primary bg-primary/10 shadow-lg scale-[1.02]'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-lg">
                          {pkg.amount} Diamonds
                        </div>
                        {pkg.label && (
                          <div className="text-sm text-primary font-medium">
                            {pkg.label}
                          </div>
                        )}
                      </div>
                      <div className="text-xl font-bold text-primary">
                        {pkg.price} BDT
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* UID Input Section */}
          <Card className="border-2 border-primary/20 shadow-soft bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Player UID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="uid">Enter Player UID</Label>
                <Input
                  id="uid"
                  type="text"
                  placeholder="Enter your player UID"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Please enter your Free Fire player UID to receive diamonds
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Instructions - Only shown when UID is entered */}
        {uid.trim() && (
          <Card className="border-2 border-primary/30 bg-white shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Please send payment to one of the following numbers:
                </p>

                <div className="space-y-3">
                  {/* bKash */}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      bK
                    </div>
                    <div>
                      <div className="font-semibold">bKash</div>
                      <div className="text-lg font-mono text-primary">
                        01868226859
                      </div>
                    </div>
                  </div>

                  {/* Nagad */}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      N
                    </div>
                    <div>
                      <div className="font-semibold">Nagad</div>
                      <div className="text-lg font-mono text-primary">
                        01784377956
                      </div>
                    </div>
                  </div>
                </div>

                {selectedPackage && (
                  <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-2">
                      Selected Package:
                    </div>
                    <div className="text-xl font-bold text-primary">
                      {selectedPackage} Diamonds -{' '}
                      {diamondPackages.find((p) => p.amount === selectedPackage)?.price}{' '}
                      BDT
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Player UID: <span className="font-mono text-foreground">{uid}</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> After payment, please contact our support team
                    via Telegram with your transaction ID and player UID for verification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
