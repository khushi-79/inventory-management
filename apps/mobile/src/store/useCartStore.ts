import { create } from 'zustand';

// =============================================================================
// TYPES
// =============================================================================

/** A single line-item in the cart: variant ID + quantity selected. */
export interface CartItem {
  variantId: string;
  /** Human-readable label for display (e.g. "128mm / Black Matt"). */
  label: string;
  /** Unit price at the time of adding to cart — used for display only. */
  unitPrice: number;
  quantity: number;
  /** Standard box pack size — used to show number of boxes in cart. */
  boxPackQty: number;
}

interface CartState {
  /** The customer this cart is being built for. Null until party is selected. */
  activeCustomerId: string | null;
  activeCustomerName: string | null;
  items: CartItem[];
}

interface CartActions {
  setActiveCustomer: (id: string, name: string) => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
}

// =============================================================================
// STORE
// =============================================================================

/**
 * useCartStore — Zustand store for the active shopping cart.
 *
 * NOT persisted to MMKV — cart is intentionally in-memory only so it resets
 * cleanly when the user switches between customers. The checkout flow (Sprint 5)
 * will write order drafts to SQLite for offline persistence.
 */
export const useCartStore = create<CartState & CartActions>()((set, get) => ({
  // --- State ---
  activeCustomerId: null,
  activeCustomerName: null,
  items: [],

  // --- Actions ---
  setActiveCustomer: (id, name) => {
    // Switching customer resets the cart to prevent mixing orders
    set({ activeCustomerId: id, activeCustomerName: name, items: [] });
  },

  addItem: (incoming) => {
    const quantity = incoming.quantity ?? 1;
    set((state) => {
      const existing = state.items.find((i) => i.variantId === incoming.variantId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variantId === incoming.variantId
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          ),
        };
      }
      return { items: [...state.items, { ...incoming, quantity }] };
    });
  },

  updateQuantity: (variantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(variantId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.variantId === variantId ? { ...i, quantity } : i,
      ),
    }));
  },

  removeItem: (variantId) => {
    set((state) => ({
      items: state.items.filter((i) => i.variantId !== variantId),
    }));
  },

  clearCart: () => {
    set({ items: [], activeCustomerId: null, activeCustomerName: null });
  },

  totalAmount: () => {
    return get().items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
  },

  totalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
