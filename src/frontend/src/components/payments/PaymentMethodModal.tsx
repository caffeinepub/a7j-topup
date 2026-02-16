import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method: 'bkash' | 'nagad';
  phoneNumber: string;
  onSubmit: (amount: string, txId: string) => Promise<void>;
  isSubmitting: boolean;
}

export function PaymentMethodModal({
  open,
  onOpenChange,
  method,
  phoneNumber,
  onSubmit,
  isSubmitting,
}: PaymentMethodModalProps) {
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [amountError, setAmountError] = useState('');
  const [txIdError, setTxIdError] = useState('');

  const methodLabel = method === 'bkash' ? 'bKash' : 'Nagad';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAmountError('');
    setTxIdError('');

    const trimmedTxId = txId.trim();
    const numAmount = Number(amount);

    let hasError = false;

    if (!trimmedTxId) {
      setTxIdError('Transaction ID cannot be empty');
      hasError = true;
    }

    if (!amount || numAmount <= 0) {
      setAmountError('Amount must be greater than 0');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      await onSubmit(amount, trimmedTxId);
      setAmount('');
      setTxId('');
      setAmountError('');
      setTxIdError('');
    } catch (err: any) {
      // Error is already handled in parent with toast, just keep form open
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount('');
      setTxId('');
      setAmountError('');
      setTxIdError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white sm:max-w-md max-w-[95vw] mx-auto p-0 rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 space-y-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-primary pr-8">
              {methodLabel} Payment
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Follow the instructions below to complete your payment
            </DialogDescription>
          </DialogHeader>

          {/* Payment Number Display */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {methodLabel} Number
            </p>
            <p className="text-2xl font-bold text-primary">{phoneNumber}</p>
          </div>

          {/* Instructions - Ordered List */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-3">Instructions:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Send money to the number</li>
              <li>Enter amount</li>
              <li>Enter Transaction ID</li>
              <li>Click "Submit Transaction"</li>
            </ol>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-amount" className="text-base font-medium">
                Amount (৳)
              </Label>
              <Input
                id="modal-amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError('');
                }}
                min="1"
                required
                disabled={isSubmitting}
                className="text-base h-11"
              />
              {amountError && (
                <p className="text-sm text-red-600">{amountError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-txid" className="text-base font-medium">
                Transaction ID
              </Label>
              <Input
                id="modal-txid"
                type="text"
                placeholder="Enter transaction ID"
                value={txId}
                onChange={(e) => {
                  setTxId(e.target.value);
                  setTxIdError('');
                }}
                required
                disabled={isSubmitting}
                className="text-base h-11"
              />
              {txIdError && (
                <p className="text-sm text-red-600">{txIdError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Transaction'
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
