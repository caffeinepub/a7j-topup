import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGetCallerBalance } from '../hooks/useWallet';
import { useGetConversionSettings, useSubmitPointsPurchaseRequest, useGetCallerPointsBalance, useGetCallerPointsPurchaseRequests } from '../hooks/usePoints';
import { generateTransactionId } from '../utils/transactionId';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export default function BuyPointsPage() {
  const { data: walletBalance = BigInt(0) } = useGetCallerBalance();
  const { data: pointsBalance = BigInt(0) } = useGetCallerPointsBalance();
  const { data: settings } = useGetConversionSettings();
  const { data: requests = [] } = useGetCallerPointsPurchaseRequests();
  const submitRequest = useSubmitPointsPurchaseRequest();
  const [bdtAmount, setBdtAmount] = useState('');
  const [txId, setTxId] = useState('');

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseInt(bdtAmount);
    const trimmedTxId = txId.trim();

    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!trimmedTxId) {
      toast.error('Transaction ID cannot be empty');
      return;
    }

    if (!settings) {
      toast.error('Unable to load conversion settings');
      return;
    }

    const bdtBigInt = BigInt(amount);
    if (bdtBigInt > walletBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    try {
      await submitRequest.mutateAsync({ bdtAmount: bdtBigInt, transactionId: trimmedTxId });
      toast.success('Points purchase request submitted. Admin will verify and add points.');
      setBdtAmount('');
      setTxId('');
    } catch (error: any) {
      let errorMessage = 'Failed to submit request';
      if (error.message) {
        if (error.message.includes('already used')) {
          errorMessage = 'Transaction ID already used. Please enter a different Transaction ID.';
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
    }
  };

  const calculatePoints = () => {
    if (!settings || !bdtAmount) return 0;
    const amount = parseInt(bdtAmount);
    if (isNaN(amount)) return 0;
    return Math.floor(amount / Number(settings.bdtToPointsRate));
  };

  const estimatedPoints = calculatePoints();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 bg-white min-h-screen">
      <Toaster />
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Coins className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-gradient-purple">Buy Points</h1>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-white shadow-soft border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Wallet Balance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">৳{walletBalance.toString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-primary shadow-soft border-primary">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-white" />
                <CardTitle className="text-lg text-white">Points Balance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{pointsBalance.toString()} Points</p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rate */}
        {settings && (
          <Card className="bg-gradient-to-br from-purple-50 to-white shadow-soft border-primary/30 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-4 text-lg font-semibold">
                <span className="text-primary">৳{settings.bdtToPointsRate.toString()} BDT</span>
                <ArrowRight className="w-5 h-5 text-primary" />
                <span className="text-primary">1 Point</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Purchase Form */}
        <Card className="bg-white shadow-soft border-primary/30 mb-8">
          <CardHeader>
            <CardTitle>Purchase Points</CardTitle>
            <CardDescription>Convert your wallet balance to points</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePurchase} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (BDT)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount in BDT"
                  value={bdtAmount}
                  onChange={(e) => setBdtAmount(e.target.value)}
                  min="1"
                  required
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="txid">Transaction ID</Label>
                <Input
                  id="txid"
                  type="text"
                  placeholder="Enter unique transaction ID"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  required
                  className="text-lg"
                />
              </div>

              {estimatedPoints > 0 && (
                <div className="bg-purple-50 border border-primary/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">You will receive:</p>
                  <p className="text-2xl font-bold text-primary">{estimatedPoints} Points</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitRequest.isPending || !bdtAmount || !txId}
                className="w-full btn-purple-gradient text-lg py-6"
              >
                {submitRequest.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Request History */}
        <Card className="bg-white shadow-soft border-primary/30">
          <CardHeader>
            <CardTitle>Points Purchase Requests</CardTitle>
            <CardDescription>View your points purchase request history</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No requests yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>BDT Amount</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-mono text-sm">{req.id}</TableCell>
                        <TableCell>৳{req.bdtAmount.toString()}</TableCell>
                        <TableCell>{req.amount.toString()} Points</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
