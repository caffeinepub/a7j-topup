import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, Loader2, Copy, Check, AlertCircle } from 'lucide-react';
import { useGetCallerBalance, useGetCallerTransactions } from '../hooks/useWallet';
import { useAddWalletTransaction } from '../hooks/useTransactions';
import { PaymentMethod } from '../backend';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export default function AddMoneyPage() {
  const { data: balance = BigInt(0) } = useGetCallerBalance();
  const { data: transactions = [] } = useGetCallerTransactions();
  const addTransaction = useAddWalletTransaction();

  const [formData, setFormData] = useState({
    paymentMethod: '' as PaymentMethod | '',
    amount: '',
    transactionId: '',
  });

  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const handleCopyNumber = (number: string, method: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(method);
    toast.success(`${method} number copied!`);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paymentMethod || !formData.amount || !formData.transactionId) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addTransaction.mutateAsync({
        amount: BigInt(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
      });
      toast.success('Transaction submitted successfully! Waiting for admin approval.');
      setFormData({ paymentMethod: '', amount: '', transactionId: '' });
    } catch (error) {
      toast.error('Failed to submit transaction. Please try again.');
    }
  };

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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
          <Wallet className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-gradient-purple">Add Money</h1>
        </div>

        {/* Wallet Balance */}
        <Card className="bg-primary shadow-soft border-primary/30 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white">Current Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white">৳{balance.toString()}</p>
          </CardContent>
        </Card>

        {/* How to Add Money Instructions */}
        <Card className="border-primary/30 shadow-soft bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="text-primary">How to Add Money</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-3 list-decimal list-inside text-foreground">
              <li className="text-base">Send money to the chosen number (bKash or Nagad)</li>
              <li className="text-base">Enter the amount</li>
              <li className="text-base">After payment, enter Transaction ID</li>
              <li className="text-base">Click Submit</li>
              <li className="text-base">Admin will verify and add balance</li>
            </ol>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-semibold text-amber-900">Important Notice:</p>
                  <ul className="space-y-1 text-sm text-amber-800">
                    <li>• Balance will be added only after admin approval</li>
                    <li>• Do not send money without submitting transaction ID</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Numbers */}
        <Card className="border-primary/30 shadow-soft bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="text-primary">Payment Numbers</CardTitle>
            <CardDescription>
              Send money to one of these numbers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* bKash */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-white border border-pink-200 rounded-lg">
              <div className="flex items-center gap-4">
                <img 
                  src="/assets/generated/bkash-icon.dim_128x128.png" 
                  alt="bKash" 
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">bKash Personal</p>
                  <p className="text-xl font-bold text-foreground">01868226859</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyNumber('01868226859', 'bKash')}
                className="flex items-center gap-2"
              >
                {copiedNumber === 'bKash' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiedNumber === 'bKash' ? 'Copied' : 'Copy'}
              </Button>
            </div>

            {/* Nagad */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-white border border-orange-200 rounded-lg">
              <div className="flex items-center gap-4">
                <img 
                  src="/assets/generated/nagad-icon.dim_128x128.png" 
                  alt="Nagad" 
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nagad Personal</p>
                  <p className="text-xl font-bold text-foreground">01784377956</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyNumber('01784377956', 'Nagad')}
                className="flex items-center gap-2"
              >
                {copiedNumber === 'Nagad' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiedNumber === 'Nagad' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Money Form */}
        <Card className="border-primary/30 shadow-soft bg-white rounded-xl">
          <CardHeader>
            <CardTitle>Submit Transaction Details</CardTitle>
            <CardDescription>
              After sending money, enter your transaction details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentMethod: value as PaymentMethod })
                  }
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Enter Amount (৳)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  type="text"
                  placeholder="Enter your transaction ID"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={addTransaction.isPending}
                className="w-full btn-purple-gradient"
              >
                {addTransaction.isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : null}
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="border-primary/30 shadow-soft bg-white rounded-xl">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View your wallet top-up requests</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-sm">{tx.transactionId}</TableCell>
                        <TableCell className="capitalize">{tx.paymentMethod}</TableCell>
                        <TableCell>৳{tx.amount.toString()}</TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
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
