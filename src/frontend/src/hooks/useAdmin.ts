import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { WalletTopUpTransaction } from '../backend';

export function useGetAllTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<WalletTopUpTransaction[]>({
    queryKey: ['allTransactions'],
    queryFn: async () => {
      if (!actor) return [];
      const transactions = await actor.getAllWalletTopUpTransactions();
      // Backend already sorts by createdAt descending
      return transactions;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.approveWalletTopUpTransaction(transactionId);
      if (!result) {
        throw new Error('Failed to approve transaction. Transaction may not be pending.');
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate both admin and user queries
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['callerBalance'] });
      queryClient.invalidateQueries({ queryKey: ['callerTransactions'] });
    },
  });
}

export function useRejectTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.rejectWalletTopUpTransaction(transactionId);
      if (!result) {
        throw new Error('Failed to reject transaction. Transaction may not be pending.');
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate both admin and user queries
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['callerTransactions'] });
    },
  });
}
