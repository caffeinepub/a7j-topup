import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PaymentMethod } from '../backend';

export function useAddWalletTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      paymentMethod,
      transactionId,
    }: {
      amount: bigint;
      paymentMethod: PaymentMethod;
      transactionId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitAddMoneyTransaction(amount, paymentMethod, transactionId);
    },
    onSuccess: () => {
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['callerTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['callerBalance'] });
      // Invalidate admin queries so pending transactions appear in admin panel
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
    },
  });
}
