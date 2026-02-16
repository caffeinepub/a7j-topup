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
      // Backend already sorts by createdAt descending, but we ensure it here
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
      return actor.approveWalletTopUpTransaction(transactionId);
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
      return actor.rejectWalletTopUpTransaction(transactionId);
    },
    onSuccess: () => {
      // Invalidate both admin and user queries
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['callerTransactions'] });
    },
  });
}
