import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

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
  const [error, setError] = useState('');

  const methodLabel = method === 'bkash' ? 'bKash' : 'Nagad';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedTxId = txId.trim();
    const numAmount = Number(amount);

    if (!trimmedTxId) {
      setError('Transaction ID cannot be empty');
      return;
    }

    if (!amount || numAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      await onSubmit(amount, trimmedTxId);
      setAmount('');
      setTxId('');
    } catch (err: any) {
      // Error is already handled in parent, just keep form open
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white sm:max-w-md max-w-[95vw] mx-auto p-6 rounded-xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-primary">
            {methodLabel} Payment
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Send money to the {methodLabel} number below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Number Display */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {methodLabel} Personal Number
            </p>
            <p className="text-2xl font-bold text-primary">{phoneNumber}</p>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-semibold text-amber-900 mb-2">Instructions:</p>
            <p className="text-sm text-amber-800">
              Send money, enter amount, enter TxID, click submit
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-amount" className="text-base">
                Amount (৳)
              </Label>
              <Input
                id="modal-amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
                disabled={isSubmitting}
                className="text-base h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-txid" className="text-base">
                Transaction ID
              </Label>
              <Input
                id="modal-txid"
                type="text"
                placeholder="Enter transaction ID"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                required
                disabled={isSubmitting}
                className="text-base h-11"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

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
