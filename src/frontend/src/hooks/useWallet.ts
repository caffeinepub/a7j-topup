import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { WalletTopUpTransaction } from '../backend';

export function useGetCallerBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['callerBalance'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getCallerBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<WalletTopUpTransaction[]>({
    queryKey: ['callerTransactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerWalletTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}
