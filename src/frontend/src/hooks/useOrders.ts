import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// Note: ProductOrder type and order methods are not available in the current backend
// Returning empty arrays as placeholders

interface ProductOrder {
  id: number;
  user: any;
  productId: number;
  status: string;
  amount: bigint;
  createdAt: bigint;
  isAutoDelivery: boolean;
}

export function useGetCallerOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<ProductOrder[]>({
    queryKey: ['callerOrders'],
    queryFn: async () => {
      // Backend method not available yet
      return [];
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
      // Backend method not available yet
      throw new Error('Order creation is not yet available');
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
      // Backend method not available yet
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}
