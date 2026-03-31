import React, { createContext, useContext, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type CartContextType = {
  items: any[];
  count: number;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number, optionId?: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refetch: () => void;
};

const CartContext = createContext<CartContextType>({
  items: [],
  count: 0,
  isLoading: false,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  refetch: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: items = [], isLoading: itemsLoading } = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: count = 0 } = trpc.cart.count.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const addMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
    },
  });

  const updateMutation = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
    },
  });

  const removeMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
    },
  });

  const clearMutation = trpc.cart.clear.useMutation({
    onSuccess: () => {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
    },
  });

  const addToCart = useCallback(async (productId: number, quantity = 1, optionId?: number) => {
    await addMutation.mutateAsync({ productId, quantity, optionId });
  }, [addMutation]);

  const updateQuantity = useCallback(async (id: number, quantity: number) => {
    await updateMutation.mutateAsync({ id, quantity });
  }, [updateMutation]);

  const removeItem = useCallback(async (id: number) => {
    await removeMutation.mutateAsync({ id });
  }, [removeMutation]);

  const clearCartFn = useCallback(async () => {
    await clearMutation.mutateAsync();
  }, [clearMutation]);

  const refetch = useCallback(() => {
    utils.cart.list.invalidate();
    utils.cart.count.invalidate();
  }, [utils]);

  return (
    <CartContext.Provider value={{
      items,
      count,
      isLoading: itemsLoading,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart: clearCartFn,
      refetch,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
