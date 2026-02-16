import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ProductOrder } from '../backend';

export function useGetCallerOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<ProductOrder[]>({
    queryKey: ['callerOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrder(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerOrders'] });
      queryClient.invalidateQueries({ queryKey: ['callerBalance'] });
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<ProductOrder[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrdersSortedByTime();
    },
    enabled: !!actor && !isFetching,
  });
}
