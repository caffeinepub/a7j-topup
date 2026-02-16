import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Wallet, AlertCircle } from 'lucide-react';
import { useGetCallerBalance, useGetCallerTransactions } from '../hooks/useWallet';
import { useAddWalletTransaction } from '../hooks/useTransactions';
import { PaymentMethod } from '../backend';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { PaymentMethodModal } from '../components/payments/PaymentMethodModal';

export default function AddMoneyPage() {
  const { data: balance = BigInt(0) } = useGetCallerBalance();
  const { data: transactions = [] } = useGetCallerTransactions();
  const addTransaction = useAddWalletTransaction();

  const [modalState, setModalState] = useState<{
    open: boolean;
    method: 'bkash' | 'nagad' | null;
  }>({
    open: false,
    method: null,
  });

  const openModal = (method: 'bkash' | 'nagad') => {
    setModalState({ open: true, method });
  };

  const closeModal = () => {
    setModalState({ open: false, method: null });
  };

  const handleModalSubmit = async (amount: string, txId: string) => {
    if (!modalState.method) return;

    const paymentMethod: PaymentMethod = modalState.method === 'bkash' ? PaymentMethod.bkash : PaymentMethod.nagad;
    const trimmedTxId = txId.trim();

    try {
      await addTransaction.mutateAsync({
        amount: BigInt(amount),
        paymentMethod,
        transactionId: trimmedTxId,
      });
      toast.success('Transaction submitted. Admin will verify and add balance.');
      closeModal();
    } catch (error: any) {
      let errorMessage = 'Failed to submit transaction. Please try again.';
      if (error.message) {
        if (error.message.includes('already used')) {
          errorMessage = 'Transaction ID already used. Please enter a different Transaction ID.';
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      throw error;
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

  const phoneNumbers = {
    bkash: '01868226859',
    nagad: '01784377956',
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 bg-white min-h-screen">
      <Toaster />
      
      {/* Modal */}
      {modalState.method && (
        <PaymentMethodModal
          open={modalState.open}
          onOpenChange={(open) => !open && closeModal()}
          method={modalState.method}
          phoneNumber={phoneNumbers[modalState.method]}
          onSubmit={handleModalSubmit}
          isSubmitting={addTransaction.isPending}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient-purple">Add Money</h1>
        </div>

        {/* Wallet Balance */}
        <Card className="bg-primary shadow-soft border-primary/30 rounded-xl">
          <CardHeader>
            <CardTitle className="text-white text-lg sm:text-xl">Current Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold text-white">৳{balance.toString()}</p>
          </CardContent>
        </Card>

        {/* How to Add Money Instructions */}
        <Card className="border-primary/30 shadow-soft bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="text-primary text-lg sm:text-xl">How to Add Money</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-2 sm:space-y-3 list-decimal list-inside text-foreground text-sm sm:text-base">
              <li>Send money to the chosen number (bKash or Nagad)</li>
              <li>Enter the amount</li>
              <li>After payment, enter Transaction ID</li>
              <li>Click Submit</li>
              <li>Admin will verify and add balance</li>
            </ol>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-semibold text-amber-900 text-sm sm:text-base">Important Notice:</p>
                  <ul className="space-y-1 text-xs sm:text-sm text-amber-800">
                    <li>• Balance will be added only after admin approval</li>
                    <li>• Do not send money without submitting transaction ID</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-primary/30 shadow-soft bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="text-primary text-lg sm:text-xl">Choose Payment Method</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Click on a payment method to proceed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {/* bKash */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 bg-gradient-to-r from-pink-50 to-white border border-pink-200 rounded-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <img 
                  src="/assets/generated/bkash-icon.dim_128x128.png" 
                  alt="bKash" 
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">bKash Personal</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{phoneNumbers.bkash}</p>
                </div>
              </div>
              <Button
                onClick={() => openModal('bkash')}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                Pay with bKash
              </Button>
            </div>

            {/* Nagad */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 bg-gradient-to-r from-orange-50 to-white border border-orange-200 rounded-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <img 
                  src="/assets/generated/nagad-icon.dim_128x128.png" 
                  alt="Nagad" 
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Nagad Personal</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{phoneNumbers.nagad}</p>
                </div>
              </div>
              <Button
                onClick={() => openModal('nagad')}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                Pay with Nagad
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="border-primary/30 shadow-soft bg-white rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Transaction History</CardTitle>
            <CardDescription className="text-sm sm:text-base">View your wallet top-up requests</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">No transactions yet</p>
            ) : (
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Transaction ID</TableHead>
                        <TableHead className="text-xs sm:text-sm">Method</TableHead>
                        <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                        <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-mono text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">
                            {tx.transactionId}
                          </TableCell>
                          <TableCell className="capitalize text-xs sm:text-sm">{tx.paymentMethod}</TableCell>
                          <TableCell className="text-xs sm:text-sm">৳{tx.amount.toString()}</TableCell>
                          <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
