import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PointsTransaction, DiamondPurchase, ConversionSettings, PointsPurchaseRequest } from '../backend';

// Get caller's points balance
export function useGetCallerPointsBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['callerPointsBalance'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getCallerPointsBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

// Get caller's points transactions
export function useGetCallerPointsTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<PointsTransaction[]>({
    queryKey: ['callerPointsTransactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerPointsTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

// Get caller's points purchase requests
export function useGetCallerPointsPurchaseRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<PointsPurchaseRequest[]>({
    queryKey: ['callerPointsPurchaseRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerPointsPurchaseRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

// Get caller's diamond purchases
export function useGetCallerDiamondPurchases() {
  const { actor, isFetching } = useActor();

  return useQuery<DiamondPurchase[]>({
    queryKey: ['callerDiamondPurchases'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerDiamondPurchases();
    },
    enabled: !!actor && !isFetching,
  });
}

// Get conversion settings
export function useGetConversionSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<ConversionSettings>({
    queryKey: ['conversionSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getConversionSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

// Submit points purchase request
export function useSubmitPointsPurchaseRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bdtAmount, transactionId }: { bdtAmount: bigint; transactionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitPointsPurchaseRequest(bdtAmount, transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerPointsPurchaseRequests'] });
      queryClient.invalidateQueries({ queryKey: ['callerBalance'] });
    },
  });
}

// Purchase diamonds with points
export function usePurchaseDiamondsWithPoints() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ packageName, transactionId }: { packageName: string; transactionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.purchaseDiamondsWithPoints(packageName, transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerPointsBalance'] });
      queryClient.invalidateQueries({ queryKey: ['callerPointsTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['callerDiamondPurchases'] });
    },
  });
}

// Get caller's daily ad count
export function useGetCallerDailyAdCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['callerDailyAdCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getCallerDailyAdCount();
    },
    enabled: !!actor && !isFetching,
  });
}

// Claim ad reward
export function useClaimAdReward() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.claimAdReward(transactionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerPointsBalance'] });
      queryClient.invalidateQueries({ queryKey: ['callerPointsTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['callerDailyAdCount'] });
    },
  });
}
