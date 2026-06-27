import { QueryClient } from '@tanstack/react-query';

/**
 * Global TanStack Query client configuration.
 *
 * staleTime strategy (from implementation_blueprint.md):
 * - Product catalogs: 5 minutes — catalog changes rarely; serve from cache.
 * - Financial data (ledger, invoices): 10 seconds — must reflect recent transactions.
 *
 * Global defaults apply to all queries; individual queries override as needed.
 *
 * retry: 2 — retry failed requests twice before showing an error state.
 * retryDelay: Exponential back-off (1s, 2s) to avoid hammering a degraded server.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,              // 5 minutes default
      gcTime: 1000 * 60 * 10,               // Remove from cache after 10 min of inactivity
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,           // Mobile app — window focus is not meaningful
      refetchOnReconnect: true,              // Always refetch stale data on network restore
    },
    mutations: {
      retry: 0,                              // Never auto-retry mutations (orders, payments)
    },
  },
});
