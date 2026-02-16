import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PointsTransaction, DiamondPurchase, AdminDashboard, PointsPurchaseRequest } from '../backend';

// Get all points transactions (admin)
export function useGetAllPointsTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<PointsTransaction[]>({
    queryKey: ['allPointsTransactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPointsTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

// Get all points purchase requests (admin)
export function useGetAllPointsPurchaseRequests() {
  const { actor, isFetching } = useActor();

  return useQuery<PointsPurchaseRequest[]>({
    queryKey: ['allPointsPurchaseRequests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPointsPurchaseRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

// Approve points purchase request (admin)
export function useApprovePointsPurchaseRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approvePointsPurchaseRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPointsPurchaseRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allPointsTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

// Reject points purchase request (admin)
export function useRejectPointsPurchaseRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectPointsPurchaseRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPointsPurchaseRequests'] });
    },
  });
}

// Get all diamond purchases (admin)
export function useGetAllDiamondPurchases() {
  const { actor, isFetching } = useActor();

  return useQuery<DiamondPurchase[]>({
    queryKey: ['allDiamondPurchases'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDiamondPurchases();
    },
    enabled: !!actor && !isFetching,
  });
}

// Get ad rewards analytics (admin)
export function useGetAdRewardsAnalytics() {
  const { actor, isFetching } = useActor();

  return useQuery<{ totalAdRewards: bigint; totalProfit: bigint }>({
    queryKey: ['adRewardsAnalytics'],
    queryFn: async () => {
      if (!actor) return { totalAdRewards: BigInt(0), totalProfit: BigInt(0) };
      return actor.getAdRewardsAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

// Get admin dashboard stats
export function useGetAdminDashboard() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminDashboard>({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminDashboard();
    },
    enabled: !!actor && !isFetching,
  });
}

// Update conversion settings (admin)
export function useUpdateConversionSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bdtToPointsRate,
      pointsToDiamondsRate,
      diamondsPerPackage,
    }: {
      bdtToPointsRate: bigint;
      pointsToDiamondsRate: bigint;
      diamondsPerPackage: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateConversionSettings(bdtToPointsRate, pointsToDiamondsRate, diamondsPerPackage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversionSettings'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}
